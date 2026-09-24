import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { isProduction } from "#src/config.js";
import path from "path";

import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as archivofacturaDao from "#root/src/daos/archivofactura.Dao.js";
import * as cedentelimiteDao from "#root/src/daos/cedentelimite.Dao.js";
import * as empresaDao from "#root/src/daos/empresa.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factorlimiteDao from "#root/src/daos/factorlimite.Dao.js";
import * as facturaDao from "#root/src/daos/factura.Dao.js";
import * as facturaimpuestoDao from "#root/src/daos/facturaimpuesto.Dao.js";
import * as facturaitemDao from "#root/src/daos/facturaitem.Dao.js";
import * as facturamediopagoDao from "#root/src/daos/facturamediopago.Dao.js";
import * as facturanotaDao from "#root/src/daos/facturanota.Dao.js";
import * as facturaterminopagoDao from "#root/src/daos/facturaterminopago.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import * as pagadorlimiteDao from "#root/src/daos/pagadorlimite.Dao.js";
import * as riesgoDao from "#root/src/daos/riesgo.Dao.js";

import { ARCHIVO_TIPO } from "#root/src/daos/archivotipo.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

import * as telegramService from "#src/providers/telegram/telegram.Provider.js";
import { limitMessage, newFacturaCargadaMessage } from "#src/templates/telegram/factura.Template.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as facturaUtils from "#src/utils/facturaUtils.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { formatNumber } from "#src/utils/numberUtils.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface SubirFacturaDto {
  factura_xml: string;
  factura_pdf: string;
  idusuario: number;
}

export interface GetFacturasByFactoringidDto {
  factoringid: string;
}

export interface ActivateFacturaDto {
  facturaid: string;
  idusuario: number;
}

export interface DeleteFacturaDto {
  facturaid: string;
  idusuario: number;
}

// ─── Private Helpers ─────────────────────────────────────────────────────────

const procesarDatos = async (tx: any, items: any[], insertFunction: Function) => {
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

// ─── Services ────────────────────────────────────────────────────────────────

export const subirFacturaService = async (dto: SubirFacturaDto) => {
  log.debug(line(), "service::empresario::subirFacturaService");

  const session_idusuario = dto.idusuario;
  const filter_estado = [ESTADO.ACTIVO];
  const filter_estado_archivo = isProduction ? [ESTADO.ACTIVO] : [ESTADO.ACTIVO, ESTADO.ELIMINADO];

  const archivo_xml = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(
    prismaFT.client,
    dto.factura_xml,
    ARCHIVO_TIPO.FACTURA_XML,
    filter_estado_archivo,
  );
  if (!archivo_xml) {
    log.warn(line(), "Factura XML no existe o tipo no coincide: [" + dto.factura_xml + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const archivo_pdf = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(
    prismaFT.client,
    dto.factura_pdf,
    ARCHIVO_TIPO.FACTURA_PDF,
    filter_estado_archivo,
  );
  if (!archivo_pdf) {
    log.warn(line(), "Factura PDF no existe o tipo no coincide: [" + dto.factura_pdf + "]");
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

  await prismaFT.client.$transaction(
    async (tx) => {
      const facturaCreated = await facturaDao.insertFactura(tx, facturaToCreate);

      const itemsToCreate = facturaUtils.getItemsToCreate(facturaFinal, facturaCreated.idfactura, session_idusuario);
      const mediosdepagoToCreate = facturaUtils.getMediosdepagoToCreate(
        facturaFinal,
        facturaCreated.idfactura,
        session_idusuario,
      );
      const terminosdepagoToCreate = facturaUtils.getTerminosdepagoToCreate(
        facturaFinal,
        facturaCreated.idfactura,
        session_idusuario,
      );
      const impuestosToCreate = facturaUtils.getImpuestosToCreate(
        facturaFinal,
        facturaCreated.idfactura,
        session_idusuario,
      );
      const notasToCreate = facturaUtils.getNotasToCreate(facturaFinal, facturaCreated.idfactura, session_idusuario);

      await procesarDatos(tx, itemsToCreate, facturaitemDao.insertFacturaitem);
      await procesarDatos(tx, mediosdepagoToCreate, facturamediopagoDao.insertFacturamediopago);
      await procesarDatos(tx, terminosdepagoToCreate, facturaterminopagoDao.insertFacturaterminopago);
      await procesarDatos(tx, impuestosToCreate, facturaimpuestoDao.insertFacturaimpuesto);
      await procesarDatos(tx, notasToCreate, facturanotaDao.insertFacturanota);

      await vincularFacturaArchivo(tx, archivo_xml, facturaCreated, session_idusuario);
      await vincularFacturaArchivo(tx, archivo_pdf, facturaCreated, session_idusuario);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );

  const facturaFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      if (isProduction) {
        const filter_estados_factoring = [ESTADO.ACTIVO];
        const factoring_existe = await factoringDao.getFactoringByRucCedenteAndCodigoFactura(
          tx,
          facturaToCreate.proveedor_ruc,
          facturaToCreate.serie,
          facturaToCreate.numero_comprobante,
          filter_estados_factoring,
        );
        if (factoring_existe) {
          log.warn(
            line(),
            "Factoring ya existe: [" +
              facturaToCreate.proveedor_ruc +
              ", " +
              facturaToCreate.serie +
              ", " +
              facturaToCreate.numero_comprobante +
              ", " +
              filter_estados_factoring +
              "]",
          );
          throw new ClientError(
            "La factura (" +
              facturaToCreate.serie +
              "-" +
              facturaToCreate.numero_comprobante +
              ") seleccionada ya está vinculada a una operación de factoring activa. Por favor, elija otra factura para continuar con el proceso.",
            404,
          );
        }
      }

      const empresa = await empresaDao.getEmpresaByIdusuarioAndRuc(
        tx,
        session_idusuario,
        facturaToCreate.proveedor_ruc,
        filter_estado,
      );
      if (!empresa) {
        log.warn(line(), "RUC no asociado al usuario: [" + session_idusuario + ", " + facturaToCreate.proveedor_ruc + "]");
        throw new ClientError(
          "Seleccione una factura perteneciente a una de las empresas asociadas a su cuenta. La empresa [" +
            facturaToCreate.proveedor_razon_social +
            " (" +
            facturaToCreate.proveedor_ruc +
            ")] no está asociada a su cuenta.",
          404,
        );
      }

      if (!facturaToCreate.codigo_tipo_documento || facturaToCreate.codigo_tipo_documento != "01") {
        log.warn(line(), "Seleccione una factura válida");
        throw new ClientError("Seleccione una factura válida", 404);
      }

      if (!facturaToCreate.pago_cantidad_cuotas || facturaToCreate.pago_cantidad_cuotas <= 0) {
        log.warn(line(), "Seleccione una factura que cuya forma de pago sea al Crédito. La factura que ha seleccionado es de pago al Contado.");
        throw new ClientError(
          "Seleccione una factura que cuya forma de pago sea al Crédito. La factura que ha seleccionado es de pago al Contado.",
          404,
        );
      }

      if (!facturaToCreate.pago_cantidad_cuotas || facturaToCreate.pago_cantidad_cuotas != 1) {
        log.warn(
          line(),
          "Seleccione una factura que sea al Crédito y de una sola cuota. La factura que ha seleccionado es de " +
            facturaToCreate.pago_cantidad_cuotas +
            " cuotas.",
        );
        throw new ClientError(
          "Seleccione una factura que sea al Crédito y de una sola cuota. La factura que ha seleccionado es de " +
            facturaToCreate.pago_cantidad_cuotas +
            " cuotas.",
          404,
        );
      }

      const REGLA_MINIMO_DE_DIAS_PARA_PAGO = 5;
      if (facturaToCreate.dias_estimados_para_pago <= REGLA_MINIMO_DE_DIAS_PARA_PAGO) {
        log.warn(
          line(),
          "Seleccione una factura cuya fecha de vencimiento sea superior a " + REGLA_MINIMO_DE_DIAS_PARA_PAGO + " días.",
        );
        throw new ClientError(
          "Seleccione una factura cuya fecha de vencimiento sea superior a " + REGLA_MINIMO_DE_DIAS_PARA_PAGO + " días.",
          404,
        );
      }

      /* Límites: Reglas de negocio del factor, cedente y pagador */
      const dbMoneda = await monedaDao.getMonedaByCodigo(tx, facturaToCreate.codigo_tipo_moneda);
      if (!dbMoneda) {
        log.warn(line(), `Moneda no configurada en el sistema: ${facturaToCreate.codigo_tipo_moneda}`);
        throw new ClientError(
          `La moneda especificada en la factura (${facturaToCreate.codigo_tipo_moneda}) no se encuentra registrada o habilitada en nuestra plataforma. Por favor, comuníquese con su asesor asignado para gestionar su registro.`,
          404,
        );
      }
      const idmoneda = dbMoneda.idmoneda;
      const monedaSimbolo = dbMoneda.simbolo ?? facturaToCreate.codigo_tipo_moneda;
      const monedaNombre = dbMoneda.alias ?? dbMoneda.nombre ?? facturaToCreate.codigo_tipo_moneda;

      const importeNeto = Number(facturaToCreate.importe_neto?.toString() || 0);

      // 1. Validar límite del Factor (ID 1)
      const limitFactor = await factorlimiteDao.getFactorlimiteByIdfactorAndIdmoneda(tx, 1, idmoneda, filter_estado);
      if (!limitFactor) {
        log.warn(line(), `No se encontró límite de factor configurado para Factor ID 1, idmoneda: ${idmoneda} - ${monedaNombre}`);
        const msnTelegram = limitMessage(
          `No se ha registrado una línea de factoring configurada para nuestra entidad en ${monedaNombre}. Por favor, póngase en contacto con su asesor.`,
          "Factor",
          facturaFinal,
          facturaToCreate,
        );
        telegramService.sendMessageImportant(msnTelegram);
        throw new ClientError(
          `No se ha registrado una línea de factoring configurada para nuestra entidad en ${monedaNombre}. Por favor, póngase en contacto con su asesor.`,
          422,
        );
      }
      const dispFactor = Number(limitFactor.disponible);
      if (importeNeto > dispFactor) {
        log.warn(line(), `Importe neto supera límite de factor: ${importeNeto} > ${dispFactor}`);
        const msnTelegram = limitMessage(
          `El importe neto de la factura (${monedaSimbolo} ${formatNumber(importeNeto)}) supera el límite disponible. Le invitamos a contactar a su asesor para evaluar la viabilidad de una excepción comercial.`,
          "Factor",
          facturaFinal,
          facturaToCreate,
          limitFactor,
        );
        telegramService.sendMessageImportant(msnTelegram);
        throw new ClientError(
          `El importe neto de la factura (${monedaSimbolo} ${formatNumber(importeNeto)}) supera el límite disponible. Le invitamos a contactar a su asesor para evaluar la viabilidad de una excepción comercial.`,
          422,
        );
      }

      // 2. Validar límite del Cedente
      const idcedente = empresa.idempresa;
      const limitCedente = await cedentelimiteDao.getCedentelimiteByIdcedenteAndIdmoneda(
        tx,
        idcedente,
        idmoneda,
        filter_estado,
      );
      if (!limitCedente) {
        log.warn(
          line(),
          `No se encontró límite de cedente para idcedente: ${idcedente} - ${empresa.razon_social} (${facturaFinal.cliente.ruc}), idmoneda: ${idmoneda} - ${monedaNombre}`,
        );
        const msnTelegram = limitMessage(
          `La empresa (${empresa.razon_social}) no cuenta con una línea disponible asignada en ${monedaNombre} en nuestra plataforma. Para iniciar el proceso de asignación de línea, por favor póngase en contacto con su asesor.`,
          "Cedente",
          facturaFinal,
          facturaToCreate,
        );
        telegramService.sendMessageImportant(msnTelegram);
        throw new ClientError(
          `La empresa (${empresa.razon_social}) no cuenta con una línea disponible asignada en ${monedaNombre} en nuestra plataforma. Para iniciar el proceso de asignación de línea, por favor póngase en contacto con su asesor.`,
          422,
        );
      }
      const dispCedente = Number(limitCedente.disponible);
      if (importeNeto > dispCedente) {
        log.warn(line(), `Importe neto supera límite de cedente: ${importeNeto} > ${dispCedente}`);
        const msnTelegram = limitMessage(
          `El importe neto de la factura (${monedaSimbolo} ${formatNumber(importeNeto)}) supera el límite disponible. Le invitamos a contactar a su asesor para evaluar la viabilidad de una excepción comercial.`,
          "Cedente",
          facturaFinal,
          facturaToCreate,
          limitCedente,
        );
        telegramService.sendMessageImportant(msnTelegram);
        throw new ClientError(
          `El importe neto de la factura (${monedaSimbolo} ${formatNumber(importeNeto)}) supera el límite disponible. Le invitamos a contactar a su asesor para evaluar la viabilidad de una excepción comercial.`,
          422,
        );
      }

      // 3. Validar límite del Pagador
      const pagador = await empresaDao.getEmpresaByRuc(tx, facturaFinal.cliente.ruc);
      if (!pagador) {
        log.warn(line(), `Empresa pagadora no registrada en la base de datos: RUC ${facturaFinal.cliente.ruc}`);
        const msnTelegram = limitMessage(
          `La empresa pagadora (${facturaFinal.cliente.razon_social}, RUC: ${facturaFinal.cliente.ruc}) no registra una línea disponible asignada en la moneda ${monedaNombre}. Le invitamos a contactar a su asesor para iniciar la evaluación crediticia.`,
          "Pagador",
          facturaFinal,
          facturaToCreate,
        );
        telegramService.sendMessageImportant(msnTelegram);
        throw new ClientError(
          `La empresa pagadora (${facturaFinal.cliente.razon_social}, RUC: ${facturaFinal.cliente.ruc}) no registra una línea disponible asignada en la moneda ${monedaNombre}. Le invitamos a contactar a su asesor para iniciar la evaluación crediticia.`,
          422,
        );
      }
      const idpagador = pagador.idempresa;
      const limitPagador = await pagadorlimiteDao.getPagadorlimiteByIdpagadorAndIdmoneda(
        tx,
        idpagador,
        idmoneda,
        filter_estado,
      );
      if (!limitPagador) {
        log.warn(line(), `No se encontró límite de pagador para idpagador: ${idpagador}, idmoneda: ${idmoneda}`);
        const msnTelegram = limitMessage(
          `La empresa pagadora (${pagador.razon_social}, RUC: ${pagador.ruc}) no registra una línea disponible asignada para la moneda ${monedaNombre} en nuestra plataforma. Le invitamos a contactar a su asesor para iniciar la evaluación crediticia.`,
          "Pagador",
          facturaFinal,
          facturaToCreate,
        );
        telegramService.sendMessageImportant(msnTelegram);
        throw new ClientError(
          `La empresa pagadora (${pagador.razon_social}, RUC: ${pagador.ruc}) no registra una línea disponible asignada para la moneda ${monedaNombre} en nuestra plataforma. Le invitamos a contactar a su asesor para iniciar la evaluación crediticia.`,
          422,
        );
      }
      const dispPagador = Number(limitPagador.disponible);
      if (importeNeto > dispPagador) {
        log.warn(line(), `Importe neto supera límite de pagador: ${importeNeto} > ${dispPagador}`);
        const msnTelegram = limitMessage(
          `El importe neto de la factura (${monedaSimbolo} ${formatNumber(importeNeto)}) supera la línea disponible asignada para la empresa pagadora (${pagador.razon_social}, RUC: ${pagador.ruc}). Le invitamos a contactar a su asesor para evaluar la viabilidad de una excepción comercial.`,
          "Pagador",
          facturaFinal,
          facturaToCreate,
          limitPagador,
        );
        telegramService.sendMessageImportant(msnTelegram);
        throw new ClientError(
          `El importe neto de la factura (${monedaSimbolo} ${formatNumber(importeNeto)}) supera la línea disponible asignada para la empresa pagadora (${pagador.razon_social}, RUC: ${pagador.ruc}). Le invitamos a contactar a su asesor para evaluar la viabilidad de una excepción comercial.`,
          422,
        );
      }

      let cliente = await empresaDao.getEmpresaByRuc(tx, facturaFinal.cliente.ruc);
      if (!cliente) {
        const empresaToCreate: Prisma.empresaCreateInput = {
          ruc: facturaFinal.cliente.ruc,
          razon_social: facturaFinal.cliente.razon_social,
          empresaid: uuidv4(),
          code: uuidv4().split("-")[0],
          idusuariocrea: session_idusuario,
          fechacrea: new Date(),
          idusuariomod: session_idusuario,
          fechamod: new Date(),
          estado: 1,
        };
        cliente = await empresaDao.insertEmpresa(tx, empresaToCreate);
      }
      facturaFinal.cliente.empresaid = cliente.empresaid;

      let proveedor = await empresaDao.getEmpresaByRuc(tx, facturaFinal.proveedor.ruc);
      if (!proveedor) {
        const empresaToCreate: Prisma.empresaCreateInput = {
          ruc: facturaFinal.proveedor.ruc,
          razon_social: facturaFinal.proveedor.razon_social,
          empresaid: uuidv4(),
          code: uuidv4().split("-")[0],
          idusuariocrea: session_idusuario,
          fechacrea: new Date(),
          idusuariomod: session_idusuario,
          fechamod: new Date(),
          estado: 1,
        };
        proveedor = await empresaDao.insertEmpresa(tx, empresaToCreate);
      }
      facturaFinal.proveedor.empresaid = proveedor.empresaid;

      const moneda = await monedaDao.getMonedaByCodigo(tx, facturaToCreate.codigo_tipo_moneda);
      facturaFinal.monedaid = moneda.monedaid;
      facturaFinal.moneda_alias = moneda.alias;
      facturaFinal.moneda_simbolo = moneda.simbolo;

      let filtered = jsonUtils.removeAttributesPrivates(facturaFinal);
      filtered = jsonUtils.removeAttributes(facturaFinal, ["items", "terminos_pago", "notas", "medios_pago"]);
      filtered = jsonUtils.removeAttributesPrivates(filtered);

      const msnTelegram = newFacturaCargadaMessage(facturaToCreate);
      telegramService.sendMessageImportant(msnTelegram);

      return filtered;
    },
    { timeout: prismaFT.transactionTimeout },
  );

  return facturaFiltered;
};

export const getFacturasByFactoringidService = async (dto: GetFacturasByFactoringidDto) => {
  log.debug(line(), "service::empresario::getFacturasByFactoringidService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + dto.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const facturas = await facturaDao.getFacturasByIdfactoring(tx, factoring.idfactoring, filter_estado);
      return facturas;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const activateFacturaService = async (dto: ActivateFacturaDto) => {
  log.debug(line(), "service::empresario::activateFacturaService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const facturaActivated = await facturaDao.activateFactura(tx, dto.facturaid, dto.idusuario);
      if (facturaActivated[0] === 0) {
        throw new ClientError("Factura no existe", 404);
      }
      return facturaActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deleteFacturaService = async (dto: DeleteFacturaDto) => {
  log.debug(line(), "service::empresario::deleteFacturaService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const facturaDeleted = await facturaDao.deleteFactura(tx, dto.facturaid, dto.idusuario);
      if (facturaDeleted[0] === 0) {
        throw new ClientError("Factura no existe", 404);
      }
      return facturaDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFacturaMasterService = async () => {
  log.debug(line(), "service::empresario::getFacturaMasterService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);
      const facturasMaster: Record<string, any> = { riesgos };
      return jsonUtils.removeAttributesPrivates(facturasMaster);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFacturasService = async () => {
  log.debug(line(), "service::empresario::getFacturasService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const facturas = await facturaDao.getFacturas(tx, filter_estado);
      return facturas;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
