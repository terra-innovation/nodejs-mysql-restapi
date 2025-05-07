import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import * as archivofacturaDao from "#src/daos/archivofacturaDao.js";
import * as factoringDao from "#src/daos/factoringDao.js";
import * as riesgoDao from "#src/daos/riesgoDao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line, log } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { ArchivoFacturaAttributes } from "#src/models/ft_factoring/ArchivoFactura.js";

import { Sequelize, Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const getArchivofacturasByFactoringid = async (req, res) => {
  log.debug(line(), "controller::getArchivofacturasByFactoringid");
  //log.info(line(),req.session_user.usuario._idusuario);
  const { id } = req.params;
  const archivofacturaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivofacturaValidated = archivofacturaSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "archivofacturaValidated:", archivofacturaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];

    var factoring = await factoringDao.getFactoringByFactoringid(transaction, archivofacturaValidated.factoringid);
    if (!factoring) {
      log.warn(line(), "Factoring no existe: [" + archivofacturaValidated.factoringid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const archivofacturas = await archivofacturaDao.getArchivofacturasByIdfactoring(transaction, factoring._idfactoring, filter_estado);
    var archivofacturasJson = jsonUtils.sequelizeToJSON(archivofacturas);
    //log.info(line(),archivofacturaObfuscated);

    //var archivofacturasFiltered = jsonUtils.removeAttributes(archivofacturasJson, ["score"]);
    //archivofacturasFiltered = jsonUtils.removeAttributesPrivates(archivofacturasFiltered);
    await transaction.commit();
    response(res, 201, archivofacturasJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
