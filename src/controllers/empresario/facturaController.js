import * as fs from "fs";
import path from "path";
import { sequelizeFT } from "../../config/bd/sequelize_db_factoring.js";
import * as factoringDao from "../../daos/factoringDao.js";
import * as monedaDao from "../../daos/monedaDao.js";
import * as empresaDao from "../../daos/empresaDao.js";
import * as archivoDao from "../../daos/archivoDao.js";
import * as facturaDao from "../../daos/facturaDao.js";
import * as facturaimpuestoDao from "../../daos/facturaimpuestoDao.js";
import * as facturaitemDao from "../../daos/facturaitemDao.js";
import * as facturamediopagoDao from "../../daos/facturamediopagoDao.js";
import * as facturanotaDao from "../../daos/facturanotaDao.js";
import * as facturaterminopagoDao from "../../daos/facturaterminopagoDao.js";
import * as archivofacturaDao from "../../daos/archivofacturaDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import logger, { line } from "../../utils/logger.js";
import * as storageUtils from "../../utils/storageUtils.js";
import * as facturaUtils from "../../utils/facturaUtils.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import * as validacionesYup from "../../utils/validacionesYup.js";
import { ClientError } from "../../utils/CustomErrors.js";

import { Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const subirFactura = async (req, res) => {
  logger.debug(line(), "controller::verifyFactura");
  const transaction1 = await sequelizeFT.transaction();
  try {
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
    logger.debug(line(), "facturaValidated:", facturaValidated);

    const facturaJson = await facturaUtils.procesarFacturaXML(facturaValidated.factura_xml[0]);
    if (!facturaJson) {
      logger.warn(line(), "El archivo XML carece de una estructura válida");
      throw new ClientError("El archivo XML carece de una estructura válida", 404);
    }

    const codigo_tipo_documento = facturaUtils.getInvoiceTypeCode(facturaJson);
    if (codigo_tipo_documento !== "01") {
      logger.warn(line(), "El archivo XML no corresponde a una factura válida");
      throw new ClientError("El archivo XML no corresponde a una factura válida");
    }

    const facturaCreate = facturaUtils.buildFacturaJson(facturaJson, facturaValidated.factura_xml[0].codigo_archivo, session_idusuario);
    const facturaCreated = await facturaDao.insertFactura(transaction1, facturaCreate);

    await procesarDatos(transaction1, facturaCreated._idfactura, facturaCreate.items, session_idusuario, facturaitemDao.insertFacturaitem);
    await procesarDatos(transaction1, facturaCreated._idfactura, facturaCreate.medios_pago, session_idusuario, facturamediopagoDao.insertFacturamediopago);
    await procesarDatos(transaction1, facturaCreated._idfactura, facturaCreate.terminos_pago, session_idusuario, facturaterminopagoDao.insertFacturaterminopago);
    await procesarDatos(transaction1, facturaCreated._idfactura, facturaCreate.impuesto.impuestos, session_idusuario, facturaimpuestoDao.insertFacturaimpuesto);
    await procesarDatos(transaction1, facturaCreated._idfactura, facturaCreate.notas, session_idusuario, facturanotaDao.insertFacturanota);

    const facturaxmlCreated = await crearFacturaXML(req, transaction1, facturaValidated, facturaCreated);
    logger.debug(line(), "facturaxmlCreated:", facturaxmlCreated);

    const facturapdfCreated = await crearFacturaPDF(req, transaction1, facturaValidated, facturaCreated);
    logger.debug(line(), "facturapdfCreated:", facturapdfCreated);

    await transaction1.commit();

    const transaction2 = await sequelizeFT.transaction();
    try {
      // Validar si el factoring ya existe

      // JCHR:20250213: Habillitar para producción
      /*
      const filter_estados_factoring = [1];
      const factoring_existe = await factoringDao.getFactoringByRucCedenteAndCodigoFactura(transaction2, facturaCreate.proveedor_ruc, facturaCreate.serie, facturaCreate.numero_comprobante, filter_estados_factoring);
      if (factoring_existe) {
        logger.warn(line(), "Factoring ya existe: [" + facturaCreate.proveedor_ruc + ", " + facturaCreate.serie + ", " + facturaCreate.numero_comprobante + ", " + filter_estados_factoring + "]");
        throw new ClientError("La factura seleccionada ya está vinculada a una operación de factoring activa. Por favor, elija otra factura para continuar con el proceso.", 404);
      }
        */

      var empresa = await empresaDao.getEmpresaByIdusuarioAndRuc(transaction2, session_idusuario, facturaCreate.proveedor_ruc, filter_estado);
      if (!empresa) {
        logger.warn(line(), "RUC no asociado al usuario: [" + session_idusuario + ", " + facturaCreate.proveedor_ruc + "]");
        throw new ClientError("Seleccione una factura perteneciente a una de las empresas asociadas a su cuenta. La empresa [" + facturaCreate.proveedor_razon_social + " (" + facturaCreate.proveedor_ruc + ")] no está asociada a su cuenta.", 404);
      }

      if (!facturaCreate.codigo_tipo_documento || facturaCreate.codigo_tipo_documento != "01") {
        logger.warn(line(), "Seleccione una factura válida");
        throw new ClientError("Seleccione una factura válida", 404);
      }

      if (!facturaCreate.pago_cantidad_cuotas || facturaCreate.pago_cantidad_cuotas <= 0) {
        logger.warn(line(), "Seleccione una factura que cuya forma de pago sea al Crédito. La factura que ha seleccionado es de pago al Contado.");
        throw new ClientError("Seleccione una factura que cuya forma de pago sea al Crédito. La factura que ha seleccionado es de pago al Contado.", 404);
      }

      if (!facturaCreate.pago_cantidad_cuotas || facturaCreate.pago_cantidad_cuotas != 1) {
        logger.warn(line(), "Seleccione una factura que sea al Crédito y de una sola cuota. La factura que ha seleccionado es de " + facturaCreate.pago_cantidad_cuotas + " cuotas.");
        throw new ClientError("Seleccione una factura que sea al Crédito y de una sola cuota. La factura que ha seleccionado es de " + facturaCreate.pago_cantidad_cuotas + " cuotas.", 404);
      }

      if (facturaCreate.dias_desde_emision > 8) {
        //throw new ClientError("Seleccione una factura que no haya transcurrido más de 8 días desde su fecha de emisión", 404);
      }

      const REGLA_MINIMO_DE_DIAS_PARA_PAGO = 8;
      if (facturaCreate.dias_estimados_para_pago <= REGLA_MINIMO_DE_DIAS_PARA_PAGO) {
        logger.warn(line(), "Seleccione una factura cuya fecha de vencimiento sea superior a " + REGLA_MINIMO_DE_DIAS_PARA_PAGO + " días.");
        throw new ClientError("Seleccione una factura cuya fecha de vencimiento sea superior a " + REGLA_MINIMO_DE_DIAS_PARA_PAGO + " días.", 404);
      }

      let cliente = await empresaDao.getEmpresaByRuc(transaction2, facturaCreate.cliente.ruc);
      if (!cliente) {
        const empresaCreate = {
          ruc: facturaCreate.cliente.ruc,
          razon_social: facturaCreate.cliente.razon_social,
          empresaid: uuidv4(),
          code: uuidv4().split("-")[0],
          idusuariocrea: session_idusuario,
          fechacrea: Sequelize.fn("now", 3),
          idusuariomod: session_idusuario,
          fechamod: Sequelize.fn("now", 3),
          estado: 1,
        };

        cliente = await empresaDao.insertEmpresa(transaction2, empresaCreate);
      }
      facturaCreate.cliente.empresaid = cliente.empresaid;

      let proveedor = await empresaDao.getEmpresaByRuc(transaction2, facturaCreate.proveedor.ruc);
      if (!proveedor) {
        const empresaCreate = {
          ruc: facturaCreate.proveedor.ruc,
          razon_social: facturaCreate.proveedor.razon_social,
          empresaid: uuidv4(),
          code: uuidv4().split("-")[0],
          idusuariocrea: session_idusuario,
          fechacrea: Sequelize.fn("now", 3),
          idusuariomod: session_idusuario,
          fechamod: Sequelize.fn("now", 3),
          estado: 1,
        };

        proveedor = await empresaDao.insertEmpresa(transaction2, empresaCreate);
      }
      facturaCreate.proveedor.empresaid = proveedor.empresaid;

      const moneda = await monedaDao.getMonedaByCodigo(transaction2, facturaCreate.codigo_tipo_moneda);
      facturaCreate.monedaid = moneda.monedaid;

      let facturaFiltered = jsonUtils.removeAttributesPrivates(facturaCreate);
      facturaFiltered = jsonUtils.removeAttributes(facturaCreate, ["items", "terminos_pago", "notas", "medios_pago"]);
      facturaFiltered = jsonUtils.removeAttributesPrivates(facturaFiltered, ["items", "terminos_pago", "notas", "medios_pago"]);

      await transaction2.commit();
      response(res, 200, facturaFiltered);
    } catch (error) {
      await transaction2.rollback();
      throw error;
    }
  } catch (error) {
    if (transaction1 && transaction1.finished !== "commit") {
      await transaction1.rollback();
    }
    throw error;
  }
};

const procesarDatos = async (transaction, _idfactura, items, _idusuario, insertFunction) => {
  const results = [];
  for (const item of items) {
    const factura_item = {
      _idfactura: _idfactura,
      idusuariocrea: _idusuario,
      fechacrea: Sequelize.fn("now", 3),
      idusuariomod: _idusuario,
      fechamod: Sequelize.fn("now", 3),
      estado: 1,
      ...item,
    };

    const result = await insertFunction(transaction, factura_item);
    results.push(result);
  }
  return results;
};

const crearFacturaPDF = async (req, transaction, facturaValidated, facturaCreated) => {
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
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  };
  const identificacionselfiCreated = await archivoDao.insertArchivo(transaction, identificacionselfiNew);

  await archivofacturaDao.insertArchivoFactura(transaction, {
    _idarchivo: identificacionselfiCreated._idarchivo,
    _idfactura: facturaCreated._idfactura,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  });

  fs.unlinkSync(archivoOrigen);
  return identificacionselfiCreated;
};

const crearFacturaXML = async (req, transaction, facturaValidated, facturaCreated) => {
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
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  };
  const identificacionselfiCreated = await archivoDao.insertArchivo(transaction, identificacionselfiNew);

  await archivofacturaDao.insertArchivoFactura(transaction, {
    _idarchivo: identificacionselfiCreated._idarchivo,
    _idfactura: facturaCreated._idfactura,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  });

  fs.unlinkSync(archivoOrigen);
  return identificacionselfiCreated;
};
