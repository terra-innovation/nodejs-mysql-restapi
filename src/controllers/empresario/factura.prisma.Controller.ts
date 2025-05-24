import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as fs from "fs";
import path from "path";

import * as factoringDao from "#src/daos/factoringDao.js";
import * as monedaDao from "#src/daos/monedaDao.js";
import * as empresaDao from "#src/daos/empresaDao.js";
import * as archivoDao from "#src/daos/archivoDao.js";
import * as facturaDao from "#src/daos/facturaDao.js";
import * as facturaimpuestoDao from "#src/daos/facturaimpuestoDao.js";
import * as facturaitemDao from "#src/daos/facturaitemDao.js";
import * as facturamediopagoDao from "#src/daos/facturamediopagoDao.js";
import * as facturanotaDao from "#src/daos/facturanotaDao.js";
import * as facturaterminopagoDao from "#src/daos/facturaterminopagoDao.js";
import * as archivofacturaDao from "#src/daos/archivofacturaDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { log, line } from "#src/utils/logger.pino.js";

import * as storageUtils from "#src/utils/storageUtils.js";
import * as facturaUtils from "#src/utils/facturaUtils.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import * as validacionesYup from "#src/utils/validacionesYup.js";
import { ClientError } from "#src/utils/CustomErrors.js";

import { Sequelize, Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const subirFactura = async (req: Request, res: Response) => {
  log.debug(line(), "controller::verifyFactura");

  const session_idusuario = req.session_user?.usuario?._idusuario;
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

  const facturaCreate = facturaUtils.buildFacturaJson(facturaJson, facturaValidated.factura_xml[0].codigo_archivo, session_idusuario);

  const resultado1 = await prismaFT.client.$transaction(
    async (tx) => {
      const facturaCreated = await facturaDao.insertFactura(tx, facturaCreate);

      await procesarDatos(tx, facturaCreated._idfactura, facturaCreate.items, session_idusuario, facturaitemDao.insertFacturaitem);
      await procesarDatos(tx, facturaCreated._idfactura, facturaCreate.medios_pago, session_idusuario, facturamediopagoDao.insertFacturamediopago);
      await procesarDatos(tx, facturaCreated._idfactura, facturaCreate.terminos_pago, session_idusuario, facturaterminopagoDao.insertFacturaterminopago);
      await procesarDatos(tx, facturaCreated._idfactura, facturaCreate.impuesto.impuestos, session_idusuario, facturaimpuestoDao.insertFacturaimpuesto);
      await procesarDatos(tx, facturaCreated._idfactura, facturaCreate.notas, session_idusuario, facturanotaDao.insertFacturanota);

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
      /*
      const filter_estados_factoring = [1];
      const factoring_existe = await factoringDao.getFactoringByRucCedenteAndCodigoFactura(transaction2, facturaCreate.proveedor_ruc, facturaCreate.serie, facturaCreate.numero_comprobante, filter_estados_factoring);
      if (factoring_existe) {
        log.warn(line(), "Factoring ya existe: [" + facturaCreate.proveedor_ruc + ", " + facturaCreate.serie + ", " + facturaCreate.numero_comprobante + ", " + filter_estados_factoring + "]");
        throw new ClientError("La factura seleccionada ya está vinculada a una operación de factoring activa. Por favor, elija otra factura para continuar con el proceso.", 404);
      }
        */

      var empresa = await empresaDao.getEmpresaByIdusuarioAndRuc(tx, session_idusuario, facturaCreate.proveedor_ruc, filter_estado);
      if (!empresa) {
        log.warn(line(), "RUC no asociado al usuario: [" + session_idusuario + ", " + facturaCreate.proveedor_ruc + "]");
        throw new ClientError("Seleccione una factura perteneciente a una de las empresas asociadas a su cuenta. La empresa [" + facturaCreate.proveedor_razon_social + " (" + facturaCreate.proveedor_ruc + ")] no está asociada a su cuenta.", 404);
      }

      if (!facturaCreate.codigo_tipo_documento || facturaCreate.codigo_tipo_documento != "01") {
        log.warn(line(), "Seleccione una factura válida");
        throw new ClientError("Seleccione una factura válida", 404);
      }

      if (!facturaCreate.pago_cantidad_cuotas || facturaCreate.pago_cantidad_cuotas <= 0) {
        log.warn(line(), "Seleccione una factura que cuya forma de pago sea al Crédito. La factura que ha seleccionado es de pago al Contado.");
        throw new ClientError("Seleccione una factura que cuya forma de pago sea al Crédito. La factura que ha seleccionado es de pago al Contado.", 404);
      }

      if (!facturaCreate.pago_cantidad_cuotas || facturaCreate.pago_cantidad_cuotas != 1) {
        log.warn(line(), "Seleccione una factura que sea al Crédito y de una sola cuota. La factura que ha seleccionado es de " + facturaCreate.pago_cantidad_cuotas + " cuotas.");
        throw new ClientError("Seleccione una factura que sea al Crédito y de una sola cuota. La factura que ha seleccionado es de " + facturaCreate.pago_cantidad_cuotas + " cuotas.", 404);
      }

      if (facturaCreate.dias_desde_emision > 8) {
        //throw new ClientError("Seleccione una factura que no haya transcurrido más de 8 días desde su fecha de emisión", 404);
      }

      const REGLA_MINIMO_DE_DIAS_PARA_PAGO = 8;
      if (facturaCreate.dias_estimados_para_pago <= REGLA_MINIMO_DE_DIAS_PARA_PAGO) {
        log.warn(line(), "Seleccione una factura cuya fecha de vencimiento sea superior a " + REGLA_MINIMO_DE_DIAS_PARA_PAGO + " días.");
        throw new ClientError("Seleccione una factura cuya fecha de vencimiento sea superior a " + REGLA_MINIMO_DE_DIAS_PARA_PAGO + " días.", 404);
      }

      let cliente = await empresaDao.getEmpresaByRuc(tx, facturaCreate.cliente.ruc);
      if (!cliente) {
        const empresaCreate = {
          ruc: facturaCreate.cliente.ruc,
          razon_social: facturaCreate.cliente.razon_social,
          empresaid: uuidv4(),
          code: uuidv4().split("-")[0],
          idusuariocrea: session_idusuario,
          fechacrea: new Date(),
          idusuariomod: session_idusuario,
          fechamod: new Date(),
          estado: 1,
        };

        cliente = await empresaDao.insertEmpresa(tx, empresaCreate);
      }
      facturaCreate.cliente.empresaid = cliente.empresaid;

      let proveedor = await empresaDao.getEmpresaByRuc(tx, facturaCreate.proveedor.ruc);
      if (!proveedor) {
        const empresaCreate = {
          ruc: facturaCreate.proveedor.ruc,
          razon_social: facturaCreate.proveedor.razon_social,
          empresaid: uuidv4(),
          code: uuidv4().split("-")[0],
          idusuariocrea: session_idusuario,
          fechacrea: new Date(),
          idusuariomod: session_idusuario,
          fechamod: new Date(),
          estado: 1,
        };

        proveedor = await empresaDao.insertEmpresa(tx, empresaCreate);
      }
      facturaCreate.proveedor.empresaid = proveedor.empresaid;

      const moneda = await monedaDao.getMonedaByCodigo(tx, facturaCreate.codigo_tipo_moneda);
      facturaCreate.monedaid = moneda.monedaid;

      let facturaFiltered = jsonUtils.removeAttributesPrivates(facturaCreate);
      facturaFiltered = jsonUtils.removeAttributes(facturaCreate, ["items", "terminos_pago", "notas", "medios_pago"]);
      facturaFiltered = jsonUtils.removeAttributesPrivates(facturaFiltered);

      return facturaFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, facturaFiltered);
};

const procesarDatos = async (tx, _idfactura, items, _idusuario, insertFunction) => {
  const results = [];
  for (const item of items) {
    const factura_item = {
      _idfactura: _idfactura,
      idusuariocrea: _idusuario,
      fechacrea: new Date(),
      idusuariomod: _idusuario,
      fechamod: new Date(),
      estado: 1,
      ...item,
    };

    const result = await insertFunction(tx, factura_item);
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

  let identificacionselfiNew = {
    archivoid: uuidv4(),
    _idarchivotipo: 9,
    _idarchivoestado: 1,
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
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };
  const identificacionselfiCreated = await archivoDao.insertArchivo(tx, identificacionselfiNew);

  await archivofacturaDao.insertArchivoFactura(tx, {
    _idarchivo: identificacionselfiCreated._idarchivo,
    _idfactura: facturaCreated._idfactura,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  });

  fs.unlinkSync(archivoOrigen);
  return identificacionselfiCreated;
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

  let identificacionselfiNew = {
    archivoid: uuidv4(),
    _idarchivotipo: 8,
    _idarchivoestado: 1,
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
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };
  const identificacionselfiCreated = await archivoDao.insertArchivo(tx, identificacionselfiNew);

  await archivofacturaDao.insertArchivoFactura(tx, {
    _idarchivo: identificacionselfiCreated._idarchivo,
    _idfactura: facturaCreated._idfactura,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  });

  fs.unlinkSync(archivoOrigen);
  return identificacionselfiCreated;
};
