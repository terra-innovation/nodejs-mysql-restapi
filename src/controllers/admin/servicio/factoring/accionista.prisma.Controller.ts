import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as accionistaDao from "#src/daos/accionista.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import * as yup from "yup";

export const getAccionistasByEmpresaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getAccionistasByEmpresaid");
  const { id } = req.params;
  const accionistaSearchSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const accionistaValidated = accionistaSearchSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "accionistaValidated:", accionistaValidated);

  const accionistasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];

      var empresa = await empresaDao.getEmpresaByEmpresaid(tx, accionistaValidated.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + accionistaValidated.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const accionistas = await accionistaDao.getAccionistasByIdempresa(tx, empresa.idempresa, filter_estado);
      var accionistasJson = jsonUtils.sequelizeToJSON(accionistas);
      
      return accionistasJson;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, accionistasJson);
};
