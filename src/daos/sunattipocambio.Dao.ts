import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, sunat_tipo_cambio } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";
import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

/**
 * Obtiene el tipo de cambio SUNAT para una fecha y par de monedas específicos.
 */
export const getSunatTipoCambioByFecha = async (
  tx: TxClient,
  fecha: Date,
  idmonedabase: number,
  idmonedacotizada: number,
  estados: number[] = [ESTADO.ACTIVO],
) => {
  try {
    const registro = await tx.sunat_tipo_cambio.findFirst({
      where: {
        idmonedabase,
        idmonedacotizada,
        fecha,
        estado: {
          in: estados,
        },
      },
      include: {
        moneda_base: true,
        moneda_cotizada: true,
      },
    });

    return registro;
  } catch (error) {
    log.error(line(), "Error al obtener tipo de cambio SUNAT por fecha", error);
    throw new ClientError("Ocurrió un error al obtener el tipo de cambio SUNAT", 500);
  }
};

/**
 * Obtiene el último tipo de cambio registrado de SUNAT.
 */
export const getUltimoSunatTipoCambio = async (
  tx: TxClient,
  idmonedabase: number,
  idmonedacotizada: number,
  estados: number[] = [ESTADO.ACTIVO],
) => {
  try {
    const registro = await tx.sunat_tipo_cambio.findFirst({
      where: {
        idmonedabase,
        idmonedacotizada,
        estado: {
          in: estados,
        },
      },
      include: {
        moneda_base: true,
        moneda_cotizada: true,
      },
      orderBy: {
        fecha: "desc",
      },
    });

    return registro;
  } catch (error) {
    log.error(line(), "Error al obtener último tipo de cambio SUNAT", error);
    throw new ClientError("Ocurrió un error al consultar el último tipo de cambio SUNAT", 500);
  }
};

/**
 * Obtiene el historial de tipos de cambio SUNAT en un rango de fechas.
 */
export const getSunatTipoCambioHistorial = async (
  tx: TxClient,
  idmonedabase: number,
  idmonedacotizada: number,
  fechaInicio?: Date,
  fechaFin?: Date,
  estados: number[] = [ESTADO.ACTIVO],
) => {
  try {
    const where: Prisma.sunat_tipo_cambioWhereInput = {
      idmonedabase,
      idmonedacotizada,
      estado: {
        in: estados,
      },
    };

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = fechaInicio;
      if (fechaFin) where.fecha.lte = fechaFin;
    }

    const historial = await tx.sunat_tipo_cambio.findMany({
      where,
      include: {
        moneda_base: true,
        moneda_cotizada: true,
      },
      orderBy: {
        fecha: "desc",
      },
    });

    return historial;
  } catch (error) {
    log.error(line(), "Error al obtener historial de tipos de cambio SUNAT", error);
    throw new ClientError("Ocurrió un error al obtener el historial de tipos de cambio SUNAT", 500);
  }
};

/**
 * Inserta un nuevo registro de tipo de cambio SUNAT.
 */
export const insertSunatTipoCambio = async (
  tx: TxClient,
  sunattipocambio: Prisma.sunat_tipo_cambioUncheckedCreateInput,
) => {
  try {
    const nuevo = await tx.sunat_tipo_cambio.create({ data: sunattipocambio });
    return nuevo;
  } catch (error) {
    log.error(line(), "Error al insertar tipo de cambio SUNAT", error);
    throw new ClientError("Ocurrió un error al guardar el tipo de cambio SUNAT", 500);
  }
};

/**
 * Inserta o actualiza (upsert) un registro de tipo de cambio SUNAT basado en la clave única:
 * [idmonedabase, idmonedacotizada, fecha].
 */
export const upsertSunatTipoCambio = async (
  tx: TxClient,
  data: Prisma.sunat_tipo_cambioUncheckedCreateInput,
) => {
  try {
    const registro = await tx.sunat_tipo_cambio.upsert({
      where: {
        idmonedabase_idmonedacotizada_fecha: {
          idmonedabase: data.idmonedabase,
          idmonedacotizada: data.idmonedacotizada,
          fecha: data.fecha as Date,
        },
      },
      create: data,
      update: {
        precio_compra: data.precio_compra,
        precio_venta: data.precio_venta,
        fechamod: new Date(),
        idusuariomod: data.idusuariomod || 1,
        estado: data.estado || ESTADO.ACTIVO,
      },
      include: {
        moneda_base: true,
        moneda_cotizada: true,
      },
    });

    return registro;
  } catch (error) {
    log.error(line(), "Error al realizar upsert de tipo de cambio SUNAT", error);
    throw new ClientError("Ocurrió un error al sincronizar el tipo de cambio SUNAT", 500);
  }
};

/**
 * Obtiene todos los tipos de cambio SUNAT según los estados proporcionados.
 */
export const getSunatTipoCambios = async (tx: TxClient, estados: number[]) => {
  try {
    const registros = await tx.sunat_tipo_cambio.findMany({
      include: {
        moneda_base: true,
        moneda_cotizada: true,
      },
      where: {
        estado: {
          in: estados,
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    return registros;
  } catch (error) {
    log.error(line(), "Error al listar tipos de cambio SUNAT", error);
    throw new ClientError("Ocurrió un error al obtener la lista de tipos de cambio SUNAT", 500);
  }
};

/**
 * Obtiene un tipo de cambio SUNAT por su UUID (sunattipocambioid).
 */
export const getSunatTipoCambioBySunattipocambioid = async (tx: TxClient, sunattipocambioid: string) => {
  try {
    const registro = await tx.sunat_tipo_cambio.findFirst({
      include: {
        moneda_base: true,
        moneda_cotizada: true,
      },
      where: {
        sunattipocambioid,
      },
    });

    return registro;
  } catch (error) {
    log.error(line(), "Error al buscar tipo de cambio SUNAT por UUID", error);
    throw new ClientError("Ocurrió un error al buscar el tipo de cambio SUNAT", 500);
  }
};

/**
 * Actualiza un tipo de cambio SUNAT por su UUID (sunattipocambioid).
 */
export const updateSunatTipoCambio = async (
  tx: TxClient,
  sunattipocambioid: string,
  sunattipocambio: Prisma.sunat_tipo_cambioUpdateInput,
) => {
  try {
    const result = await tx.sunat_tipo_cambio.update({
      data: sunattipocambio,
      where: {
        sunattipocambioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "Error al actualizar tipo de cambio SUNAT", error);
    throw new ClientError("Ocurrió un error al actualizar el tipo de cambio SUNAT", 500);
  }
};

/**
 * Elimina lógicamente un tipo de cambio SUNAT (estado = ESTADO.ELIMINADO).
 */
export const deleteSunatTipoCambio = async (tx: TxClient, sunattipocambioid: string, idusuariomod: number) => {
  try {
    const result = await tx.sunat_tipo_cambio.update({
      data: {
        idusuariomod,
        fechamod: new Date(),
        estado: ESTADO.ELIMINADO,
      },
      where: {
        sunattipocambioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "Error al eliminar tipo de cambio SUNAT", error);
    throw new ClientError("Ocurrió un error al eliminar el tipo de cambio SUNAT", 500);
  }
};

/**
 * Activa un tipo de cambio SUNAT previamente eliminado (estado = ESTADO.ACTIVO).
 */
export const activateSunatTipoCambio = async (tx: TxClient, sunattipocambioid: string, idusuariomod: number) => {
  try {
    const result = await tx.sunat_tipo_cambio.update({
      data: {
        idusuariomod,
        fechamod: new Date(),
        estado: ESTADO.ACTIVO,
      },
      where: {
        sunattipocambioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "Error al activar tipo de cambio SUNAT", error);
    throw new ClientError("Ocurrió un error al activar el tipo de cambio SUNAT", 500);
  }
};

/**
 * Opciones para la paginación de tipos de cambio SUNAT.
 */
export interface SunatTipoCambioPaginationOptions {
  page?: number;
  pageIndex?: number;
  limit?: number;
  pageSize?: number;
  offset?: number;
  skip?: number;
  sortBy?: string;
  order?: string;
  desc?: boolean | string;
  search?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estados?: number[] | string;
  estado?: number | string;
  monedaCodigo?: string;
}

/**
 * Obtiene la lista paginada de tipos de cambio SUNAT con estrategia estándar de opciones (Offset-based).
 */
export const getSunatTipoCambiosPaginado = async (
  tx: TxClient,
  options: SunatTipoCambioPaginationOptions = {}
) => {
  try {
    // 1. Normalizar paginación
    const limit = Math.min(100, Math.max(1, Number(options.limit || options.pageSize || 10)));
    let page = 1;
    if (options.page !== undefined) {
      page = Math.max(1, Number(options.page));
    } else if (options.pageIndex !== undefined) {
      page = Math.max(1, Number(options.pageIndex) + 1);
    }

    const skip =
      options.skip !== undefined
        ? Math.max(0, Number(options.skip))
        : options.offset !== undefined
        ? Math.max(0, Number(options.offset))
        : (page - 1) * limit;

    // 2. Normalizar ordenamiento
    const allowedSortFields = [
      "fecha",
      "precio_compra",
      "precio_venta",
      "fechacrea",
      "fechamod",
      "estado",
      "code",
    ];
    const requestedSort = options.sortBy || "fecha";
    const sortField = allowedSortFields.includes(requestedSort) ? requestedSort : "fecha";

    let sortDirection: "asc" | "desc" = "desc";
    if (options.order) {
      sortDirection = String(options.order).toLowerCase() === "asc" ? "asc" : "desc";
    } else if (options.desc !== undefined) {
      sortDirection = options.desc === true || options.desc === "true" ? "desc" : "asc";
    }

    // 3. Normalizar filtros de estado
    let filterEstados: number[] = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
    if (options.estados) {
      filterEstados = Array.isArray(options.estados)
        ? options.estados.map(Number)
        : String(options.estados).split(",").map(Number);
    } else if (options.estado !== undefined) {
      filterEstados = String(options.estado).split(",").map(Number);
    }

    // 4. Construir cláusula Where
    const where: Prisma.sunat_tipo_cambioWhereInput = {
      estado: {
        in: filterEstados,
      },
    };

    // Rango de fechas
    if (options.fechaInicio || options.fechaFin) {
      where.fecha = {};
      if (options.fechaInicio) {
        where.fecha.gte = new Date(options.fechaInicio);
      }
      if (options.fechaFin) {
        const finDate = new Date(options.fechaFin);
        if (typeof options.fechaFin === "string" && options.fechaFin.length === 10) {
          finDate.setUTCHours(23, 59, 59, 999);
        }
        where.fecha.lte = finDate;
      }
    }

    // Filtro por moneda específica
    if (options.monedaCodigo) {
      const cod = options.monedaCodigo.toUpperCase();
      where.OR = [
        { moneda_base: { codigo: cod } },
        { moneda_cotizada: { codigo: cod } },
      ];
    }

    // Búsqueda global por texto
    if (options.search && options.search.trim()) {
      const term = options.search.trim();
      const searchConditions: Prisma.sunat_tipo_cambioWhereInput[] = [
        { code: { contains: term } },
        { moneda_base: { codigo: { contains: term } } },
        { moneda_base: { nombre: { contains: term } } },
        { moneda_cotizada: { codigo: { contains: term } } },
        { moneda_cotizada: { nombre: { contains: term } } },
      ];

      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    // 5. Ejecución concurrente de conteo y consulta
    const [total, items] = await Promise.all([
      tx.sunat_tipo_cambio.count({ where }),
      tx.sunat_tipo_cambio.findMany({
        where,
        include: {
          moneda_base: true,
          moneda_cotizada: true,
        },
        orderBy: {
          [sortField]: sortDirection,
        },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      pageIndex: page - 1,
      pageSize: limit,
      pageCount: totalPages,
    };
  } catch (error) {
    log.error(line(), "Error al obtener tipos de cambio SUNAT paginados", error);
    throw new ClientError("Ocurrió un error al obtener la lista paginada de tipos de cambio SUNAT", 500);
  }
};
