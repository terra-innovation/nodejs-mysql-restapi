import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { isProduction } from "#src/config.js";
import { Request, Response } from "express";
import path from "path";

import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as archivofacturaDao from "#src/daos/archivofactura.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as facturaDao from "#src/daos/factura.prisma.Dao.js";
import * as facturaimpuestoDao from "#src/daos/facturaimpuesto.prisma.Dao.js";
import * as facturaitemDao from "#src/daos/facturaitem.prisma.Dao.js";
import * as facturamediopagoDao from "#src/daos/facturamediopago.prisma.Dao.js";
import * as facturanotaDao from "#src/daos/facturanota.prisma.Dao.js";
import * as facturaterminopagoDao from "#src/daos/facturaterminopago.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import * as factorlimiteDao from "#src/daos/factorlimite.prisma.Dao.js";
import * as cedentelimiteDao from "#src/daos/cedentelimite.prisma.Dao.js";
import * as pagadorlimiteDao from "#src/daos/pagadorlimite.prisma.Dao.js";

import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ARCHIVO_TIPO } from "#src/daos/archivotipo.prisma.Dao.js";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatNumber } from "#src/utils/numberUtils.js";
import * as facturaUtils from "#src/utils/facturaUtils.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import * as telegramService from "#src/services/telegram.Service.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const subirFactura = async (req: Request, res: Response) => {
  log.debug(line(), "controller::subirFactura");

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
      // Validar si el factoring ya existe
      // JCHR:20250213: Habillitar para producción
      if (isProduction) {
        const filter_estados_factoring = [ESTADO.ACTIVO];
        const factoring_existe = await factoringDao.getFactoringByRucCedenteAndCodigoFactura(tx, facturaToCreate.proveedor_ruc, facturaToCreate.serie, facturaToCreate.numero_comprobante, filter_estados_factoring);
        if (factoring_existe) {
          log.warn(line(), "Factoring ya existe: [" + facturaToCreate.proveedor_ruc + ", " + facturaToCreate.serie + ", " + facturaToCreate.numero_comprobante + ", " + filter_estados_factoring + "]");
          throw new ClientError("La factura (" + facturaToCreate.serie + "-" + facturaToCreate.numero_comprobante + ") seleccionada ya está vinculada a una operación de factoring activa. Por favor, elija otra factura para continuar con el proceso.", 404);
        }
      }

      var empresa = await empresaDao.getEmpresaByIdusuarioAndRuc(tx, session_idusuario, facturaToCreate.proveedor_ruc, filter_estado);
      if (!empresa) {
        log.warn(line(), "RUC no asociado al usuario: [" + session_idusuario + ", " + facturaToCreate.proveedor_ruc + "]");
        throw new ClientError("Seleccione una factura perteneciente a una de las empresas asociadas a su cuenta. La empresa [" + facturaToCreate.proveedor_razon_social + " (" + facturaToCreate.proveedor_ruc + ")] no está asociada a su cuenta.", 404);
      }

      if (!facturaToCreate.codigo_tipo_documento || facturaToCreate.codigo_tipo_documento != "01") {
        log.warn(line(), "Seleccione una factura válida");
        throw new ClientError("Seleccione una factura válida", 404);
      }

      if (!facturaToCreate.pago_cantidad_cuotas || facturaToCreate.pago_cantidad_cuotas <= 0) {
        log.warn(line(), "Seleccione una factura que cuya forma de pago sea al Crédito. La factura que ha seleccionado es de pago al Contado.");
        throw new ClientError("Seleccione una factura que cuya forma de pago sea al Crédito. La factura que ha seleccionado es de pago al Contado.", 404);
      }

      if (!facturaToCreate.pago_cantidad_cuotas || facturaToCreate.pago_cantidad_cuotas != 1) {
        log.warn(line(), "Seleccione una factura que sea al Crédito y de una sola cuota. La factura que ha seleccionado es de " + facturaToCreate.pago_cantidad_cuotas + " cuotas.");
        throw new ClientError("Seleccione una factura que sea al Crédito y de una sola cuota. La factura que ha seleccionado es de " + facturaToCreate.pago_cantidad_cuotas + " cuotas.", 404);
      }

      if (facturaToCreate.dias_desde_emision > 8) {
        //throw new ClientError("Seleccione una factura que no haya transcurrido más de 8 días desde su fecha de emisión", 404);
      }

      const REGLA_MINIMO_DE_DIAS_PARA_PAGO = 5;
      if (facturaToCreate.dias_estimados_para_pago <= REGLA_MINIMO_DE_DIAS_PARA_PAGO) {
        log.warn(line(), "Seleccione una factura cuya fecha de vencimiento sea superior a " + REGLA_MINIMO_DE_DIAS_PARA_PAGO + " días.");
        throw new ClientError("Seleccione una factura cuya fecha de vencimiento sea superior a " + REGLA_MINIMO_DE_DIAS_PARA_PAGO + " días.", 404);
      }

      /* Límites: Reglas de negocio del factor, cedente y pagador */
      const dbMoneda = await monedaDao.getMonedaByCodigo(tx, facturaToCreate.codigo_tipo_moneda);
      if (!dbMoneda) {
        log.warn(line(), `Moneda no configurada en el sistema: ${facturaToCreate.codigo_tipo_moneda}`);
        throw new ClientError(`La moneda especificada en la factura (${facturaToCreate.codigo_tipo_moneda}) no se encuentra registrada o habilitada en nuestra plataforma. Por favor, comuníquese con su asesor asignado para gestionar su registro.`, 404);
      }
      const idmoneda = dbMoneda.idmoneda;
      const monedaSimbolo = dbMoneda.simbolo ?? facturaToCreate.codigo_tipo_moneda;
      const monedaNombre = dbMoneda.alias ?? dbMoneda.nombre ?? facturaToCreate.codigo_tipo_moneda;

      const importeNeto = Number(facturaToCreate.importe_neto?.toString() || 0);

      // 1. Validar límite del Factor (ID 1)
      const limitFactor = await factorlimiteDao.getFactorlimiteByIdfactorAndIdmoneda(tx, 1, idmoneda, filter_estado);
      if (!limitFactor) {
        log.warn(line(), `No se encontró límite de factor configurado para Factor ID 1, idmoneda: ${idmoneda} - ${monedaNombre}`);
        const msnTelegram = {
          title: `No se ha registrado una línea de factoring configurada para nuestra entidad en ${monedaNombre}. Por favor, póngase en contacto con su asesor.`,
          restriccion: "Factor",
          cedente_ruc: facturaFinal.proveedor.ruc,
          cedente_razon_social: facturaFinal.proveedor.razon_social,
          pagador_ruc: facturaFinal.cliente.ruc,
          pagador_razon_social: facturaFinal.cliente.razon_social,
        };

        telegramService.sendMessageTelegramInfo(msnTelegram);
        throw new ClientError(`No se ha registrado una línea de factoring configurada para nuestra entidad en ${monedaNombre}. Por favor, póngase en contacto con su asesor.`, 422);
      }
      const dispFactor = Number(limitFactor.disponible);
      if (importeNeto > dispFactor) {
        log.warn(line(), `Importe neto supera límite de factor: ${importeNeto} > ${dispFactor}`);
        const msnTelegram = {
          title: `El importe neto de la factura (${monedaSimbolo} ${formatNumber(importeNeto)}) supera el límite disponible. Le invitamos a contactar a su asesor para evaluar la viabilidad de una excepción comercial.`,
          restriccion: "Factor",
          cedente_ruc: facturaFinal.proveedor.ruc,
          cedente_razon_social: facturaFinal.proveedor.razon_social,
          pagador_ruc: facturaFinal.cliente.ruc,
          pagador_razon_social: facturaFinal.cliente.razon_social,
          ...limitFactor,
        };

        telegramService.sendMessageTelegramInfo(msnTelegram);
        throw new ClientError(`El importe neto de la factura (${monedaSimbolo} ${formatNumber(importeNeto)}) supera el límite disponible. Le invitamos a contactar a su asesor para evaluar la viabilidad de una excepción comercial.`, 422);
      }

      // 2. Validar límite del Cedente (empresa proveedora emisor)
      const idcedente = empresa.idempresa;
      const limitCedente = await cedentelimiteDao.getCedentelimiteByIdcedenteAndIdmoneda(tx, idcedente, idmoneda, filter_estado);
      if (!limitCedente) {
        log.warn(line(), `No se encontró límite de cedente para idcedente: ${idcedente} - ${empresa.razon_social} (${facturaFinal.cliente.ruc}), idmoneda: ${idmoneda} - ${monedaNombre}`);
        const msnTelegram = {
          title: `La empresa (${empresa.razon_social}) no cuenta con una línea disponible asignada en ${monedaNombre} en nuestra plataforma. Para iniciar el proceso de asignación de línea, por favor póngase en contacto con su asesor.`,
          restriccion: "Cedente",
          cedente_ruc: facturaFinal.proveedor.ruc,
          cedente_razon_social: facturaFinal.proveedor.razon_social,
          pagador_ruc: facturaFinal.cliente.ruc,
          pagador_razon_social: facturaFinal.cliente.razon_social,
        };

        telegramService.sendMessageTelegramInfo(msnTelegram);
        throw new ClientError(`La empresa (${empresa.razon_social}) no cuenta con una línea disponible asignada en ${monedaNombre} en nuestra plataforma. Para iniciar el proceso de asignación de línea, por favor póngase en contacto con su asesor.`, 422);
      }
      const dispCedente = Number(limitCedente.disponible);
      if (importeNeto > dispCedente) {
        log.warn(line(), `Importe neto supera límite de cedente: ${importeNeto} > ${dispCedente}`);
        const msnTelegram = {
          title: `El importe neto de la factura (${monedaSimbolo} ${formatNumber(importeNeto)}) supera el límite disponible. Le invitamos a contactar a su asesor para evaluar la viabilidad de una excepción comercial.`,
          restriccion: "Cedente",
          cedente_ruc: facturaFinal.proveedor.ruc,
          cedente_razon_social: facturaFinal.proveedor.razon_social,
          pagador_ruc: facturaFinal.cliente.ruc,
          pagador_razon_social: facturaFinal.cliente.razon_social,
          ...limitCedente,
        };
        telegramService.sendMessageTelegramInfo(msnTelegram);

        throw new ClientError(`El importe neto de la factura (${monedaSimbolo} ${formatNumber(importeNeto)}) supera el límite disponible. Le invitamos a contactar a su asesor para evaluar la viabilidad de una excepción comercial.`, 422);
      }

      // 3. Validar límite del Pagador (empresa cliente receptor)
      const pagador = await empresaDao.getEmpresaByRuc(tx, facturaFinal.cliente.ruc);
      if (!pagador) {
        log.warn(line(), `Empresa pagadora no registrada en la base de datos: RUC ${facturaFinal.cliente.ruc}`);
        const msnTelegram = {
          title: `La empresa pagadora (${facturaFinal.cliente.razon_social}, RUC: ${facturaFinal.cliente.ruc}) no registra una línea disponible asignada en la moneda ${monedaNombre}. Le invitamos a contactar a su asesor para iniciar la evaluación crediticia.`,
          restriccion: "Pagador",
          cedente_ruc: facturaFinal.proveedor.ruc,
          cedente_razon_social: facturaFinal.proveedor.razon_social,
          pagador_ruc: facturaFinal.cliente.ruc,
          pagador_razon_social: facturaFinal.cliente.razon_social,
        };
        telegramService.sendMessageTelegramInfo(msnTelegram);

        throw new ClientError(`La empresa pagadora (${facturaFinal.cliente.razon_social}, RUC: ${facturaFinal.cliente.ruc}) no registra una línea disponible asignada en la moneda ${monedaNombre}. Le invitamos a contactar a su asesor para iniciar la evaluación crediticia.`, 422);
      }
      const idpagador = pagador.idempresa;
      const limitPagador = await pagadorlimiteDao.getPagadorlimiteByIdpagadorAndIdmoneda(tx, idpagador, idmoneda, filter_estado);
      if (!limitPagador) {
        log.warn(line(), `No se encontró límite de pagador para idpagador: ${idpagador}, idmoneda: ${idmoneda}`);
        const msnTelegram = {
          title: `La empresa pagadora (${pagador.razon_social}, RUC: ${pagador.ruc}) no registra una línea disponible asignada para la moneda ${monedaNombre} en nuestra plataforma. Le invitamos a contactar a su asesor para iniciar la evaluación crediticia.`,
          restriccion: "Pagador",
          cedente_ruc: facturaFinal.proveedor.ruc,
          cedente_razon_social: facturaFinal.proveedor.razon_social,
          pagador_ruc: facturaFinal.cliente.ruc,
          pagador_razon_social: facturaFinal.cliente.razon_social,
        };
        telegramService.sendMessageTelegramInfo(msnTelegram);

        throw new ClientError(`La empresa pagadora (${pagador.razon_social}, RUC: ${pagador.ruc}) no registra una línea disponible asignada para la moneda ${monedaNombre} en nuestra plataforma. Le invitamos a contactar a su asesor para iniciar la evaluación crediticia.`, 422);
      }
      const dispPagador = Number(limitPagador.disponible);
      if (importeNeto > dispPagador) {
        log.warn(line(), `Importe neto supera límite de pagador: ${importeNeto} > ${dispPagador}`);
        const msnTelegram = {
          title: `El importe neto de la factura (${monedaSimbolo} ${formatNumber(importeNeto)}) supera la línea disponible asignada para la empresa pagadora (${pagador.razon_social}, RUC: ${pagador.ruc}). Le invitamos a contactar a su asesor para evaluar la viabilidad de una excepción comercial.`,
          restriccion: "Pagador",
          cedente_ruc: facturaFinal.proveedor.ruc,
          cedente_razon_social: facturaFinal.proveedor.razon_social,
          pagador_ruc: facturaFinal.cliente.ruc,
          pagador_razon_social: facturaFinal.cliente.razon_social,
          ...limitPagador,
        };
        telegramService.sendMessageTelegramInfo(msnTelegram);

        throw new ClientError(`El importe neto de la factura (${monedaSimbolo} ${formatNumber(importeNeto)}) supera la línea disponible asignada para la empresa pagadora (${pagador.razon_social}, RUC: ${pagador.ruc}). Le invitamos a contactar a su asesor para evaluar la viabilidad de una excepción comercial.`, 422);
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

      let facturaFiltered = jsonUtils.removeAttributesPrivates(facturaFinal);
      facturaFiltered = jsonUtils.removeAttributes(facturaFinal, ["items", "terminos_pago", "notas", "medios_pago"]);
      facturaFiltered = jsonUtils.removeAttributesPrivates(facturaFiltered);

      const msnTelegram = {
        title: "Nueva factura cargada",
        code: facturaToCreate.code,
        serie: facturaToCreate.serie,
        numero_comprobante: facturaToCreate.numero_comprobante,
        fecha_pago_mayor_estimado: facturaToCreate.fecha_pago_mayor_estimado,
        importe_bruto: facturaToCreate.importe_bruto,
        importe_neto: facturaToCreate.importe_neto,
        dias_estimados_para_pago: facturaToCreate.dias_estimados_para_pago,
        dias_desde_emision: facturaToCreate.dias_desde_emision,
        proveedor_ruc: facturaToCreate.proveedor_ruc,
        proveedor_razon_social: facturaToCreate.proveedor_razon_social,
        cliente_ruc: facturaToCreate.cliente_ruc,
        cliente_razon_social: facturaToCreate.cliente_razon_social,
      };

      telegramService.sendMessageTelegramInfo(msnTelegram);

      return facturaFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 200, facturaFiltered);
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
