import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { v4 as uuidv4 } from "uuid";

import * as monedaDao from "#src/daos/moneda.Dao.js";
import * as sbstipocambioDao from "#src/daos/sbstipocambio.Dao.js";
import * as sunattipocambioDao from "#src/daos/sunattipocambio.Dao.js";

import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import type { ServicioTipoCambioConfig } from "#src/daos/configuracionapp.Dao.js";
import * as configuracionappDao from "#src/daos/configuracionapp.Dao.js";
import { apisPeruService } from "#src/integrations/apisperu/index.js";
import { decolectaService } from "#src/integrations/decolecta/index.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { line, log } from "#src/utils/logger.pino.js";

import { parseDateUtcMidnight } from "#src/utils/dateUtils.js";

/**
 * Convierte un string o valor de fecha a objeto Date anclado a medianoche UTC
 * para el manejo preciso de columnas MySQL DATE (@db.Date) en Prisma sin desfases horarios.
 */
export const parseFechaLima = (fechaStr?: string): Date => {
  return parseDateUtcMidnight(fechaStr);
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

/**
 * Resuelve el servicio de tipo de cambio de la SUNAT configurado a utilizar (APIs Perú o Decolecta).
 * Si no se pasa serviciotipocambioid, selecciona el servicio activo de mayor prioridad.
 */
export const resolverServicioTipoCambioSunat = async (tx: any, serviciotipocambioid?: string): Promise<ServicioTipoCambioConfig> => {
  const servicios = await configuracionappDao.getServiciosTipoDeCambioParsed(tx);
  const activos = servicios.filter((s) => s.estado === 1);

  if (activos.length === 0) {
    throw new ClientError("No se encontraron servicios de tipo de cambio activos en la configuración", 500);
  }

  if (serviciotipocambioid) {
    const encontrado = activos.find((s) => s.serviciotipocambioid === serviciotipocambioid);
    if (!encontrado) {
      throw new ClientError(`El servicio de tipo de cambio '${serviciotipocambioid}' no existe o no está activo`, 404);
    }
    return encontrado;
  }

  // Por defecto el de mayor prioridad (menor valor numérico de prioridad, ej. prioridad: 1)
  activos.sort((a, b) => a.prioridad_sunat - b.prioridad_sunat);
  return activos[0];
};

/**
 * Resuelve el servicio de tipo de cambio de la SBS configurado a utilizar (APIs Perú o Decolecta).
 * Si no se pasa serviciotipocambioid, selecciona el servicio activo de mayor prioridad.
 */
export const resolverServicioTipoCambioSbs = async (tx: any, serviciotipocambioid?: string): Promise<ServicioTipoCambioConfig> => {
  const servicios = await configuracionappDao.getServiciosTipoDeCambioParsed(tx);
  const activos = servicios.filter((s) => s.estado === 1);

  if (activos.length === 0) {
    throw new ClientError("No se encontraron servicios de tipo de cambio activos en la configuración", 500);
  }

  if (serviciotipocambioid) {
    const encontrado = activos.find((s) => s.serviciotipocambioid === serviciotipocambioid);
    if (!encontrado) {
      throw new ClientError(`El servicio de tipo de cambio '${serviciotipocambioid}' no existe o no está activo`, 404);
    }
    return encontrado;
  }

  // Por defecto el de mayor prioridad (menor valor numérico de prioridad, ej. prioridad: 1)
  activos.sort((a, b) => a.prioridad_sbs - b.prioridad_sbs);
  return activos[0];
};

/**
 * Obtiene todos los servicios de tipo de cambio de la SUNAT activos (estado = 1)
 * ordenados por prioridad de menor a mayor (ej. prioridad 1 primero, luego 2, etc.).
 */
export const resolverServiciosTipoCambioOrdenadosSunat = async (tx: any): Promise<ServicioTipoCambioConfig[]> => {
  const servicios = await configuracionappDao.getServiciosTipoDeCambioParsed(tx);
  const activos = servicios.filter((s) => s.estado === 1);

  if (activos.length === 0) {
    throw new ClientError("No se encontraron servicios de tipo de cambio activos en la configuración", 500);
  }

  activos.sort((a, b) => a.prioridad_sunat - b.prioridad_sunat);
  return activos;
};

/**
 * Obtiene todos los servicios de tipo de cambio de la SUNAT activos (estado = 1)
 * ordenados por prioridad de menor a mayor (ej. prioridad 1 primero, luego 2, etc.).
 */
export const resolverServiciosTipoCambioOrdenadosSbs = async (tx: any): Promise<ServicioTipoCambioConfig[]> => {
  const servicios = await configuracionappDao.getServiciosTipoDeCambioParsed(tx);
  const activos = servicios.filter((s) => s.estado === 1);

  if (activos.length === 0) {
    throw new ClientError("No se encontraron servicios de tipo de cambio activos en la configuración", 500);
  }

  activos.sort((a, b) => a.prioridad_sbs - b.prioridad_sbs);
  return activos;
};

// ============================================================================
// SUNAT: Lógica de Sincronización y Consulta
// ============================================================================

interface ResultadoConsultaSunat {
  fechaRegistroStr: string;
  buyPriceStr: string;
  sellPriceStr: string;
  baseCurrency: string;
  quoteCurrency: string;
}

/**
 * Consulta un proveedor de tipo de cambio específico para SUNAT.
 */
const consultarProveedorSunat = async (servicio: ServicioTipoCambioConfig, fechaIso: string): Promise<ResultadoConsultaSunat> => {
  if (servicio.idserviciotipocambio === 1) {
    // APIs Perú
    const data = await apisPeruService.getTipoCambioSunatPorFecha(fechaIso);

    const usdRate = data?.rates?.USD;
    if (!data || !data.success || !data.date || !usdRate?.buy || !usdRate?.sell) {
      throw new ClientError("APIs Perú no retornó información válida para el tipo de cambio SUNAT", 502);
    }

    return {
      fechaRegistroStr: data.date,
      buyPriceStr: usdRate.buy,
      sellPriceStr: usdRate.sell,
      baseCurrency: "USD",
      quoteCurrency: "PEN",
    };
  } else if (servicio.idserviciotipocambio === 2) {
    // Decolecta
    const dataDecolecta = await decolectaService.getTipoCambioSunatPorFecha(fechaIso);

    if (!dataDecolecta || !dataDecolecta.date || !dataDecolecta.buy_price || !dataDecolecta.sell_price) {
      throw new ClientError("Decolecta no retornó información válida para el tipo de cambio SUNAT", 502);
    }

    return {
      fechaRegistroStr: dataDecolecta.date,
      buyPriceStr: dataDecolecta.buy_price,
      sellPriceStr: dataDecolecta.sell_price,
      baseCurrency: dataDecolecta.base_currency || "USD",
      quoteCurrency: dataDecolecta.quote_currency || "PEN",
    };
  } else {
    throw new ClientError(`Proveedor de tipo de cambio no soportado: ${servicio.nombre}`, 400);
  }
};

/**
 * Persiste en base de datos un resultado obtenido de tipo de cambio SUNAT.
 */
const persistirSunatTipoCambio = async (data: ResultadoConsultaSunat) => {
  return await prismaFT.client.$transaction(
    async (tx) => {
      const { monedaBase, monedaCotizada } = await resolverMonedas(tx, data.baseCurrency, data.quoteCurrency);
      const fechaRegistro = parseFechaLima(data.fechaRegistroStr);

      const registro = await sunattipocambioDao.upsertSunatTipoCambio(tx, {
        code: generateCode(),
        idmonedabase: monedaBase.idmoneda,
        idmonedacotizada: monedaCotizada.idmoneda,
        fecha: fechaRegistro,
        precio_compra: new Prisma.Decimal(data.buyPriceStr),
        precio_venta: new Prisma.Decimal(data.sellPriceStr),
        estado: ESTADO.ACTIVO,
      });

      return registro;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Sincroniza SUNAT utilizando una estrategia de Fallback en cascada (Failover jerárquico):
 * Obtiene todos los servicios de tipo de cambio con estado 1 ordenados por prioridad de menor a mayor.
 * Intenta uno por uno; cuando un servicio responde correctamente, detiene los intentos y retorna el resultado.
 */
export const sincronizarSunatWithFallbackLogic = async (fechaIso: string) => {
  log.debug(line(), `logic::sincronizarSunatWithFallbackLogic - fecha: ${fechaIso}`);

  const servicios = await prismaFT.client.$transaction(async (tx) => {
    return await resolverServiciosTipoCambioOrdenadosSunat(tx);
  });

  const errores: { servicio: string; prioridad: number; error: string }[] = [];

  for (const servicio of servicios) {
    try {
      log.info(line(), `Intentando consultar tipo de cambio SUNAT con '${servicio.nombre}' (prioridad: ${servicio.prioridad_sunat})...`);
      const rawData = await consultarProveedorSunat(servicio, fechaIso);
      const resultado = await persistirSunatTipoCambio(rawData);
      log.info(line(), `Tipo de cambio SUNAT obtenido exitosamente con '${servicio.nombre}'`);
      return Object.assign(resultado, {
        origen: "API_EXTERNA" as const,
        proveedor: servicio.nombre,
        prioridad: servicio.prioridad_sunat,
      });
    } catch (err: any) {
      const msg = err?.message || String(err);
      log.warn(line(), `Falló el proveedor SUNAT '${servicio.nombre}' (prioridad: ${servicio.prioridad_sunat}): ${msg}. Intentando siguiente proveedor en cascada...`);
      errores.push({
        servicio: servicio.nombre,
        prioridad: servicio.prioridad_sunat,
        error: msg,
      });
    }
  }

  log.error(line(), "Todos los servicios de tipo de cambio SUNAT fallaron en cascada", errores);
  const clientErr = new ClientError(`No se pudo obtener el tipo de cambio SUNAT. Fallaron todos los servicios configurados: ${errores.map((e) => `[${e.servicio}: ${e.error}]`).join(", ")}`, 502);
  (clientErr as any).errores = errores;
  throw clientErr;
};

/**
 * Consulta la API externa para SUNAT y persiste/actualiza el registro en BD.
 * Si no se especifica serviciotipocambioid, aplica la estrategia de Fallback en cascada.
 */
export const sincronizarSunatLogic = async (fechaIso: string, serviciotipocambioid?: string) => {
  log.debug(line(), `logic::sincronizarSunatLogic - fecha: ${fechaIso}, servicio: ${serviciotipocambioid || "cascade-fallback"}`);

  // Si no se especifica un servicio particular, se utiliza la estrategia de Fallback en cascada
  if (!serviciotipocambioid) {
    return await sincronizarSunatWithFallbackLogic(fechaIso);
  }

  // 1. Resolver el servicio configurado específico
  const servicio = await prismaFT.client.$transaction(async (tx) => {
    return await resolverServicioTipoCambioSunat(tx, serviciotipocambioid);
  });

  // 2. Consultar al servicio correspondiente
  const rawData = await consultarProveedorSunat(servicio, fechaIso);

  // 3. Persistir en BD dentro de una transacción
  const resultado = await persistirSunatTipoCambio(rawData);
  return Object.assign(resultado, {
    origen: "API_EXTERNA" as const,
    proveedor: servicio.nombre,
    prioridad: servicio.prioridad_sunat,
  });
};

/**
 * Consulta la API externa seleccionada para SUNAT por mes y año, persistiendo en BD en una sola transacción.
 */
export const sincronizarSunatMesLogic = async (mes: number, anio: number, serviciotipocambioid?: string) => {
  log.debug(line(), `logic::sincronizarSunatMesLogic - mes: ${mes}, anio: ${anio}, servicio: ${serviciotipocambioid || "default"}`);

  if (!mes || isNaN(mes) || mes < 1 || mes > 12) {
    throw new ClientError("El parámetro 'mes' debe ser un número entero entre 1 y 12", 400);
  }

  if (!anio || isNaN(anio) || anio < 2000 || anio > 2100) {
    throw new ClientError("El parámetro 'anio' debe ser un año válido de 4 dígitos (ej. 2026)", 400);
  }

  // 1. Resolver el servicio configurado
  const servicio = await prismaFT.client.$transaction(async (tx) => {
    return await resolverServicioTipoCambioSunat(tx, serviciotipocambioid);
  });

  const itemsToSave: { date: string; buy_price: string; sell_price: string }[] = [];

  if (servicio.idserviciotipocambio === 1) {
    // APIs Perú
    try {
      const resApisPeru = await apisPeruService.getTipoCambioSunatPorMes(mes, anio);
      if (resApisPeru && resApisPeru.data && Array.isArray(resApisPeru.data)) {
        for (const item of resApisPeru.data) {
          const usd = item.rates?.USD;
          if (item.date && usd?.buy && usd?.sell) {
            itemsToSave.push({
              date: item.date,
              buy_price: usd.buy,
              sell_price: usd.sell,
            });
          }
        }
      }
    } catch (err: any) {
      if (err?.status === 404) {
        log.warn(line(), `No se encontraron datos en APIs Perú para SUNAT mes ${mes}/${anio}`);
      } else {
        throw err;
      }
    }
  } else if (servicio.idserviciotipocambio === 2) {
    // Decolecta
    const listaDecolecta = await decolectaService.getTipoCambioSunatPorMes(mes, anio);
    if (listaDecolecta && Array.isArray(listaDecolecta)) {
      for (const item of listaDecolecta) {
        if (item.date && item.buy_price && item.sell_price) {
          itemsToSave.push({
            date: item.date,
            buy_price: item.buy_price,
            sell_price: item.sell_price,
          });
        }
      }
    }
  } else {
    throw new ClientError(`Proveedor de tipo de cambio no soportado: ${servicio.nombre}`, 400);
  }

  if (itemsToSave.length === 0) {
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

      for (const item of itemsToSave) {
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
 * Si ya existe en la BD local, lo devuelve; si no, lo sincroniza desde la API configurada
 * o mediante Fallback en cascada (Failover jerárquico) si no se especifica un proveedor.
 */
export const obtenerSunatLogic = async (fechaIso: string, serviciotipocambioid?: string) => {
  log.debug(line(), `logic::obtenerSunatLogic - fecha: ${fechaIso}`);

  const fechaBuscada = parseFechaLima(fechaIso);

  const local = await prismaFT.client.$transaction(
    async (tx) => {
      const { monedaBase, monedaCotizada } = await resolverMonedas(tx, "USD", "PEN");
      return await sunattipocambioDao.getSunatTipoCambioByFecha(tx, fechaBuscada, monedaBase.idmoneda, monedaCotizada.idmoneda);
    },
    { timeout: prismaFT.transactionTimeout },
  );

  if (local) {
    return Object.assign(local, {
      origen: "CACHE_LOCAL" as const,
    });
  }

  // Si no existe localmente, sincronizamos desde el proveedor seleccionado (o en cascada si no se especifica)
  return await sincronizarSunatLogic(fechaIso, serviciotipocambioid);
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

interface ResultadoConsultaSbs {
  fechaRegistroStr: string;
  buyPriceStr: string;
  sellPriceStr: string;
  baseCurrency: string;
  quoteCurrency: string;
  precioContableDecimal: Prisma.Decimal | null;
}

/**
 * Consulta un proveedor de tipo de cambio específico para SBS.
 */
const consultarProveedorSbs = async (servicio: ServicioTipoCambioConfig, monedaCodigo = "USD", fechaIso: string): Promise<ResultadoConsultaSbs> => {
  if (servicio.idserviciotipocambio === 1) {
    // APIs Perú
    const data = await apisPeruService.getTipoCambioSbsPorFecha(fechaIso);

    const rate = data?.rates?.[monedaCodigo];
    if (!data || !data.success || !data.date || !rate?.buy || !rate?.sell) {
      throw new ClientError(`APIs Perú no retornó información de tipo de cambio SBS para la moneda ${monedaCodigo}`, 502);
    }

    return {
      fechaRegistroStr: data.date,
      buyPriceStr: rate.buy,
      sellPriceStr: rate.sell,
      baseCurrency: monedaCodigo,
      quoteCurrency: "PEN",
      precioContableDecimal: null, // APIs Perú no provee tipo de cambio contable SBS
    };
  } else if (servicio.idserviciotipocambio === 2) {
    // Decolecta
    const promedioData = await decolectaService.getTipoCambioSbsPromedioPorFecha(monedaCodigo, fechaIso);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const contableData = await decolectaService.getTipoCambioSbsContable(monedaCodigo, fechaIso);

    if (!promedioData || !promedioData.date || !promedioData.buy_price || !promedioData.sell_price) {
      throw new ClientError("Decolecta no retornó información de tipo de cambio promedio SBS", 502);
    }

    return {
      fechaRegistroStr: promedioData.date,
      buyPriceStr: promedioData.buy_price,
      sellPriceStr: promedioData.sell_price,
      baseCurrency: promedioData.base_currency || monedaCodigo,
      quoteCurrency: promedioData.quote_currency || "PEN",
      precioContableDecimal: contableData?.price ? new Prisma.Decimal(contableData.price) : new Prisma.Decimal(promedioData.sell_price),
    };
  } else {
    throw new ClientError(`Proveedor de tipo de cambio no soportado: ${servicio.nombre}`, 400);
  }
};

/**
 * Persiste en base de datos un resultado obtenido de tipo de cambio SBS.
 */
const persistirSbsTipoCambio = async (data: ResultadoConsultaSbs) => {
  return await prismaFT.client.$transaction(
    async (tx) => {
      const { monedaBase, monedaCotizada } = await resolverMonedas(tx, data.baseCurrency, data.quoteCurrency);
      const fechaRegistro = parseFechaLima(data.fechaRegistroStr);

      const registro = await sbstipocambioDao.upsertSbsTipoCambio(tx, {
        code: generateCode(),
        idmonedabase: monedaBase.idmoneda,
        idmonedacotizada: monedaCotizada.idmoneda,
        fecha: fechaRegistro,
        precio_compra: new Prisma.Decimal(data.buyPriceStr),
        precio_venta: new Prisma.Decimal(data.sellPriceStr),
        precio_contable: data.precioContableDecimal,
        estado: ESTADO.ACTIVO,
      });

      return registro;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Sincroniza SBS utilizando una estrategia de Fallback en cascada (Failover jerárquico):
 * Obtiene todos los servicios de tipo de cambio con estado 1 ordenados por prioridad de menor a mayor.
 * Intenta uno por uno; cuando un servicio responde correctamente, detiene los intentos y retorna el resultado.
 */
export const sincronizarSbsWithFallbackLogic = async (monedaCodigo = "USD", fechaIso: string) => {
  log.debug(line(), `logic::sincronizarSbsWithFallbackLogic - moneda: ${monedaCodigo}, fecha: ${fechaIso}`);

  const servicios = await prismaFT.client.$transaction(async (tx) => {
    return await resolverServiciosTipoCambioOrdenadosSbs(tx);
  });

  const errores: { servicio: string; prioridad: number; error: string }[] = [];

  for (const servicio of servicios) {
    try {
      log.info(line(), `Intentando consultar tipo de cambio SBS (${monedaCodigo}) con '${servicio.nombre}' (prioridad: ${servicio.prioridad_sbs})...`);
      const rawData = await consultarProveedorSbs(servicio, monedaCodigo, fechaIso);
      const resultado = await persistirSbsTipoCambio(rawData);
      log.info(line(), `Tipo de cambio SBS (${monedaCodigo}) obtenido exitosamente con '${servicio.nombre}'`);
      return Object.assign(resultado, {
        origen: "API_EXTERNA" as const,
        proveedor: servicio.nombre,
        prioridad: servicio.prioridad_sbs,
      });
    } catch (err: any) {
      const msg = err?.message || String(err);
      log.warn(line(), `Falló el proveedor SBS '${servicio.nombre}' (prioridad: ${servicio.prioridad_sbs}): ${msg}. Intentando siguiente proveedor en cascada...`);
      errores.push({
        servicio: servicio.nombre,
        prioridad: servicio.prioridad_sbs,
        error: msg,
      });
    }
  }

  log.error(line(), `Todos los servicios de tipo de cambio SBS fallaron en cascada para la moneda ${monedaCodigo}`, errores);
  const clientErr = new ClientError(`No se pudo obtener el tipo de cambio SBS. Fallaron todos los servicios configurados: ${errores.map((e) => `[${e.servicio}: ${e.error}]`).join(", ")}`, 502);
  (clientErr as any).errores = errores;
  throw clientErr;
};

/**
 * Consulta la API externa para SBS (Promedio y Contable) y persiste/actualiza en BD.
 * Si no se especifica serviciotipocambioid, aplica la estrategia de Fallback en cascada.
 */
export const sincronizarSbsLogic = async (monedaCodigo = "USD", fechaIso: string, serviciotipocambioid?: string) => {
  log.debug(line(), `logic::sincronizarSbsLogic - moneda: ${monedaCodigo}, fecha: ${fechaIso}, servicio: ${serviciotipocambioid || "cascade-fallback"}`);

  // Si no se especifica un servicio particular, se utiliza la estrategia de Fallback en cascada
  if (!serviciotipocambioid) {
    return await sincronizarSbsWithFallbackLogic(monedaCodigo, fechaIso);
  }

  // 1. Resolver el servicio configurado específico
  const servicio = await prismaFT.client.$transaction(async (tx) => {
    return await resolverServicioTipoCambioSbs(tx, serviciotipocambioid);
  });

  // 2. Consultar al servicio correspondiente
  const rawData = await consultarProveedorSbs(servicio, monedaCodigo, fechaIso);

  // 3. Persistir en BD dentro de una transacción
  const resultado = await persistirSbsTipoCambio(rawData);
  return Object.assign(resultado, {
    origen: "API_EXTERNA" as const,
    proveedor: servicio.nombre,
    prioridad: servicio.prioridad_sbs,
  });
};

/**
 * Consulta la API externa seleccionada para SBS por mes y año, persistiendo en BD en una sola transacción.
 */
export const sincronizarSbsMesLogic = async (monedaCodigo = "USD", mes: number, anio: number, serviciotipocambioid?: string) => {
  log.debug(line(), `logic::sincronizarSbsMesLogic - moneda: ${monedaCodigo}, mes: ${mes}, anio: ${anio}, servicio: ${serviciotipocambioid || "default"}`);

  if (!mes || isNaN(mes) || mes < 1 || mes > 12) {
    throw new ClientError("El parámetro 'mes' debe ser un número entero entre 1 y 12", 400);
  }

  if (!anio || isNaN(anio) || anio < 2000 || anio > 2100) {
    throw new ClientError("El parámetro 'anio' debe ser un año válido de 4 dígitos (ej. 2026)", 400);
  }

  // 1. Resolver el servicio configurado
  const servicio = await prismaFT.client.$transaction(async (tx) => {
    return await resolverServicioTipoCambioSbs(tx, serviciotipocambioid);
  });

  const itemsToSave: { date: string; buy_price: string; sell_price: string; precio_contable: Prisma.Decimal | null }[] = [];

  if (servicio.idserviciotipocambio === 1) {
    // APIs Perú
    try {
      const resApisPeru = await apisPeruService.getTipoCambioSbsPorMes(mes, anio);
      if (resApisPeru && resApisPeru.data && Array.isArray(resApisPeru.data)) {
        for (const item of resApisPeru.data) {
          const rate = item.rates?.[monedaCodigo];
          if (item.date && rate?.buy && rate?.sell) {
            itemsToSave.push({
              date: item.date,
              buy_price: rate.buy,
              sell_price: rate.sell,
              precio_contable: null,
            });
          }
        }
      }
    } catch (err: any) {
      if (err?.status === 404) {
        log.warn(line(), `No se encontraron datos en APIs Perú para SBS (${monedaCodigo}) mes ${mes}/${anio}`);
      } else {
        throw err;
      }
    }
  } else if (servicio.idserviciotipocambio === 2) {
    // Decolecta
    const listaDecolecta = await decolectaService.getTipoCambioSbsPromedioPorMes(monedaCodigo, mes, anio);
    if (listaDecolecta && Array.isArray(listaDecolecta)) {
      for (const item of listaDecolecta) {
        if (item.date && item.buy_price && item.sell_price) {
          itemsToSave.push({
            date: item.date,
            buy_price: item.buy_price,
            sell_price: item.sell_price,
            precio_contable: new Prisma.Decimal(item.sell_price),
          });
        }
      }
    }
  } else {
    throw new ClientError(`Proveedor de tipo de cambio no soportado: ${servicio.nombre}`, 400);
  }

  if (itemsToSave.length === 0) {
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

      for (const item of itemsToSave) {
        const fechaRegistro = parseFechaLima(item.date);
        const registro = await sbstipocambioDao.upsertSbsTipoCambio(tx, {
          code: generateCode(),
          idmonedabase: monedaBase.idmoneda,
          idmonedacotizada: monedaCotizada.idmoneda,
          fecha: fechaRegistro,
          precio_compra: new Prisma.Decimal(item.buy_price),
          precio_venta: new Prisma.Decimal(item.sell_price),
          precio_contable: item.precio_contable,
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
 * Si ya existe en la BD local, lo devuelve; si no, lo sincroniza desde el proveedor seleccionado
 * o mediante Fallback en cascada (Failover jerárquico) si no se especifica un proveedor.
 */
export const obtenerSbsLogic = async (monedaCodigo = "USD", fechaIso: string, serviciotipocambioid?: string) => {
  log.debug(line(), `logic::obtenerSbsLogic - moneda: ${monedaCodigo}, fecha: ${fechaIso}`);

  const fechaBuscada = parseFechaLima(fechaIso);

  const local = await prismaFT.client.$transaction(
    async (tx) => {
      const { monedaBase, monedaCotizada } = await resolverMonedas(tx, monedaCodigo, "PEN");
      return await sbstipocambioDao.getSbsTipoCambioByFecha(tx, fechaBuscada, monedaBase.idmoneda, monedaCotizada.idmoneda);
    },
    { timeout: prismaFT.transactionTimeout },
  );

  if (local) {
    return Object.assign(local, {
      origen: "CACHE_LOCAL" as const,
    });
  }

  // Si no existe localmente, sincronizamos desde el proveedor seleccionado (o en cascada si no se especifica)
  return await sincronizarSbsLogic(monedaCodigo, fechaIso, serviciotipocambioid);
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
 * Sincroniza tanto SUNAT como SBS para una fecha determinada (o la fecha del sistema por defecto)
 * aplicando estrategia Cache-Aside (si ya existe en BD no consulta a las APIs externas)
 * y Fallback en cascada (Failover jerárquico de servicios activos ordenados por prioridad) si no existe en BD local.
 * Ideal para ser ejecutada desde scripts de Crontab / Programador de Tareas.
 *
 * @param fechaIsoOrForzar Fecha en formato YYYY-MM-DD (opcional) o boolean para forzarSincronizacion
 * @param forzarSincronizacion Si es true, ignora el caché local y fuerza la consulta a las APIs externas
 * @param throwOnError Si es false (por defecto), los fallos individuales en cascada no lanzan excepción y no detienen el flujo conjunto
 */
export const sincronizarTipoCambioDelDiaLogic = async (fechaIso: string, forzarSincronizacion = false, throwOnError = false) => {
  log.info(line(), `Iniciando sincronización conjunta de tipo de cambio (SUNAT + SBS) con Cache-Aside [fecha: ${fechaIso}, forzar: ${forzarSincronizacion}]...`);

  // 1. Consultar SUNAT
  let sunat: any = null;
  try {
    sunat = forzarSincronizacion ? await sincronizarSunatLogic(fechaIso) : await obtenerSunatLogic(fechaIso);
  } catch (err: any) {
    if (throwOnError) throw err;
    sunat = {
      origen: "FALLO_EN_CASCADA" as const,
      error: true,
      mensaje: "Todos los servicios de tipo de cambio SUNAT fallaron en cascada",
      detalle: err?.message || String(err),
      errores: err?.errores,
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  // 2. Consultar SBS
  let sbs: any = null;
  try {
    sbs = forzarSincronizacion ? await sincronizarSbsLogic("USD", fechaIso) : await obtenerSbsLogic("USD", fechaIso);
  } catch (err: any) {
    if (throwOnError) throw err;
    sbs = {
      origen: "FALLO_EN_CASCADA" as const,
      error: true,
      mensaje: "Todos los servicios de tipo de cambio SBS fallaron en cascada para la moneda USD",
      detalle: err?.message || String(err),
      errores: err?.errores,
    };
  }

  log.info(line(), `Sincronización conjunta completada. SUNAT: ${sunat?.origen || "ERROR"}, SBS: ${sbs?.origen || "ERROR"}`);

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
