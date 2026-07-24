import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as facturaDao from "#src/daos/factura.prisma.Dao.js";
import * as riesgoDao from "#src/daos/riesgo.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";

import type { factura } from "#root/generated/prisma/ft_factoring/client.js";

import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { isProduction } from "#src/config.js";
import path from "path";
import * as yup from "yup";

import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as facturaimpuestoDao from "#src/daos/facturaimpuesto.prisma.Dao.js";
import * as facturaitemDao from "#src/daos/facturaitem.prisma.Dao.js";
import * as facturamediopagoDao from "#src/daos/facturamediopago.prisma.Dao.js";
import * as facturanotaDao from "#src/daos/facturanota.prisma.Dao.js";
import * as facturaterminopagoDao from "#src/daos/facturaterminopago.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";

import { ARCHIVO_TIPO } from "#src/daos/archivotipo.prisma.Dao.js";

import * as facturaUtils from "#src/utils/facturaUtils.js";
import * as storageUtils from "#src/utils/storageUtils.js";

import * as archivofacturaDao from "#src/daos/archivofactura.prisma.Dao.js";

export const subirFacturaFactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::subirFacturaFactor");

  const session_idusuario = req.session_user?.usuario?.idusuario;
  const filter_estado = [ESTADO.ACTIVO];

  const facturaVerifySchema = yup
    .object()
    .shape({
      factura_xml: yup.string().trim().required().min(36).max(36),
      factura_pdf: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaVerifySchema.validateSync({ ...req.files, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "facturaValidated:", facturaValidated);

  const filter_estado_archivo = isProduction ? [ESTADO.ACTIVO] : [ESTADO.ACTIVO, ESTADO.ELIMINADO];

  const archivo_xml = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(prismaFT.client, facturaValidated.factura_xml, ARCHIVO_TIPO.FACTURA_XML, filter_estado_archivo);
  if (!archivo_xml) {
    log.warn(line(), "Factura XML no existe o tipo no coincide: [" + facturaValidated.factura_xml + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const archivo_pdf = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(prismaFT.client, facturaValidated.factura_pdf, ARCHIVO_TIPO.FACTURA_PDF, filter_estado_archivo);
  if (!archivo_pdf) {
    log.warn(line(), "Factura PDF no existe o tipo no coincide: [" + facturaValidated.factura_pdf + "]");
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

  const facturaFinal = facturaUtils.buildFacturaJson(facturaJson, archivo_xml.codigo, session_idusuario);

  const facturaToCreate = facturaUtils.getFacturaToCreate(facturaFinal, session_idusuario);

  const resultado1 = await prismaFT.client.$transaction(
    async (tx) => {
      const facturaCreated = await facturaDao.insertFactura(tx, facturaToCreate);

      const itemsToCreate = facturaUtils.getItemsToCreate(facturaFinal, facturaCreated.idfactura, session_idusuario);
      const mediosdepagoToCreate = facturaUtils.getMediosdepagoToCreate(facturaFinal, facturaCreated.idfactura, session_idusuario);
      const terminosdepagoToCreate = facturaUtils.getTerminosdepagoToCreate(facturaFinal, facturaCreated.idfactura, session_idusuario);
      const impuestosToCreate = facturaUtils.getImpuestosToCreate(facturaFinal, facturaCreated.idfactura, session_idusuario);
      const notasToCreate = facturaUtils.getNotasToCreate(facturaFinal, facturaCreated.idfactura, session_idusuario);

      await procesarDatos(tx, itemsToCreate, facturaitemDao.insertFacturaitem);
      await procesarDatos(tx, mediosdepagoToCreate, facturamediopagoDao.insertFacturamediopago);
      await procesarDatos(tx, terminosdepagoToCreate, facturaterminopagoDao.insertFacturaterminopago);
      await procesarDatos(tx, impuestosToCreate, facturaimpuestoDao.insertFacturaimpuesto);
      await procesarDatos(tx, notasToCreate, facturanotaDao.insertFacturanota);

      const facturaxmlCreated = await vincularFacturaXML(req, tx, archivo_xml, facturaCreated);
      log.debug(line(), "facturaxmlCreated:", facturaxmlCreated);

      const facturapdfCreated = await vincularFacturaPDF(req, tx, archivo_pdf, facturaCreated);
      log.debug(line(), "facturapdfCreated:", facturapdfCreated);

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
  response(res, 200, facturaFiltered);
};

export const getFacturasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturasByFactoringid");
  //log.info(line(),req.session_user.usuario.idusuario);
  const { id } = req.params;
  const facturaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "facturaValidated:", facturaValidated);

  const facturasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, facturaValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + facturaValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const facturas = await facturaDao.getFacturasByIdfactoring(tx, factoring.idfactoring, filter_estado);

      return facturas;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, facturasJson);
};

export const activateFactura = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactura");
  const { id } = req.params;
  const facturaSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSchema.validateSync({ facturaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "facturaValidated:", facturaValidated);

  const facturaActivated = await prismaFT.client.$transaction(
    async (tx) => {
      const facturaActivated = await facturaDao.activateFactura(tx, facturaValidated.facturaid, req.session_user.usuario.idusuario);
      if (facturaActivated[0] === 0) {
        throw new ClientError("Factura no existe", 404);
      }
      log.debug(line(), "facturaActivated:", facturaActivated);
      return facturaActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, facturaActivated);
};

export const deleteFactura = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactura");
  const { id } = req.params;
  const facturaSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSchema.validateSync({ facturaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "facturaValidated:", facturaValidated);

  const facturaDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAuditoria: Partial<factura> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario.idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 2;

      const facturaDeleted = await facturaDao.deleteFactura(tx, facturaValidated.facturaid, req.session_user.usuario.idusuario);
      if (facturaDeleted[0] === 0) {
        throw new ClientError("Factura no existe", 404);
      }
      log.debug(line(), "facturaDeleted:", facturaDeleted);
      return facturaDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, facturaDeleted);
};

export const getFacturaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturaMaster");
  const facturasMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);
      var facturasMaster: Record<string, any> = {};
      facturasMaster.riesgos = riesgos;

      return facturasMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, facturasMasterFiltered);
};

export const getFacturas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturas");
  //log.info(line(),req.session_user.usuario.idusuario);

  const facturasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const facturas = await facturaDao.getFacturas(tx, filter_estado);

      return facturas;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, facturasJson);
};

const procesarDatos = async (tx, items, insertFunction) => {
  const results = [];
  for (const item of items) {
    const result = await insertFunction(tx, item);
    results.push(result);
  }
  return results;
};

const vincularFacturaPDF = async (req, tx, archivo, facturaCreated) => {
  const idusuario = req.session_user?.usuario?.idusuario ?? 1;

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

const vincularFacturaXML = async (req, tx, archivo, facturaCreated) => {
  const idusuario = req.session_user?.usuario?.idusuario ?? 1;

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
