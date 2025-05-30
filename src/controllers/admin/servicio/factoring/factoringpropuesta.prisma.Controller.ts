import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as factoringpropuestaDao from "#src/daos/factoringpropuesta.prisma.Dao.js";
import * as factoringpropuestafinancieroDao from "#src/daos/factoringpropuestafinanciero.prisma.Dao.js";
import * as factoringpropuestaestadoDao from "#src/daos/factoringpropuestaestado.prisma.Dao.js";
import * as factoringtipoDao from "#src/daos/factoringtipo.prisma.Dao.js";
import * as factoringestrategiaDao from "#src/daos/factoringestrategia.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as riesgoDao from "#src/daos/riesgo.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import type { factoring_propuesta } from "#src/models/prisma/ft_factoring/client";
import { Simulacion } from "#src/types/Simulacion.types.js";

import * as luxon from "luxon";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import { simulateFactoringLogicV2 } from "#src/logics/factoringLogic.js";

import { unlink } from "fs/promises";
import path from "path"; // Para eliminar el archivo después de enviarlo
import PDFGenerator from "#src/utils/document/PDFgenerator.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import * as fs from "fs";

export const downloadFactoringpropuestaPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringpropuestaPDF");
  const { id } = req.params;
  const factoringpropuestaUpdateSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.validateSync({ factoringpropuestaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(tx, factoringpropuestaValidated.factoringpropuestaid);
      if (!factoringpropuesta) {
        log.warn(line(), "Factoringpropuesta no existe: [" + factoringpropuestaValidated.factoringpropuestaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      //log.debug(line(), "factoringpropuesta:", jsonUtils.sequelizeToJSON(factoringpropuesta));

      var factoring = await factoringDao.getFactoringByIdfactoring(tx, factoringpropuesta.idfactoring);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringpropuesta.idfactoring + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      //log.debug(line(), "factoringpropuesta:", jsonUtils.sequelizeToJSON(factoring));

      // Generar el PDF
      const formattedDate = luxon.DateTime.now().toFormat("yyyyMMdd_HHmm");
      const filename = formattedDate + "_factoring_propuesta_" + factoring.cedente_empresa.ruc + "_" + factoringpropuesta.code + ".pdf";
      const dirPath = path.join(storageUtils.pathApp(), storageUtils.STORAGE_PATH_PROCESAR, storageUtils.pathDate(new Date()));
      const filePath = path.join(dirPath, filename);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const pdfGenerator = new PDFGenerator(filePath);
      await pdfGenerator.generateFactoringQuote(factoring, factoringpropuesta);

      let filenameDownload = "Factoring_Propuesta_" + factoring.cedente_empresa.ruc + "_" + factoringpropuesta.code + "_" + formattedDate + ".pdf";

      // res.setHeader("Content-Disposition", 'attachment; filename="' + filenameDownload + '"');

      setDownloadHeaders(res, filenameDownload);
      await sendFileAsync(req, res, filePath);
      await unlink(filePath);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
};

export const updateFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringpropuesta");
  const { id } = req.params;
  const factoringpropuestaUpdateSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
      factoringpropuestaestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.validateSync({ factoringpropuestaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(tx, factoringpropuestaValidated.factoringpropuestaid);
      if (!factoringpropuesta) {
        log.warn(line(), "Factoringpropuesta no existe: [" + factoringpropuestaValidated.factoringpropuestaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoringpropuestaestado = await factoringpropuestaestadoDao.getFactoringpropuestaestadoByFactoringpropuestaestadoid(tx, factoringpropuestaValidated.factoringpropuestaestadoid);
      if (!factoringpropuestaestado) {
        log.warn(line(), "Factoringpropuestaestado no existe: [" + factoringpropuestaValidated.factoringpropuestaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var camposFk: Partial<factoring_propuesta> = {};
      camposFk.idfactoringpropuestaestado = factoringpropuestaestado.idfactoringpropuestaestado;

      var camposAdicionales: Partial<factoring_propuesta> = {};
      camposAdicionales.factoringpropuestaid = factoringpropuestaValidated.factoringpropuestaid;

      var camposAuditoria: Partial<factoring_propuesta> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario.idusuario ?? 1;
      camposAuditoria.fechamod = new Date();

      const factoringpropuestaUpdated = await factoringpropuestaDao.updateFactoringpropuesta(tx, {
        ...camposFk,
        ...camposAdicionales,
        ...factoringpropuestaValidated,
        ...camposAuditoria,
      });
      log.debug(line(), "factoringpropuestaUpdated:", factoringpropuestaUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, { ...factoringpropuestaValidated });
};

export const createFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringpropuesta");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [1, 2];
  const factoringSimulateSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringtipoid: yup.string().trim().required().min(36).max(36),
      riesgooperacionid: yup.string().trim().required().min(36).max(36),
      factoringpropuestaestadoid: yup.string().trim().required().min(36).max(36),
      factoringestrategiaid: yup.string().trim().required().min(36).max(36),
      tdm: yup.number().required().min(0).max(100),
      porcentaje_financiado_estimado: yup.number().required().min(0).max(100),
    })
    .required();
  var factoringValidated = factoringSimulateSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  //log.debug(line(),"factoringValidated:", factoringValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user.usuario.idusuario;
      const filter_estados = [1];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoringtipo = await factoringtipoDao.getFactoringtipoByFactoringtipoid(tx, factoringValidated.factoringtipoid);
      if (!factoringtipo) {
        log.warn(line(), "Factoring tipo no existe: [" + factoringValidated.factoringtipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var riesgooperacion = await riesgoDao.getRiesgoByRiesgoid(tx, factoringValidated.riesgooperacionid);
      if (!riesgooperacion) {
        log.warn(line(), "Riesgo operación no existe: [" + factoringValidated.riesgooperacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoringpropuestaestado = await factoringpropuestaestadoDao.getFactoringpropuestaestadoByFactoringpropuestaestadoid(tx, factoringValidated.factoringpropuestaestadoid);
      if (!factoringpropuestaestado) {
        log.warn(line(), "Factoring propuesta estado no existe: [" + factoringValidated.factoringpropuestaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoringestrategia = await factoringestrategiaDao.getFactoringestrategiaByFactoringestrategiaid(tx, factoringValidated.factoringestrategiaid);
      if (!factoringestrategia) {
        log.warn(line(), "Factoring estategia no existe: [" + factoringValidated.factoringestrategiaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      let fecha_ahora = luxon.DateTime.local();
      let fecha_fin = luxon.DateTime.fromISO(factoring.fecha_pago_estimado.toISOString());
      let dias_pago_estimado = fecha_fin.startOf("day").diff(fecha_ahora.startOf("day"), "days").days; // Actualizamos la cantidad de dias para el pago
      let dias_antiguedad_estimado = fecha_ahora.startOf("day").diff(luxon.DateTime.fromISO(factoring.fecha_emision.toISOString()).startOf("day"), "days").days;
      var simulacion: Partial<Simulacion> = {};
      simulacion = await simulateFactoringLogicV2(
        riesgooperacion.idriesgo,
        factoring.cuentabancaria_cuenta_bancarium.idbanco,
        factoring.cantidad_facturas,
        factoring.monto_neto,
        dias_pago_estimado,
        factoringValidated.porcentaje_financiado_estimado,
        factoringValidated.tdm,
        dias_antiguedad_estimado
      );

      log.info(line(), "simulacion: ", simulacion);

      var camposFk: Partial<factoring_propuesta> = {};
      camposFk.idfactoring = factoring.idfactoring;
      camposFk.idfactoringtipo = factoringtipo.idfactoringtipo;
      camposFk.idfactoringpropuestaestado = factoringpropuestaestado.idfactoringpropuestaestado;
      camposFk.idriesgooperacion = riesgooperacion.idriesgo;
      camposFk.idfactoringestrategia = factoringestrategia.idfactoringestrategia;

      var camposAdicionales: Partial<factoring_propuesta> = {};
      camposAdicionales.factoringpropuestaid = uuidv4();
      camposAdicionales.code = uuidv4().split("-")[0];
      camposAdicionales.fecha_propuesta = new Date();
      camposAdicionales.dias_antiguedad_estimado = dias_antiguedad_estimado;
      camposAdicionales.fecha_pago_estimado = factoring.fecha_pago_estimado;

      var camposAuditoria: Partial<factoring_propuesta> = {};
      camposAuditoria.idusuariocrea = req.session_user.usuario.idusuario ?? 1;
      camposAuditoria.fechacrea = new Date();
      camposAuditoria.idusuariomod = req.session_user.usuario.idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 1;

      const factoringpropuestaCreated = await factoringpropuestaDao.insertFactoringpropuesta(tx, {
        ...camposFk,
        ...camposAdicionales,
        ...factoringValidated,
        ...camposAuditoria,
        ...simulacion,
      });

      log.debug(line(), "factoringpropuestaCreated:", factoringpropuestaCreated);

      for (let i = 0; i < simulacion?.comisiones?.length; i++) {
        const comision = simulacion.comisiones[i];
        var factoringpropuestafinanciero_comision = {
          _idfactoringpropuesta: factoringpropuestaCreated.idfactoringpropuesta,
          factoringpropuestafinancieroid: uuidv4(),
          code: uuidv4().split("-")[0],
          idusuariocrea: req.session_user.usuario.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
          ...comision,
        };
        const factoringpropuestafinancieroCreated = await factoringpropuestafinancieroDao.insertFactoringpropuestafinanciero(tx, factoringpropuestafinanciero_comision);
        log.debug(line(), "factoringpropuestafinancieroCreated:", factoringpropuestafinancieroCreated);
      }

      for (let i = 0; i < simulacion?.costos?.length; i++) {
        const costo = simulacion.costos[i];
        var factoringpropuestafinanciero_costo = {
          _idfactoringpropuesta: factoringpropuestaCreated.idfactoringpropuesta,
          factoringpropuestafinancieroid: uuidv4(),
          code: uuidv4().split("-")[0],
          idusuariocrea: req.session_user.usuario.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
          ...costo,
        };
        const factoringpropuestafinancieroCreated = await factoringpropuestafinancieroDao.insertFactoringpropuestafinanciero(tx, factoringpropuestafinanciero_costo);
        log.debug(line(), "factoringpropuestafinancieroCreated:", factoringpropuestafinancieroCreated);
      }
      for (let i = 0; i < simulacion?.gastos?.length; i++) {
        const gasto = simulacion.gastos[i];
        var factoringpropuestafinanciero_gasto = {
          _idfactoringpropuesta: factoringpropuestaCreated.idfactoringpropuesta,
          factoringpropuestafinancieroid: uuidv4(),
          code: uuidv4().split("-")[0],
          idusuariocrea: req.session_user.usuario.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
          ...gasto,
        };
        const factoringpropuestafinancieroCreated = await factoringpropuestafinancieroDao.insertFactoringpropuestafinanciero(tx, factoringpropuestafinanciero_gasto);
        log.debug(line(), "factoringpropuestafinancieroCreated:", factoringpropuestafinancieroCreated);
      }

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
};

export const simulateFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringpropuesta");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [1, 2];
  const { id } = req.params;
  const factoringSimulateSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringtipoid: yup.string().trim().required().min(36).max(36),
      riesgooperacionid: yup.string().trim().required().min(36).max(36),
      factoringestrategiaid: yup.string().trim().required().min(36).max(36),
      tdm: yup.number().required().min(0).max(100),
      porcentaje_financiado_estimado: yup.number().required().min(0).max(100),
    })
    .required();
  var factoringValidated = factoringSimulateSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  //log.debug(line(),"factoringValidated:", factoringValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user.usuario.idusuario;
      const filter_estados = [1];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoringtipo = await factoringtipoDao.getFactoringtipoByFactoringtipoid(tx, factoringValidated.factoringtipoid);
      if (!factoringtipo) {
        log.warn(line(), "Factoring tipo no existe: [" + factoringValidated.factoringtipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var riesgooperacion = await riesgoDao.getRiesgoByRiesgoid(tx, factoringValidated.riesgooperacionid);
      if (!riesgooperacion) {
        log.warn(line(), "Riesgo operación no existe: [" + factoringValidated.riesgooperacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoringestrategia = await factoringestrategiaDao.getFactoringestrategiaByFactoringestrategiaid(tx, factoringValidated.factoringestrategiaid);
      if (!factoringestrategia) {
        log.warn(line(), "Factoring estategia no existe: [" + factoringValidated.factoringestrategiaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      let fecha_ahora = luxon.DateTime.local();
      let fecha_fin = luxon.DateTime.fromISO(factoring.fecha_pago_estimado.toISOString());
      var dias_pago_estimado = fecha_fin.startOf("day").diff(fecha_ahora.startOf("day"), "days").days; // Actualizamos la cantidad de dias para el pago
      let dias_antiguedad_estimado = fecha_ahora.startOf("day").diff(luxon.DateTime.fromISO(factoring.fecha_emision.toISOString()).startOf("day"), "days").days;
      var simulacion = {};
      simulacion = await simulateFactoringLogicV2(
        riesgooperacion.idriesgo,
        factoring.cuentabancaria_cuenta_bancarium.idbanco,
        factoring.cantidad_facturas,
        factoring.monto_neto,
        dias_pago_estimado,
        factoringValidated.porcentaje_financiado_estimado,
        factoringValidated.tdm,
        dias_antiguedad_estimado
      );

      log.info(line(), "simulacion: ", simulacion);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
};

export const getFactoringpropuestasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestasByFactoringid");
  //log.info(line(),req.session_user.usuario.idusuario);
  const { id } = req.params;
  const factoringpropuestaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringpropuestaValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringpropuestaValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestas = await factoringpropuestaDao.getFactoringpropuestasByIdfactoring(tx, factoring.idfactoring, filter_estado);
      var factoringpropuestasJson = jsonUtils.sequelizeToJSON(factoringpropuestas);
      //log.info(line(),factoringpropuestaObfuscated);

      //var factoringpropuestasFiltered = jsonUtils.removeAttributes(factoringpropuestasJson, ["score"]);
      //factoringpropuestasFiltered = jsonUtils.removeAttributesPrivates(factoringpropuestasFiltered);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringpropuestasJson);
};

export const activateFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringpropuesta");
  const { id } = req.params;
  const factoringpropuestaSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaSchema.validateSync({ factoringpropuestaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAuditoria: Partial<factoring_propuesta> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario.idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 1;

      const factoringpropuestaActivated = await factoringpropuestaDao.activateFactoringpropuesta(tx, { ...factoringpropuestaValidated, ...camposAuditoria });
      if (factoringpropuestaActivated[0] === 0) {
        throw new ClientError("Factoringpropuesta no existe", 404);
      }
      log.debug(line(), "factoringpropuestaActivated:", factoringpropuestaActivated);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringpropuestaActivated);
};

export const deleteFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringpropuesta");
  const { id } = req.params;
  const factoringpropuestaSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaSchema.validateSync({ factoringpropuestaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAuditoria: Partial<factoring_propuesta> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario.idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 2;

      const factoringpropuestaDeleted = await factoringpropuestaDao.deleteFactoringpropuesta(tx, { ...factoringpropuestaValidated, ...camposAuditoria });
      if (factoringpropuestaDeleted[0] === 0) {
        throw new ClientError("Factoringpropuesta no existe", 404);
      }
      log.debug(line(), "factoringpropuestaDeleted:", factoringpropuestaDeleted);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringpropuestaDeleted);
};

export const getFactoringpropuestaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestaMaster");
  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);
      const factoringtipos = await factoringtipoDao.getFactoringtipos(tx, filter_estados);
      const factoringestrategias = await factoringestrategiaDao.getFactoringestrategias(tx, filter_estados);
      const factoringpropuestaestados = await factoringpropuestaestadoDao.getFactoringpropuestaestados(tx, filter_estados);

      var factoringpropuestasMaster: Record<string, any> = {};
      factoringpropuestasMaster.riesgos = riesgos;
      factoringpropuestasMaster.factoringtipos = factoringtipos;
      factoringpropuestasMaster.factoringestrategias = factoringestrategias;
      factoringpropuestasMaster.factoringpropuestaestados = factoringpropuestaestados;

      var factoringpropuestasMasterJSON = jsonUtils.sequelizeToJSON(factoringpropuestasMaster);
      //jsonUtils.prettyPrint(factoringpropuestasMasterJSON);
      var factoringpropuestasMasterObfuscated = factoringpropuestasMasterJSON;
      //jsonUtils.prettyPrint(factoringpropuestasMasterObfuscated);
      var factoringpropuestasMasterFiltered = jsonUtils.removeAttributesPrivates(factoringpropuestasMasterObfuscated);
      //jsonUtils.prettyPrint(factoringpropuestasMaster);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringpropuestasMasterFiltered);
};

export const getFactoringpropuestas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestas");
  //log.info(line(),req.session_user.usuario.idusuario);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const factoringpropuestas = await factoringpropuestaDao.getFactoringpropuestas(tx, filter_estado);
      var factoringpropuestasJson = jsonUtils.sequelizeToJSON(factoringpropuestas);
      //log.info(line(),factoringpropuestaObfuscated);

      //var factoringpropuestasFiltered = jsonUtils.removeAttributes(factoringpropuestasJson, ["score"]);
      //factoringpropuestasFiltered = jsonUtils.removeAttributesPrivates(factoringpropuestasFiltered);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringpropuestasJson);
};
