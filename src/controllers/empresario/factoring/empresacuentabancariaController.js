import * as empresacuentabancariaDao from "../../../daos/empresacuentabancariaDao.js";
import * as empresaDao from "../../../daos/empresaDao.js";
import * as cuentabancariaDao from "../../../daos/cuentabancariaDao.js";
import * as bancoDao from "../../../daos/bancoDao.js";
import * as cuentatipoDao from "../../../daos/cuentatipoDao.js";
import * as monedaDao from "../../../daos/monedaDao.js";
import { response } from "../../../utils/CustomResponseOk.js";
import { ClientError } from "../../../utils/CustomErrors.js";
import * as jsonUtils from "../../../utils/jsonUtils.js";
import logger, { line } from "../../../utils/logger.js";
import { sequelizeFT } from "../../../config/bd/sequelize_db_factoring.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getEmpresacuentabancarias = async (req, res) => {
  logger.debug(line(), "controller::getEmpresacuentabancarias");

  const empresacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaUpdateSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);
  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estado = [1];
    var empresa_por_idusuario = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(transaction, session_idusuario, empresacuentabancariaValidated.empresaid, filter_estado);
    if (!empresa_por_idusuario) {
      logger.warn(line(), "Empresa no asociada al usuario: [" + session_idusuario + ", " + empresacuentabancariaValidated.monedaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var moneda = await monedaDao.getMonedaByMonedaid(transaction, empresacuentabancariaValidated.monedaid);
    if (!moneda) {
      logger.warn(line(), "Moneda no existe: [" + empresacuentabancariaValidated.monedaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var _idcuentabancariaestado = [2, 1]; // Verificado y Pendiente

    const empresacuentabancarias = await empresacuentabancariaDao.getEmpresacuentabancariasForFactoring(transaction, empresa_por_idusuario._idempresa, moneda._idmoneda, _idcuentabancariaestado, filter_estado);
    var empresacuentabancariasJson = jsonUtils.sequelizeToJSON(empresacuentabancarias);
    //logger.info(line(),empresaObfuscated);

    var empresacuentabancariasFiltered = jsonUtils.removeAttributes(empresacuentabancariasJson, ["score"]);
    empresacuentabancariasFiltered = jsonUtils.ofuscarAtributosDefault(empresacuentabancariasFiltered);
    empresacuentabancariasFiltered = jsonUtils.removeAttributesPrivates(empresacuentabancariasFiltered);
    await transaction.commit();
    response(res, 201, empresacuentabancariasFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
