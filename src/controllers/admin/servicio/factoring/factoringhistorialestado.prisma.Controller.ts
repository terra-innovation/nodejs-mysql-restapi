import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as factoringpropuestaDao from "#src/daos/factoringpropuesta.prisma.Dao.js";
import * as factoringpropuestafinancieroDao from "#src/daos/factoringpropuestafinanciero.prisma.Dao.js";
import * as factoringpropuestaestadoDao from "#src/daos/factoringpropuestaestado.prisma.Dao.js";
import * as factoringtipoDao from "#src/daos/factoringtipo.prisma.Dao.js";
import * as factoringestadoDao from "#src/daos/factoringestado.prisma.Dao.js";
import * as factoringestrategiaDao from "#src/daos/factoringestrategia.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as factorcuentabancariaDao from "#src/daos/factorcuentabancaria.prisma.Dao.js";
import * as configuracionappDao from "#src/daos/configuracionapp.prisma.Dao.js";
import * as factoringhistorialestadoDao from "#src/daos/factoringhistorialestado.prisma.Dao.js";
import * as archivofactoringhistorialestadoDao from "#src/daos/archivofactoringhistorialestado.prisma.Dao.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as riesgoDao from "#src/daos/riesgo.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import * as emailService from "#root/src/services/email.Service.js";

import type { factoring_historial_estado } from "#root/generated/prisma/ft_factoring/client.js";

import * as luxon from "luxon";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

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

      const factoringhistorialestadoToUpdate: Prisma.factoring_historial_estadoUpdateInput = {
        comentario: factoringhistorialestadoValidated.comentario,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringhistorialestadoUpdated = await factoringhistorialestadoDao.updateFactoringhistorialestado(tx, factoringhistorialestadoValidated.factoringhistorialestadoid, factoringhistorialestadoToUpdate);
      log.debug(line(), "factoringhistorialestadoUpdated:", factoringhistorialestadoUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, { ...factoringhistorialestadoValidated });
};

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
      const filter_estado = [1, 2];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringhistorialestadoValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringhistorialestadoValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringhistorialestados = await factoringhistorialestadoDao.getFactoringhistorialestadosByIdfactoring(tx, factoring.idfactoring, filter_estado);
      var factoringhistorialestadosJson = jsonUtils.sequelizeToJSON(factoringhistorialestados);
      //log.info(line(),factoringpropuestaObfuscated);

      //var factoringpropuestasFiltered = jsonUtils.removeAttributes(factoringpropuestasJson, ["score"]);
      //factoringpropuestasFiltered = jsonUtils.removeAttributesPrivates(factoringpropuestasFiltered);
      return factoringhistorialestadosJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringhistorialestadosJson);
};

export const getFactoringhistorialestadoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestadoMaster");
  const factoringhistorialestadosMasterFiltered = await prismaFT.client.$transaction(
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
      return factoringhistorialestadosMasterFiltered;
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
      const session_idusuario = req.session_user.usuario.idusuario;
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

      const factoringhistorialestadoToCreate: Prisma.factoring_historial_estadoCreateInput = {
        factoring: { connect: { idfactoring: factoring.idfactoring } },
        factoring_estado: { connect: { idfactoringestado: factoringestado.idfactoringestado } },
        usuario_modifica: { connect: { idusuario: req.session_user.usuario.idusuario } },

        factoringhistorialestadoid: uuidv4(),
        code: uuidv4().split("-")[0],
        comentario: factoringhistorialestadoValidated.comentario,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringhistorialestadoCreated = await factoringhistorialestadoDao.insertFactoringhistorialestado(tx, factoringhistorialestadoToCreate);
      log.debug(line(), "factoringhistorialestadoCreated:", factoringhistorialestadoCreated);

      const factoringToUpdate: Prisma.factoringUpdateInput = {
        factoring_estado: { connect: { idfactoringestado: factoringestado.idfactoringestado } },
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringUpdated = await factoringDao.updateFactoring(tx, factoringhistorialestadoValidated.factoringid, factoringToUpdate);

      log.debug(line(), "factoringUpdated:", factoringUpdated);

      for (const archivo of archivos) {
        const archivofactoringhistorialestadoToCreate: Prisma.archivo_factoring_historial_estadoCreateInput = {
          archivo: { connect: { idarchivo: archivo.idarchivo } },
          factoring_historial_estado: { connect: { idfactoringhistorialestado: factoringhistorialestadoCreated.idfactoringhistorialestado } },
          idusuariocrea: req.session_user.usuario.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const archivofactoringhistorialestadoCreated = await archivofactoringhistorialestadoDao.insertArchivofactoringhistorialestado(tx, archivofactoringhistorialestadoToCreate);

        log.debug(line(), "archivofactoringhistorialestadoCreated:", archivofactoringhistorialestadoCreated);
      }

      // Enviamos correo electrónico
      if (factoringUpdated.idfactoringestado == 29) {
        const factoring_for_email = await factoringDao.getFactoringByIdfactoring(tx, factoringUpdated.idfactoring);
        const emails_cc_deudor_solicita_confirmacion = await configuracionappDao.getEmailsCCDeudorSolicitaConfirmacion(tx);
        const ccEmails: string[] = JSON.parse(emails_cc_deudor_solicita_confirmacion?.valor || "[]");
        ccEmails.push(factoring_for_email.contacto_cedente.email);
        var paramsEmail = {
          factoring: factoring_for_email,
        };
        await emailService.sendFactoringEmpresaServicioFactoringDeudorSolicitudConfirmacion(factoring_for_email.contacto_aceptante.email, ccEmails, paramsEmail);
      }

      if (factoringUpdated.idfactoringestado == 10) {
        const idbanco = 1;
        const estados = [1];
        const factoring_for_email = await factoringDao.getFactoringByIdfactoring(tx, factoringUpdated.idfactoring);
        const factorcuentabancaria_for_email = await factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmonedaIdbanco(tx, factoring_for_email?.idfactor ?? 0, factoring_for_email?.idmoneda ?? 0, idbanco, estados);

        const emails_cc_deudor_solicita_confirmacion = await configuracionappDao.getEmailsCCDeudorSolicitaConfirmacion(tx);
        const ccEmails: string[] = JSON.parse(emails_cc_deudor_solicita_confirmacion?.valor || "[]");
        ccEmails.push(factoring_for_email.contacto_cedente.email);
        var paramsEmail_10 = {
          factoring: factoring_for_email,
          factorcuentabancaria: factorcuentabancaria_for_email,
        };
        await emailService.sendFactoringEmpresaServicioFactoringDeudorNotificacionTransferencia(factoring_for_email.contacto_aceptante.email, ccEmails, paramsEmail_10);
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

  const factoringhistorialestadoActivated = await prismaFT.client.$transaction(
    async (tx) => {
      var factoringhistorialestado = await factoringhistorialestadoDao.getFactoringhistorialestadoByFactoringhistorialestadoid(tx, factoringhistorialestadoValidated.factoringhistorialestadoid);
      if (!factoringhistorialestado) {
        log.warn(line(), "Factoringhistorialestado no existe: [" + factoringhistorialestadoValidated.factoringhistorialestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringhistorialestadoActivated = await factoringhistorialestadoDao.activateFactoringhistorialestado(tx, factoringhistorialestadoValidated.factoringhistorialestadoid, req.session_user.usuario.idusuario);
      log.debug(line(), "factoringhistorialestadoActivated:", factoringhistorialestadoActivated);

      return factoringhistorialestadoActivated;
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

  const factoringhistorialestadoDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      var factoringhistorialestado = await factoringhistorialestadoDao.getFactoringhistorialestadoByFactoringhistorialestadoid(tx, factoringhistorialestadoValidated.factoringhistorialestadoid);
      if (!factoringhistorialestado) {
        log.warn(line(), "Factoringhistorialestado no existe: [" + factoringhistorialestadoValidated.factoringhistorialestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringhistorialestadoDeleted = await factoringhistorialestadoDao.deleteFactoringhistorialestado(tx, factoringhistorialestadoValidated.factoringhistorialestadoid, req.session_user.usuario.idusuario);
      log.debug(line(), "factoringhistorialestadoDeleted:", factoringhistorialestadoDeleted);

      return factoringhistorialestadoDeleted;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringhistorialestadoDeleted);
};

export const getFactoringhistorialestados = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestados");
  //log.info(line(),req.session_user.usuario.idusuario);

  const factoringhistorialestadosJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const factoringhistorialestados = await factoringhistorialestadoDao.getFactoringhistorialestados(tx, filter_estado);
      var factoringhistorialestadosJson = jsonUtils.sequelizeToJSON(factoringhistorialestados);
      //log.info(line(),factoringhistorialestadoObfuscated);

      //var factoringhistorialestadosFiltered = jsonUtils.removeAttributes(factoringhistorialestadosJson, ["score"]);
      //factoringhistorialestadosFiltered = jsonUtils.removeAttributesPrivates(factoringhistorialestadosFiltered);
      return factoringhistorialestadosJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringhistorialestadosJson);
};
