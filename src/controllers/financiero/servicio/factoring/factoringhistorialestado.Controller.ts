import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringestadoDao from "#root/src/daos/factoringestado.Dao.js";
import * as factoringhistorialestadoDao from "#root/src/daos/factoringhistorialestado.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";

import * as yup from "yup";

export const getFactoringhistorialestadosByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestadosByFactoringid");
  //log.info(line(),req.session_user.usuario.idusuario);
  const { id } = req.params;
  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringhistorialestadoValidated = factoringhistorialestadoSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const factoringhistorialestadosJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringhistorialestadoValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringhistorialestadoValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringhistorialestados = await factoringhistorialestadoDao.getFactoringhistorialestadosByIdfactoring(tx, factoring.idfactoring, filter_estado);

      return factoringhistorialestados;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringhistorialestadosJson);
};

export const getFactoringhistorialestadoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestadoMaster");
  const factoringhistorialestadosMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const factoringestados = await factoringestadoDao.getFactoringestados(tx, filter_estados);

      var factoringhistorialestadosMaster: Record<string, any> = {};
      factoringhistorialestadosMaster.factoringestados = factoringestados;

      return factoringhistorialestadosMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringhistorialestadosMasterFiltered);
};

export const getFactoringhistorialestados = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestados");
  //log.info(line(),req.session_user.usuario.idusuario);

  const factoringhistorialestadosJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const factoringhistorialestados = await factoringhistorialestadoDao.getFactoringhistorialestados(tx, filter_estado);

      return factoringhistorialestados;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringhistorialestadosJson);
};
