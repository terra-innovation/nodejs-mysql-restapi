import { poolFactoring } from "../config/bd/mysql2_db_factoring.js";
import { insertarFactura } from "../daos/factura.dao.js";
import { insertarFacturaMedioPago } from "../daos/factura_medio_pago.dao.js";
import { insertarFacturaTerminoPago } from "../daos/factura_termino_pago.dao.js";
import { insertarFacturaItem } from "../daos/factura_item.dao.js";
import { insertarFacturaImpuesto } from "../daos/factura_impuesto.dao.js";
import date from "date-and-time";
import multer from "multer";
import xml2js from "xml2js";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";

const upload = multer({ dest: "./src/uploads" });

let storage_invoice = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/uploads");
  },
  filename: (req, file, cb) => {
    //console.log(file);
    const uniqueSuffix = date.format(new Date(), "YYYYMMDD_HHmmss_SSS") + "_" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "_" + file.originalname);
  },
});
const upload_invoice = multer({
  storage: storage_invoice,
  limits: { fileSize: 2 * 1024 * 1024, files: 5, fields: 10 },
  fileFilter: function (req, file, cb) {
    //console.log("fileFilter");
    //console.log("file.mimetype: " + file.mimetype);
    if (file.mimetype !== "text/xml" && file.mimetype !== "application/xml") {
      cb(new Error("Formato de archivo inválido"));
    }
    cb(null, true);
  },
}).array("invoice", 2);

export const uploadInvoice = async (req, res) => {
  try {
    //console.log("Ingreso a uploadInvoice");

    //console.log(req.file);
    //console.log(req.files);
    //console.log(req.body);
    upload_invoice(req, res, function (err) {
      //console.log("Ingreso a upload_invoice");
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        if (err.code == "LIMIT_FILE_SIZE") {
          return res.status(404).send({
            message: "El archivo supera el máximo tamaño permitido de 2 MB",
          });
        } else if (err.code == "LIMIT_UNEXPECTED_FILE") {
          return res.status(404).send({
            message: "El máximo de archivos a cargar es 1",
          });
        } else {
          console.log(err);
          return res.status(404).send({
            message: "El archivo no fue posible cargar",
          });
        }
      } else if (err) {
        console.log(err);
        // An unknown error occurred when uploading.
        return res.status(500).json({ message: err.message });
      } else if (!req.files) {
        // FILE NOT SELECTED
        return res.status(404).json({ message: "El archivo es requerido" });
      }

      // Everything went fine.
      //console.log(req.file);
      //console.log(req.files);
      //console.log(req.body);

      //console.log(req.files[0].path);
      var parser = new xml2js.Parser();
      req.files.forEach(function (file) {
        //console.log("Filename: " + file.path);
        fs.readFile(file.path, "utf8", function (err, data) {
          data = data.replace(/cbc\:/g, "");
          data = data.replace(/cac\:/g, "");
          data = data.replace(/n1\:/g, "");
          data = data.replace(/n2\:/g, "");
          //return res.json(data);
          var resultadojson = parser.parseString(data, async function (err, result) {
            //return res.json(result.Invoice.ID[0]._ ? result.Invoice.ID[0]._ : result.Invoice.ID[0]);
            //console.dir(result.Invoice.ID[0]);
            try {
              var datajson = {
                facturaid: uuidv4(),
                code: uuidv4().split("-")[0],
                serie: (result.Invoice.ID[0]._ ? result.Invoice.ID[0]._ : result.Invoice.ID[0]).split("-")[0],
                numero_comprobante: (result.Invoice.ID[0]._ ? result.Invoice.ID[0]._ : result.Invoice.ID[0]).split("-")[1],
                fecha_emision: result.Invoice.IssueDate[0]._ ? result.Invoice.IssueDate[0]._ : result.Invoice.IssueDate[0],
                hora_emision: result.Invoice.IssueTime[0]._ ? result.Invoice.IssueTime[0]._ : result.Invoice.IssueTime[0],
                fecha_vencimiento: result.Invoice.DueDate?.[0]._ ? result.Invoice.DueDate?.[0]._ : result.Invoice.DueDate?.[0],
                codigo_tipo_documento: result.Invoice.InvoiceTypeCode[0]._,
                nota: result.Invoice.Note?.[0]._ ? result.Invoice.Note[0]._ : result.Invoice.Note,
                codigo_tipo_moneda: result.Invoice.DocumentCurrencyCode?.[0]._,
                cantidad_items: result.Invoice.LineCountNumeric?.[0],
                proveedor: {
                  ruc: result.Invoice.AccountingSupplierParty[0].Party[0].PartyIdentification?.[0].ID[0]._,
                  razon_social: result.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationName[0],
                  direccion: result.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].AddressLine[0].Line[0],
                  codigo_pais: result.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].Country[0].IdentificationCode[0]._,
                  ubigeo: result.Invoice.AccountingSupplierParty?.[0].Party?.[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].ID?.[0]._,
                  provincia: result.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].CityName[0],
                  departamento: result.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].CountrySubentity[0],
                  urbanizacion: result.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].CitySubdivisionName?.[0],
                  distrito: result.Invoice.AccountingSupplierParty[0].Party[0].PartyLegalEntity?.[0].RegistrationAddress?.[0].District?.[0],
                },
                cliente: {
                  ruc: result.Invoice.AccountingCustomerParty[0].Party[0].PartyIdentification?.[0].ID[0]._,
                  razon_social: result.Invoice.AccountingCustomerParty[0].Party[0].PartyLegalEntity?.[0].RegistrationName[0],
                },
                medios_pago: result.Invoice.PaymentMeans?.map(function (item) {
                  var medio_pago = {
                    //item: item,
                    facturamediopagoid: uuidv4(),
                    id: item.ID[0],
                    medio_pago_codigo: item.PaymentMeansCode[0],
                    cuenta_bancaria: item.PayeeFinancialAccount?.[0].ID[0],
                  };

                  return medio_pago;
                }),
                terminos_pago: result.Invoice.PaymentTerms.map(function (item) {
                  var termino_pago = {
                    //item: item,
                    facturaterminopagoid: uuidv4(),
                    id: item.ID[0],
                    forma_pago: item.PaymentMeansID[0],
                    monto: item.Amount?.[0]._,
                    porcentaje: item.PaymentPercent?.[0],
                    fecha_pago: item.PaymentDueDate?.[0],
                  };

                  return termino_pago;
                }),

                items: result.Invoice.InvoiceLine.map(function (item) {
                  var item_invoice = {
                    //item: item,
                    facturaitemid: uuidv4(),
                    id: item.ID[0],
                    codigo_producto_sunat: item.Item[0].CommodityClassification?.[0].ItemClassificationCode[0]._
                      ? item.Item[0].CommodityClassification?.[0].ItemClassificationCode[0]._
                      : item.Item[0].CommodityClassification?.[0].ItemClassificationCode[0],
                    codigo_producto_vendedor: item.Item[0].SellersItemIdentification?.[0].ID[0],
                    unidad_medida: item.InvoicedQuantity[0].$.unitCode,
                    cantidad: item.InvoicedQuantity[0]._,
                    descripcion: item.Item[0].Description[0],
                    valor_unitario: item.PricingReference[0].AlternativeConditionPrice[0].PriceAmount[0]._,
                    precio_venta: item.LineExtensionAmount[0]._,
                    impuesto_codigo_sunat: item.TaxTotal[0].TaxSubtotal[0].TaxCategory[0].TaxScheme[0].ID[0]._,
                    impuesto_nombre: item.TaxTotal[0].TaxSubtotal[0].TaxCategory[0].TaxScheme[0].Name[0],
                    impuesto_porcentaje: item.TaxTotal[0].TaxSubtotal[0].TaxCategory[0].Percent[0],
                    impuesto_codigo_afectacion_sunat: item.TaxTotal[0].TaxSubtotal[0].TaxCategory[0].TaxExemptionReasonCode[0]._,
                    impuesto_base_imponible: item.TaxTotal[0].TaxSubtotal[0].TaxableAmount[0]._,
                    impuesto_monto: item.TaxTotal[0].TaxSubtotal[0].TaxAmount[0]._,

                    moneda: item.LineExtensionAmount[0].$.currencyID,
                  };
                  return item_invoice;
                }),
                impuesto: {
                  monto: result.Invoice.TaxTotal[0].TaxAmount[0]._,
                  impuestos: result.Invoice.TaxTotal[0].TaxSubtotal.map(function (taxsubtotal) {
                    // var info = { orderName: order.name, orderDesc: order.description };
                    var impuesto_invoice = {
                      //impuesto: taxsubtotal,
                      facturaimpuestoid: uuidv4(),
                      id: taxsubtotal.TaxCategory[0]?.ID?.[0]._,
                      codigo_sunat: taxsubtotal.TaxCategory[0].TaxScheme[0].ID?.[0]._ ? taxsubtotal.TaxCategory[0].TaxScheme[0].ID[0]._ : taxsubtotal.TaxCategory[0].TaxScheme[0].ID?.[0],
                      nombre: taxsubtotal.TaxCategory[0].TaxScheme[0].Name?.[0],
                      porcentaje: taxsubtotal.TaxCategory[0].Percent?.[0],
                      base_imponible: taxsubtotal.TaxableAmount?.[0]._,
                      monto: taxsubtotal.TaxAmount[0]._,
                    };
                    return impuesto_invoice;
                  }),
                  valor_venta: {
                    monto_venta: result.Invoice.LegalMonetaryTotal[0].LineExtensionAmount[0]._,
                    monto_venta_mas_impuesto: result.Invoice.LegalMonetaryTotal[0].TaxInclusiveAmount?.[0]._,
                    monto_pago: result.Invoice.LegalMonetaryTotal[0].PayableAmount[0]._,
                  },
                },
              };
              //console.log(datajson);
              //console.log("Done");

              var factura = {
                facturaid: datajson.facturaid,
                code: datajson.code,
                serie: datajson.serie,
                numero_comprobante: datajson.numero_comprobante,
                fecha_emision: datajson.fecha_emision,
                hora_emision: datajson.hora_emision,
                fecha_vencimiento: datajson.fecha_vencimiento,
                codigo_tipo_documento: datajson.codigo_tipo_documento,
                nota: datajson.nota,
                codigo_tipo_moneda: datajson.codigo_tipo_moneda,
                cantidad_items: datajson.cantidad_items,
                proveedor_ruc: datajson.proveedor.ruc,
                proveedor_razon_social: datajson.proveedor.razon_social,
                proveedor_direccion: datajson.proveedor.direccion,
                proveedor_codigo_pais: datajson.proveedor.codigo_pais,
                proveedor_ubigeo: datajson.proveedor.ubigeo,
                proveedor_provincia: datajson.proveedor.provincia,
                proveedor_departamento: datajson.proveedor.departamento,
                proveedor_urbanizacion: datajson.proveedor.urbanizacion,
                proveedor_distrito: datajson.proveedor.distrito,
                cliente_ruc: datajson.cliente.ruc,
                cliente_razon_social: datajson.cliente.razon_social,
                impuestos_monto: datajson.impuesto.monto,
                impuestos_valor_venta_monto_venta: datajson.impuesto.valor_venta.monto_venta,
                impuestos_valor_venta_monto_venta_mas_impuesto: datajson.impuesto.valor_venta.monto_venta_mas_impuesto,
                impuestos_valor_venta_monto_pago: datajson.impuesto.valor_venta.monto_pago,
              };
              var factura_insertada = await insertarFactura(factura);
              datajson.medios_pago?.forEach(async function (medio_pago) {
                var factura_medio_pago = {
                  facturamediopagoid: medio_pago.facturamediopagoid,
                  idfactura: factura_insertada.insertId,
                  id: medio_pago.id,
                  medio_pago_codigo: medio_pago.medio_pago_codigo,
                  cuenta_bancaria: medio_pago.cuenta_bancaria,
                };
                await insertarFacturaMedioPago(factura_medio_pago);
              });
              datajson.terminos_pago.forEach(async function (termino_pago) {
                var factura_medio_pago = {
                  facturaterminopagoid: termino_pago.facturaterminopagoid,
                  idfactura: factura_insertada.insertId,
                  id: termino_pago.id,
                  forma_pago: termino_pago.forma_pago,
                  monto: termino_pago.monto,
                  porcentaje: termino_pago.porcentaje,
                  fecha_pago: termino_pago.fecha_pago,
                };
                await insertarFacturaTerminoPago(factura_medio_pago);
              });
              datajson.items.forEach(async function (item) {
                var factura_item = {
                  facturaitemid: item.facturaitemid,
                  idfactura: factura_insertada.insertId,
                  id: item.id,
                  codigo_producto_sunat: item.codigo_producto_sunat,
                  codigo_producto_vendedor: item.codigo_producto_vendedor,
                  unidad_medida: item.unidad_medida,
                  cantidad: item.cantidad,
                  descripcion: item.descripcion,
                  valor_unitario: item.valor_unitario,
                  precio_venta: item.precio_venta,
                  impuesto_codigo_sunat: item.impuesto_codigo_sunat,
                  impuesto_nombre: item.impuesto_nombre,
                  impuesto_porcentaje: item.impuesto_porcentaje,
                  impuesto_codigo_afectacion_sunat: item.impuesto_codigo_afectacion_sunat,
                  impuesto_base_imponible: item.impuesto_base_imponible,
                  impuesto_monto: item.impuesto_monto,
                  moneda: item.moneda,
                };
                await insertarFacturaItem(factura_item);
              });
              datajson.impuesto.impuestos.forEach(async function (impuesto) {
                var factura_impuesto = {
                  facturaimpuestoid: impuesto.facturaimpuestoid,
                  idfactura: factura_insertada.insertId,
                  id: impuesto.id,
                  codigo_sunat: impuesto.codigo_sunat,
                  nombre: impuesto.nombre,
                  porcentaje: impuesto.porcentaje,
                  base_imponible: impuesto.base_imponible,
                  monto: impuesto.monto,
                };
                await insertarFacturaImpuesto(factura_impuesto);
              });
              return res.json(datajson);
            } catch (error) {
              console.log("aqui");
              console.log(error);
              return res.status(500).json({ message: "Something goes wrong" });
            }
          });
        });
      });
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const [rows] = await poolFactoring.query("SELECT * FROM employee");
    res.json(rows);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const getTrabajadoresPorRuc = async (req, res) => {
  try {
    const { ruc } = req.params;
    const query = `
    SELECT se.ruc, se.nombreempresa, st.ano, st.mes, st.canttrabajador, st.cantpensionista, st.cantservicio, st.fechamod, CONCAT(se.ruc, " ", se.nombreempresa) AS empresa 
    FROM dwh_sunat_empresa se 
    INNER JOIN dwh_sunat_trabajador st ON st.ruc = se.ruc 
    WHERE se.ruc = ? 
    `;

    const [rows] = await poolFactoring.query(query, [ruc]);

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(rows);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await poolFactoring.query("DELETE FROM employee WHERE id = ?", [id]);

    if (rows.affectedRows <= 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { name, salary } = req.body;
    const [rows] = await poolFactoring.query("INSERT INTO employee (name, salary) VALUES (?, ?)", [name, salary]);
    res.status(201).json({ id: rows.insertId, name, salary });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, salary } = req.body;

    const [result] = await poolFactoring.query("UPDATE employee SET name = IFNULL(?, name), salary = IFNULL(?, salary) WHERE id = ?", [name, salary, id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Employee not found" });

    const [rows] = await poolFactoring.query("SELECT * FROM employee WHERE id = ?", [id]);

    res.json(rows[0]);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};
