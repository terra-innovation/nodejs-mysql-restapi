import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";

import * as archivofacturaDao from "#src/daos/archivofactura.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as riesgoDao from "#src/daos/riesgo.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import type { archivo_factura } from "#root/generated/prisma/ft_factoring/client.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const getArchivofacturasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getArchivofacturasByFactoringid");
  //log.info(line(),req.session_user.usuario.idusuario);
  const { id } = req.params;
  const archivofacturaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivofacturaValidated = archivofacturaSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "archivofacturaValidated:", archivofacturaValidated);

  const archivofacturasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, archivofacturaValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + archivofacturaValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const archivofacturas = await archivofacturaDao.getArchivofacturasByIdfactoring(tx, factoring.idfactoring, filter_estado);
      var archivofacturasJson = jsonUtils.sequelizeToJSON(archivofacturas);
      //log.info(line(),archivofacturaObfuscated);

      //var archivofacturasFiltered = jsonUtils.removeAttributes(archivofacturasJson, ["score"]);
      //archivofacturasFiltered = jsonUtils.removeAttributesPrivates(archivofacturasFiltered);
      return archivofacturasJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, archivofacturasJson);
};
