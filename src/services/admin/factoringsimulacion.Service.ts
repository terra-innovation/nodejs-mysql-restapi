import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as bancoDao from "#root/src/daos/banco.Dao.js";
import * as factoringestrategiaDao from "#root/src/daos/factoringestrategia.Dao.js";
import * as factoringsimulacionDao from "#root/src/daos/factoringsimulacion.Dao.js";
import * as factoringsimulacionfinancieroDao from "#root/src/daos/factoringsimulacionfinanciero.Dao.js";
import * as factoringtipoDao from "#root/src/daos/factoringtipo.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import * as riesgoDao from "#root/src/daos/riesgo.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { simulateFactoringLogicV4 } from "#root/src/services/factoring.Service.js";
import { Simulacion } from "#root/src/types/Simulacion.types.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as dateUtils from "#src/utils/dateUtils.js";
import PDFGenerator from "#src/utils/document/PDFgenerator.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import { Decimal } from "@prisma/client/runtime/library";
import * as fs from "fs";
import * as luxon from "luxon";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export interface CreateFactoringsimulacionPayload {
  bancoid: string;
  monedaid: string;
  factoringtipoid: string;
  riesgooperacionid: string;
  factoringestrategiaid: string;
  tdm: number;
  porcentaje_financiado_estimado: number;
  porcentaje_comision_descuento: number;
  ruc_cedente: string;
  ruc_aceptante: string;
  razon_social_cedente: string;
  razon_social_aceptante: string;
  fecha_pago_estimado: Date;
  fecha_emision: Date;
  cantidad_facturas: number;
  monto_neto: number;
}

export interface SimulateFactoringsimulacionPayload {
  factoringtipoid: string;
  riesgooperacionid: string;
  factoringestrategiaid: string;
  bancoid: string;
  monedaid: string;
  tdm: number;
  porcentaje_financiado_estimado: number;
  fecha_pago_estimado: Date;
  fecha_emision: Date;
  cantidad_facturas: number;
  monto_neto: number;
  porcentaje_comision_descuento: number;
}

export const generateFactoringsimulacionPDFService = async (factoringsimulacionid: string) => {
  log.debug(line(), "service::generateFactoringsimulacionPDFService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringsimulacion = await factoringsimulacionDao.getFactoringsimulacionByFactoringsimulacionid(tx, factoringsimulacionid);
      if (!factoringsimulacion) {
        log.warn(line(), "Factoringsimulacion no existe: [" + factoringsimulacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const formattedDate = luxon.DateTime.now().toFormat("yyyyMMdd_HHmm");
      const filename = formattedDate + "_factoring_simulacion_" + factoringsimulacion.ruc_cedente + "_" + factoringsimulacion.code + ".pdf";
      const dirPath = path.join(storageUtils.pathApp(), storageUtils.STORAGE_PATH_PROCESAR, storageUtils.pathDate(new Date()));
      const filePath = path.join(dirPath, filename);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const pdfGenerator = new PDFGenerator(filePath);
      await pdfGenerator.generateFactoringSimulacion(factoringsimulacion);

      const filenameDownload = "Factoring_Simulacion_" + factoringsimulacion.ruc_cedente + "_" + factoringsimulacion.code + "_" + formattedDate + ".pdf";

      return { filePath, filenameDownload };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const createFactoringsimulacionService = async (session_idusuario: number, factoringValidated: CreateFactoringsimulacionPayload) => {
  log.debug(line(), "service::createFactoringsimulacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const banco = await bancoDao.getBancoByBancoid(tx, factoringValidated.bancoid);
      if (!banco) {
        log.warn(line(), "Banco no existe: [" + factoringValidated.bancoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const moneda = await monedaDao.getMonedaByMonedaid(tx, factoringValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + factoringValidated.monedaid + "]");
        throw new ClientError("Moneda no válidos", 404);
      }

      const factoringtipo = await factoringtipoDao.getFactoringtipoByFactoringtipoid(tx, factoringValidated.factoringtipoid);
      if (!factoringtipo) {
        log.warn(line(), "Factoring tipo no existe: [" + factoringValidated.factoringtipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const riesgooperacion = await riesgoDao.getRiesgoByRiesgoid(tx, factoringValidated.riesgooperacionid);
      if (!riesgooperacion) {
        log.warn(line(), "Riesgo operación no existe: [" + factoringValidated.riesgooperacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringestrategia = await factoringestrategiaDao.getFactoringestrategiaByFactoringestrategiaid(tx, factoringValidated.factoringestrategiaid);
      if (!factoringestrategia) {
        log.warn(line(), "Factoring estategia no existe: [" + factoringValidated.factoringestrategiaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const fecha_ahora = dateUtils.getNowLima();
      const fecha_fin = dateUtils.toLimaDate(factoringValidated.fecha_pago_estimado);
      const fecha_emision = dateUtils.toLimaDate(factoringValidated.fecha_emision);

      const simulacion: Partial<Simulacion> = await simulateFactoringLogicV4(
        riesgooperacion.idriesgo,
        banco.idbanco,
        factoringValidated.cantidad_facturas,
        new Decimal(factoringValidated.monto_neto),
        fecha_ahora,
        fecha_fin,
        fecha_emision,
        new Decimal(factoringValidated.porcentaje_financiado_estimado),
        new Decimal(factoringValidated.tdm),
        new Decimal(factoringValidated.porcentaje_comision_descuento),
        moneda.idmoneda,
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

        fecha_simulacion: simulacion.fecha_propuesta,

        tda: simulacion.tda,
        tdm: simulacion.tdm,
        tdd: simulacion.tdd,
        tda_mora: simulacion.tda_mora,
        tdm_mora: simulacion.tdm_mora,
        tdd_mora: simulacion.tdd_mora,
        fecha_emision: factoringValidated.fecha_emision,
        fecha_pago_estimado: factoringValidated.fecha_pago_estimado,
        dias_pago_estimado: simulacion.dias_pago_estimado,
        dias_antiguedad_estimado: simulacion.dias_antiguedad_estimado,
        dias_cobertura_garantia_estimado: simulacion.dias_cobertura_garantia_estimado,
        monto_neto: simulacion.monto_neto,
        monto_garantia: simulacion.monto_garantia,
        monto_efectivo: simulacion.monto_efectivo,
        monto_descuento: simulacion.monto_descuento,
        monto_financiado: simulacion.monto_financiado,
        monto_comision_bruto: simulacion.monto_comision_bruto,
        monto_comision: simulacion.monto_comision,
        monto_comision_igv: simulacion.monto_comision_igv,
        monto_costo_estimado: simulacion.monto_costo_estimado,
        monto_costo_estimado_igv: simulacion.monto_costo_estimado_igv,
        monto_gasto_estimado: simulacion.monto_gasto_estimado,
        monto_gasto_estimado_igv: simulacion.monto_gasto_estimado_igv,
        monto_total_igv: simulacion.monto_total_igv,
        monto_gasto_excento_igv: simulacion.monto_gasto_excento_igv,
        monto_adelanto: simulacion.monto_adelanto,
        monto_dia_mora_estimado: simulacion.monto_dia_mora_estimado,
        monto_dia_interes_estimado: simulacion.monto_dia_interes_estimado,
        porcentaje_comision_descuento: simulacion.porcentaje_comision_descuento,
        porcentaje_garantia_estimado: simulacion.porcentaje_garantia_estimado,
        porcentaje_efectivo_estimado: simulacion.porcentaje_efectivo_estimado,
        porcentaje_descuento_estimado: simulacion.porcentaje_descuento_estimado,
        porcentaje_financiado_estimado: simulacion.porcentaje_financiado_estimado,
        porcentaje_adelanto_estimado: simulacion.porcentaje_adelanto_estimado,
        porcentaje_comision_estimado: simulacion.porcentaje_comision_estimado,

        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringsimulacionCreated = await factoringsimulacionDao.insertFactoringsimulacion(tx, jsonUtils.omitNullAndUndefined(factoringsimulacionToCreate));
      log.debug(line(), "factoringsimulacionCreated:", factoringsimulacionCreated);

      for (let i = 0; i < (simulacion?.comisiones?.length ?? 0); i++) {
        const comision = simulacion.comisiones![i];
        const factoringsimulacionfinancieroToCreated: Prisma.factoring_simulacion_financieroCreateInput = {
          factoring_simulacion: { connect: { idfactoringsimulacion: factoringsimulacionCreated.idfactoringsimulacion } },
          financiero_tipo: { connect: { idfinancierotipo: comision.financiero_tipo.idfinancierotipo } },
          financiero_concepto: { connect: { idfinancieroconcepto: comision.financiero_concepto.idfinancieroconcepto } },
          factoringsimulacionfinancieroid: uuidv4(),
          code: uuidv4().split("-")[0],
          cantidad: comision.cantidad,
          monto_unitario: comision.monto_unitario,
          monto: comision.monto,
          igv: comision.igv,
          total: comision.total,
          porcentaje_monto: comision.porcentaje_monto,
          idusuariocrea: session_idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: session_idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };
        await factoringsimulacionfinancieroDao.insertFactoringsimulacionfinanciero(tx, factoringsimulacionfinancieroToCreated);
      }

      for (let i = 0; i < (simulacion?.costos?.length ?? 0); i++) {
        const costo = simulacion.costos![i];
        const factoringsimulacionfinancieroToCreated: Prisma.factoring_simulacion_financieroCreateInput = {
          factoring_simulacion: { connect: { idfactoringsimulacion: factoringsimulacionCreated.idfactoringsimulacion } },
          financiero_tipo: { connect: { idfinancierotipo: costo.financiero_tipo.idfinancierotipo } },
          financiero_concepto: { connect: { idfinancieroconcepto: costo.financiero_concepto.idfinancieroconcepto } },
          factoringsimulacionfinancieroid: uuidv4(),
          code: uuidv4().split("-")[0],
          cantidad: costo.cantidad,
          monto_unitario: costo.monto_unitario,
          monto: costo.monto,
          igv: costo.igv,
          total: costo.total,
          porcentaje_monto: costo.porcentaje_monto,
          idusuariocrea: session_idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: session_idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };
        await factoringsimulacionfinancieroDao.insertFactoringsimulacionfinanciero(tx, factoringsimulacionfinancieroToCreated);
      }

      for (let i = 0; i < (simulacion?.gastos?.length ?? 0); i++) {
        const gasto = simulacion.gastos![i];
        const factoringsimulacionfinancieroToCreated: Prisma.factoring_simulacion_financieroCreateInput = {
          factoring_simulacion: { connect: { idfactoringsimulacion: factoringsimulacionCreated.idfactoringsimulacion } },
          financiero_tipo: { connect: { idfinancierotipo: gasto.financiero_tipo.idfinancierotipo } },
          financiero_concepto: { connect: { idfinancieroconcepto: gasto.financiero_concepto.idfinancieroconcepto } },
          factoringsimulacionfinancieroid: uuidv4(),
          code: uuidv4().split("-")[0],
          cantidad: gasto.cantidad,
          monto_unitario: gasto.monto_unitario,
          monto: gasto.monto,
          igv: gasto.igv,
          total: gasto.total,
          porcentaje_monto: gasto.porcentaje_monto,
          idusuariocrea: session_idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: session_idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };
        await factoringsimulacionfinancieroDao.insertFactoringsimulacionfinanciero(tx, factoringsimulacionfinancieroToCreated);
      }

      for (let i = 0; i < (simulacion?.gastos_excento_igv?.length ?? 0); i++) {
        const gasto_excento_igv = simulacion.gastos_excento_igv![i];
        const factoringsimulacionfinancieroToCreated: Prisma.factoring_simulacion_financieroCreateInput = {
          factoring_simulacion: { connect: { idfactoringsimulacion: factoringsimulacionCreated.idfactoringsimulacion } },
          financiero_tipo: { connect: { idfinancierotipo: gasto_excento_igv.financiero_tipo.idfinancierotipo } },
          financiero_concepto: { connect: { idfinancieroconcepto: gasto_excento_igv.financiero_concepto.idfinancieroconcepto } },
          factoringsimulacionfinancieroid: uuidv4(),
          code: uuidv4().split("-")[0],
          cantidad: gasto_excento_igv.cantidad,
          monto_unitario: gasto_excento_igv.monto_unitario,
          monto: gasto_excento_igv.monto,
          igv: gasto_excento_igv.igv,
          total: gasto_excento_igv.total,
          porcentaje_monto: gasto_excento_igv.porcentaje_monto,
          idusuariocrea: session_idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: session_idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };
        await factoringsimulacionfinancieroDao.insertFactoringsimulacionfinanciero(tx, factoringsimulacionfinancieroToCreated);
      }

      return simulacion;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const simulateFactoringsimulacionService = async (factoringValidated: SimulateFactoringsimulacionPayload) => {
  log.debug(line(), "service::simulateFactoringsimulacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const banco = await bancoDao.getBancoByBancoid(tx, factoringValidated.bancoid);
      if (!banco) {
        log.warn(line(), "Banco no existe: [" + factoringValidated.bancoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const moneda = await monedaDao.getMonedaByMonedaid(tx, factoringValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + factoringValidated.monedaid + "]");
        throw new ClientError("Moneda no válidos", 404);
      }

      const factoringtipo = await factoringtipoDao.getFactoringtipoByFactoringtipoid(tx, factoringValidated.factoringtipoid);
      if (!factoringtipo) {
        log.warn(line(), "Factoring tipo no existe: [" + factoringValidated.factoringtipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const riesgooperacion = await riesgoDao.getRiesgoByRiesgoid(tx, factoringValidated.riesgooperacionid);
      if (!riesgooperacion) {
        log.warn(line(), "Riesgo operación no existe: [" + factoringValidated.riesgooperacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringestrategia = await factoringestrategiaDao.getFactoringestrategiaByFactoringestrategiaid(tx, factoringValidated.factoringestrategiaid);
      if (!factoringestrategia) {
        log.warn(line(), "Factoring estategia no existe: [" + factoringValidated.factoringestrategiaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const fecha_ahora = dateUtils.getNowLima();
      const fecha_fin = dateUtils.toLimaDate(factoringValidated.fecha_pago_estimado);
      const fecha_emision = dateUtils.toLimaDate(factoringValidated.fecha_emision);

      const simulacion = await simulateFactoringLogicV4(
        riesgooperacion.idriesgo,
        banco.idbanco,
        factoringValidated.cantidad_facturas,
        new Decimal(factoringValidated.monto_neto),
        fecha_ahora,
        fecha_fin,
        fecha_emision,
        new Decimal(factoringValidated.porcentaje_financiado_estimado),
        new Decimal(factoringValidated.tdm),
        new Decimal(factoringValidated.porcentaje_comision_descuento),
        moneda.idmoneda,
      );

      log.info(line(), "simulacion: ", simulacion);
      return simulacion;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const activateFactoringsimulacionService = async (factoringsimulacionid: string, idusuario: number) => {
  log.debug(line(), "service::activateFactoringsimulacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringsimulacionActivated = await factoringsimulacionDao.activateFactoringsimulacion(tx, factoringsimulacionid, idusuario);
      if (factoringsimulacionActivated[0] === 0) {
        throw new ClientError("Factoringsimulacion no existe", 404);
      }
      return factoringsimulacionActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deleteFactoringsimulacionService = async (factoringsimulacionid: string, idusuario: number) => {
  log.debug(line(), "service::deleteFactoringsimulacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringsimulacionDeleted = await factoringsimulacionDao.deleteFactoringsimulacion(tx, factoringsimulacionid, idusuario);
      if (factoringsimulacionDeleted[0] === 0) {
        throw new ClientError("Factoringsimulacion no existe", 404);
      }
      return factoringsimulacionDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactoringsimulacionMasterService = async () => {
  log.debug(line(), "service::getFactoringsimulacionMasterService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);
      const factoringtipos = await factoringtipoDao.getFactoringtipos(tx, filter_estados);
      const factoringestrategias = await factoringestrategiaDao.getFactoringestrategias(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);

      const factoringsimulacionsMaster: Record<string, any> = {
        bancos,
        riesgos,
        factoringtipos,
        factoringestrategias,
        monedas,
      };

      return factoringsimulacionsMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactoringsimulacionsService = async () => {
  log.debug(line(), "service::getFactoringsimulacionsService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      return await factoringsimulacionDao.getFactoringsimulacions(tx, filter_estado);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
