import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as archivofacturaDao from "#root/src/daos/archivofactura.Dao.js";
import { ARCHIVO_TIPO } from "#root/src/daos/archivotipo.Dao.js";
import * as detraccionestadoDao from "#root/src/daos/detraccionestado.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringfacturafactorDao from "#root/src/daos/factoringfacturafactor.Dao.js";
import * as facturaDao from "#root/src/daos/factura.Dao.js";
import * as facturaestadoDao from "#root/src/daos/facturaestado.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { isProduction } from "#src/config.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface OperacionFactoringfacturafactorDto {
  factoringfacturafactorid: string;
  idusuario: number;
}

export interface UpdateFactoringfacturafactorDto {
  factoringfacturafactorid: string;
  facturaestadoid: string;
  detraccionestadoid: string;
  detraccionarchivoid?: string;
  fecha_pago_factura?: string | null;
  fecha_pago_detraccion?: string | null;
  idusuario: number;
}

export interface CreateFactoringfacturafactorDto {
  factoringid: string;
  facturaid: string;
  facturaestadoid: string;
  detraccionestadoid: string;
  detraccionarchivoid?: string;
  fecha_pago_factura?: string | null;
  fecha_pago_detraccion?: string | null;
  idusuario: number;
}

export interface GetFactoringfacturafactoresByFactoringidDto {
  factoringid: string;
}

export interface GetFactoringfacturafactorMasterByFactoringidDto {
  factoringid: string;
}

// ─── Private Helpers ─────────────────────────────────────────────────────────

const vincularFacturaDetraccion = async (
  tx: any,
  idarchivo: number,
  idfactura: number,
  idusuario: number,
) => {
  const archivofacturaToCreate: Prisma.archivo_facturaCreateInput = {
    archivo: { connect: { idarchivo: idarchivo } },
    factura: { connect: { idfactura: idfactura } },
    idusuariocrea: idusuario,
    fechacrea: new Date(),
    idusuariomod: idusuario,
    fechamod: new Date(),
    estado: 1,
  };

  const archivofacturaCreated = await archivofacturaDao.insertArchivoFactura(tx, archivofacturaToCreate);
  return archivofacturaCreated;
};

// ─── Services ────────────────────────────────────────────────────────────────

/**
 * Activa lógicamente una asignación de factura de factor en módulo admin.
 */
export const activateFactoringfacturafactorService = async (dto: OperacionFactoringfacturafactorDto) => {
  log.debug(line(), "service::admin::activateFactoringfacturafactorService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const existed = await factoringfacturafactorDao.getFactoringfacturafactorByFactoringfacturafactorid(
        tx,
        dto.factoringfacturafactorid,
      );
      if (!existed) {
        log.warn(line(), `Factoringfacturafactor no existe: [${dto.factoringfacturafactorid}]`);
        throw new ClientError("Factoringfacturafactor no existe", 404);
      }
      return await factoringfacturafactorDao.activateFactoringfacturafactor(
        tx,
        dto.factoringfacturafactorid,
        dto.idusuario,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina lógicamente una asignación de factura de factor en módulo admin.
 */
export const deleteFactoringfacturafactorService = async (dto: OperacionFactoringfacturafactorDto) => {
  log.debug(line(), "service::admin::deleteFactoringfacturafactorService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const existed = await factoringfacturafactorDao.getFactoringfacturafactorByFactoringfacturafactorid(
        tx,
        dto.factoringfacturafactorid,
      );
      if (!existed) {
        log.warn(line(), `Factoringfacturafactor no existe: [${dto.factoringfacturafactorid}]`);
        throw new ClientError("Factoringfacturafactor no existe", 404);
      }
      return await factoringfacturafactorDao.deleteFactoringfacturafactor(
        tx,
        dto.factoringfacturafactorid,
        dto.idusuario,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Actualiza los estados y fechas de pago de la factura de factor en módulo admin.
 */
export const updateFactoringfacturafactorService = async (dto: UpdateFactoringfacturafactorDto) => {
  log.debug(line(), "service::admin::updateFactoringfacturafactorService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringfacturafactor = await factoringfacturafactorDao.getFactoringfacturafactorByFactoringfacturafactorid(
        tx,
        dto.factoringfacturafactorid,
      );
      if (!factoringfacturafactor) {
        log.warn(line(), `Factoringfacturafactor no existe: [${dto.factoringfacturafactorid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factura_estado = await facturaestadoDao.getFacturaestadoByFacturaestadoid(tx, dto.facturaestadoid);
      if (!factura_estado) {
        log.warn(line(), `Factura estado no existe: [${dto.facturaestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const detraccion_estado = await detraccionestadoDao.getDetraccionestadoByDetraccionestadoid(
        tx,
        dto.detraccionestadoid,
      );
      if (!detraccion_estado) {
        log.warn(line(), `Detraccion estado no existe: [${dto.detraccionestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      if (dto.detraccionarchivoid) {
        const filter_estado_archivo = isProduction ? [ESTADO.ACTIVO] : [ESTADO.ACTIVO, ESTADO.ELIMINADO];
        const detraccionarchivo = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(
          prismaFT.client,
          dto.detraccionarchivoid,
          ARCHIVO_TIPO.CONSTANCIA_PAGO_DETRACCION,
          filter_estado_archivo,
        );
        if (!detraccionarchivo) {
          log.warn(line(), `Factura Detraccion no existe o tipo no coincide: [${dto.detraccionarchivoid}]`);
          throw new ClientError("Datos no válidos", 404);
        }

        const facturaDetraccionCreated = await vincularFacturaDetraccion(
          tx,
          detraccionarchivo.idarchivo,
          factoringfacturafactor.idfactura,
          dto.idusuario,
        );
        log.debug(line(), "facturaDetraccionCreated:", facturaDetraccionCreated);
      }

      const factoringfacturafactorToUpdate: Prisma.factoring_factura_factorUpdateInput = {
        factura_estado: { connect: { idfacturaestado: factura_estado.idfacturaestado } },
        detraccion_estado: { connect: { iddetraccionestado: detraccion_estado.iddetraccionestado } },
        fecha_pago_factura: dto.fecha_pago_factura ? new Date(dto.fecha_pago_factura) : null,
        fecha_pago_detraccion: dto.fecha_pago_detraccion ? new Date(dto.fecha_pago_detraccion) : null,
        idusuariomod: dto.idusuario,
        fechamod: new Date(),
      };

      const result = await factoringfacturafactorDao.updateFactoringfacturafactor(
        tx,
        dto.factoringfacturafactorid,
        factoringfacturafactorToUpdate,
      );
      log.debug(line(), "updated:", result);

      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Crea una asignación de factura del factor a una operación de factoring.
 */
export const createFactoringfacturafactorService = async (dto: CreateFactoringfacturafactorDto) => {
  log.debug(line(), "service::admin::createFactoringfacturafactorService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factura = await facturaDao.getFacturaByFacturaid(tx, dto.facturaid);
      if (!factura) {
        log.warn(line(), `Factura no existe: [${dto.facturaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factura_estado = await facturaestadoDao.getFacturaestadoByFacturaestadoid(tx, dto.facturaestadoid);
      if (!factura_estado) {
        log.warn(line(), `Factura estado no existe: [${dto.facturaestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const detraccion_estado = await detraccionestadoDao.getDetraccionestadoByDetraccionestadoid(
        tx,
        dto.detraccionestadoid,
      );
      if (!detraccion_estado) {
        log.warn(line(), `Detraccion estado no existe: [${dto.detraccionestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      if (dto.detraccionarchivoid) {
        const filter_estado_archivo = isProduction ? [ESTADO.ACTIVO] : [ESTADO.ACTIVO, ESTADO.ELIMINADO];
        const detraccionarchivo = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(
          prismaFT.client,
          dto.detraccionarchivoid,
          ARCHIVO_TIPO.CONSTANCIA_PAGO_DETRACCION,
          filter_estado_archivo,
        );
        if (!detraccionarchivo) {
          log.warn(line(), `Factura Detraccion no existe o tipo no coincide: [${dto.detraccionarchivoid}]`);
          throw new ClientError("Datos no válidos", 404);
        }

        const facturaDetraccionCreated = await vincularFacturaDetraccion(
          tx,
          detraccionarchivo.idarchivo,
          factura.idfactura,
          dto.idusuario,
        );
        log.debug(line(), "facturaDetraccionCreated:", facturaDetraccionCreated);
      }

      const factoringfacturafactorToCreate: Prisma.factoring_factura_factorCreateInput = {
        factoring: { connect: { idfactoring: factoring.idfactoring } },
        factura: { connect: { idfactura: factura.idfactura } },
        factura_estado: { connect: { idfacturaestado: factura_estado.idfacturaestado } },
        detraccion_estado: { connect: { iddetraccionestado: detraccion_estado.iddetraccionestado } },

        factoringfacturafactorid: uuidv4(),
        code: uuidv4().split("-")[0],

        fecha_pago_factura: dto.fecha_pago_factura ? new Date(dto.fecha_pago_factura) : null,
        fecha_pago_detraccion: dto.fecha_pago_detraccion ? new Date(dto.fecha_pago_detraccion) : null,

        idusuariocrea: dto.idusuario,
        fechacrea: new Date(),
        idusuariomod: dto.idusuario,
        fechamod: new Date(),
        estado: 1,
      };

      const result = await factoringfacturafactorDao.insertFactoringfacturafactor(tx, factoringfacturafactorToCreate);
      log.debug(line(), "created:", result);

      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta las facturas de factores vinculadas a un factoring en módulo admin.
 */
export const getFactoringfacturafactoresByFactoringidService = async (
  dto: GetFactoringfacturafactoresByFactoringidDto,
) => {
  log.debug(line(), "service::admin::getFactoringfacturafactoresByFactoringidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      return await factoringfacturafactorDao.getFactoringfacturafactorsByIdfactoring(
        tx,
        factoring.idfactoring,
        filter_estado,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta catálogos maestros de asignación de facturas de factores en módulo admin.
 */
export const getFactoringfacturafactorMasterByFactoringidService = async (
  dto: GetFactoringfacturafactorMasterByFactoringidDto,
) => {
  log.debug(line(), "service::admin::getFactoringfacturafactorMasterByFactoringidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const facturaestados = await facturaestadoDao.getFacturaestados(tx, filter_estados);
      const detraccionestados = await detraccionestadoDao.getDetraccionestados(tx, filter_estados);

      return {
        facturaestados,
        detraccionestados,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
