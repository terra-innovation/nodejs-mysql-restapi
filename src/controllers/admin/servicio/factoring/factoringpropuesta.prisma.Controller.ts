import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as factoringpropuestaDao from "#src/daos/factoringpropuesta.prisma.Dao.js";
import * as factoringpropuestahistorialestadoDao from "#src/daos/factoringpropuestahistorialestado.prisma.Dao.js";
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

import type { factoring_propuesta } from "#root/generated/prisma/ft_factoring/client.js";
import { Simulacion } from "#src/types/Simulacion.prisma.types.js";

import * as luxon from "luxon";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import { simulateFactoringLogicV2 } from "#src/logics/factoring.prisma.Logic.js";

import { unlink } from "fs/promises";
import path from "path"; // Para eliminar el archivo después de enviarlo
import PDFGenerator from "#src/utils/document/PDFgenerator.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import * as fs from "fs";
import { Decimal } from "@prisma/client/runtime/library";

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
      const filename = formattedDate + "_factoring_propuesta_" + factoring.empresa_cedente.ruc + "_" + factoringpropuesta.code + ".pdf";
      const dirPath = path.join(storageUtils.pathApp(), storageUtils.STORAGE_PATH_PROCESAR, storageUtils.pathDate(new Date()));
      const filePath = path.join(dirPath, filename);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const pdfGenerator = new PDFGenerator(filePath);
      await pdfGenerator.generateFactoringQuote(factoring, factoringpropuesta);

      let filenameDownload = "Factoring_Propuesta_" + factoring.empresa_cedente.ruc + "_" + factoringpropuesta.code + "_" + formattedDate + ".pdf";

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

      const factoringpropuestahistorialestadoToCreate: Prisma.factoring_propuesta_historial_estadoCreateInput = {
        factoring_propuesta: { connect: { idfactoringpropuesta: factoringpropuesta.idfactoringpropuesta } },
        factoring_propuesta_estado: { connect: { idfactoringpropuestaestado: factoringpropuestaestado.idfactoringpropuestaestado } },
        usuario_modifica: { connect: { idusuario: req.session_user.usuario.idusuario } },

        factoringpropuestahistorialestadoid: uuidv4(),
        code: uuidv4().split("-")[0],
        comentario: "",
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

      const factoringpropuestaUpdated = await factoringpropuestaDao.updateFactoringpropuesta(tx, factoringpropuestaValidated.factoringpropuestaid, factoringpropuestaToUpdate);
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

  const simulacion = await prismaFT.client.$transaction(
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
        factoring.cuenta_bancaria.idbanco,
        factoring.cantidad_facturas,
        factoring.monto_neto,
        dias_pago_estimado,
        new Decimal(factoringValidated.porcentaje_financiado_estimado),
        new Decimal(factoringValidated.tdm),
        dias_antiguedad_estimado
      );

      log.info(line(), "simulacion: ", simulacion);

      const factoringpropuestaToCreate: Prisma.factoring_propuestaCreateInput = {
        factoring: { connect: { idfactoring: factoring.idfactoring } },
        factoring_tipo: { connect: { idfactoringtipo: factoringtipo.idfactoringtipo } },
        factoring_propuesta_estado: { connect: { idfactoringpropuestaestado: factoringpropuestaestado.idfactoringpropuestaestado } },
        riesgo_operacion: { connect: { idriesgo: riesgooperacion.idriesgo } },
        factoring_estrategia: { connect: { idfactoringestrategia: factoringestrategia.idfactoringestrategia } },

        factoringpropuestaid: uuidv4(),
        code: uuidv4().split("-")[0],
        fecha_propuesta: new Date(),

        tda: simulacion.tda,
        tdm: simulacion.tdm,
        tdd: simulacion.tdd,
        tda_mora: simulacion.tda_mora,
        tdm_mora: simulacion.tdm_mora,
        tdd_mora: simulacion.tdd_mora,
        fecha_pago_estimado: factoring.fecha_pago_estimado,
        dias_pago_estimado: simulacion.dias_pago_estimado,
        dias_antiguedad_estimado: dias_antiguedad_estimado,
        dias_cobertura_garantia_estimado: simulacion.dias_cobertura_garantia_estimado,
        monto_neto: simulacion.monto_neto,
        monto_garantia: simulacion.monto_garantia,
        monto_efectivo: simulacion.monto_efectivo,
        monto_descuento: simulacion.monto_descuento,
        monto_financiado: simulacion.monto_financiado,
        monto_comision: simulacion.monto_comision,
        monto_comision_igv: simulacion.monto_comision_igv,
        monto_costo_estimado: simulacion.monto_costo_estimado,
        monto_costo_estimado_igv: simulacion.monto_costo_estimado_igv,
        monto_gasto_estimado: simulacion.monto_gasto_estimado,
        monto_gasto_estimado_igv: simulacion.monto_gasto_estimado_igv,
        monto_total_igv: simulacion.monto_total_igv,
        monto_adelanto: simulacion.monto_adelanto,
        monto_dia_mora_estimado: simulacion.monto_dia_mora_estimado,
        monto_dia_interes_estimado: simulacion.monto_dia_interes_estimado,
        porcentaje_garantia_estimado: simulacion.porcentaje_garantia_estimado,
        porcentaje_efectivo_estimado: simulacion.porcentaje_efectivo_estimado,
        porcentaje_descuento_estimado: simulacion.porcentaje_descuento_estimado,
        porcentaje_financiado_estimado: simulacion.porcentaje_financiado_estimado,
        porcentaje_adelanto_estimado: simulacion.porcentaje_adelanto_estimado,
        porcentaje_comision_estimado: simulacion.porcentaje_comision_estimado,

        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringpropuestaCreated = await factoringpropuestaDao.insertFactoringpropuesta(tx, jsonUtils.omitNullAndUndefined(factoringpropuestaToCreate));
      log.debug(line(), "factoringpropuestaCreated:", factoringpropuestaCreated);

      const factoringpropuestahistorialestadoToCreate: Prisma.factoring_propuesta_historial_estadoCreateInput = {
        factoring_propuesta: { connect: { idfactoringpropuesta: factoringpropuestaCreated.idfactoringpropuesta } },
        factoring_propuesta_estado: { connect: { idfactoringpropuestaestado: factoringpropuestaestado.idfactoringpropuestaestado } },
        usuario_modifica: { connect: { idusuario: req.session_user.usuario.idusuario } },

        factoringpropuestahistorialestadoid: uuidv4(),
        code: uuidv4().split("-")[0],

        comentario: "",

        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringpropuestahistorialestadoCreated = await factoringpropuestahistorialestadoDao.insertFactoringpropuestahistorialestado(tx, jsonUtils.omitNullAndUndefined(factoringpropuestahistorialestadoToCreate));
      log.debug(line(), "factoringpropuestahistorialestadoCreated:", factoringpropuestahistorialestadoCreated);

      for (let i = 0; i < simulacion?.comisiones?.length; i++) {
        const comision = simulacion.comisiones[i];

        const factoringpropuestafinancieroToCreated: Prisma.factoring_propuesta_financieroCreateInput = {
          factoring_propuesta: { connect: { idfactoringpropuesta: factoringpropuestaCreated.idfactoringpropuesta } },
          financiero_tipo: { connect: { idfinancierotipo: comision.financierotipo.idfinancierotipo } },
          financiero_concepto: { connect: { idfinancieroconcepto: comision.financieroconcepto.idfinancieroconcepto } },
          factoringpropuestafinancieroid: uuidv4(),
          code: uuidv4().split("-")[0],
          monto: comision.monto,
          igv: comision.igv,
          total: comision.total,
          idusuariocrea: req.session_user.usuario.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };
        const factoringpropuestafinancieroCreated = await factoringpropuestafinancieroDao.insertFactoringpropuestafinanciero(tx, factoringpropuestafinancieroToCreated);
        log.debug(line(), "factoringpropuestafinancieroCreated:", factoringpropuestafinancieroCreated);
      }

      for (let i = 0; i < simulacion?.costos?.length; i++) {
        const costo = simulacion.costos[i];

        const factoringpropuestafinancieroToCreated: Prisma.factoring_propuesta_financieroCreateInput = {
          factoring_propuesta: { connect: { idfactoringpropuesta: factoringpropuestaCreated.idfactoringpropuesta } },
          financiero_tipo: { connect: { idfinancierotipo: costo.financierotipo.idfinancierotipo } },
          financiero_concepto: { connect: { idfinancieroconcepto: costo.financieroconcepto.idfinancieroconcepto } },
          factoringpropuestafinancieroid: uuidv4(),
          code: uuidv4().split("-")[0],
          monto: costo.monto,
          igv: costo.igv,
          total: costo.total,
          idusuariocrea: req.session_user.usuario.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };
        const factoringpropuestafinancieroCreated = await factoringpropuestafinancieroDao.insertFactoringpropuestafinanciero(tx, factoringpropuestafinancieroToCreated);
        log.debug(line(), "factoringpropuestafinancieroCreated:", factoringpropuestafinancieroCreated);
      }
      for (let i = 0; i < simulacion?.gastos?.length; i++) {
        const gasto = simulacion.gastos[i];
        const factoringpropuestafinancieroToCreated: Prisma.factoring_propuesta_financieroCreateInput = {
          factoring_propuesta: { connect: { idfactoringpropuesta: factoringpropuestaCreated.idfactoringpropuesta } },
          financiero_tipo: { connect: { idfinancierotipo: gasto.financierotipo.idfinancierotipo } },
          financiero_concepto: { connect: { idfinancieroconcepto: gasto.financieroconcepto.idfinancieroconcepto } },
          factoringpropuestafinancieroid: uuidv4(),
          code: uuidv4().split("-")[0],
          monto: gasto.monto,
          igv: gasto.igv,
          total: gasto.total,
          idusuariocrea: req.session_user.usuario.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };
        const factoringpropuestafinancieroCreated = await factoringpropuestafinancieroDao.insertFactoringpropuestafinanciero(tx, factoringpropuestafinancieroToCreated);
        log.debug(line(), "factoringpropuestafinancieroCreated:", factoringpropuestafinancieroCreated);
      }

      return simulacion;
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
};

export const simulateFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::simulateFactoringpropuesta");
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
  log.debug(line(), "factoringValidated:", factoringValidated);

  const simulacion = await prismaFT.client.$transaction(
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
        factoring.cuenta_bancaria.idbanco,
        factoring.cantidad_facturas,
        factoring.monto_neto,
        dias_pago_estimado,
        new Decimal(factoringValidated.porcentaje_financiado_estimado),
        new Decimal(factoringValidated.tdm),
        dias_antiguedad_estimado
      );

      log.info(line(), "simulacion: ", simulacion);

      return simulacion;
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

  const factoringpropuestasJson = await prismaFT.client.$transaction(
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
      return factoringpropuestasJson;
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

  const factoringpropuestaActivated = await prismaFT.client.$transaction(
    async (tx) => {
      const $Activated = await factoringpropuestaDao.activateFactoringpropuesta(tx, factoringpropuestaValidated.factoringpropuestaid, req.session_user.usuario.idusuario);
      if (factoringpropuestaActivated[0] === 0) {
        throw new ClientError("Factoringpropuesta no existe", 404);
      }
      log.debug(line(), "factoringpropuestaActivated:", factoringpropuestaActivated);
      return factoringpropuestaActivated;
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

  const factoringpropuestaDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringpropuestaDeleted = await factoringpropuestaDao.deleteFactoringpropuesta(tx, factoringpropuestaValidated.factoringpropuestaid, req.session_user.usuario.idusuario);
      if (factoringpropuestaDeleted[0] === 0) {
        throw new ClientError("Factoringpropuesta no existe", 404);
      }
      log.debug(line(), "factoringpropuestaDeleted:", factoringpropuestaDeleted);
      return factoringpropuestaDeleted;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringpropuestaDeleted);
};

export const getFactoringpropuestaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestaMaster");
  const factoringpropuestasMasterFiltered = await prismaFT.client.$transaction(
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
      return factoringpropuestasMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringpropuestasMasterFiltered);
};

export const getFactoringpropuestas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestas");
  //log.info(line(),req.session_user.usuario.idusuario);

  const factoringpropuestasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const factoringpropuestas = await factoringpropuestaDao.getFactoringpropuestas(tx, filter_estado);
      var factoringpropuestasJson = jsonUtils.sequelizeToJSON(factoringpropuestas);
      //log.info(line(),factoringpropuestaObfuscated);

      //var factoringpropuestasFiltered = jsonUtils.removeAttributes(factoringpropuestasJson, ["score"]);
      //factoringpropuestasFiltered = jsonUtils.removeAttributesPrivates(factoringpropuestasFiltered);
      return factoringpropuestasJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringpropuestasJson);
};
