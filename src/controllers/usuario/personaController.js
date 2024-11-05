//import * as personaDao from "../../daos/personaDao.js";
import * as empresaDao from "../../daos/empresaDao.js";
import * as bancoDao from "../../daos/bancoDao.js";
import * as cuentatipoDao from "../../daos/cuentatipoDao.js";
import * as monedaDao from "../../daos/monedaDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import * as storageUtils from "../../utils/storageUtils.js";
import * as validacionesYup from "../../utils/validacionesYup.js";
import * as fs from "fs";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const verifyPersona = async (req, res) => {
  let NAME_REGX = /^[a-zA-Z ]+$/;
  const personaVerifySchema = yup
    .object()
    .shape({
      identificacion_anverso: yup
        .mixed()
        .concat(validacionesYup.fileRequeridValidation())
        .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
        .concat(validacionesYup.fileTypeValidation(["image/png", "image/jpeg", "image/jpg"])),
      identificacion_reservo: yup
        .mixed()
        .concat(validacionesYup.fileRequeridValidation())
        .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
        .concat(validacionesYup.fileTypeValidation(["image/png", "image/jpeg", "image/jpg"])),
      identificacion_selfi: yup
        .mixed()
        .concat(validacionesYup.fileRequeridValidation())
        .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
        .concat(validacionesYup.fileTypeValidation(["image/png", "image/jpeg", "image/jpg"])),
      documentotipoid: yup.string().min(36).max(36).trim().required(),
      documentonumero: yup
        .string()
        .trim()
        .required()
        .matches(/^[0-9]*$/, "Ingrese solo números")
        .length(8),
      personanombres: yup.string().trim().required().matches(NAME_REGX, "Debe ser un nombre válido").min(2).max(100),
      apellidopaterno: yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
      apellidomaterno: yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
      paisnacionalidadid: yup.string().min(36).max(36).trim().required(),
      paisnacimientoid: yup.string().min(36).max(36).trim().required(),
      paisresidenciaid: yup.string().min(36).max(36).trim().required(),
      distritoresidenciaid: yup.string().min(36).max(36).trim().required(),
      generoid: yup.string().min(36).max(36).trim().required(),
      fechanacimiento: yup.date().required(),
      direccion: yup.string().trim().max(200).required(),
    })
    .required();
  const personaValidated = personaVerifySchema.validateSync({ ...req.files, ...req.body }, { abortEarly: false, stripUnknown: true });
  console.debug("personaValidated:", personaValidated);

  response(res, 200, {});
};

export const verifyPersona01 = async (req, res) => {
  console.log("Ingreso a uploadInvoice");

  console.log(req.file);
  console.log(req.files);
  console.log(req.body);
  console.log(req.param);

  for (const file of req.files) {
    console.log(file);

    /*
    var archivoXML = fs.readFileSync(file.path, "latin1");
    // console.log(archivoXML);
    archivoXML = archivoXML.replace(/cbc:/g, "");
    archivoXML = archivoXML.replace(/cac:/g, "");
    archivoXML = archivoXML.replace(/n1:/g, "");
    archivoXML = archivoXML.replace(/n2:/g, "");

    var archivoJson = await parseStringPromise(archivoXML);
    //jsonUtils.prettyPrint(archivoJson.Invoice);

    //jsonUtils.prettyPrint(result.Invoice);
    //Limpiamos los valores de posibles valore sno deseados
    // Definir los regex y los valores de reemplazo
    const regexsYReemplazos = [
      [/\n|\r|\t/g, " "], // Reemplazar saltos de línea, retornos de carro y tabuladores por un espacio
      [/\s{2,}/g, " "], // Reemplazar dos o más espacios por un solo espacio
      [/^\s+|\s+$/g, ""], // Trim: Eliminar espacios en blanco al principio y al final de la cadena
    ];

    var result = jsonUtils.reemplazarValores(archivoJson, regexsYReemplazos);
    if (!result || !result?.Invoice) {
      console.error("En el archivo XML no existe el objeto result o result.Invoice");
      throw new ClientError("El archivo carece de una estructura válida");
    }
    var codigo_tipo_documento = result?.Invoice?.InvoiceTypeCode?.[0]._ ?? result?.Invoice?.InvoiceTypeCode?.[0] ?? null;
    if (!codigo_tipo_documento || codigo_tipo_documento != "01") {
      console.error("El código del tipo de documento [" + codigo_tipo_documento + "] del archivo XML no corresponde al de una factura.");
      throw new ClientError("El archivo carece de una estructura válida");
    }

    var facturaJson = facturaUtils.getFactura(result);
    facturaJson.codigo_archivo = file.codigo_archivo;

    var factura = {
      proveedor_ruc: facturaJson.proveedor.ruc,
      proveedor_razon_social: facturaJson.proveedor.razon_social,
      proveedor_direccion: facturaJson.proveedor.direccion,
      proveedor_codigo_pais: facturaJson.proveedor.codigo_pais,
      proveedor_ubigeo: facturaJson.proveedor.ubigeo,
      proveedor_provincia: facturaJson.proveedor.provincia,
      proveedor_departamento: facturaJson.proveedor.departamento,
      proveedor_urbanizacion: facturaJson.proveedor.urbanizacion,
      proveedor_distrito: facturaJson.proveedor.distrito,
      cliente_ruc: facturaJson.cliente.ruc,
      cliente_razon_social: facturaJson.cliente.razon_social,
      impuestos_monto: facturaJson.impuesto.monto,
      impuestos_valor_venta_monto_venta: facturaJson.impuesto.valor_venta.monto_venta,
      impuestos_valor_venta_monto_venta_mas_impuesto: facturaJson.impuesto.valor_venta.monto_venta_mas_impuesto,
      impuestos_valor_venta_monto_pago: facturaJson.impuesto.valor_venta.monto_pago,
      ...facturaJson,
    };
    var factura_insertada = await facturaDao.insertarFactura(factura);
    facturaJson.medios_pago?.forEach(async function (medio_pago) {
      var factura_medio_pago = {
        _idfactura: factura_insertada.insertId,
        ...medio_pago,
      };
      await insertarFacturaMedioPago(factura_medio_pago);
    });
    facturaJson.terminos_pago.forEach(async function (termino_pago) {
      var factura_medio_pago = {
        _idfactura: factura_insertada.insertId,
        ...termino_pago,
      };
      await insertarFacturaTerminoPago(factura_medio_pago);
    });
    facturaJson.items.forEach(async function (item) {
      var factura_item = {
        _idfactura: factura_insertada.insertId,
        ...item,
      };
      await insertarFacturaItem(factura_item);
    });
    facturaJson.impuesto.impuestos.forEach(async function (impuesto) {
      var factura_impuesto = {
        _idfactura: factura_insertada.insertId,
        ...impuesto,
      };
      await insertarFacturaImpuesto(factura_impuesto);
    });
    facturaJson.notas?.forEach(async function (nota) {
      var factura_nota = {
        _idfactura: factura_insertada.insertId,
        ...nota,
      };
      await insertarFacturaNota(factura_nota);
    });

    const empresa = await empresaDao.getEmpresaByIdusuarioAndRuc(req, req.session_user.usuario._idusuario, factura.proveedor_ruc, 1);
    //console.log(empresa);
    if (!empresa) {
      throw new ClientError("Seleccione una factura perteneciente a una de las empresas asociadas a su cuenta. La empresa [" + factura.proveedor_razon_social + " (" + factura.proveedor_ruc + ")] no está asociada a su cuenta.", 404);
    }

    if (!facturaJson.codigo_tipo_documento || facturaJson.codigo_tipo_documento != "01") {
      throw new ClientError("Seleccione una factura válida", 404);
    }

    if (!facturaJson.pago_cantidad_cuotas || facturaJson.pago_cantidad_cuotas <= 0) {
      throw new ClientError("Seleccione una factura que cuya forma de pago sea al Crédito. La factura que ha seleccionado es de pago al Contado.", 404);
    }

    if (!facturaJson.pago_cantidad_cuotas || facturaJson.pago_cantidad_cuotas != 1) {
      throw new ClientError("Seleccione una factura que sea al Crédito y de una sola cuota. La factura que ha seleccionado es de " + facturaJson.pago_cantidad_cuotas + " cuotas.", 404);
    }

    if (facturaJson.dias_desde_emision > 8) {
      //throw new ClientError("Seleccione una factura que no haya transcurrido más de 8 días desde su fecha de emisión", 404);
    }

    var REGLA_MINIMO_DE_DIAS_PARA_PAGO = 8;
    if (facturaJson.dias_estimados_para_pago <= REGLA_MINIMO_DE_DIAS_PARA_PAGO) {
      throw new ClientError("Seleccione una factura cuya fecha de vencimiento sea superior a " + REGLA_MINIMO_DE_DIAS_PARA_PAGO + " días.", 404);
    }

    var cliente = await getEmpresaByRUCSinoExisteCrear(req, facturaJson.cliente.ruc, facturaJson.cliente);
    facturaJson.cliente.empresaid = cliente[0].empresaid;

    var proveedor = await getEmpresaByRUCSinoExisteCrear(req, facturaJson.proveedor.ruc, facturaJson.proveedor);
    facturaJson.proveedor.empresaid = proveedor[0].empresaid;

    var moneda = await monedaDao.getMonedaByCodigo(req, facturaJson.codigo_tipo_moneda);
    facturaJson.monedaid = moneda.monedaid;

    var facturaFiltered = jsonUtils.removeAttributesPrivates(facturaJson);
    facturaFiltered = jsonUtils.removeAttributes(facturaJson, ["items", "terminos_pago", "notas", "medios_pago"]);

    const origen = storageUtils.STORAGE_PATH_PROCESAR + "/" + file.filename;
    const destino = storageUtils.STORAGE_PATH_SUCCESS + "/" + file.filename;
    fs.renameSync(origen, destino);

    response(res, 200, facturaFiltered);
    */
  }
};
