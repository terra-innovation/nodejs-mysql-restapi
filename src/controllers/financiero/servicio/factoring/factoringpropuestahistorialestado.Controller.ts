import * as factoringpropuestaDao from "#root/src/daos/factoringpropuesta.Dao.js";
import * as factoringpropuestaestadoDao from "#root/src/daos/factoringpropuestaestado.Dao.js";
import * as factoringpropuestahistorialestadoDao from "#root/src/daos/factoringpropuestahistorialestado.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";

import * as yup from "yup";

export const getFactoringpropuestahistorialestadosByFactoringpropuestaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestadosByFactoringpropuestaid");
  //log.info(line(),req.session_user.usuario.idusuario);
  const { id } = req.params;
  const factoringpropuestahistorialestadoSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringpropuestahistorialestadoValidated = factoringpropuestahistorialestadoSchema.validateSync({ factoringpropuestaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  const factoringpropuestahistorialestadosJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      var factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(tx, factoringpropuestahistorialestadoValidated.factoringpropuestaid);
      if (!factoringpropuesta) {
        log.warn(line(), "Factoringpropuesta no existe: [" + factoringpropuestahistorialestadoValidated.factoringpropuestaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestahistorialestados = await factoringpropuestahistorialestadoDao.getFactoringpropuestahistorialestadosByIdfactoringpropuesta(tx, factoringpropuesta.idfactoringpropuesta, filter_estado);

      return factoringpropuestahistorialestados;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringpropuestahistorialestadosJson);
};

export const getFactoringpropuestahistorialestadoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestadoMaster");
  const factoringpropuestahistorialestadosMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const factoringpropuestaestados = await factoringpropuestaestadoDao.getFactoringpropuestaestados(tx, filter_estados);

      var factoringpropuestahistorialestadosMaster: Record<string, any> = {};
      factoringpropuestahistorialestadosMaster.factoringpropuestaestados = factoringpropuestaestados;

      return factoringpropuestahistorialestadosMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringpropuestahistorialestadosMasterFiltered);
};

export const getFactoringpropuestahistorialestados = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestados");
  //log.info(line(),req.session_user.usuario.idusuario);

  const factoringpropuestahistorialestadosJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const factoringpropuestahistorialestados = await factoringpropuestahistorialestadoDao.getFactoringpropuestahistorialestados(tx, filter_estado);

      return factoringpropuestahistorialestados;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringpropuestahistorialestadosJson);
};
