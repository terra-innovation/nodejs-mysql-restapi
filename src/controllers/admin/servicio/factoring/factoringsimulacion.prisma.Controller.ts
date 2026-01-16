import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as factoringsimulacionDao from "#src/daos/factoringsimulacion.prisma.Dao.js";

import * as factoringsimulacionfinancieroDao from "#src/daos/factoringsimulacionfinanciero.prisma.Dao.js";

import * as factoringtipoDao from "#src/daos/factoringtipo.prisma.Dao.js";
import * as factoringestrategiaDao from "#src/daos/factoringestrategia.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as riesgoDao from "#src/daos/riesgo.prisma.Dao.js";
import * as bancoDao from "#src/daos/banco.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import * as emailService from "#root/src/services/email.Service.js";

import type { factoring_simulacion } from "#root/generated/prisma/ft_factoring/client.js";
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

export const downloadFactoringsimulacionPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringsimulacionPDF");
  const { id } = req.params;
  const factoringsimulacionUpdateSchema = yup
    .object()
    .shape({
      factoringsimulacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringsimulacionValidated = factoringsimulacionUpdateSchema.validateSync({ factoringsimulacionid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringsimulacionValidated:", factoringsimulacionValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var factoringsimulacion = await factoringsimulacionDao.getFactoringsimulacionByFactoringsimulacionid(tx, factoringsimulacionValidated.factoringsimulacionid);
      if (!factoringsimulacion) {
        log.warn(line(), "Factoringsimulacion no existe: [" + factoringsimulacionValidated.factoringsimulacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      //log.debug(line(), "factoringsimulacion:", jsonUtils.sequelizeToJSON(factoringsimulacion));

      //log.debug(line(), "factoringsimulacion:", jsonUtils.sequelizeToJSON(factoring));

      // Generar el PDF
      const formattedDate = luxon.DateTime.now().toFormat("yyyyMMdd_HHmm");
      const filename = formattedDate + "_factoring_simulacion_" + factoringsimulacion.ruc_cedente + "_" + factoringsimulacion.code + ".pdf";
      const dirPath = path.join(storageUtils.pathApp(), storageUtils.STORAGE_PATH_PROCESAR, storageUtils.pathDate(new Date()));
      const filePath = path.join(dirPath, filename);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const pdfGenerator = new PDFGenerator(filePath);
      await pdfGenerator.generateFactoringSimulacion(factoringsimulacion);

      let filenameDownload = "Factoring_Simulacion_" + factoringsimulacion.ruc_cedente + "_" + factoringsimulacion.code + "_" + formattedDate + ".pdf";

      // res.setHeader("Content-Disposition", 'attachment; filename="' + filenameDownload + '"');

      setDownloadHeaders(res, filenameDownload);
      await sendFileAsync(req, res, filePath);
      await unlink(filePath);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
};

export const createFactoringsimulacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringsimulacion");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [1, 2];
  const factoringSimulateSchema = yup
    .object()
    .shape({
      bancoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      factoringtipoid: yup.string().trim().required().min(36).max(36),
      riesgooperacionid: yup.string().trim().required().min(36).max(36),
      factoringestrategiaid: yup.string().trim().required().min(36).max(36),
      tdm: yup.number().required().min(0).max(100),
      porcentaje_financiado_estimado: yup.number().required().min(0).max(100),

      ruc_cedente: yup
        .string()
        .trim()
        .matches(/^\d{11}$/, "RUC debe ser un número de exactamente 11 dígitos")
        .required(),
      ruc_aceptante: yup
        .string()
        .trim()
        .matches(/^\d{11}$/, "RUC debe ser un número de exactamente 11 dígitos")
        .required(),
      razon_social_cedente: yup.string().trim().required().min(2).max(200),
      razon_social_aceptante: yup.string().trim().required().min(2).max(200),

      fecha_pago_estimado: yup.date().required(),
      fecha_emision: yup.date().required(),
      cantidad_facturas: yup.number().required().min(1).max(100),
      monto_neto: yup.number().required().min(1),
    })
    .required();
  var factoringValidated = factoringSimulateSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  //log.debug(line(),"factoringValidated:", factoringValidated);

  const simulacion = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user.usuario.idusuario;
      const filter_estados = [1];

      var banco = await bancoDao.getBancoByBancoid(tx, factoringValidated.bancoid);
      if (!banco) {
        log.warn(line(), "Banco no existe: [" + factoringValidated.bancoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var moneda = await monedaDao.getMonedaByMonedaid(tx, factoringValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + factoringValidated.monedaid + "]");
        throw new ClientError("Moneda no válidos", 404);
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
      let fecha_fin = luxon.DateTime.fromISO(factoringValidated.fecha_pago_estimado.toISOString());
      let dias_pago_estimado = fecha_fin.startOf("day").diff(fecha_ahora.startOf("day"), "days").days; // Actualizamos la cantidad de dias para el pago
      let dias_antiguedad_estimado = fecha_ahora.startOf("day").diff(luxon.DateTime.fromISO(factoringValidated.fecha_emision.toISOString()).startOf("day"), "days").days;
      var simulacion: Partial<Simulacion> = {};
      simulacion = await simulateFactoringLogicV2(
        riesgooperacion.idriesgo,
        banco.idbanco,
        factoringValidated.cantidad_facturas,
        new Decimal(factoringValidated.monto_neto),
        dias_pago_estimado,
        new Decimal(factoringValidated.porcentaje_financiado_estimado),
        new Decimal(factoringValidated.tdm),
        dias_antiguedad_estimado
      );

      log.info(line(), "simulacion: ", simulacion);

      const factoringsimulacionToCreate: Prisma.factoring_simulacionCreateInput = {
        banco: { connect: { idbanco: banco.idbanco } },
        moneda: { connect: { idmoneda: moneda.idmoneda } },
        factoring_tipo: { connect: { idfactoringtipo: factoringtipo.idfactoringtipo } },
        riesgo_operacion: { connect: { idriesgo: riesgooperacion.idriesgo } },
        factoring_estrategia: { connect: { idfactoringestrategia: factoringestrategia.idfactoringestrategia } },

        factoringsimulacionid: uuidv4(),
        code: uuidv4().split("-")[0],
        ruc_cedente: factoringValidated.ruc_cedente,
        ruc_aceptante: factoringValidated.ruc_aceptante,
        razon_social_cedente: factoringValidated.razon_social_cedente,
        razon_social_aceptante: factoringValidated.razon_social_aceptante,
        cantidad_facturas: factoringValidated.cantidad_facturas,

        fecha_simulacion: new Date(),

        tda: simulacion.tda,
        tdm: simulacion.tdm,
        tdd: simulacion.tdd,
        tda_mora: simulacion.tda_mora,
        tdm_mora: simulacion.tdm_mora,
        tdd_mora: simulacion.tdd_mora,
        fecha_emision: factoringValidated.fecha_emision,
        fecha_pago_estimado: factoringValidated.fecha_pago_estimado,
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

      const factoringsimulacionCreated = await factoringsimulacionDao.insertFactoringsimulacion(tx, jsonUtils.omitNullAndUndefined(factoringsimulacionToCreate));
      log.debug(line(), "factoringsimulacionCreated:", factoringsimulacionCreated);

      for (let i = 0; i < simulacion?.comisiones?.length; i++) {
        const comision = simulacion.comisiones[i];

        const factoringsimulacionfinancieroToCreated: Prisma.factoring_simulacion_financieroCreateInput = {
          factoring_simulacion: { connect: { idfactoringsimulacion: factoringsimulacionCreated.idfactoringsimulacion } },
          financiero_tipo: { connect: { idfinancierotipo: comision.financierotipo.idfinancierotipo } },
          financiero_concepto: { connect: { idfinancieroconcepto: comision.financieroconcepto.idfinancieroconcepto } },
          factoringsimulacionfinancieroid: uuidv4(),
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
        const factoringsimulacionfinancieroCreated = await factoringsimulacionfinancieroDao.insertFactoringsimulacionfinanciero(tx, factoringsimulacionfinancieroToCreated);
        log.debug(line(), "factoringsimulacionfinancieroCreated:", factoringsimulacionfinancieroCreated);
      }

      for (let i = 0; i < simulacion?.costos?.length; i++) {
        const costo = simulacion.costos[i];

        const factoringsimulacionfinancieroToCreated: Prisma.factoring_simulacion_financieroCreateInput = {
          factoring_simulacion: { connect: { idfactoringsimulacion: factoringsimulacionCreated.idfactoringsimulacion } },
          financiero_tipo: { connect: { idfinancierotipo: costo.financierotipo.idfinancierotipo } },
          financiero_concepto: { connect: { idfinancieroconcepto: costo.financieroconcepto.idfinancieroconcepto } },
          factoringsimulacionfinancieroid: uuidv4(),
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
        const factoringsimulacionfinancieroCreated = await factoringsimulacionfinancieroDao.insertFactoringsimulacionfinanciero(tx, factoringsimulacionfinancieroToCreated);
        log.debug(line(), "factoringsimulacionfinancieroCreated:", factoringsimulacionfinancieroCreated);
      }
      for (let i = 0; i < simulacion?.gastos?.length; i++) {
        const gasto = simulacion.gastos[i];
        const factoringsimulacionfinancieroToCreated: Prisma.factoring_simulacion_financieroCreateInput = {
          factoring_simulacion: { connect: { idfactoringsimulacion: factoringsimulacionCreated.idfactoringsimulacion } },
          financiero_tipo: { connect: { idfinancierotipo: gasto.financierotipo.idfinancierotipo } },
          financiero_concepto: { connect: { idfinancieroconcepto: gasto.financieroconcepto.idfinancieroconcepto } },
          factoringsimulacionfinancieroid: uuidv4(),
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
        const factoringsimulacionfinancieroCreated = await factoringsimulacionfinancieroDao.insertFactoringsimulacionfinanciero(tx, factoringsimulacionfinancieroToCreated);
        log.debug(line(), "factoringsimulacionfinancieroCreated:", factoringsimulacionfinancieroCreated);
      }

      return simulacion;
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
};

export const simulateFactoringsimulacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::simulateFactoringsimulacion");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [1, 2];

  const factoringSimulateSchema = yup
    .object()
    .shape({
      factoringtipoid: yup.string().trim().required().min(36).max(36),
      riesgooperacionid: yup.string().trim().required().min(36).max(36),
      factoringestrategiaid: yup.string().trim().required().min(36).max(36),
      bancoid: yup.string().trim().required().min(36).max(36),
      tdm: yup.number().required().min(0).max(100),
      porcentaje_financiado_estimado: yup.number().required().min(0).max(100),
      fecha_pago_estimado: yup.date().required(),
      fecha_emision: yup.date().required(),
      cantidad_facturas: yup.number().required().min(1).max(100),
      monto_neto: yup.number().required().min(1),
    })
    .required();
  var factoringValidated = factoringSimulateSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringValidated:", factoringValidated);

  const simulacion = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user.usuario.idusuario;
      const filter_estados = [1];

      var banco = await bancoDao.getBancoByBancoid(tx, factoringValidated.bancoid);
      if (!banco) {
        log.warn(line(), "Banco no existe: [" + factoringValidated.bancoid + "]");
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
      let fecha_fin = luxon.DateTime.fromISO(factoringValidated.fecha_pago_estimado.toISOString());
      var dias_pago_estimado = fecha_fin.startOf("day").diff(fecha_ahora.startOf("day"), "days").days; // Actualizamos la cantidad de dias para el pago
      let dias_antiguedad_estimado = fecha_ahora.startOf("day").diff(luxon.DateTime.fromISO(factoringValidated.fecha_emision.toISOString()).startOf("day"), "days").days;
      var simulacion = {};
      simulacion = await simulateFactoringLogicV2(
        riesgooperacion.idriesgo,
        banco.idbanco,
        factoringValidated.cantidad_facturas,
        new Decimal(factoringValidated.monto_neto),
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

export const activateFactoringsimulacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringsimulacion");
  const { id } = req.params;
  const factoringsimulacionSchema = yup
    .object()
    .shape({
      factoringsimulacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringsimulacionValidated = factoringsimulacionSchema.validateSync({ factoringsimulacionid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringsimulacionValidated:", factoringsimulacionValidated);

  const factoringsimulacionActivated = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringsimulacionActivated = await factoringsimulacionDao.activateFactoringsimulacion(tx, factoringsimulacionValidated.factoringsimulacionid, req.session_user.usuario.idusuario);
      if (factoringsimulacionActivated[0] === 0) {
        throw new ClientError("Factoringsimulacion no existe", 404);
      }
      log.debug(line(), "factoringsimulacionActivated:", factoringsimulacionActivated);
      return factoringsimulacionActivated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringsimulacionActivated);
};

export const deleteFactoringsimulacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringsimulacion");
  const { id } = req.params;
  const factoringsimulacionSchema = yup
    .object()
    .shape({
      factoringsimulacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringsimulacionValidated = factoringsimulacionSchema.validateSync({ factoringsimulacionid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringsimulacionValidated:", factoringsimulacionValidated);

  const factoringsimulacionDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringsimulacionDeleted = await factoringsimulacionDao.deleteFactoringsimulacion(tx, factoringsimulacionValidated.factoringsimulacionid, req.session_user.usuario.idusuario);
      if (factoringsimulacionDeleted[0] === 0) {
        throw new ClientError("Factoringsimulacion no existe", 404);
      }
      log.debug(line(), "factoringsimulacionDeleted:", factoringsimulacionDeleted);
      return factoringsimulacionDeleted;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringsimulacionDeleted);
};

export const getFactoringsimulacionMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsimulacionMaster");
  const factoringsimulacionsMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);
      const factoringtipos = await factoringtipoDao.getFactoringtipos(tx, filter_estados);
      const factoringestrategias = await factoringestrategiaDao.getFactoringestrategias(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);

      var factoringsimulacionsMaster: Record<string, any> = {};
      factoringsimulacionsMaster.bancos = bancos;
      factoringsimulacionsMaster.riesgos = riesgos;
      factoringsimulacionsMaster.factoringtipos = factoringtipos;
      factoringsimulacionsMaster.factoringestrategias = factoringestrategias;
      factoringsimulacionsMaster.monedas = monedas;

      var factoringsimulacionsMasterJSON = jsonUtils.sequelizeToJSON(factoringsimulacionsMaster);
      //jsonUtils.prettyPrint(factoringsimulacionsMasterJSON);
      var factoringsimulacionsMasterObfuscated = factoringsimulacionsMasterJSON;
      //jsonUtils.prettyPrint(factoringsimulacionsMasterObfuscated);
      var factoringsimulacionsMasterFiltered = jsonUtils.removeAttributesPrivates(factoringsimulacionsMasterObfuscated);
      //jsonUtils.prettyPrint(factoringsimulacionsMaster);
      return factoringsimulacionsMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringsimulacionsMasterFiltered);
};

export const getFactoringsimulacions = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsimulacions");
  //log.info(line(),req.session_user.usuario.idusuario);

  const factoringsimulacionsJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const factoringsimulacions = await factoringsimulacionDao.getFactoringsimulacions(tx, filter_estado);
      var factoringsimulacionsJson = jsonUtils.sequelizeToJSON(factoringsimulacions);
      //log.info(line(),factoringsimulacionObfuscated);

      //var factoringsimulacionsFiltered = jsonUtils.removeAttributes(factoringsimulacionsJson, ["score"]);
      //factoringsimulacionsFiltered = jsonUtils.removeAttributesPrivates(factoringsimulacionsFiltered);
      return factoringsimulacionsJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringsimulacionsJson);
};
