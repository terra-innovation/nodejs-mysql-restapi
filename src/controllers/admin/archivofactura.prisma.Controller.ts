import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { Request, Response } from "express";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as archivofacturaDao from "#src/daos/archivofactura.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

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
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, archivofacturaValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + archivofacturaValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const archivofacturas = await archivofacturaDao.getArchivofacturasByIdfactoring(tx, factoring.idfactoring, filter_estado);

      return archivofacturas;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, archivofacturasJson);
};
