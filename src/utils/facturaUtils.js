import * as luxon from "luxon";
import { v4 as uuidv4 } from "uuid";
import { parseStringPromise } from "xml2js";
import * as fs from "fs";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line } from "#src/utils/logger.js";
import { Sequelize } from "sequelize";

export const buildFacturaJson = (result, codigo_archivo, _idusuario) => {
  const facturaJson = getFactura(result);
  facturaJson.codigo_archivo = codigo_archivo;
  const factura = {
    _idusuarioupload: _idusuario,
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
    idusuariocrea: _idusuario,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: _idusuario,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
    ...facturaJson,
  };
  return factura;
};

export const getInvoiceTypeCode = (invoice) => {
  return invoice?.Invoice?.InvoiceTypeCode?.[0]._ ?? invoice?.Invoice?.InvoiceTypeCode?.[0] ?? null;
};

export const procesarFacturaXML = async (file) => {
  let archivoXML = fs.readFileSync(file.path, "latin1");
  archivoXML = archivoXML.replace(/cbc:/g, "").replace(/cac:/g, "").replace(/n1:/g, "").replace(/n2:/g, "");
  let archivoJson = await parseStringPromise(archivoXML);

  const regexsYReemplazos = [
    [/\n|\r|\t/g, " "],
    [/\s{2,}/g, " "],
    [/^\s+|\s+$/g, ""],
  ];

  const result = jsonUtils.reemplazarValores(archivoJson, regexsYReemplazos);
  if (!result || !result?.Invoice) {
    logger.warn(line(), "En el archivo XML no existe el objeto result o result.Invoice");

    return null;
  }
  return result;
};

export const getFactura = (json) => {
  //Validamos el tipo de documento
  var codigo_tipo_documento = json.Invoice.InvoiceTypeCode?.[0]._ ?? json.Invoice.InvoiceTypeCode?.[0] ?? null;
  if (!codigo_tipo_documento || codigo_tipo_documento != "01") {
    throw new Error("El archivo no es una factura");
  }
  var facturaJson = {
    facturaid: uuidv4(),
    code: uuidv4().split("-")[0],
    serie: (json.Invoice.ID[0]._ ? json.Invoice.ID[0]._ : json.Invoice.ID[0]).split("-")[0],
    numero_comprobante: (json.Invoice.ID[0]._ ? json.Invoice.ID[0]._ : json.Invoice.ID[0]).split("-")[1],
    fecha_emision: json.Invoice.IssueDate[0]._ ?? json.Invoice.IssueDate[0] ?? null,
    hora_emision: json.Invoice.IssueTime?.[0]._ ?? json.Invoice.IssueTime?.[0] ?? null,
    fecha_vencimiento: json.Invoice.DueDate?.[0]._ ?? json.Invoice.DueDate?.[0] ?? null,
    codigo_tipo_documento: codigo_tipo_documento,
    UBLVersionID: json.Invoice.UBLVersionID?.[0]._ ?? json.Invoice.UBLVersionID?.[0] ?? null,
    CustomizationID: json.Invoice.CustomizationID?.[0]._ ?? json.Invoice.CustomizationID?.[0] ?? null,
    codigo_tipo_moneda: json.Invoice.DocumentCurrencyCode?.[0]._ ?? null,
    cantidad_items: json.Invoice.LineCountNumeric?.[0] ?? null,
    proveedor: {
      ruc: json.Invoice.AccountingSupplierParty[0].Party[0].PartyIdentification?.[0].ID[0]._ ?? null,
      razon_social: json.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationName[0] ?? null,
      direccion: json.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].AddressLine?.[0].Line[0] ?? null,
      codigo_pais: json.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].Country?.[0].IdentificationCode[0]._ ?? null,
      ubigeo: json.Invoice.AccountingSupplierParty?.[0].Party?.[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].ID?.[0]._ ?? null,
      provincia: json.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].CityName?.[0] ?? null,
      departamento: json.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].CountrySubentity?.[0] ?? null,
      urbanizacion: json.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].CitySubdivisionName?.[0] ?? null,
      distrito: json.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].District?.[0] ?? null,
    },
    cliente: {
      ruc: json.Invoice.AccountingCustomerParty[0].Party[0].PartyIdentification?.[0].ID[0]._ ?? null,
      razon_social: json.Invoice.AccountingCustomerParty[0].Party[0].PartyLegalEntity?.[0].RegistrationName[0] ?? null,
    },
    notas: (json.Invoice.Note || []).map(function (item) {
      let descripcion = "";
      let id = null;

      if (typeof item === "object") {
        descripcion = item._ ? item._.trim().replace(/\n|\r|\t/g, "") : null;
        id = item.$ ? item.$.languageLocaleID : null;
      } else if (typeof item === "string") {
        descripcion = item.trim().replace(/\n|\r|\t/g, "");
      }

      var nota = {
        facturanotaid: uuidv4(),
        id,
        descripcion,
      };
      return nota;
    }),
    medios_pago: (json.Invoice.PaymentMeans || []).map(function (item) {
      var medio_pago = {
        //item: item,
        facturamediopagoid: uuidv4(),
        id: item.ID[0] ?? null,
        medio_pago_codigo: item.PaymentMeansCode[0] ?? null,
        cuenta_bancaria: item.PayeeFinancialAccount?.[0].ID[0] ?? null,
      };

      return medio_pago;
    }),
    terminos_pago: (json.Invoice.PaymentTerms || []).map(function (item) {
      var termino_pago = {
        //item: item,
        facturaterminopagoid: uuidv4(),
        id: item.ID[0] ?? null,
        forma_pago: item.PaymentMeansID[0] ?? null,
        monto: item.Amount?.[0]._ ?? null,
        porcentaje: item.PaymentPercent?.[0] ?? null,
        fecha_pago: item.PaymentDueDate?.[0] ?? null,
      };

      return termino_pago;
    }),

    items: (json.Invoice.InvoiceLine || []).map(function (item) {
      var item_invoice = {
        //item: item,
        facturaitemid: uuidv4(),
        id: item.ID[0] ?? null,
        codigo_producto_sunat: item.Item[0].CommodityClassification?.[0].ItemClassificationCode[0]._ ? item.Item[0].CommodityClassification?.[0].ItemClassificationCode[0]._ : item.Item[0].CommodityClassification?.[0].ItemClassificationCode[0] ?? null,
        codigo_producto_vendedor: item.Item[0].SellersItemIdentification?.[0].ID[0] ?? null,
        unidad_medida: item.InvoicedQuantity[0].$.unitCode ?? null,
        cantidad: item.InvoicedQuantity[0]._ ?? null,
        descripcion: item.Item[0].Description[0] ?? null,
        valor_unitario: item.PricingReference[0].AlternativeConditionPrice[0].PriceAmount[0]._ ?? null,
        precio_venta: item.LineExtensionAmount[0]._ ?? null,
        impuesto_codigo_sunat: item.TaxTotal[0].TaxSubtotal[0].TaxCategory[0].TaxScheme[0].ID[0]._ ?? null,
        impuesto_nombre: item.TaxTotal[0].TaxSubtotal[0].TaxCategory[0].TaxScheme[0].Name[0] ?? null,
        impuesto_porcentaje: item.TaxTotal[0].TaxSubtotal[0].TaxCategory[0].Percent[0] ?? null,
        impuesto_codigo_afectacion_sunat: item.TaxTotal[0].TaxSubtotal[0].TaxCategory[0].TaxExemptionReasonCode[0]._ ?? null,
        impuesto_base_imponible: item.TaxTotal[0].TaxSubtotal[0].TaxableAmount[0]._ ?? null,
        impuesto_monto: item.TaxTotal[0].TaxSubtotal[0].TaxAmount[0]._ ?? null,

        moneda: item.LineExtensionAmount[0].$.currencyID ?? null,
      };
      return item_invoice;
    }),
    impuesto: {
      monto: json.Invoice.TaxTotal[0].TaxAmount[0]._ ?? null,
      impuestos: (json.Invoice.TaxTotal[0].TaxSubtotal || []).map(function (taxsubtotal) {
        // var info = { orderName: order.name, orderDesc: order.description };
        var impuesto_invoice = {
          //impuesto: taxsubtotal,
          facturaimpuestoid: uuidv4(),
          id: taxsubtotal.TaxCategory[0]?.ID?.[0]._ ?? null,
          codigo_sunat: taxsubtotal.TaxCategory[0].TaxScheme[0].ID?.[0]._ ?? taxsubtotal.TaxCategory[0].TaxScheme[0].ID?.[0] ?? null,
          nombre: taxsubtotal.TaxCategory[0].TaxScheme[0].Name?.[0] ?? null,
          porcentaje: taxsubtotal.TaxCategory[0].Percent?.[0] ?? null,
          base_imponible: taxsubtotal.TaxableAmount?.[0]._ ?? null,
          monto: taxsubtotal.TaxAmount[0]._ ?? null,
        };
        return impuesto_invoice;
      }),
      valor_venta: {
        monto_venta: json.Invoice.LegalMonetaryTotal[0].LineExtensionAmount[0]._ ?? null,
        monto_venta_mas_impuesto: json.Invoice.LegalMonetaryTotal[0].TaxInclusiveAmount?.[0]._ ?? null,
        monto_pago: json.Invoice.LegalMonetaryTotal[0].PayableAmount[0]._ ?? null,
      },
    },

    //pago_cantidad_cuotas: facturaUtils.contarCuotasDepago(this.terminos_pago || []),
    //
  };

  //Formatear para compatilidad con BBDD
  facturaJson.hora_emision = luxon.DateTime.fromISO(facturaJson.hora_emision).toFormat("HH:mm:ss");

  //facturaJson.fecha_registro = new Date();
  facturaJson.fecha_registro_para_calculos = luxon.DateTime.local().toISO();
  facturaJson.fecha_registro = luxon.DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
  facturaJson.detraccion_cantidad = contarDetracciones(facturaJson.terminos_pago || []);
  facturaJson.detraccion_monto = sumarMontosDetracciones(facturaJson.terminos_pago || []);
  facturaJson.pago_cantidad_cuotas = contarCuotasDepago(facturaJson.terminos_pago || []);
  facturaJson.fecha_pago_mayor_estimado = encontrarMayorFechaPago(facturaJson.terminos_pago || []);
  facturaJson.dias_desde_emision = restarFechas(facturaJson.fecha_registro_para_calculos, facturaJson.fecha_emision);
  facturaJson.dias_estimados_para_pago = restarFechas(facturaJson.fecha_pago_mayor_estimado, facturaJson.fecha_registro_para_calculos);
  facturaJson.importe_bruto = parseFloat(facturaJson.impuesto.valor_venta.monto_pago).toFixed(2);
  facturaJson.importe_neto = parseFloat(parseFloat(facturaJson.importe_bruto) - parseFloat(facturaJson.detraccion_monto)).toFixed(2);
  //logger.info(line(),facturaJson);
  //logger.info(line(),"Done");

  return facturaJson;
};

export const restarFechas = (fecha1, fecha2) => {
  // Verificar si alguna de las fechas es null
  if (!fecha1 || !fecha2) {
    return null;
  }

  // Convertir las fechas a objetos DateTime de Luxon
  const fecha1Luxon = luxon.DateTime.fromISO(fecha1).startOf("day");
  const fecha2Luxon = luxon.DateTime.fromISO(fecha2).startOf("day");

  // Validar si las fechas son válidas
  if (!fecha1Luxon.isValid) {
    throw new Error(`La fecha 1 "${fecha1}" no es válida.`);
  }

  if (!fecha2Luxon.isValid) {
    throw new Error(`La fecha 2 "${fecha2}" no es válida.`);
  }

  // Calcular la diferencia de días entre las fechas
  const diferenciaDias = fecha1Luxon.diff(fecha2Luxon, "days").days;

  // Redondear la diferencia de días y convertirla a un entero
  const diferenciaDiasEntero = Math.round(diferenciaDias);

  return diferenciaDiasEntero;
};

export const encontrarMayorFechaPago = (json) => {
  let mayorFechaPago = null;

  // Iterar sobre cada elemento del JSON
  for (const cuota of json) {
    // Verificar si es una cuota y si tiene una fecha de pago válida
    if (cuota.forma_pago && /^cuota/i.test(cuota.forma_pago) && cuota.fecha_pago) {
      const fechaPagoActual = luxon.DateTime.fromISO(cuota.fecha_pago);
      // Verificar si la fecha de pago es válida
      if (fechaPagoActual.isValid) {
        // Comparar la fecha actual con la mayor fecha encontrada hasta el momento
        if (!mayorFechaPago || fechaPagoActual > mayorFechaPago) {
          mayorFechaPago = fechaPagoActual;
        }
      } else {
        throw new Error(`La fecha de pago "${cuota.fecha_pago}" no es válida.`);
      }
    }
  }
  // Formatear la mayor fecha en el formato "yyyy-MM-dd"
  return mayorFechaPago ? mayorFechaPago.toFormat("yyyy-MM-dd") : null;
};

export const contarCuotasDepago = (json) => {
  const regex = /^cuota/i; // Expresión regular para hacer coincidir "Cuota" al principio, sin distinguir mayúsculas y minúsculas
  let cantidadCuotas = 0;

  // Iterar sobre cada elemento del JSON
  for (const cuota of json) {
    // Verificar si el valor de forma_pago comienza con "Cuota"
    if (regex.test(cuota.forma_pago)) {
      cantidadCuotas++;
    }
  }
  return cantidadCuotas;
};

// Suma los montos de las detracciones
export const sumarMontosDetracciones = (json) => {
  let sumaDetracciones = 0;

  // Iterar sobre cada elemento del JSON
  for (const elemento of json) {
    // Verificar si es una detracción (tiene id igual a "Detraccion")
    if (elemento.id === "Detraccion") {
      // Convertir el monto a número y sumarlo a la suma total
      sumaDetracciones += parseFloat(elemento.monto);
    }
  }

  return sumaDetracciones;
};

//Cuenta la cantidad de detraccione
export const contarDetracciones = (json) => {
  // Inicializar el contador en cero
  let cantidadDetracciones = 0;

  // Iterar sobre cada elemento del JSON
  for (const elemento of json) {
    // Verificar si es una detracción (tiene id igual a "Detraccion")
    if (elemento.id === "Detraccion") {
      // Convertir el monto a número y sumarlo a la suma total
      cantidadDetracciones++;
    }
  }

  // Devolver la cantidad de detracciones
  return cantidadDetracciones;
};
