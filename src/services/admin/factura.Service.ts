import type { factura, Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { ARCHIVO_TIPO } from "#root/src/daos/archivotipo.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { isProduction } from "#src/config.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as facturaUtils from "#src/utils/facturaUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import path from "path";

import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as archivofacturaDao from "#root/src/daos/archivofactura.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as facturaDao from "#root/src/daos/factura.Dao.js";
import * as facturaimpuestoDao from "#root/src/daos/facturaimpuesto.Dao.js";
import * as facturaitemDao from "#root/src/daos/facturaitem.Dao.js";
import * as facturamediopagoDao from "#root/src/daos/facturamediopago.Dao.js";
import * as facturanotaDao from "#root/src/daos/facturanota.Dao.js";
import * as facturaterminopagoDao from "#root/src/daos/facturaterminopago.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import * as riesgoDao from "#root/src/daos/riesgo.Dao.js";

export interface SubirFacturaFactorDto {
  factura_xml: string;
  factura_pdf: string;
}

const procesarDatos = async (tx: any, items: any[], insertFunction: (tx: any, item: any) => Promise<any>) => {
  const results = [];
  for (const item of items) {
    const result = await insertFunction(tx, item);
    results.push(result);
  }
  return results;
};

const vincularFacturaArchivo = async (tx: any, archivo: any, facturaCreated: any, idusuario: number) => {
  const archivofacturaToCreate: Prisma.archivo_facturaCreateInput = {
    archivo: { connect: { idarchivo: archivo.idarchivo } },
    factura: { connect: { idfactura: facturaCreated.idfactura } },
    idusuariocrea: idusuario,
    fechacrea: new Date(),
    idusuariomod: idusuario,
    fechamod: new Date(),
    estado: 1,
  };

  await archivofacturaDao.insertArchivoFactura(tx, archivofacturaToCreate);
  return archivo;
};

/**
 * Procesa y registra una factura en el sistema a partir de sus identificadores XML y PDF.
 */
export const subirFacturaFactorService = async (dto: SubirFacturaFactorDto, idusuario: number) => {
  log.debug(line(), "service::subirFacturaFactorService");

  const filter_estado_archivo = isProduction ? [ESTADO.ACTIVO] : [ESTADO.ACTIVO, ESTADO.ELIMINADO];

  const archivo_xml = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(
    prismaFT.client,
    dto.factura_xml,
    ARCHIVO_TIPO.FACTURA_XML,
    filter_estado_archivo,
  );
  if (!archivo_xml) {
    log.warn(line(), `Factura XML no existe o tipo no coincide: [${dto.factura_xml}]`);
    throw new ClientError("Datos no válidos", 404);
  }

  const archivo_pdf = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(
    prismaFT.client,
    dto.factura_pdf,
    ARCHIVO_TIPO.FACTURA_PDF,
    filter_estado_archivo,
  );
  if (!archivo_pdf) {
    log.warn(line(), `Factura PDF no existe o tipo no coincide: [${dto.factura_pdf}]`);
    throw new ClientError("Datos no válidos", 404);
  }

  const path_xml = path.join(storageUtils.STORAGE_PATH_SUCCESS, archivo_xml.ruta, archivo_xml.nombrealmacenamiento);
  const file_xml = { ...archivo_xml, path: path_xml };

  const facturaJson = await facturaUtils.procesarFacturaXML(file_xml);
  if (!facturaJson) {
    log.warn(line(), "El archivo XML carece de una estructura válida");
    throw new ClientError("El archivo XML carece de una estructura válida", 404);
  }

  const codigo_tipo_documento = facturaUtils.getInvoiceTypeCode(facturaJson);
  if (codigo_tipo_documento !== "01") {
    log.warn(line(), "El archivo XML no corresponde a una factura válida");
    throw new ClientError("El archivo XML no corresponde a una factura válida");
  }

  const facturaFinal = facturaUtils.buildFacturaJson(facturaJson, archivo_xml.codigo, idusuario);
  const facturaToCreate = facturaUtils.getFacturaToCreate(facturaFinal, idusuario);

  await prismaFT.client.$transaction(
    async (tx) => {
      const facturaCreated = await facturaDao.insertFactura(tx, facturaToCreate);

      const itemsToCreate = facturaUtils.getItemsToCreate(facturaFinal, facturaCreated.idfactura, idusuario);
      const mediosdepagoToCreate = facturaUtils.getMediosdepagoToCreate(facturaFinal, facturaCreated.idfactura, idusuario);
      const terminosdepagoToCreate = facturaUtils.getTerminosdepagoToCreate(facturaFinal, facturaCreated.idfactura, idusuario);
      const impuestosToCreate = facturaUtils.getImpuestosToCreate(facturaFinal, facturaCreated.idfactura, idusuario);
      const notasToCreate = facturaUtils.getNotasToCreate(facturaFinal, facturaCreated.idfactura, idusuario);

      await procesarDatos(tx, itemsToCreate, facturaitemDao.insertFacturaitem);
      await procesarDatos(tx, mediosdepagoToCreate, facturamediopagoDao.insertFacturamediopago);
      await procesarDatos(tx, terminosdepagoToCreate, facturaterminopagoDao.insertFacturaterminopago);
      await procesarDatos(tx, impuestosToCreate, facturaimpuestoDao.insertFacturaimpuesto);
      await procesarDatos(tx, notasToCreate, facturanotaDao.insertFacturanota);

      await vincularFacturaArchivo(tx, archivo_xml, facturaCreated, idusuario);
      await vincularFacturaArchivo(tx, archivo_pdf, facturaCreated, idusuario);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );

  const facturaFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const moneda = await monedaDao.getMonedaByCodigo(tx, facturaToCreate.codigo_tipo_moneda);
      facturaFinal.monedaid = moneda.monedaid;
      facturaFinal.moneda_alias = moneda.alias;
      facturaFinal.moneda_simbolo = moneda.simbolo;

      return facturaFinal;
    },
    { timeout: prismaFT.transactionTimeout },
  );

  return facturaFiltered;
};

/**
 * Consulta facturas asociadas a un factoring.
 */
export const getFacturasByFactoringidService = async (factoringid: string) => {
  log.debug(line(), "service::getFacturasByFactoringidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      return await facturaDao.getFacturasByIdfactoring(tx, factoring.idfactoring, filter_estado);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Activa una factura lógicamente.
 */
export const activateFacturaService = async (facturaid: string, idusuario: number) => {
  log.debug(line(), "service::activateFacturaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const facturaActivated = await facturaDao.activateFactura(tx, facturaid, idusuario);
      if (facturaActivated[0] === 0) {
        throw new ClientError("Factura no existe", 404);
      }
      log.debug(line(), "facturaActivated:", facturaActivated);
      return facturaActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina lógicamente una factura.
 */
export const deleteFacturaService = async (facturaid: string, idusuario: number) => {
  log.debug(line(), "service::deleteFacturaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const facturaDeleted = await facturaDao.deleteFactura(tx, facturaid, idusuario);
      if (facturaDeleted[0] === 0) {
        throw new ClientError("Factura no existe", 404);
      }
      log.debug(line(), "facturaDeleted:", facturaDeleted);
      return facturaDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta de maestros de facturación.
 */
export const getFacturaMasterService = async () => {
  log.debug(line(), "service::getFacturaMasterService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);
      return {
        riesgos,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta el listado general de facturas.
 */
export const getFacturasService = async () => {
  log.debug(line(), "service::getFacturasService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      return await facturaDao.getFacturas(tx, filter_estado);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
