import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as fs from "fs";
import path from "path";
import { isProduction, isDevelopment } from "#src/config.js";

import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as facturaDao from "#src/daos/factura.prisma.Dao.js";
import * as facturaimpuestoDao from "#src/daos/facturaimpuesto.prisma.Dao.js";
import * as facturaitemDao from "#src/daos/facturaitem.prisma.Dao.js";
import * as facturamediopagoDao from "#src/daos/facturamediopago.prisma.Dao.js";
import * as facturanotaDao from "#src/daos/facturanota.prisma.Dao.js";
import * as facturaterminopagoDao from "#src/daos/facturaterminopago.prisma.Dao.js";
import * as archivofacturaDao from "#src/daos/archivofactura.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { log, line } from "#src/utils/logger.pino.js";
import * as telegramService from "#src/services/telegram.Service.js";

import * as storageUtils from "#src/utils/storageUtils.js";
import * as facturaUtils from "#src/utils/facturaUtils.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import * as validacionesYup from "#src/utils/validacionesYup.js";
import { ClientError } from "#src/utils/CustomErrors.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const subirFactura = async (req: Request, res: Response) => {
  log.debug(line(), "controller::verifyFactura");

  const session_idusuario = req.session_user?.usuario?.idusuario;
  const filter_estado = [1];

  const facturaVerifySchema = yup
    .object()
    .shape({
      factura_xml: yup
        .mixed()
        .concat(validacionesYup.fileRequeridValidation())
        .concat(validacionesYup.fileSizeValidation(3 * 1024 * 1024))
        .concat(validacionesYup.fileTypeValidation(["text/xml", "application/xml"])),
      factura_pdf: yup
        .mixed()
        .concat(validacionesYup.fileRequeridValidation())
        .concat(validacionesYup.fileSizeValidation(3 * 1024 * 1024))
        .concat(validacionesYup.fileTypeValidation(["application/pdf"])),
    })
    .required();
  const facturaValidated = facturaVerifySchema.validateSync({ ...req.files, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "facturaValidated:", facturaValidated);

  const facturaJson = await facturaUtils.procesarFacturaXML(facturaValidated.factura_xml[0]);
  if (!facturaJson) {
    log.warn(line(), "El archivo XML carece de una estructura válida");
    throw new ClientError("El archivo XML carece de una estructura válida", 404);
  }

  const codigo_tipo_documento = facturaUtils.getInvoiceTypeCode(facturaJson);
  if (codigo_tipo_documento !== "01") {
    log.warn(line(), "El archivo XML no corresponde a una factura válida");
    throw new ClientError("El archivo XML no corresponde a una factura válida");
  }

  const facturaFinal = facturaUtils.buildFacturaJson(facturaJson, facturaValidated.factura_xml[0].codigo_archivo, session_idusuario);

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

      const facturaxmlCreated = await crearFacturaXML(req, tx, facturaValidated, facturaCreated);
      log.debug(line(), "facturaxmlCreated:", facturaxmlCreated);

      const facturapdfCreated = await crearFacturaPDF(req, tx, facturaValidated, facturaCreated);
      log.debug(line(), "facturapdfCreated:", facturapdfCreated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );

  const facturaFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      // Validar si el factoring ya existe
      // JCHR:20250213: Habillitar para producción
      if (isProduction) {
        const filter_estados_factoring = [1];
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

      const REGLA_MINIMO_DE_DIAS_PARA_PAGO = 8;
      if (facturaToCreate.dias_estimados_para_pago <= REGLA_MINIMO_DE_DIAS_PARA_PAGO) {
        log.warn(line(), "Seleccione una factura cuya fecha de vencimiento sea superior a " + REGLA_MINIMO_DE_DIAS_PARA_PAGO + " días.");
        throw new ClientError("Seleccione una factura cuya fecha de vencimiento sea superior a " + REGLA_MINIMO_DE_DIAS_PARA_PAGO + " días.", 404);
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
    { timeout: prismaFT.transactionTimeout }
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

const crearFacturaPDF = async (req, tx, facturaValidated, facturaCreated) => {
  //Copiamos el archivo
  const { factura_pdf } = facturaValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = factura_pdf[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = factura_pdf[0];

  const archivoToCreate: Prisma.archivoCreateInput = {
    archivoid: uuidv4(),
    archivo_tipo: { connect: { idarchivotipo: 9 } },
    archivo_estado: { connect: { idarchivoestado: 1 } },
    codigo: codigo_archivo,
    nombrereal: originalname,
    nombrealmacenamiento: filename,
    ruta: carpetaDestino,
    tamanio: size,
    mimetype: mimetype,
    encoding: encoding,
    extension: extension,
    observacion: "",
    fechavencimiento: null,
    idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };
  const archivoCreated = await archivoDao.insertArchivo(tx, archivoToCreate);

  const archivofacturaToCreate: Prisma.archivo_facturaCreateInput = {
    archivo: { connect: { idarchivo: archivoCreated.idarchivo } },
    factura: { connect: { idfactura: facturaCreated.idfactura } },
    idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };

  await archivofacturaDao.insertArchivoFactura(tx, archivofacturaToCreate);

  fs.unlinkSync(archivoOrigen);
  return archivoCreated;
};

const crearFacturaXML = async (req, tx, facturaValidated, facturaCreated) => {
  //Copiamos el archivo
  const { factura_xml } = facturaValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = factura_xml[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = factura_xml[0];

  const archivoToCreate: Prisma.archivoCreateInput = {
    archivoid: uuidv4(),
    archivo_tipo: { connect: { idarchivotipo: 8 } },
    archivo_estado: { connect: { idarchivoestado: 1 } },
    codigo: codigo_archivo,
    nombrereal: originalname,
    nombrealmacenamiento: filename,
    ruta: carpetaDestino,
    tamanio: size,
    mimetype: mimetype,
    encoding: encoding,
    extension: extension,
    observacion: "",
    fechavencimiento: null,
    idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };
  const archivoCreated = await archivoDao.insertArchivo(tx, archivoToCreate);

  const archivofacturaToCreate: Prisma.archivo_facturaCreateInput = {
    archivo: { connect: { idarchivo: archivoCreated.idarchivo } },
    factura: { connect: { idfactura: facturaCreated.idfactura } },
    idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };

  await archivofacturaDao.insertArchivoFactura(tx, archivofacturaToCreate);

  fs.unlinkSync(archivoOrigen);
  return archivoCreated;
};
