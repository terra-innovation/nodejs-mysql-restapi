import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";

import * as monedaDao from "#src/daos/moneda.Dao.js";
import * as sbstipocambioDao from "#src/daos/sbstipocambio.Dao.js";
import * as sunattipocambioDao from "#src/daos/sunattipocambio.Dao.js";

import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { decolectaService } from "#src/integrations/decolecta/index.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { line, log } from "#src/utils/logger.pino.js";

const DEFAULT_ZONE = "America/Lima";

/**
 * Convierte un string YYYY-MM-DD a objeto Date al inicio del día en zona horaria America/Lima.
 */
export const parseFechaLima = (fechaStr?: string): Date => {
  if (!fechaStr) {
    return DateTime.now().setZone(DEFAULT_ZONE).startOf("day").toJSDate();
  }
  const dt = DateTime.fromISO(fechaStr, { zone: DEFAULT_ZONE }).startOf("day");
  if (!dt.isValid) {
    throw new ClientError(`La fecha proporcionada '${fechaStr}' no es válida. Formato requerido: YYYY-MM-DD`, 400);
  }
  return dt.toJSDate();
};

/**
 * Genera un código único de 20 caracteres para el campo `code`.
 */
export const generateCode = (): string => {
  return uuidv4().split("-")[0];
};

/**
 * Resuelve las monedas base y cotizada desde la BD por su código ISO (ej: USD y PEN).
 */
export const resolverMonedas = async (tx: any, codigoBase: string, codigoCotizada: string = "PEN") => {
  const [monedaBase, monedaCotizada] = await Promise.all([monedaDao.getMonedaByCodigo(tx, codigoBase), monedaDao.getMonedaByCodigo(tx, codigoCotizada)]);

  if (!monedaBase) {
    throw new ClientError(`No se encontró la moneda base con código '${codigoBase}' en la base de datos`, 404);
  }

  if (!monedaCotizada) {
    throw new ClientError(`No se encontró la moneda cotizada con código '${codigoCotizada}' en la base de datos`, 404);
  }

  return { monedaBase, monedaCotizada };
};

// ============================================================================
// SUNAT: Lógica de Sincronización y Consulta
// ============================================================================

/**
 * Consulta la API de Decolecta para SUNAT y persiste/actualiza el registro en BD.
 */
export const sincronizarSunatLogic = async (fechaIso?: string) => {
  log.debug(line(), `logic::sincronizarSunatLogic - fecha: ${fechaIso || "hoy"}`);

  // 1. Consultar a Decolecta
  const dataDecolecta = fechaIso ? await decolectaService.getTipoCambioSunatPorFecha(fechaIso) : await decolectaService.getTipoCambioSunatHoy();

  if (!dataDecolecta || !dataDecolecta.date) {
    throw new ClientError("Decolecta no retornó información válida para el tipo de cambio SUNAT", 502);
  }

  // 2. Persistir en BD dentro de una transacción
  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const { monedaBase, monedaCotizada } = await resolverMonedas(tx, dataDecolecta.base_currency || "USD", dataDecolecta.quote_currency || "PEN");

      const fechaRegistro = parseFechaLima(dataDecolecta.date);

      const registro = await sunattipocambioDao.upsertSunatTipoCambio(tx, {
        code: generateCode(),
        idmonedabase: monedaBase.idmoneda,
        idmonedacotizada: monedaCotizada.idmoneda,
        fecha: fechaRegistro,
        precio_compra: new Prisma.Decimal(dataDecolecta.buy_price),
        precio_venta: new Prisma.Decimal(dataDecolecta.sell_price),
        estado: ESTADO.ACTIVO,
      });

      return registro;
    },
    { timeout: prismaFT.transactionTimeout },
  );

  return resultado;
};

/**
 * Consulta la API de Decolecta para SUNAT por mes y año, persistiendo en BD en una sola transacción.
 */
export const sincronizarSunatMesLogic = async (mes: number, anio: number) => {
  log.debug(line(), `logic::sincronizarSunatMesLogic - mes: ${mes}, anio: ${anio}`);

  if (!mes || isNaN(mes) || mes < 1 || mes > 12) {
    throw new ClientError("El parámetro 'mes' debe ser un número entero entre 1 y 12", 400);
  }

  if (!anio || isNaN(anio) || anio < 2000 || anio > 2100) {
    throw new ClientError("El parámetro 'anio' debe ser un año válido de 4 dígitos (ej. 2025)", 400);
  }

  // 1. Consultar a Decolecta el mes completo en 1 sola llamada
  const listaDecolecta = await decolectaService.getTipoCambioSunatPorMes(mes, anio);

  if (!listaDecolecta || !Array.isArray(listaDecolecta) || listaDecolecta.length === 0) {
    return {
      mes,
      anio,
      total_sincronizados: 0,
      registros: [],
    };
  }

  // 2. Persistir en BD dentro de una única transacción
  const registros = await prismaFT.client.$transaction(
    async (tx) => {
      const { monedaBase, monedaCotizada } = await resolverMonedas(tx, "USD", "PEN");
      const upsertedList = [];

      for (const item of listaDecolecta) {
        if (!item.date || !item.buy_price || !item.sell_price) continue;

        const fechaRegistro = parseFechaLima(item.date);
        const registro = await sunattipocambioDao.upsertSunatTipoCambio(tx, {
          code: generateCode(),
          idmonedabase: monedaBase.idmoneda,
          idmonedacotizada: monedaCotizada.idmoneda,
          fecha: fechaRegistro,
          precio_compra: new Prisma.Decimal(item.buy_price),
          precio_venta: new Prisma.Decimal(item.sell_price),
          estado: ESTADO.ACTIVO,
        });

        upsertedList.push(registro);
      }

      return upsertedList;
    },
    { timeout: prismaFT.transactionTimeout },
  );

  return {
    mes,
    anio,
    total_sincronizados: registros.length,
    registros,
  };
};

/**
 * Obtiene el tipo de cambio SUNAT aplicando estrategia Cache-Aside.
 * Si ya existe en la BD local, lo devuelve; si no, lo sincroniza desde Decolecta.
 */
export const obtenerSunatLogic = async (fechaIso?: string) => {
  log.debug(line(), `logic::obtenerSunatLogic - fecha: ${fechaIso || "hoy"}`);

  const fechaBuscada = parseFechaLima(fechaIso);

  const local = await prismaFT.client.$transaction(
    async (tx) => {
      const { monedaBase, monedaCotizada } = await resolverMonedas(tx, "USD", "PEN");
      return await sunattipocambioDao.getSunatTipoCambioByFecha(tx, fechaBuscada, monedaBase.idmoneda, monedaCotizada.idmoneda);
    },
    { timeout: prismaFT.transactionTimeout },
  );

  if (local) {
    return local;
  }

  // Si no existe localmente, sincronizamos desde Decolecta
  return await sincronizarSunatLogic(fechaIso);
};

/**
 * Lista el historial de tipos de cambio SUNAT por rango de fechas.
 */
export const obtenerHistorialSunatLogic = async (fechaInicio?: string, fechaFin?: string) => {
  log.debug(line(), `logic::obtenerHistorialSunatLogic - desde: ${fechaInicio}, hasta: ${fechaFin}`);

  const fInicio = fechaInicio ? parseFechaLima(fechaInicio) : undefined;
  const fFin = fechaFin ? parseFechaLima(fechaFin) : undefined;

  const historial = await prismaFT.client.$transaction(
    async (tx) => {
      const { monedaBase, monedaCotizada } = await resolverMonedas(tx, "USD", "PEN");
      return await sunattipocambioDao.getSunatTipoCambioHistorial(tx, monedaBase.idmoneda, monedaCotizada.idmoneda, fInicio, fFin);
    },
    { timeout: prismaFT.transactionTimeout },
  );

  return historial;
};

// ============================================================================
// SBS: Lógica de Sincronización y Consulta
// ============================================================================

/**
 * Consulta la API de Decolecta para SBS (Promedio y Contable) y persiste/actualiza en BD.
 */
export const sincronizarSbsLogic = async (monedaCodigo = "USD", fechaIso?: string) => {
  log.debug(line(), `logic::sincronizarSbsLogic - moneda: ${monedaCodigo}, fecha: ${fechaIso || "hoy"}`);

  // 1. Consultar de forma secuencial para no saturar el rate limit (429) de Decolecta
  const promedioData = await decolectaService.getTipoCambioSbsPromedioPorFecha(monedaCodigo, fechaIso);
  await new Promise((resolve) => setTimeout(resolve, 350));
  const contableData = await decolectaService.getTipoCambioSbsContable(monedaCodigo, fechaIso);

  if (!promedioData || !promedioData.date) {
    throw new ClientError("Decolecta no retornó información de tipo de cambio promedio SBS", 502);
  }

  // 2. Persistir en BD dentro de una transacción
  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const { monedaBase, monedaCotizada } = await resolverMonedas(tx, promedioData.base_currency || monedaCodigo, promedioData.quote_currency || "PEN");

      const fechaRegistro = parseFechaLima(promedioData.date);
      const precioContable = contableData?.price ? new Prisma.Decimal(contableData.price) : new Prisma.Decimal(promedioData.sell_price);

      const registro = await sbstipocambioDao.upsertSbsTipoCambio(tx, {
        code: generateCode(),
        idmonedabase: monedaBase.idmoneda,
        idmonedacotizada: monedaCotizada.idmoneda,
        fecha: fechaRegistro,
        precio_compra: new Prisma.Decimal(promedioData.buy_price),
        precio_venta: new Prisma.Decimal(promedioData.sell_price),
        precio_contable: precioContable,
        estado: ESTADO.ACTIVO,
      });

      return registro;
    },
    { timeout: prismaFT.transactionTimeout },
  );

  return resultado;
};

/**
 * Consulta la API de Decolecta para SBS (Promedio) por mes y año, persistiendo en BD en una sola transacción.
 */
export const sincronizarSbsMesLogic = async (monedaCodigo = "USD", mes: number, anio: number) => {
  log.debug(line(), `logic::sincronizarSbsMesLogic - moneda: ${monedaCodigo}, mes: ${mes}, anio: ${anio}`);

  if (!mes || isNaN(mes) || mes < 1 || mes > 12) {
    throw new ClientError("El parámetro 'mes' debe ser un número entero entre 1 y 12", 400);
  }

  if (!anio || isNaN(anio) || anio < 2000 || anio > 2100) {
    throw new ClientError("El parámetro 'anio' debe ser un año válido de 4 dígitos (ej. 2025)", 400);
  }

  // 1. Consultar a Decolecta el promedio SBS por mes y año en 1 sola llamada
  const listaDecolecta = await decolectaService.getTipoCambioSbsPromedioPorMes(monedaCodigo, mes, anio);

  if (!listaDecolecta || !Array.isArray(listaDecolecta) || listaDecolecta.length === 0) {
    return {
      moneda: monedaCodigo,
      mes,
      anio,
      total_sincronizados: 0,
      registros: [],
    };
  }

  // 2. Persistir en BD dentro de una única transacción
  const registros = await prismaFT.client.$transaction(
    async (tx) => {
      const { monedaBase, monedaCotizada } = await resolverMonedas(tx, monedaCodigo, "PEN");
      const upsertedList = [];

      for (const item of listaDecolecta) {
        if (!item.date || !item.buy_price || !item.sell_price) continue;

        const fechaRegistro = parseFechaLima(item.date);
        // En sincronización mensual masiva, se toma el precio de venta como base contable
        const precioContable = new Prisma.Decimal(item.sell_price);

        const registro = await sbstipocambioDao.upsertSbsTipoCambio(tx, {
          code: generateCode(),
          idmonedabase: monedaBase.idmoneda,
          idmonedacotizada: monedaCotizada.idmoneda,
          fecha: fechaRegistro,
          precio_compra: new Prisma.Decimal(item.buy_price),
          precio_venta: new Prisma.Decimal(item.sell_price),
          precio_contable: precioContable,
          estado: ESTADO.ACTIVO,
        });

        upsertedList.push(registro);
      }

      return upsertedList;
    },
    { timeout: prismaFT.transactionTimeout },
  );

  return {
    moneda: monedaCodigo,
    mes,
    anio,
    total_sincronizados: registros.length,
    registros,
  };
};

/**
 * Obtiene el tipo de cambio SBS aplicando estrategia Cache-Aside.
 * Si ya existe en la BD local, lo devuelve; si no, lo sincroniza desde Decolecta.
 */
export const obtenerSbsLogic = async (monedaCodigo = "USD", fechaIso?: string) => {
  log.debug(line(), `logic::obtenerSbsLogic - moneda: ${monedaCodigo}, fecha: ${fechaIso || "hoy"}`);

  const fechaBuscada = parseFechaLima(fechaIso);

  const local = await prismaFT.client.$transaction(
    async (tx) => {
      const { monedaBase, monedaCotizada } = await resolverMonedas(tx, monedaCodigo, "PEN");
      return await sbstipocambioDao.getSbsTipoCambioByFecha(tx, fechaBuscada, monedaBase.idmoneda, monedaCotizada.idmoneda);
    },
    { timeout: prismaFT.transactionTimeout },
  );

  if (local) {
    return local;
  }

  // Si no existe localmente, sincronizamos desde Decolecta
  return await sincronizarSbsLogic(monedaCodigo, fechaIso);
};

/**
 * Lista el historial de tipos de cambio SBS por rango de fechas y moneda.
 */
export const obtenerHistorialSbsLogic = async (monedaCodigo = "USD", fechaInicio?: string, fechaFin?: string) => {
  log.debug(line(), `logic::obtenerHistorialSbsLogic - moneda: ${monedaCodigo}, desde: ${fechaInicio}, hasta: ${fechaFin}`);

  const fInicio = fechaInicio ? parseFechaLima(fechaInicio) : undefined;
  const fFin = fechaFin ? parseFechaLima(fechaFin) : undefined;

  const historial = await prismaFT.client.$transaction(
    async (tx) => {
      const { monedaBase, monedaCotizada } = await resolverMonedas(tx, monedaCodigo, "PEN");
      return await sbstipocambioDao.getSbsTipoCambioHistorial(tx, monedaBase.idmoneda, monedaCotizada.idmoneda, fInicio, fFin);
    },
    { timeout: prismaFT.transactionTimeout },
  );

  return historial;
};

// ============================================================================
// Sincronización Conjunta (Para Crontab)
// ============================================================================

/**
 * Sincroniza tanto SUNAT como SBS para el día actual.
 * Ideal para ser ejecutada desde scripts de Crontab.
 */
export const sincronizarTipoCambioDelDiaLogic = async () => {
  log.info(line(), "Iniciando sincronización conjunta de tipo de cambio (SUNAT + SBS)...");

  const sunat = await sincronizarSunatLogic();
  await new Promise((resolve) => setTimeout(resolve, 500));
  const sbs = await sincronizarSbsLogic("USD");

  log.info(line(), "Sincronización conjunta de tipo de cambio completada exitosamente");

  return { sunat, sbs };
};

/**
 * Sincroniza tanto SUNAT como SBS para un mes y año determinado.
 */
export const sincronizarMesTipoCambioConjuntaLogic = async (mes: number, anio: number, moneda = "USD") => {
  log.info(line(), `Iniciando sincronización mensual conjunta de tipo de cambio (SUNAT + SBS) para ${mes}/${anio}...`);

  const sunat = await sincronizarSunatMesLogic(mes, anio);
  await new Promise((resolve) => setTimeout(resolve, 350));
  const sbs = await sincronizarSbsMesLogic(moneda, mes, anio);

  log.info(line(), `Sincronización mensual conjunta finalizada: SUNAT(${sunat.total_sincronizados}), SBS(${sbs.total_sincronizados})`);

  return { sunat, sbs };
};

/**
 * Obtiene tipos de cambio SUNAT paginados con estrategia de opciones (offset-based).
 */
export const obtenerSunatPaginadoLogic = async (options: sunattipocambioDao.SunatTipoCambioPaginationOptions) => {
  log.debug(line(), "logic::obtenerSunatPaginadoLogic", options);

  return await prismaFT.client.$transaction(
    async (tx) => {
      return await sunattipocambioDao.getSunatTipoCambiosPaginado(tx, options);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Obtiene tipos de cambio SBS paginados con estrategia de opciones (offset-based).
 */
export const obtenerSbsPaginadoLogic = async (options: sbstipocambioDao.SbsTipoCambioPaginationOptions) => {
  log.debug(line(), "logic::obtenerSbsPaginadoLogic", options);

  return await prismaFT.client.$transaction(
    async (tx) => {
      return await sbstipocambioDao.getSbsTipoCambiosPaginado(tx, options);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
