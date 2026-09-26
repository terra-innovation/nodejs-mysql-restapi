import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as configuracionappDao from "#root/src/daos/configuracionapp.Dao.js";
import * as factorcuentabancariaDao from "#root/src/daos/factorcuentabancaria.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringliquidacionDao from "#root/src/daos/factoringliquidacion.Dao.js";
import * as factoringliquidacionestadoDao from "#root/src/daos/factoringliquidacionestado.Dao.js";
import * as factoringliquidacionfinancieroDao from "#root/src/daos/factoringliquidacionfinanciero.Dao.js";
import * as financieroconceptoDao from "#root/src/daos/financieroconcepto.Dao.js";
import * as financierotipoDao from "#root/src/daos/financierotipo.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as emailService from "#root/src/providers/email/email.Provider.js";
import { simulateFactoringLogicV4 } from "#root/src/services/factoring.Service.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as dateUtils from "#src/utils/dateUtils.js";
import PDFGenerator from "#src/utils/document/PDFgenerator.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import { Decimal } from "@prisma/client/runtime/library";
import * as fs from "fs";
import { unlink } from "fs/promises";
import * as luxon from "luxon";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface FactoringLiquidacionFinancieroInput {
  financierotipoid: string;
  financieroconceptoid: string;
  cantidad?: number;
  monto_unitario?: number;
  descripcion?: string;
}

export interface FactoringliquidacionIdDto {
  factoringliquidacionid: string;
}

export interface UpdateFactoringliquidacionDto {
  factoringliquidacionid: string;
  factoringliquidacionestadoid: string;
  fecha_liquidacion: Date | string;
}

export interface CreateFactoringliquidacionDto {
  factoringid: string;
  factoringliquidacionestadoid: string;
  fecha_liquidacion: Date | string;
  fecha_pago_efectivo: Date | string;
  exonerar_gasto_interbancario?: boolean;
  factoring_liquidacion_financieros?: FactoringLiquidacionFinancieroInput[];
}

export interface SimulateFactoringliquidacionDto {
  factoringid: string;
  fecha_liquidacion: Date | string;
  fecha_pago_efectivo: Date | string;
  exonerar_gasto_interbancario?: boolean;
  factoring_liquidacion_financieros?: FactoringLiquidacionFinancieroInput[];
}

export interface GetFactoringliquidacionMasterByFactoringidDto {
  factoringid: string;
}

export interface GetFactoringliquidacionByFactoringidDto {
  factoringid: string;
}

// ─── Helpers Internos de Simulación ──────────────────────────────────────────

const getFinancialData = async (
  tx: any,
  item: FactoringLiquidacionFinancieroInput,
  constante_igv: any,
  monto_neto: Decimal,
  orden: number,
) => {
  const financiero_tipo = await financierotipoDao.getFinancierotipoByFinancierotipoid(
    tx,
    item.financierotipoid,
  );
  if (!financiero_tipo) {
    throw new ClientError(`Financiero tipo no existe: [${item.financierotipoid}]`, 404);
  }

  const financiero_concepto = await financieroconceptoDao.getFinancieroconceptoByFinancieroconceptoid(
    tx,
    item.financieroconceptoid,
  );
  if (!financiero_concepto) {
    throw new ClientError(`Financiero concepto no existe: [${item.financieroconceptoid}]`, 404);
  }

  const cantidad = new Decimal(item.cantidad ?? 1);
  const monto_unitario = new Decimal(item.monto_unitario ?? 0);
  const monto = cantidad.mul(monto_unitario).toDecimalPlaces(2);

  let igv = new Decimal(0);
  if (financiero_tipo.idfinancierotipo !== 4) {
    igv = monto.mul(constante_igv.valor).toDecimalPlaces(2);
  }

  const total = monto.add(igv).toDecimalPlaces(2);
  const porcentaje_monto = monto.div(monto_neto).toDecimalPlaces(5);

  return {
    financiero_tipo,
    financiero_concepto,
    cantidad,
    monto_unitario,
    monto,
    igv,
    total,
    porcentaje_monto,
    descripcion: item.descripcion || null,
    orden: orden + 1,
  };
};

const getFinancialDataById = async (tx: any, item: any, constante_igv: any) => {
  const financiero_tipo = await financierotipoDao.getFinancierotipoByIdfinancierotipo(
    tx,
    item.idfinancierotipo,
  );
  if (!financiero_tipo) {
    throw new ClientError(`Financiero tipo no existe: [${item.idfinancierotipo}]`, 404);
  }

  const financiero_concepto = await financieroconceptoDao.getFinancieroconceptoByIdfinancieroconcepto(
    tx,
    item.idfinancieroconcepto,
  );
  if (!financiero_concepto) {
    throw new ClientError(`Financiero concepto no existe: [${item.idfinancieroconcepto}]`, 404);
  }

  const cantidad = new Decimal(item.cantidad ?? 1);
  const monto_unitario = new Decimal(item.monto_unitario ?? 0);
  const monto = cantidad.mul(monto_unitario).toDecimalPlaces(2);

  let igv = new Decimal(0);
  if (financiero_concepto.afecto_igv) {
    igv = monto.mul(constante_igv.valor).toDecimalPlaces(2);
  }

  const total = monto.add(igv).toDecimalPlaces(2);
  const porcentaje_monto = new Decimal(0);

  return {
    financiero_tipo,
    financiero_concepto,
    cantidad,
    monto_unitario,
    monto,
    igv,
    total,
    porcentaje_monto,
    descripcion: item.descripcion || null,
    orden: item.orden,
  };
};

const runSimulation = async (
  tx: any,
  factoring: any,
  fecha_liquidacion: any,
  fecha_pago_efectivo_raw: any,
  financieros_raw?: FactoringLiquidacionFinancieroInput[],
  exonerar_gasto_interbancario: boolean = false,
) => {
  if (!factoring.factoring_propuesta_aceptada) {
    log.warn(line(), "Factoring no tiene propuesta aceptada");
    throw new ClientError("El factoring no cuenta con una propuesta aceptada", 400);
  }

  const constante_comison_bcp_pen = await configuracionappDao.getComisionBCPPen(tx);
  const constante_comison_bcp_usd = await configuracionappDao.getComisionBCPUsd(tx);
  const constante_igv = await configuracionappDao.getIGV(tx);
  const fecha_operacion = dateUtils.toLimaDateTime(factoring.fecha_operacion);
  const fecha_fin = dateUtils.toLimaDateTime(fecha_pago_efectivo_raw);
  const fecha_emision = dateUtils.toLimaDate(factoring.fecha_emision);

  const acceptedProp = factoring.factoring_propuesta_aceptada;
  const simBase = await simulateFactoringLogicV4(
    acceptedProp.idriesgooperacion,
    factoring.cuenta_bancaria.idbanco,
    factoring.cantidad_facturas,
    factoring.monto_neto,
    fecha_operacion,
    fecha_fin,
    fecha_emision,
    acceptedProp.porcentaje_financiado_estimado,
    acceptedProp.tdm,
    acceptedProp.porcentaje_comision_descuento,
    factoring.moneda.idmoneda,
  );

  const fecha_pago_estimado = luxon.DateTime.fromJSDate(acceptedProp.fecha_pago_estimado);
  const diffDays = Math.floor(
    fecha_fin.startOf("day").diff(fecha_pago_estimado.startOf("day"), "days").days,
  );

  let dias_pago_efectivo = 0;
  let dias_mora_efectivo = 0;
  let monto_descuento_efectivo = new Decimal(0);
  let monto_descuento_a_favor = new Decimal(0);
  let monto_descuento_mora = new Decimal(0);

  const originalMontoDescuento = new Decimal(acceptedProp.monto_descuento);
  const simulatedMontoDescuento = new Decimal(simBase.monto_descuento || 0);

  if (diffDays <= 0) {
    dias_pago_efectivo = simBase.dias_pago_estimado;
    dias_mora_efectivo = 0;
    monto_descuento_efectivo = simulatedMontoDescuento;
    const diffFavor = originalMontoDescuento.minus(simulatedMontoDescuento);
    monto_descuento_a_favor = diffFavor.greaterThan(0) ? diffFavor : new Decimal(0);
    monto_descuento_mora = new Decimal(0);
  } else {
    dias_pago_efectivo = simBase.dias_pago_estimado;
    dias_mora_efectivo = diffDays;
    monto_descuento_efectivo = simulatedMontoDescuento;
    const diffMora = simulatedMontoDescuento.minus(originalMontoDescuento);
    monto_descuento_a_favor = new Decimal(0);
    monto_descuento_mora = diffMora.greaterThan(0) ? diffMora : new Decimal(0);
  }

  const factoring_liquidacion_financieros: any[] = [];
  let orden = 1;

  factoring_liquidacion_financieros.push(
    await getFinancialDataById(
      tx,
      {
        idfinancierotipo: 5,
        idfinancieroconcepto: 7,
        cantidad: 1,
        monto_unitario: acceptedProp.monto_garantia || 0,
        descripcion: "",
        orden: orden++,
      },
      constante_igv,
    ),
  );

  if (monto_descuento_a_favor.greaterThan(0)) {
    factoring_liquidacion_financieros.push(
      await getFinancialDataById(
        tx,
        {
          idfinancierotipo: 2,
          idfinancieroconcepto: 8,
          cantidad: 1,
          monto_unitario: monto_descuento_a_favor || 0,
          descripcion: "",
          orden: orden++,
        },
        constante_igv,
      ),
    );
  } else if (monto_descuento_mora.greaterThan(0)) {
    factoring_liquidacion_financieros.push(
      await getFinancialDataById(
        tx,
        {
          idfinancierotipo: 2,
          idfinancieroconcepto: 9,
          cantidad: 1,
          monto_unitario: monto_descuento_mora || 0,
          descripcion: "",
          orden: orden++,
        },
        constante_igv,
      ),
    );
  }

  if (!exonerar_gasto_interbancario) {
    const gasto_interbantario_monto = new Decimal(
      factoring.idmoneda === 1 ? constante_comison_bcp_pen.valor : constante_comison_bcp_usd.valor,
    );
    const monto_probable_a_reembolsar_al_cedente = new Decimal(acceptedProp.monto_garantia || 0)
      .minus(monto_descuento_mora)
      .minus(gasto_interbantario_monto);

    if (factoring.cuenta_bancaria.idbanco !== 1 && monto_probable_a_reembolsar_al_cedente.greaterThan(0)) {
      factoring_liquidacion_financieros.push(
        await getFinancialDataById(
          tx,
          {
            idfinancierotipo: 2,
            idfinancieroconcepto: 3,
            cantidad: 1,
            monto_unitario: gasto_interbantario_monto || 0,
            descripcion: "",
            orden: orden++,
          },
          constante_igv,
        ),
      );
    }
  }

  if (financieros_raw && financieros_raw.length > 0) {
    for (const item of financieros_raw) {
      const parsed = await getFinancialData(tx, item, constante_igv, factoring.monto_neto, orden++);
      factoring_liquidacion_financieros.push(parsed);
    }
  }

  let monto_total_neto_inafecto_igv_abono = new Decimal(0);
  let monto_total_neto_inafecto_igv_cargo = new Decimal(0);
  let monto_total_neto_afecto_igv_abono = new Decimal(0);
  let monto_total_neto_afecto_igv_cargo = new Decimal(0);
  let igv_abonos = new Decimal(0);
  let igv_cargos = new Decimal(0);

  const isAbono = (item: any) => item.financiero_concepto.factor === 1;

  for (const fin of factoring_liquidacion_financieros) {
    const isAfecto = fin.financiero_concepto.afecto_igv;
    const isAb = isAbono(fin);
    const amount = new Decimal(fin.monto || 0);
    const igvVal = new Decimal(fin.igv || 0);

    if (isAb) {
      if (isAfecto) {
        monto_total_neto_afecto_igv_abono = monto_total_neto_afecto_igv_abono.add(amount);
      } else {
        monto_total_neto_inafecto_igv_abono = monto_total_neto_inafecto_igv_abono.add(amount);
      }
      igv_abonos = igv_abonos.add(igvVal);
    } else {
      if (isAfecto) {
        monto_total_neto_afecto_igv_cargo = monto_total_neto_afecto_igv_cargo.add(amount);
      } else {
        monto_total_neto_inafecto_igv_cargo = monto_total_neto_inafecto_igv_cargo.add(amount);
      }
      igv_cargos = igv_cargos.add(igvVal);
    }
  }

  const monto_total_neto_inafecto_igv = monto_total_neto_inafecto_igv_abono
    .minus(monto_total_neto_inafecto_igv_cargo)
    .toDecimalPlaces(2);
  const monto_total_neto_afecto_igv = monto_total_neto_afecto_igv_abono
    .minus(monto_total_neto_afecto_igv_cargo)
    .toDecimalPlaces(2);
  const monto_total_igv = igv_abonos.minus(igv_cargos).toDecimalPlaces(2);

  const netTotal = monto_total_neto_inafecto_igv
    .add(monto_total_neto_afecto_igv)
    .add(monto_total_igv)
    .toDecimalPlaces(2);

  let monto_total_a_favor = new Decimal(0);
  let monto_total_por_cobrar = new Decimal(0);

  if (netTotal.greaterThan(0)) {
    monto_total_a_favor = netTotal;
  } else if (netTotal.lessThan(0)) {
    monto_total_por_cobrar = netTotal.neg();
  }

  return {
    fecha_liquidacion,
    fecha_pago_efectivo: fecha_fin.toJSDate(),
    dias_pago_efectivo,
    dias_mora_efectivo,
    monto_descuento_efectivo,
    monto_descuento_a_favor,
    monto_descuento_mora,
    monto_total_neto_inafecto_igv_abono,
    monto_total_neto_inafecto_igv_cargo,
    monto_total_neto_inafecto_igv,
    monto_total_neto_afecto_igv_abono,
    monto_total_neto_afecto_igv_cargo,
    monto_total_neto_afecto_igv,
    monto_total_igv,
    monto_total_a_favor,
    monto_total_por_cobrar,
    factoring_liquidacion_financieros,
  };
};

// ─── Services ────────────────────────────────────────────────────────────────

/**
 * Simula los importes de liquidación de una operación de factoring.
 */
export const simulateFactoringliquidacionService = async (dto: SimulateFactoringliquidacionDto) => {
  log.debug(line(), "service::admin::simulateFactoringliquidacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      return await runSimulation(
        tx,
        factoring,
        dto.fecha_liquidacion,
        dto.fecha_pago_efectivo,
        dto.factoring_liquidacion_financieros,
        dto.exonerar_gasto_interbancario,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Crea la liquidación definitiva y su desglose financiero en base a la simulación.
 */
export const createFactoringliquidacionService = async (
  dto: CreateFactoringliquidacionDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::createFactoringliquidacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const liqEstado =
        await factoringliquidacionestadoDao.getFactoringliquidacionestadoByFactoringliquidacionestadoid(
          tx,
          dto.factoringliquidacionestadoid,
        );
      if (!liqEstado) {
        log.warn(line(), `Estado liquidacion no existe: [${dto.factoringliquidacionestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const sim = await runSimulation(
        tx,
        factoring,
        dto.fecha_liquidacion,
        dto.fecha_pago_efectivo,
        dto.factoring_liquidacion_financieros,
        dto.exonerar_gasto_interbancario,
      );

      const toCreate: Prisma.factoring_liquidacionCreateInput = {
        factoring: { connect: { idfactoring: factoring.idfactoring } },
        factoring_liquidacion_estado: {
          connect: { idfactoringliquidacionestado: liqEstado.idfactoringliquidacionestado },
        },
        factoringliquidacionid: uuidv4(),
        code: uuidv4().split("-")[0],
        fecha_liquidacion: sim.fecha_liquidacion,
        fecha_pago_efectivo: sim.fecha_pago_efectivo,
        dias_pago_efectivo: sim.dias_pago_efectivo,
        dias_mora_efectivo: sim.dias_mora_efectivo,
        monto_descuento_efectivo: sim.monto_descuento_efectivo,
        monto_descuento_a_favor: sim.monto_descuento_a_favor,
        monto_descuento_mora: sim.monto_descuento_mora,
        monto_total_neto_inafecto_igv_abono: sim.monto_total_neto_inafecto_igv_abono,
        monto_total_neto_inafecto_igv_cargo: sim.monto_total_neto_inafecto_igv_cargo,
        monto_total_neto_inafecto_igv: sim.monto_total_neto_inafecto_igv,
        monto_total_neto_afecto_igv_abono: sim.monto_total_neto_afecto_igv_abono,
        monto_total_neto_afecto_igv_cargo: sim.monto_total_neto_afecto_igv_cargo,
        monto_total_neto_afecto_igv: sim.monto_total_neto_afecto_igv,
        monto_total_igv: sim.monto_total_igv,
        monto_total_a_favor: sim.monto_total_a_favor,
        monto_total_por_cobrar: sim.monto_total_por_cobrar,
        idusuariocrea: idusuario ?? 1,
        idusuariomod: idusuario ?? 1,
        fechacrea: new Date(),
        fechamod: new Date(),
        estado: 1,
      };

      const created = await factoringliquidacionDao.insertFactoringliquidacion(tx, toCreate);

      for (const fin of sim.factoring_liquidacion_financieros) {
        const finToCreate: Prisma.factoring_liquidacion_financieroCreateInput = {
          factoring_liquidacion: { connect: { idfactoringliquidacion: created.idfactoringliquidacion } },
          financiero_tipo: { connect: { idfinancierotipo: fin.financiero_tipo.idfinancierotipo } },
          financiero_concepto: {
            connect: { idfinancieroconcepto: fin.financiero_concepto.idfinancieroconcepto },
          },
          factoringliquidacionfinancieroid: uuidv4(),
          code: uuidv4().split("-")[0],
          descripcion: fin.descripcion,
          cantidad: fin.cantidad,
          monto_unitario: fin.monto_unitario,
          monto: fin.monto,
          igv: fin.igv,
          total: fin.total,
          porcentaje_monto: fin.porcentaje_monto,
          orden: fin.orden,
          idusuariocrea: idusuario ?? 1,
          idusuariomod: idusuario ?? 1,
          fechacrea: new Date(),
          fechamod: new Date(),
          estado: 1,
        };
        await factoringliquidacionfinancieroDao.insertFactoringliquidacionfinanciero(tx, finToCreate);
      }

      return created;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Actualiza el estado y fecha de una liquidación.
 */
export const updateFactoringliquidacionService = async (
  dto: UpdateFactoringliquidacionDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::updateFactoringliquidacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const liquidacion = await factoringliquidacionDao.getFactoringliquidacionByFactoringliquidacionid(
        tx,
        dto.factoringliquidacionid,
      );
      if (!liquidacion) {
        log.warn(line(), `Factoringliquidacion no existe: [${dto.factoringliquidacionid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const estado =
        await factoringliquidacionestadoDao.getFactoringliquidacionestadoByFactoringliquidacionestadoid(
          tx,
          dto.factoringliquidacionestadoid,
        );
      if (!estado) {
        log.warn(line(), `Estado liquidacion no existe: [${dto.factoringliquidacionestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const toUpdate: Prisma.factoring_liquidacionUpdateInput = {
        factoring_liquidacion_estado: {
          connect: { idfactoringliquidacionestado: estado.idfactoringliquidacionestado },
        },
        fecha_liquidacion: dto.fecha_liquidacion,
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };

      return await factoringliquidacionDao.updateFactoringliquidacion(
        tx,
        dto.factoringliquidacionid,
        toUpdate,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina lógicamente una liquidación.
 */
export const deleteFactoringliquidacionService = async (
  dto: FactoringliquidacionIdDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::deleteFactoringliquidacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      return await factoringliquidacionDao.deleteFactoringliquidacion(
        tx,
        dto.factoringliquidacionid,
        idusuario,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Activa una liquidación.
 */
export const activateFactoringliquidacionService = async (
  dto: FactoringliquidacionIdDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::activateFactoringliquidacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      return await factoringliquidacionDao.activateFactoringliquidacion(
        tx,
        dto.factoringliquidacionid,
        idusuario,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Envía por correo la liquidación generada como PDF al cedente.
 */
export const sendCorreoFactoringliquidacionService = async (factoringliquidacionid: string) => {
  log.debug(line(), "service::admin::sendCorreoFactoringliquidacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringliquidacionExisted =
        await factoringliquidacionDao.getFactoringliquidacionByFactoringliquidacionid(
          tx,
          factoringliquidacionid,
        );
      if (!factoringliquidacionExisted) {
        log.warn(line(), `Factoringliquidacion no existe: [${factoringliquidacionid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoring_for_email = await factoringDao.getFactoringByIdfactoring(
        tx,
        factoringliquidacionExisted.idfactoring,
      );
      if (!factoring_for_email) {
        log.warn(line(), `Factoring no existe: [${factoringliquidacionExisted.idfactoring}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringliquidacion_for_email =
        await factoringliquidacionDao.getFactoringliquidacionByIdfactoringliquidacion(
          tx,
          factoringliquidacionExisted.idfactoringliquidacion,
        );
      const usuario_for_email = await usuarioDao.getUsuarioByEmail(
        tx,
        factoring_for_email.contacto_cedente.email,
      );

      const factoringliquidacionObfuscated_for_email = jsonUtils.ofuscarAtributos(
        factoringliquidacion_for_email,
        ["numero", "cci"],
        jsonUtils.PATRON_OFUSCAR_CUENTA,
      );

      const paramsEmail = {
        factoring: factoring_for_email,
        factoringliquidacion: factoringliquidacionObfuscated_for_email,
        usuario: usuario_for_email,
      };

      const formattedDate = luxon.DateTime.now().toFormat("yyyyMMdd_HHmm");
      const filename = `${formattedDate}_factoring_liquidacion_${factoring_for_email.empresa_cedente.ruc}_${factoring_for_email.code}_${factoringliquidacionExisted.code}_email.pdf`;
      const dirPath = path.join(
        storageUtils.pathApp(),
        storageUtils.STORAGE_PATH_PROCESAR,
        storageUtils.pathDate(new Date()),
      );
      const filePath = path.join(dirPath, filename);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const IDFACFOR = 1;
      const factorcuentasbancarias_for_pdf =
        await factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmoneda(
          tx,
          IDFACFOR,
          factoring_for_email.idmoneda,
          [ESTADO.ACTIVO],
        );

      let pdfGenerated = false;
      try {
        const pdfGenerator = new PDFGenerator(filePath);
        await pdfGenerator.generateFactoringliquidacion(
          factoring_for_email,
          factoringliquidacionExisted,
          factorcuentasbancarias_for_pdf,
        );
        pdfGenerated = true;

        const attachmentName = `Factoring_Liquidacion_${factoring_for_email.empresa_cedente.ruc}_${factoring_for_email.code}_${factoringliquidacionExisted.code}.pdf`;
        const attachments = [
          {
            filename: attachmentName,
            path: filePath,
          },
        ];

        await emailService.sendFactoringEmpresaServicioFactoringCedenteNotificacionLiquidacion(
          usuario_for_email.email,
          paramsEmail,
          attachments,
        );
      } finally {
        if (pdfGenerated || fs.existsSync(filePath)) {
          await unlink(filePath);
        }
      }

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta catálogos maestros para la pantalla de liquidación en admin.
 */
export const getFactoringliquidacionMasterByFactoringidService = async (
  dto: GetFactoringliquidacionMasterByFactoringidDto,
) => {
  log.debug(line(), "service::admin::getFactoringliquidacionMasterByFactoringidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const idbanco_factor = 1;
      const idbanco_cedente = factoring.cuenta_bancaria.idbanco;

      const estados = await factoringliquidacionestadoDao.getFactoringliquidacionestados(
        tx,
        filter_estados,
      );
      const tipos = await financierotipoDao.getFinancierotipos(tx, filter_estados);
      const conceptos = await financieroconceptoDao.getFinancieroconceptosForLiquidacion(
        tx,
        filter_estados,
      );

      return {
        factoringliquidacionestados: estados,
        financierotipos: tipos,
        financieroconceptos: conceptos,
        mismo_banco: idbanco_factor === idbanco_cedente,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta el detalle de una liquidación por su ID.
 */
export const getFactoringliquidacionDetalleService = async (dto: FactoringliquidacionIdDto) => {
  log.debug(line(), "service::admin::getFactoringliquidacionDetalleService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const liquidacion =
        await factoringliquidacionDao.getFactoringliquidacionByFactoringliquidacionid(
          tx,
          dto.factoringliquidacionid,
        );
      if (!liquidacion) {
        throw new ClientError("La liquidación no existe", 404);
      }

      return liquidacion;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta las liquidaciones asociadas a una operación de factoring.
 */
export const getFactoringliquidacionByFactoringidService = async (
  dto: GetFactoringliquidacionByFactoringidDto,
) => {
  log.debug(line(), "service::admin::getFactoringliquidacionByFactoringidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      return await factoringliquidacionDao.getFactoringliquidacionsByIdfactoring(
        tx,
        factoring.idfactoring,
        filter_estado,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Genera el archivo PDF oficial de liquidación para descarga.
 */
export const generateFactoringliquidacionPDFService = async (factoringliquidacionid: string) => {
  log.debug(line(), "service::admin::generateFactoringliquidacionPDFService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringliquidacion =
        await factoringliquidacionDao.getFactoringliquidacionByFactoringliquidacionid(
          tx,
          factoringliquidacionid,
        );
      if (!factoringliquidacion) {
        log.warn(line(), `Factoringliquidacion no existe: [${factoringliquidacionid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoring = await factoringDao.getFactoringByIdfactoring(
        tx,
        factoringliquidacion.idfactoring,
      );
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${factoringliquidacion.idfactoring}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const formattedDate = luxon.DateTime.now().toFormat("yyyyMMdd_HHmm");
      const filename = `${formattedDate}_factoring_liquidacion_${factoring.empresa_cedente.ruc}_${factoringliquidacion.code}.pdf`;
      const dirPath = path.join(
        storageUtils.pathApp(),
        storageUtils.STORAGE_PATH_PROCESAR,
        storageUtils.pathDate(new Date()),
      );
      const filePath = path.join(dirPath, filename);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const IDFACFOR = 1;
      const factorcuentasbancarias_for_pdf =
        await factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmoneda(
          tx,
          IDFACFOR,
          factoring.idmoneda,
          [ESTADO.ACTIVO],
        );

      const pdfGenerator = new PDFGenerator(filePath);
      await pdfGenerator.generateFactoringliquidacion(
        factoring,
        factoringliquidacion,
        factorcuentasbancarias_for_pdf,
      );

      const filenameDownload = `Factoring_Liquidacion_${factoring.empresa_cedente.ruc}_${factoringliquidacion.code}_${formattedDate}.pdf`;

      return {
        filePath,
        filenameDownload,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
