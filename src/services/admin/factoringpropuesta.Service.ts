import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringestrategiaDao from "#root/src/daos/factoringestrategia.Dao.js";
import * as factoringpropuestaDao from "#root/src/daos/factoringpropuesta.Dao.js";
import * as factoringpropuestaestadoDao from "#root/src/daos/factoringpropuestaestado.Dao.js";
import * as factoringpropuestafinancieroDao from "#root/src/daos/factoringpropuestafinanciero.Dao.js";
import * as factoringpropuestahistorialestadoDao from "#root/src/daos/factoringpropuestahistorialestado.Dao.js";
import * as factoringtipoDao from "#root/src/daos/factoringtipo.Dao.js";
import * as riesgoDao from "#root/src/daos/riesgo.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as emailService from "#root/src/providers/email/email.Provider.js";
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

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface FactoringpropuestaIdDto {
  factoringpropuestaid: string;
}

export interface UpdateFactoringpropuestaDto {
  factoringpropuestaid: string;
  factoringpropuestaestadoid: string;
}

export interface CreateFactoringpropuestaDto {
  factoringid: string;
  factoringtipoid: string;
  riesgooperacionid: string;
  riesgocedenteid: string;
  riesgoaceptanteid: string;
  factoringpropuestaestadoid: string;
  factoringestrategiaid: string;
  tdm: number;
  porcentaje_financiado_estimado: number;
  porcentaje_comision_descuento: number;
  fecha_pago_estimado: Date | string;
  monto_neto: number;
}

export interface SimulateFactoringpropuestaDto {
  factoringid: string;
  factoringtipoid: string;
  riesgooperacionid: string;
  factoringestrategiaid: string;
  tdm: number;
  porcentaje_financiado_estimado: number;
  porcentaje_comision_descuento: number;
  fecha_pago_estimado: Date | string;
  monto_neto: number;
}

export interface GetFactoringpropuestasByFactoringidDto {
  factoringid: string;
}

// ─── Services ────────────────────────────────────────────────────────────────

/**
 * Genera el documento PDF de la propuesta de factoring.
 */
export const generateFactoringpropuestaPDFService = async (factoringpropuestaid: string) => {
  log.debug(line(), "service::admin::generateFactoringpropuestaPDFService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringpropuesta =
        await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(
          tx,
          factoringpropuestaid,
        );
      if (!factoringpropuesta) {
        log.warn(line(), `Factoringpropuesta no existe: [${factoringpropuestaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoring = await factoringDao.getFactoringByIdfactoring(
        tx,
        factoringpropuesta.idfactoring,
      );
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${factoringpropuesta.idfactoring}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const formattedDate = luxon.DateTime.now().toFormat("yyyyMMdd_HHmm");
      const filename = `${formattedDate}_factoring_propuesta_${factoring.empresa_cedente.ruc}_${factoringpropuesta.code}.pdf`;
      const dirPath = path.join(
        storageUtils.pathApp(),
        storageUtils.STORAGE_PATH_PROCESAR,
        storageUtils.pathDate(new Date()),
      );
      const filePath = path.join(dirPath, filename);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const pdfGenerator = new PDFGenerator(filePath);
      await pdfGenerator.generateFactoringPropuesta(factoring, factoringpropuesta);

      const filenameDownload = `Factoring_Propuesta_${factoring.empresa_cedente.ruc}_${factoringpropuesta.code}_${formattedDate}.pdf`;

      return {
        filePath,
        filenameDownload,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Actualiza el estado de una propuesta y despacha correo si pasa a estado DISPONIBLE (4).
 */
export const updateFactoringpropuestaService = async (
  dto: UpdateFactoringpropuestaDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::updateFactoringpropuestaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringpropuesta =
        await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(
          tx,
          dto.factoringpropuestaid,
        );
      if (!factoringpropuesta) {
        log.warn(line(), `Factoringpropuesta no existe: [${dto.factoringpropuestaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestaestado =
        await factoringpropuestaestadoDao.getFactoringpropuestaestadoByFactoringpropuestaestadoid(
          tx,
          dto.factoringpropuestaestadoid,
        );
      if (!factoringpropuestaestado) {
        log.warn(
          line(),
          `Factoringpropuestaestado no existe: [${dto.factoringpropuestaestadoid}]`,
        );
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestahistorialestadoToCreate: Prisma.factoring_propuesta_historial_estadoCreateInput = {
        factoring_propuesta: { connect: { idfactoringpropuesta: factoringpropuesta.idfactoringpropuesta } },
        factoring_propuesta_estado: {
          connect: { idfactoringpropuestaestado: factoringpropuestaestado.idfactoringpropuestaestado },
        },
        usuario_modifica: { connect: { idusuario } },
        factoringpropuestahistorialestadoid: uuidv4(),
        code: uuidv4().split("-")[0],
        comentario: "",
        idusuariocrea: idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringpropuestahistorialestadoCreated =
        await factoringpropuestahistorialestadoDao.insertFactoringpropuestahistorialestado(
          tx,
          factoringpropuestahistorialestadoToCreate,
        );
      log.debug(
        line(),
        "factoringpropuestahistorialestadoCreated:",
        factoringpropuestahistorialestadoCreated,
      );

      const factoringpropuestaToUpdate: Prisma.factoring_propuestaUpdateInput = {
        factoring_propuesta_estado: {
          connect: { idfactoringpropuestaestado: factoringpropuestaestado.idfactoringpropuestaestado },
        },
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringpropuestaUpdated = await factoringpropuestaDao.updateFactoringpropuesta(
        tx,
        dto.factoringpropuestaid,
        factoringpropuestaToUpdate,
      );
      log.debug(line(), "factoringpropuestaUpdated:", factoringpropuestaUpdated);

      if (factoringpropuestaUpdated.idfactoringpropuestaestado === 4) {
        const factoring_for_email = await factoringDao.getFactoringByIdfactoring(
          tx,
          factoringpropuestaUpdated.idfactoring,
        );
        const usuario_for_email = await usuarioDao.getUsuarioByEmail(
          tx,
          factoring_for_email.contacto_cedente.email,
        );
        const factoringpropuesta_for_email =
          await factoringpropuestaDao.getFactoringpropuestaAceptadaByIdfactoringpropuesta(
            tx,
            factoringpropuestaUpdated.idfactoringpropuesta,
            [1],
          );
        const paramsEmail = {
          factoring: factoring_for_email,
          factoringpropuesta: factoringpropuesta_for_email,
          usuario: usuario_for_email,
        };
        await emailService.sendFactoringEmpresaServicioFactoringPropuestaDisponible(
          usuario_for_email.email,
          paramsEmail,
        );
      }

      return factoringpropuestaUpdated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Simula una propuesta calculando tasas, montos, comisiones, costos y gastos.
 */
export const simulateFactoringpropuestaService = async (dto: SimulateFactoringpropuestaDto) => {
  log.debug(line(), "service::admin::simulateFactoringpropuestaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtipo = await factoringtipoDao.getFactoringtipoByFactoringtipoid(
        tx,
        dto.factoringtipoid,
      );
      if (!factoringtipo) {
        log.warn(line(), `Factoring tipo no existe: [${dto.factoringtipoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const riesgooperacion = await riesgoDao.getRiesgoByRiesgoid(tx, dto.riesgooperacionid);
      if (!riesgooperacion) {
        log.warn(line(), `Riesgo operación no existe: [${dto.riesgooperacionid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringestrategia =
        await factoringestrategiaDao.getFactoringestrategiaByFactoringestrategiaid(
          tx,
          dto.factoringestrategiaid,
        );
      if (!factoringestrategia) {
        log.warn(line(), `Factoring estategia no existe: [${dto.factoringestrategiaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const fecha_ahora = dateUtils.getNowLima();
      const fecha_fin = dateUtils.toLimaDate(dto.fecha_pago_estimado);
      const fecha_emision = dateUtils.toLimaDate(factoring.fecha_emision);

      const simulacion: Partial<Simulacion> = await simulateFactoringLogicV4(
        riesgooperacion.idriesgo,
        factoring.cuenta_bancaria.idbanco,
        factoring.cantidad_facturas,
        new Decimal(dto.monto_neto),
        fecha_ahora,
        fecha_fin,
        fecha_emision,
        new Decimal(dto.porcentaje_financiado_estimado),
        new Decimal(dto.tdm),
        new Decimal(dto.porcentaje_comision_descuento),
        factoring.moneda.idmoneda,
      );

      log.info(line(), "simulacion: ", simulacion);

      return simulacion;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Crea una propuesta de factoring con sus componentes financieros desglosados e historial inicial.
 */
export const createFactoringpropuestaService = async (
  dto: CreateFactoringpropuestaDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::createFactoringpropuestaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtipo = await factoringtipoDao.getFactoringtipoByFactoringtipoid(
        tx,
        dto.factoringtipoid,
      );
      if (!factoringtipo) {
        log.warn(line(), `Factoring tipo no existe: [${dto.factoringtipoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const riesgooperacion = await riesgoDao.getRiesgoByRiesgoid(tx, dto.riesgooperacionid);
      if (!riesgooperacion) {
        log.warn(line(), `Riesgo operación no existe: [${dto.riesgooperacionid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const riesgocedente = await riesgoDao.getRiesgoByRiesgoid(tx, dto.riesgocedenteid);
      if (!riesgocedente) {
        log.warn(line(), `Riesgo cedente no existe: [${dto.riesgocedenteid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const riesgoaceptante = await riesgoDao.getRiesgoByRiesgoid(tx, dto.riesgoaceptanteid);
      if (!riesgoaceptante) {
        log.warn(line(), `Riesgo aceptante no existe: [${dto.riesgoaceptanteid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestaestado =
        await factoringpropuestaestadoDao.getFactoringpropuestaestadoByFactoringpropuestaestadoid(
          tx,
          dto.factoringpropuestaestadoid,
        );
      if (!factoringpropuestaestado) {
        log.warn(
          line(),
          `Factoring propuesta estado no existe: [${dto.factoringpropuestaestadoid}]`,
        );
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringestrategia =
        await factoringestrategiaDao.getFactoringestrategiaByFactoringestrategiaid(
          tx,
          dto.factoringestrategiaid,
        );
      if (!factoringestrategia) {
        log.warn(line(), `Factoring estategia no existe: [${dto.factoringestrategiaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const fecha_ahora = dateUtils.getNowLima();
      const fecha_fin = dateUtils.toLimaDate(dto.fecha_pago_estimado);
      const fecha_emision = dateUtils.toLimaDate(factoring.fecha_emision);

      const simulacion: Partial<Simulacion> = await simulateFactoringLogicV4(
        riesgooperacion.idriesgo,
        factoring.cuenta_bancaria.idbanco,
        factoring.cantidad_facturas,
        new Decimal(dto.monto_neto),
        fecha_ahora,
        fecha_fin,
        fecha_emision,
        new Decimal(dto.porcentaje_financiado_estimado),
        new Decimal(dto.tdm),
        new Decimal(dto.porcentaje_comision_descuento),
        factoring.moneda.idmoneda,
      );

      log.info(line(), "simulacion: ", simulacion);

      const factoringpropuestaToCreate: Prisma.factoring_propuestaCreateInput = {
        factoring: { connect: { idfactoring: factoring.idfactoring } },
        factoring_tipo: { connect: { idfactoringtipo: factoringtipo.idfactoringtipo } },
        factoring_propuesta_estado: {
          connect: { idfactoringpropuestaestado: factoringpropuestaestado.idfactoringpropuestaestado },
        },
        riesgo_operacion: { connect: { idriesgo: riesgooperacion.idriesgo } },
        riesgo_cedente: { connect: { idriesgo: riesgocedente.idriesgo } },
        riesgo_aceptante: { connect: { idriesgo: riesgoaceptante.idriesgo } },
        factoring_estrategia: {
          connect: { idfactoringestrategia: factoringestrategia.idfactoringestrategia },
        },

        factoringpropuestaid: uuidv4(),
        code: uuidv4().split("-")[0],
        fecha_propuesta: simulacion.fecha_propuesta,

        tda: simulacion.tda,
        tdm: simulacion.tdm,
        tdd: simulacion.tdd,
        tda_mora: simulacion.tda_mora,
        tdm_mora: simulacion.tdm_mora,
        tdd_mora: simulacion.tdd_mora,
        fecha_pago_estimado: dto.fecha_pago_estimado,
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
        monto_gasto_excento_igv: simulacion.monto_gasto_excento_igv,
        monto_total_igv: simulacion.monto_total_igv,
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

        idusuariocrea: idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringpropuestaCreated = await factoringpropuestaDao.insertFactoringpropuesta(
        tx,
        jsonUtils.omitNullAndUndefined(factoringpropuestaToCreate),
      );
      log.debug(line(), "factoringpropuestaCreated:", factoringpropuestaCreated);

      const factoringpropuestahistorialestadoToCreate: Prisma.factoring_propuesta_historial_estadoCreateInput = {
        factoring_propuesta: {
          connect: { idfactoringpropuesta: factoringpropuestaCreated.idfactoringpropuesta },
        },
        factoring_propuesta_estado: {
          connect: { idfactoringpropuestaestado: factoringpropuestaestado.idfactoringpropuestaestado },
        },
        usuario_modifica: { connect: { idusuario } },
        factoringpropuestahistorialestadoid: uuidv4(),
        code: uuidv4().split("-")[0],
        comentario: "",
        idusuariocrea: idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringpropuestahistorialestadoCreated =
        await factoringpropuestahistorialestadoDao.insertFactoringpropuestahistorialestado(
          tx,
          jsonUtils.omitNullAndUndefined(factoringpropuestahistorialestadoToCreate),
        );
      log.debug(
        line(),
        "factoringpropuestahistorialestadoCreated:",
        factoringpropuestahistorialestadoCreated,
      );

      const insertFinancieros = async (items: any[] | undefined) => {
        if (!items) return;
        for (const item of items) {
          const finToCreate: Prisma.factoring_propuesta_financieroCreateInput = {
            factoring_propuesta: {
              connect: { idfactoringpropuesta: factoringpropuestaCreated.idfactoringpropuesta },
            },
            financiero_tipo: { connect: { idfinancierotipo: item.financiero_tipo.idfinancierotipo } },
            financiero_concepto: {
              connect: { idfinancieroconcepto: item.financiero_concepto.idfinancieroconcepto },
            },
            factoringpropuestafinancieroid: uuidv4(),
            code: uuidv4().split("-")[0],
            cantidad: item.cantidad,
            monto_unitario: item.monto_unitario,
            monto: item.monto,
            igv: item.igv,
            total: item.total,
            porcentaje_monto: item.porcentaje_monto,
            idusuariocrea: idusuario ?? 1,
            fechacrea: new Date(),
            idusuariomod: idusuario ?? 1,
            fechamod: new Date(),
            estado: 1,
          };
          await factoringpropuestafinancieroDao.insertFactoringpropuestafinanciero(tx, finToCreate);
        }
      };

      await insertFinancieros(simulacion.comisiones);
      await insertFinancieros(simulacion.costos);
      await insertFinancieros(simulacion.gastos);
      await insertFinancieros(simulacion.gastos_excento_igv);

      return simulacion;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta las propuestas registradas para una operación de factoring.
 */
export const getFactoringpropuestasByFactoringidService = async (
  dto: GetFactoringpropuestasByFactoringidDto,
) => {
  log.debug(line(), "service::admin::getFactoringpropuestasByFactoringidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      return await factoringpropuestaDao.getFactoringpropuestasByIdfactoring(
        tx,
        factoring.idfactoring,
        filter_estado,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Activa una propuesta de factoring.
 */
export const activateFactoringpropuestaService = async (
  dto: FactoringpropuestaIdDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::activateFactoringpropuestaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const activated = await factoringpropuestaDao.activateFactoringpropuesta(
        tx,
        dto.factoringpropuestaid,
        idusuario,
      );
      if (activated[0] === 0) {
        throw new ClientError("Factoringpropuesta no existe", 404);
      }
      log.debug(line(), "factoringpropuestaActivated:", activated);
      return activated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina lógicamente una propuesta de factoring.
 */
export const deleteFactoringpropuestaService = async (
  dto: FactoringpropuestaIdDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::deleteFactoringpropuestaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const deleted = await factoringpropuestaDao.deleteFactoringpropuesta(
        tx,
        dto.factoringpropuestaid,
        idusuario,
      );
      if (deleted[0] === 0) {
        throw new ClientError("Factoringpropuesta no existe", 404);
      }
      log.debug(line(), "factoringpropuestaDeleted:", deleted);
      return deleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta catálogos maestros para propuestas de factoring en admin.
 */
export const getFactoringpropuestaMasterService = async () => {
  log.debug(line(), "service::admin::getFactoringpropuestaMasterService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);
      const factoringtipos = await factoringtipoDao.getFactoringtipos(tx, filter_estados);
      const factoringestrategias = await factoringestrategiaDao.getFactoringestrategias(tx, filter_estados);
      const factoringpropuestaestados =
        await factoringpropuestaestadoDao.getFactoringpropuestaestados(tx, filter_estados);

      return {
        riesgos,
        factoringtipos,
        factoringestrategias,
        factoringpropuestaestados,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta el listado general de propuestas para admin.
 */
export const getFactoringpropuestasService = async () => {
  log.debug(line(), "service::admin::getFactoringpropuestasService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      return await factoringpropuestaDao.getFactoringpropuestas(tx, filter_estado);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
