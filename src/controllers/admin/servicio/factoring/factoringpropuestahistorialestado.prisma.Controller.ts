import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as factoringpropuestaDao from "#src/daos/factoringpropuesta.prisma.Dao.js";
import * as factoringpropuestafinancieroDao from "#src/daos/factoringpropuestafinanciero.prisma.Dao.js";
import * as factoringpropuestaestadoDao from "#src/daos/factoringpropuestaestado.prisma.Dao.js";
import * as factoringtipoDao from "#src/daos/factoringtipo.prisma.Dao.js";
import * as factoringestrategiaDao from "#src/daos/factoringestrategia.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as factoringpropuestahistorialestadoDao from "#src/daos/factoringpropuestahistorialestado.prisma.Dao.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as riesgoDao from "#src/daos/riesgo.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import type { factoring_historial_estado } from "#root/generated/prisma/ft_factoring/client.js";

import * as luxon from "luxon";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const updateFactoringpropuestahistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringpropuestahistorialestado");
  const { id } = req.params;
  const factoringpropuestahistorialestadoUpdateSchema = yup
    .object()
    .shape({
      factoringpropuestahistorialestadoid: yup.string().trim().required().min(36).max(36),
      comentario: yup.string().trim().required().min(2).max(65535),
    })
    .required();
  const factoringpropuestahistorialestadoValidated = factoringpropuestahistorialestadoUpdateSchema.validateSync({ factoringpropuestahistorialestadoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var factoringpropuestahistorialestado = await factoringpropuestahistorialestadoDao.getFactoringpropuestahistorialestadoByFactoringpropuestahistorialestadoid(tx, factoringpropuestahistorialestadoValidated.factoringpropuestahistorialestadoid);
      if (!factoringpropuestahistorialestado) {
        log.warn(line(), "Factoringpropuestahistorialestado no existe: [" + factoringpropuestahistorialestadoValidated.factoringpropuestahistorialestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestahistorialestadoToUpdate: Prisma.factoring_propuesta_historial_estadoUpdateInput = {
        comentario: factoringpropuestahistorialestadoValidated.comentario,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringpropuestahistorialestadoUpdated = await factoringpropuestahistorialestadoDao.updateFactoringpropuestahistorialestado(tx, factoringpropuestahistorialestadoValidated.factoringpropuestahistorialestadoid, factoringpropuestahistorialestadoToUpdate);
      log.debug(line(), "factoringpropuestahistorialestadoUpdated:", factoringpropuestahistorialestadoUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, { ...factoringpropuestahistorialestadoValidated });
};

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
      const filter_estado = [1, 2];

      var factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(tx, factoringpropuestahistorialestadoValidated.factoringpropuestaid);
      if (!factoringpropuesta) {
        log.warn(line(), "Factoringpropuesta no existe: [" + factoringpropuestahistorialestadoValidated.factoringpropuestaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestahistorialestados = await factoringpropuestahistorialestadoDao.getFactoringpropuestahistorialestadosByIdfactoringpropuesta(tx, factoringpropuesta.idfactoringpropuesta, filter_estado);
      var factoringpropuestahistorialestadosJson = jsonUtils.sequelizeToJSON(factoringpropuestahistorialestados);
      //log.info(line(),factoringpropuestaObfuscated);

      //var factoringpropuestasFiltered = jsonUtils.removeAttributes(factoringpropuestasJson, ["score"]);
      //factoringpropuestasFiltered = jsonUtils.removeAttributesPrivates(factoringpropuestasFiltered);
      return factoringpropuestahistorialestadosJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringpropuestahistorialestadosJson);
};

export const getFactoringpropuestahistorialestadoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestadoMaster");
  const factoringpropuestahistorialestadosMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const factoringpropuestaestados = await factoringpropuestaestadoDao.getFactoringpropuestaestados(tx, filter_estados);

      var factoringpropuestahistorialestadosMaster: Record<string, any> = {};
      factoringpropuestahistorialestadosMaster.factoringpropuestaestados = factoringpropuestaestados;

      var factoringpropuestahistorialestadosMasterJSON = jsonUtils.sequelizeToJSON(factoringpropuestahistorialestadosMaster);
      //jsonUtils.prettyPrint(factoringpropuestahistorialestadosMasterJSON);
      var factoringpropuestahistorialestadosMasterObfuscated = factoringpropuestahistorialestadosMasterJSON;
      //jsonUtils.prettyPrint(factoringpropuestahistorialestadosMasterObfuscated);
      var factoringpropuestahistorialestadosMasterFiltered = jsonUtils.removeAttributesPrivates(factoringpropuestahistorialestadosMasterObfuscated);
      //jsonUtils.prettyPrint(factoringpropuestahistorialestadosMaster);
      return factoringpropuestahistorialestadosMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringpropuestahistorialestadosMasterFiltered);
};

export const createFactoringpropuestahistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringpropuestahistorialestado");

  const factoringpropuestahistorialestadoSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
      factoringpropuestaestadoid: yup.string().trim().required().min(36).max(36),
      comentario: yup.string().trim().required().min(2).max(65535),
    })
    .required();
  var factoringpropuestahistorialestadoValidated = factoringpropuestahistorialestadoSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user.usuario.idusuario;
      const filter_estados = [1];

      var factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(tx, factoringpropuestahistorialestadoValidated.factoringpropuestaid);
      if (!factoringpropuesta) {
        log.warn(line(), "Factoringpropuesta no existe: [" + factoringpropuestahistorialestadoValidated.factoringpropuestaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoringpropuestaestado = await factoringpropuestaestadoDao.getFactoringpropuestaestadoByFactoringpropuestaestadoid(tx, factoringpropuestahistorialestadoValidated.factoringpropuestaestadoid);
      if (!factoringpropuestaestado) {
        log.warn(line(), "Factoringpropuesta estado no existe: [" + factoringpropuestahistorialestadoValidated.factoringpropuestaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestahistorialestadoToCreate: Prisma.factoring_propuesta_historial_estadoCreateInput = {
        factoring_propuesta: { connect: { idfactoringpropuesta: factoringpropuesta.idfactoringpropuesta } },
        factoring_propuesta_estado: { connect: { idfactoringpropuestaestado: factoringpropuestaestado.idfactoringpropuestaestado } },
        usuario_modifica: { connect: { idusuario: req.session_user.usuario.idusuario } },

        factoringpropuestahistorialestadoid: uuidv4(),
        code: uuidv4().split("-")[0],
        comentario: factoringpropuestahistorialestadoValidated.comentario,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringpropuestahistorialestadoCreated = await factoringpropuestahistorialestadoDao.insertFactoringpropuestahistorialestado(tx, factoringpropuestahistorialestadoToCreate);
      log.debug(line(), "factoringpropuestahistorialestadoCreated:", factoringpropuestahistorialestadoCreated);

      const factoringpropuestaToUpdate: Prisma.factoring_propuestaUpdateInput = {
        factoring_propuesta_estado: { connect: { idfactoringpropuestaestado: factoringpropuestaestado.idfactoringpropuestaestado } },
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringpropuestaUpdated = await factoringpropuestaDao.updateFactoringpropuesta(tx, factoringpropuestahistorialestadoValidated.factoringpropuestaid, factoringpropuestaToUpdate);

      log.debug(line(), "factoringpropuestaUpdated:", factoringpropuestaUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 201, { ...factoringpropuestahistorialestadoValidated });
};

export const activateFactoringpropuestahistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringpropuestahistorialestado");
  const { id } = req.params;
  const factoringpropuestahistorialestadoSchema = yup
    .object()
    .shape({
      factoringpropuestahistorialestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestahistorialestadoValidated = factoringpropuestahistorialestadoSchema.validateSync({ factoringpropuestahistorialestadoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  const factoringpropuestahistorialestadoActivated = await prismaFT.client.$transaction(
    async (tx) => {
      var factoringpropuestahistorialestado = await factoringpropuestahistorialestadoDao.getFactoringpropuestahistorialestadoByFactoringpropuestahistorialestadoid(tx, factoringpropuestahistorialestadoValidated.factoringpropuestahistorialestadoid);
      if (!factoringpropuestahistorialestado) {
        log.warn(line(), "Factoringpropuestahistorialestado no existe: [" + factoringpropuestahistorialestadoValidated.factoringpropuestahistorialestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestahistorialestadoActivated = await factoringpropuestahistorialestadoDao.activateFactoringpropuestahistorialestado(tx, factoringpropuestahistorialestadoValidated.factoringpropuestahistorialestadoid, req.session_user.usuario.idusuario);
      log.debug(line(), "factoringpropuestahistorialestadoActivated:", factoringpropuestahistorialestadoActivated);

      return factoringpropuestahistorialestadoActivated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringpropuestahistorialestadoActivated);
};

export const deleteFactoringpropuestahistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringpropuestahistorialestado");
  const { id } = req.params;
  const factoringpropuestahistorialestadoSchema = yup
    .object()
    .shape({
      factoringpropuestahistorialestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestahistorialestadoValidated = factoringpropuestahistorialestadoSchema.validateSync({ factoringpropuestahistorialestadoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  const factoringpropuestahistorialestadoDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      var factoringpropuestahistorialestado = await factoringpropuestahistorialestadoDao.getFactoringpropuestahistorialestadoByFactoringpropuestahistorialestadoid(tx, factoringpropuestahistorialestadoValidated.factoringpropuestahistorialestadoid);
      if (!factoringpropuestahistorialestado) {
        log.warn(line(), "Factoringpropuestahistorialestado no existe: [" + factoringpropuestahistorialestadoValidated.factoringpropuestahistorialestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestahistorialestadoDeleted = await factoringpropuestahistorialestadoDao.deleteFactoringpropuestahistorialestado(tx, factoringpropuestahistorialestadoValidated.factoringpropuestahistorialestadoid, req.session_user.usuario.idusuario);
      log.debug(line(), "factoringpropuestahistorialestadoDeleted:", factoringpropuestahistorialestadoDeleted);

      return factoringpropuestahistorialestadoDeleted;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringpropuestahistorialestadoDeleted);
};

export const getFactoringpropuestahistorialestados = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestados");
  //log.info(line(),req.session_user.usuario.idusuario);

  const factoringpropuestahistorialestadosJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const factoringpropuestahistorialestados = await factoringpropuestahistorialestadoDao.getFactoringpropuestahistorialestados(tx, filter_estado);
      var factoringpropuestahistorialestadosJson = jsonUtils.sequelizeToJSON(factoringpropuestahistorialestados);
      //log.info(line(),factoringpropuestahistorialestadoObfuscated);

      //var factoringpropuestahistorialestadosFiltered = jsonUtils.removeAttributes(factoringpropuestahistorialestadosJson, ["score"]);
      //factoringpropuestahistorialestadosFiltered = jsonUtils.removeAttributesPrivates(factoringpropuestahistorialestadosFiltered);
      return factoringpropuestahistorialestadosJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringpropuestahistorialestadosJson);
};
