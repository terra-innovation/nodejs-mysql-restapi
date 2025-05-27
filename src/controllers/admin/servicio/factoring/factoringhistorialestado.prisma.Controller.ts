import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as factoringpropuestaDao from "#src/daos/factoringpropuesta.prisma.Dao.js";
import * as factoringpropuestafinancieroDao from "#src/daos/factoringpropuestafinanciero.prisma.Dao.js";
import * as factoringpropuestaestadoDao from "#src/daos/factoringpropuestaestado.prisma.Dao.js";
import * as factoringtipoDao from "#src/daos/factoringtipo.prisma.Dao.js";
import * as factoringestadoDao from "#src/daos/factoringestado.prisma.Dao.js";
import * as factoringestrategiaDao from "#src/daos/factoringestrategia.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as factoringhistorialestadoDao from "#src/daos/factoringhistorialestado.prisma.Dao.js";
import * as archivofactoringhistorialestadoDao from "#src/daos/archivofactoringhistorialestado.prisma.Dao.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as riesgoDao from "#src/daos/riesgo.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import type { factoring_historial_estado } from "#src/models/prisma/ft_factoring/client";

import * as luxon from "luxon";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize, Op } from "sequelize";

export const updateFactoringhistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringhistorialestado");
  const { id } = req.params;
  const factoringhistorialestadoUpdateSchema = yup
    .object()
    .shape({
      factoringhistorialestadoid: yup.string().trim().required().min(36).max(36),
      comentario: yup.string().trim().required().min(2).max(65535),
    })
    .required();
  const factoringhistorialestadoValidated = factoringhistorialestadoUpdateSchema.validateSync({ factoringhistorialestadoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var factoringhistorialestado = await factoringhistorialestadoDao.getFactoringhistorialestadoByFactoringhistorialestadoid(tx, factoringhistorialestadoValidated.factoringhistorialestadoid);
      if (!factoringhistorialestado) {
        log.warn(line(), "Factoringhistorialestado no existe: [" + factoringhistorialestadoValidated.factoringhistorialestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var camposFk: Partial<factoring_historial_estado> = {};
      camposFk._idfactoringhistorialestado = factoringhistorialestado._idfactoringhistorialestado;

      var camposAuditoria: Partial<factoring_historial_estado> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposAuditoria.fechamod = new Date();

      const factoringhistorialestadoUpdated = await factoringhistorialestadoDao.updateFactoringhistorialestado(tx, {
        ...camposFk,
        ...factoringhistorialestadoValidated,
        ...camposAuditoria,
      });
      log.debug(line(), "factoringhistorialestadoUpdated:", factoringhistorialestadoUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, { ...factoringhistorialestadoValidated });
};

export const getFactoringhistorialestadosByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestadosByFactoringid");
  //log.info(line(),req.session_user.usuario._idusuario);
  const { id } = req.params;
  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringhistorialestadoValidated = factoringhistorialestadoSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringhistorialestadoValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringhistorialestadoValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringhistorialestados = await factoringhistorialestadoDao.getFactoringhistorialestadosByIdfactoring(tx, factoring._idfactoring, filter_estado);
      var factoringhistorialestadosJson = jsonUtils.sequelizeToJSON(factoringhistorialestados);
      //log.info(line(),factoringpropuestaObfuscated);

      //var factoringpropuestasFiltered = jsonUtils.removeAttributes(factoringpropuestasJson, ["score"]);
      //factoringpropuestasFiltered = jsonUtils.removeAttributesPrivates(factoringpropuestasFiltered);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringhistorialestadosJson);
};

export const getFactoringhistorialestadoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestadoMaster");
  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const factoringestados = await factoringestadoDao.getFactoringestados(tx, filter_estados);

      var factoringhistorialestadosMaster: Record<string, any> = {};
      factoringhistorialestadosMaster.factoringestados = factoringestados;

      var factoringhistorialestadosMasterJSON = jsonUtils.sequelizeToJSON(factoringhistorialestadosMaster);
      //jsonUtils.prettyPrint(factoringhistorialestadosMasterJSON);
      var factoringhistorialestadosMasterObfuscated = factoringhistorialestadosMasterJSON;
      //jsonUtils.prettyPrint(factoringhistorialestadosMasterObfuscated);
      var factoringhistorialestadosMasterFiltered = jsonUtils.removeAttributesPrivates(factoringhistorialestadosMasterObfuscated);
      //jsonUtils.prettyPrint(factoringhistorialestadosMaster);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringhistorialestadosMasterFiltered);
};

export const createFactoringhistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringhistorialestado");

  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringestadoid: yup.string().trim().required().min(36).max(36),
      archivos: yup.array().of(yup.string().min(36).max(36)),
      comentario: yup.string().trim().required().min(2).max(65535),
    })
    .required();
  var factoringhistorialestadoValidated = factoringhistorialestadoSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user.usuario._idusuario;
      const filter_estados = [1];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringhistorialestadoValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringhistorialestadoValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoringestado = await factoringestadoDao.getFactoringestadoByFactoringestadoid(tx, factoringhistorialestadoValidated.factoringestadoid);
      if (!factoringestado) {
        log.warn(line(), "Factoring estado no existe: [" + factoringhistorialestadoValidated.factoringestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      let archivos = [];
      if (factoringhistorialestadoValidated.archivos) {
        for (const archivoid of factoringhistorialestadoValidated.archivos) {
          var archivo = await archivoDao.getArchivoByArchivoid(tx, archivoid);
          if (!archivo) {
            log.warn(line(), "Archivo no existe: [" + archivoid + "]");
            throw new ClientError("Datos no válidos", 404);
          }
          archivos.push(archivo);
        }
      }

      var camposFk: Partial<factoring_historial_estado> = {};
      camposFk._idfactoring = factoring._idfactoring;
      camposFk._idfactoringestado = factoringestado._idfactoringestado;
      camposFk._idusuariomodifica = req.session_user.usuario._idusuario;

      var camposAdicionales: Partial<factoring_historial_estado> = {};
      camposAdicionales.factoringhistorialestadoid = uuidv4();
      camposAdicionales.code = uuidv4().split("-")[0];

      var camposAuditoria: Partial<factoring_historial_estado> = {};
      camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
      camposAuditoria.fechacrea = new Date();
      camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 1;

      const factoringhistorialestadoCreated = await factoringhistorialestadoDao.insertFactoringhistorialestado(tx, {
        ...camposFk,
        ...camposAdicionales,
        ...factoringhistorialestadoValidated,
        ...camposAuditoria,
      });

      log.debug(line(), "factoringhistorialestadoCreated:", factoringhistorialestadoCreated.dataValues);
      const factoringUpdate = {
        factoringid: factoringhistorialestadoValidated.factoringid,
        _idfactoringestado: factoringestado._idfactoringestado,
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringUpdated = await factoringDao.updateFactoring(tx, factoringUpdate);

      log.debug(line(), "factoringUpdated:", factoringUpdated);

      for (const archivo of archivos) {
        const archivofactoringhistorialestadoCreate = {
          _idarchivo: archivo._idarchivo,
          _idfactoringhistorialestado: factoringhistorialestadoCreated._idfactoringhistorialestado,
          idusuariocrea: req.session_user.usuario._idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario._idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const archivofactoringhistorialestadoCreated = await archivofactoringhistorialestadoDao.insertArchivofactoringhistorialestado(tx, {
          ...archivofactoringhistorialestadoCreate,
        });

        log.debug(line(), "archivofactoringhistorialestadoCreated:", archivofactoringhistorialestadoCreated.dataValues);
      }

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 201, { ...factoringhistorialestadoValidated });
};

export const activateFactoringhistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringhistorialestado");
  const { id } = req.params;
  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringhistorialestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringhistorialestadoValidated = factoringhistorialestadoSchema.validateSync({ factoringhistorialestadoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var factoringhistorialestado = await factoringhistorialestadoDao.getFactoringhistorialestadoByFactoringhistorialestadoid(tx, factoringhistorialestadoValidated.factoringhistorialestadoid);
      if (!factoringhistorialestado) {
        log.warn(line(), "Factoringhistorialestado no existe: [" + factoringhistorialestadoValidated.factoringhistorialestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var camposAuditoria: Partial<factoring_historial_estado> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 1;

      const factoringhistorialestadoActivated = await factoringhistorialestadoDao.activateFactoringhistorialestado(tx, { ...factoringhistorialestadoValidated, ...camposAuditoria });
      log.debug(line(), "factoringhistorialestadoActivated:", factoringhistorialestadoActivated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringhistorialestadoActivated);
};

export const deleteFactoringhistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringhistorialestado");
  const { id } = req.params;
  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringhistorialestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringhistorialestadoValidated = factoringhistorialestadoSchema.validateSync({ factoringhistorialestadoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var factoringhistorialestado = await factoringhistorialestadoDao.getFactoringhistorialestadoByFactoringhistorialestadoid(tx, factoringhistorialestadoValidated.factoringhistorialestadoid);
      if (!factoringhistorialestado) {
        log.warn(line(), "Factoringhistorialestado no existe: [" + factoringhistorialestadoValidated.factoringhistorialestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var camposAuditoria: Partial<factoring_historial_estado> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 2;

      const factoringhistorialestadoDeleted = await factoringhistorialestadoDao.deleteFactoringhistorialestado(tx, { ...factoringhistorialestadoValidated, ...camposAuditoria });
      log.debug(line(), "factoringhistorialestadoDeleted:", factoringhistorialestadoDeleted);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringhistorialestadoDeleted);
};

export const getFactoringhistorialestados = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestados");
  //log.info(line(),req.session_user.usuario._idusuario);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const factoringhistorialestados = await factoringhistorialestadoDao.getFactoringhistorialestados(tx, filter_estado);
      var factoringhistorialestadosJson = jsonUtils.sequelizeToJSON(factoringhistorialestados);
      //log.info(line(),factoringhistorialestadoObfuscated);

      //var factoringhistorialestadosFiltered = jsonUtils.removeAttributes(factoringhistorialestadosJson, ["score"]);
      //factoringhistorialestadosFiltered = jsonUtils.removeAttributesPrivates(factoringhistorialestadosFiltered);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringhistorialestadosJson);
};
