import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as sunattipocambioDao from "#src/daos/sunattipocambio.Dao.js";
import * as monedaDao from "#src/daos/moneda.Dao.js";
import * as configuracionappDao from "#src/daos/configuracionapp.Dao.js";
import * as tipocambioLogic from "#src/services/tipocambio.Service.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as df from "#src/utils/dateUtils.js";
import { v4 as uuidv4 } from "uuid";

export interface CreateSunatTipoCambioDto {
  fecha: string;
  precio_compra: number;
  precio_venta: number;
  monedabaseid?: string;
  monedacotizadaid?: string;
  codigomonedabase?: string;
  codigomonedacotizada?: string;
}

export interface UpdateSunatTipoCambioDto {
  sunattipocambioid: string;
  precio_compra?: number;
  precio_venta?: number;
  fecha?: string;
}

export const getSunatTipoCambioHoyService = async () => {
  log.debug(line(), "service::getSunatTipoCambioHoyService");
  const fecha = df.formatDateToYMD(df.getNowLima());
  return await tipocambioLogic.obtenerSunatLogic(fecha);
};

export const getSunatTipoCambioPorFechaService = async (fecha: string, serviciotipocambioid?: string) => {
  log.debug(line(), "service::getSunatTipoCambioPorFechaService");
  return await tipocambioLogic.obtenerSunatLogic(fecha, serviciotipocambioid);
};

export const getSunatTipoCambioExactoPorFechaService = async (fecha: string) => {
  log.debug(line(), "service::getSunatTipoCambioExactoPorFechaService");
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha.trim())) {
    throw new ClientError("Formato de fecha inválido. Formato requerido: YYYY-MM-DD", 400);
  }

  const fechaParsed = df.parseDateUtcMidnight(fecha);

  return await prismaFT.client.$transaction(
    async (tx) => {
      const { monedaBase, monedaCotizada } = await tipocambioLogic.resolverMonedas(tx, "USD", "PEN");
      const filter_estado = [ESTADO.ACTIVO];

      const registro = await sunattipocambioDao.getSunatTipoCambioByFecha(
        tx,
        fechaParsed,
        monedaBase.idmoneda,
        monedaCotizada.idmoneda,
        filter_estado,
      );

      if (!registro) {
        throw new ClientError("No existe tipo de cambio SUNAT registrado para la fecha seleccionada", 422);
      }

      return jsonUtils.removeAttributesPrivates(registro);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getSunatTipoCambioHistorialService = async (fechaInicio?: string, fechaFin?: string) => {
  log.debug(line(), "service::getSunatTipoCambioHistorialService");
  return await tipocambioLogic.obtenerHistorialSunatLogic(fechaInicio, fechaFin);
};

export const sincronizarSunatTipoCambioService = async (
  fecha?: string,
  mes?: number,
  anio?: number,
  serviciotipocambioid?: string,
) => {
  log.debug(line(), "service::sincronizarSunatTipoCambioService");
  if (mes && anio) {
    return await tipocambioLogic.sincronizarSunatMesLogic(Number(mes), Number(anio), serviciotipocambioid);
  }

  const fechaSync = fecha || df.formatDateToYMD(df.getNowLima());
  return await tipocambioLogic.sincronizarSunatLogic(fechaSync, serviciotipocambioid);
};

export const sincronizarSunatMesTipoCambioService = async (
  mes: number,
  anio: number,
  serviciotipocambioid?: string,
) => {
  log.debug(line(), "service::sincronizarSunatMesTipoCambioService");
  return await tipocambioLogic.sincronizarSunatMesLogic(mes, anio, serviciotipocambioid);
};

export const getSunatTipoCambiosListOrPaginatedService = async (params: any) => {
  log.debug(line(), "service::getSunatTipoCambiosListOrPaginatedService");
  const hasPaginationParams =
    params.page !== undefined ||
    params.pageIndex !== undefined ||
    params.limit !== undefined ||
    params.pageSize !== undefined ||
    params.offset !== undefined ||
    params.skip !== undefined;

  if (hasPaginationParams) {
    return await tipocambioLogic.obtenerSunatPaginadoLogic(params);
  }

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const registros = await sunattipocambioDao.getSunatTipoCambios(tx, filter_estado);
      return registros;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getSunatTipoCambiosPaginadoService = async (options: any) => {
  log.debug(line(), "service::getSunatTipoCambiosPaginadoService");
  return await tipocambioLogic.obtenerSunatPaginadoLogic(options);
};

export const createSunatTipoCambioService = async (
  idUsuario: number,
  payload: CreateSunatTipoCambioDto,
) => {
  log.debug(line(), "service::createSunatTipoCambioService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const fechaRegistro = tipocambioLogic.parseFechaLima(payload.fecha);

      // Resolver moneda base
      const monedaBase = payload.monedabaseid
        ? await monedaDao.getMonedaByMonedaid(tx, payload.monedabaseid)
        : await monedaDao.getMonedaByCodigo(tx, payload.codigomonedabase || "USD");

      if (!monedaBase) {
        throw new ClientError("Moneda base no encontrada", 404);
      }

      // Resolver moneda cotizada
      const monedaCotizada = payload.monedacotizadaid
        ? await monedaDao.getMonedaByMonedaid(tx, payload.monedacotizadaid)
        : await monedaDao.getMonedaByCodigo(tx, payload.codigomonedacotizada || "PEN");

      if (!monedaCotizada) {
        throw new ClientError("Moneda cotizada no encontrada", 404);
      }

      // Verificar si ya existe para ese par y fecha
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const existente = await sunattipocambioDao.getSunatTipoCambioByFecha(
        tx,
        fechaRegistro,
        monedaBase.idmoneda,
        monedaCotizada.idmoneda,
        filter_estado,
      );

      if (existente) {
        throw new ClientError("Ya existe un tipo de cambio SUNAT registrado para esta fecha y par de monedas", 400);
      }

      const sunatToCreate: Prisma.sunat_tipo_cambioUncheckedCreateInput = {
        sunattipocambioid: uuidv4(),
        code: tipocambioLogic.generateCode(),
        idmonedabase: monedaBase.idmoneda,
        idmonedacotizada: monedaCotizada.idmoneda,
        fecha: fechaRegistro,
        precio_compra: new Prisma.Decimal(payload.precio_compra),
        precio_venta: new Prisma.Decimal(payload.precio_venta),
        idusuariocrea: idUsuario,
        fechacrea: new Date(),
        idusuariomod: idUsuario,
        fechamod: new Date(),
        estado: ESTADO.ACTIVO,
      };

      const result = await sunattipocambioDao.insertSunatTipoCambio(tx, sunatToCreate);
      return jsonUtils.removeAttributesPrivates(result);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const updateSunatTipoCambioService = async (
  idUsuario: number,
  payload: UpdateSunatTipoCambioDto,
) => {
  log.debug(line(), "service::updateSunatTipoCambioService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const registro = await sunattipocambioDao.getSunatTipoCambioBySunattipocambioid(
        tx,
        payload.sunattipocambioid,
      );

      if (!registro) {
        log.warn(line(), `Tipo de cambio SUNAT no existe: [${payload.sunattipocambioid}]`);
        throw new ClientError("Tipo de cambio SUNAT no encontrado", 404);
      }

      const dataToUpdate: Prisma.sunat_tipo_cambioUpdateInput = {
        idusuariomod: idUsuario,
        fechamod: new Date(),
      };

      if (payload.precio_compra !== undefined) {
        dataToUpdate.precio_compra = new Prisma.Decimal(payload.precio_compra);
      }
      if (payload.precio_venta !== undefined) {
        dataToUpdate.precio_venta = new Prisma.Decimal(payload.precio_venta);
      }
      if (payload.fecha) {
        const nuevaFecha = tipocambioLogic.parseFechaLima(payload.fecha);
        const existente = await sunattipocambioDao.getSunatTipoCambioByFecha(
          tx,
          nuevaFecha,
          registro.idmonedabase,
          registro.idmonedacotizada,
          [ESTADO.ACTIVO, ESTADO.ELIMINADO],
        );
        if (existente && existente.sunattipocambioid !== payload.sunattipocambioid) {
          throw new ClientError("Ya existe otro tipo de cambio SUNAT registrado para esta fecha y par de monedas", 400);
        }
        dataToUpdate.fecha = nuevaFecha;
      }

      await sunattipocambioDao.updateSunatTipoCambio(tx, payload.sunattipocambioid, dataToUpdate);
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deleteSunatTipoCambioService = async (idUsuario: number, sunattipocambioid: string) => {
  log.debug(line(), "service::deleteSunatTipoCambioService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const registro = await sunattipocambioDao.getSunatTipoCambioBySunattipocambioid(tx, sunattipocambioid);
      if (!registro) {
        log.warn(line(), `Tipo de cambio SUNAT no existe: [${sunattipocambioid}]`);
        throw new ClientError("Tipo de cambio SUNAT no encontrado", 404);
      }

      const resDelete = await sunattipocambioDao.deleteSunatTipoCambio(tx, sunattipocambioid, idUsuario);
      return resDelete;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const activateSunatTipoCambioService = async (idUsuario: number, sunattipocambioid: string) => {
  log.debug(line(), "service::activateSunatTipoCambioService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const registro = await sunattipocambioDao.getSunatTipoCambioBySunattipocambioid(tx, sunattipocambioid);
      if (!registro) {
        log.warn(line(), `Tipo de cambio SUNAT no existe: [${sunattipocambioid}]`);
        throw new ClientError("Tipo de cambio SUNAT no encontrado", 404);
      }

      const resActivate = await sunattipocambioDao.activateSunatTipoCambio(tx, sunattipocambioid, idUsuario);
      return resActivate;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getSunatTipoCambioMasterService = async () => {
  log.debug(line(), "service::getSunatTipoCambioMasterService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const [monedas, servicios_tipo_cambio] = await Promise.all([
        monedaDao.getMonedas(tx, filter_estados),
        configuracionappDao.getServiciosTipoDeCambioParsed(tx),
      ]);

      const sunatMaster: Record<string, any> = {
        monedas,
        servicios_tipo_cambio,
      };

      return sunatMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
