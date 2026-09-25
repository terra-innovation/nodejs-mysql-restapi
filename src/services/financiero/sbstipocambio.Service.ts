import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as sbstipocambioDao from "#src/daos/sbstipocambio.Dao.js";
import * as monedaDao from "#src/daos/moneda.Dao.js";
import * as configuracionappDao from "#src/daos/configuracionapp.Dao.js";
import * as tipocambioLogic from "#src/services/tipocambio.Service.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as df from "#src/utils/dateUtils.js";
import { v4 as uuidv4 } from "uuid";

export interface CreateSbsTipoCambioDto {
  fecha: string;
  precio_compra: number;
  precio_venta: number;
  precio_contable?: number;
  monedabaseid?: string;
  monedacotizadaid?: string;
  codigomonedabase?: string;
  codigomonedacotizada?: string;
}

export interface UpdateSbsTipoCambioDto {
  sbstipocambioid: string;
  precio_compra?: number;
  precio_venta?: number;
  precio_contable?: number;
  fecha?: string;
}

export const getSbsTipoCambioHoyService = async (moneda: string = "USD") => {
  log.debug(line(), "service::getSbsTipoCambioHoyService");
  const fecha = df.formatDateToYMD(df.getNowLima());
  return await tipocambioLogic.obtenerSbsLogic(moneda, fecha);
};

export const getSbsTipoCambioPorFechaService = async (
  moneda: string = "USD",
  fecha: string,
  serviciotipocambioid?: string,
) => {
  log.debug(line(), "service::getSbsTipoCambioPorFechaService");
  return await tipocambioLogic.obtenerSbsLogic(moneda, fecha, serviciotipocambioid);
};

export const getSbsTipoCambioHistorialService = async (
  moneda: string = "USD",
  fechaInicio?: string,
  fechaFin?: string,
) => {
  log.debug(line(), "service::getSbsTipoCambioHistorialService");
  return await tipocambioLogic.obtenerHistorialSbsLogic(moneda, fechaInicio, fechaFin);
};

export const sincronizarSbsTipoCambioService = async (
  moneda: string = "USD",
  fecha?: string,
  mes?: number,
  anio?: number,
  serviciotipocambioid?: string,
) => {
  log.debug(line(), "service::sincronizarSbsTipoCambioService");
  if (mes && anio) {
    return await tipocambioLogic.sincronizarSbsMesLogic(moneda, Number(mes), Number(anio), serviciotipocambioid);
  }

  const fechaSync = fecha || df.formatDateToYMD(df.getNowLima());
  return await tipocambioLogic.sincronizarSbsLogic(moneda, fechaSync, serviciotipocambioid);
};

export const sincronizarSbsMesTipoCambioService = async (
  moneda: string = "USD",
  mes: number,
  anio: number,
  serviciotipocambioid?: string,
) => {
  log.debug(line(), "service::sincronizarSbsMesTipoCambioService");
  return await tipocambioLogic.sincronizarSbsMesLogic(moneda, mes, anio, serviciotipocambioid);
};

export const getSbsTipoCambiosListOrPaginatedService = async (params: any) => {
  log.debug(line(), "service::getSbsTipoCambiosListOrPaginatedService");
  const hasPaginationParams =
    params.page !== undefined ||
    params.pageIndex !== undefined ||
    params.limit !== undefined ||
    params.pageSize !== undefined ||
    params.offset !== undefined ||
    params.skip !== undefined;

  if (hasPaginationParams) {
    return await tipocambioLogic.obtenerSbsPaginadoLogic(params);
  }

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const registros = await sbstipocambioDao.getSbsTipoCambios(tx, filter_estado);
      return registros;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getSbsTipoCambiosPaginadoService = async (options: any) => {
  log.debug(line(), "service::getSbsTipoCambiosPaginadoService");
  return await tipocambioLogic.obtenerSbsPaginadoLogic(options);
};

export const createSbsTipoCambioService = async (
  idUsuario: number,
  payload: CreateSbsTipoCambioDto,
) => {
  log.debug(line(), "service::createSbsTipoCambioService");
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
      const existente = await sbstipocambioDao.getSbsTipoCambioByFecha(
        tx,
        fechaRegistro,
        monedaBase.idmoneda,
        monedaCotizada.idmoneda,
        filter_estado,
      );

      if (existente) {
        throw new ClientError("Ya existe un tipo de cambio SBS registrado para esta fecha y par de monedas", 400);
      }

      const precioContable =
        payload.precio_contable !== undefined
          ? new Prisma.Decimal(payload.precio_contable)
          : new Prisma.Decimal(payload.precio_venta);

      const sbsToCreate: Prisma.sbs_tipo_cambioUncheckedCreateInput = {
        sbstipocambioid: uuidv4(),
        code: tipocambioLogic.generateCode(),
        idmonedabase: monedaBase.idmoneda,
        idmonedacotizada: monedaCotizada.idmoneda,
        fecha: fechaRegistro,
        precio_compra: new Prisma.Decimal(payload.precio_compra),
        precio_venta: new Prisma.Decimal(payload.precio_venta),
        precio_contable: precioContable,
        idusuariocrea: idUsuario,
        fechacrea: new Date(),
        idusuariomod: idUsuario,
        fechamod: new Date(),
        estado: ESTADO.ACTIVO,
      };

      const result = await sbstipocambioDao.insertSbsTipoCambio(tx, sbsToCreate);
      return jsonUtils.removeAttributesPrivates(result);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const updateSbsTipoCambioService = async (
  idUsuario: number,
  payload: UpdateSbsTipoCambioDto,
) => {
  log.debug(line(), "service::updateSbsTipoCambioService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const registro = await sbstipocambioDao.getSbsTipoCambioBySbstipocambioid(
        tx,
        payload.sbstipocambioid,
      );

      if (!registro) {
        log.warn(line(), `Tipo de cambio SBS no existe: [${payload.sbstipocambioid}]`);
        throw new ClientError("Tipo de cambio SBS no encontrado", 404);
      }

      const dataToUpdate: Prisma.sbs_tipo_cambioUpdateInput = {
        idusuariomod: idUsuario,
        fechamod: new Date(),
      };

      if (payload.precio_compra !== undefined) {
        dataToUpdate.precio_compra = new Prisma.Decimal(payload.precio_compra);
      }
      if (payload.precio_venta !== undefined) {
        dataToUpdate.precio_venta = new Prisma.Decimal(payload.precio_venta);
      }
      if (payload.precio_contable !== undefined) {
        dataToUpdate.precio_contable = new Prisma.Decimal(payload.precio_contable);
      }
      if (payload.fecha) {
        const nuevaFecha = tipocambioLogic.parseFechaLima(payload.fecha);
        const existente = await sbstipocambioDao.getSbsTipoCambioByFecha(
          tx,
          nuevaFecha,
          registro.idmonedabase,
          registro.idmonedacotizada,
          [ESTADO.ACTIVO, ESTADO.ELIMINADO],
        );
        if (existente && existente.sbstipocambioid !== payload.sbstipocambioid) {
          throw new ClientError("Ya existe otro tipo de cambio SBS registrado para esta fecha y par de monedas", 400);
        }
        dataToUpdate.fecha = nuevaFecha;
      }

      await sbstipocambioDao.updateSbsTipoCambio(tx, payload.sbstipocambioid, dataToUpdate);
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deleteSbsTipoCambioService = async (idUsuario: number, sbstipocambioid: string) => {
  log.debug(line(), "service::deleteSbsTipoCambioService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const registro = await sbstipocambioDao.getSbsTipoCambioBySbstipocambioid(tx, sbstipocambioid);
      if (!registro) {
        log.warn(line(), `Tipo de cambio SBS no existe: [${sbstipocambioid}]`);
        throw new ClientError("Tipo de cambio SBS no encontrado", 404);
      }

      const resDelete = await sbstipocambioDao.deleteSbsTipoCambio(tx, sbstipocambioid, idUsuario);
      return resDelete;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const activateSbsTipoCambioService = async (idUsuario: number, sbstipocambioid: string) => {
  log.debug(line(), "service::activateSbsTipoCambioService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const registro = await sbstipocambioDao.getSbsTipoCambioBySbstipocambioid(tx, sbstipocambioid);
      if (!registro) {
        log.warn(line(), `Tipo de cambio SBS no existe: [${sbstipocambioid}]`);
        throw new ClientError("Tipo de cambio SBS no encontrado", 404);
      }

      const resActivate = await sbstipocambioDao.activateSbsTipoCambio(tx, sbstipocambioid, idUsuario);
      return resActivate;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getSbsTipoCambioMasterService = async () => {
  log.debug(line(), "service::getSbsTipoCambioMasterService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const [monedas, servicios_tipo_cambio] = await Promise.all([
        monedaDao.getMonedas(tx, filter_estados),
        configuracionappDao.getServiciosTipoDeCambioParsed(tx),
      ]);

      const sbsMaster: Record<string, any> = {
        monedas,
        servicios_tipo_cambio,
      };

      return sbsMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
