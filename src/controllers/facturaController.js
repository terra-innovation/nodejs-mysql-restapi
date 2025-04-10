import { poolFactoring } from "#src/config/bd/mysql2_db_factoring.js";
import * as facturaDao from "#src/daos/factura.dao.js";
import * as empresaDao from "#src/daos/empresaDao.js";
import * as monedaDao from "#src/daos/monedaDao.js";
import { insertarFacturaMedioPago } from "#src/daos/factura_medio_pago.dao.js";
import { insertarFacturaTerminoPago } from "#src/daos/factura_termino_pago.dao.js";
import { insertarFacturaItem } from "#src/daos/factura_item.dao.js";
import { insertarFacturaNota } from "#src/daos/factura_nota.dao.js";
import { insertarFacturaImpuesto } from "#src/daos/factura_impuesto.dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";

import * as facturaUtils from "#src/utils/facturaUtils.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import { parseStringPromise } from "xml2js";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";
import * as luxon from "luxon";

export const uploadInvoice = async (req, res) => {
  logger.debug(line(), "controller::uploadInvoice");

  //logger.info(line(),req.file);
  //logger.info(line(),req.files);
  //logger.info(line(),req.body);

  for (const file of req.files) {
    const transaction = await sequelizeFT.transaction();
    try {
      //logger.info(line(),file);

      var archivoXML = fs.readFileSync(file.path, "latin1");
      // logger.info(line(),archivoXML);
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
        logger.error(line(), "En el archivo XML no existe el objeto result o result.Invoice");
        throw new ClientError("El archivo carece de una estructura válida");
      }
      var codigo_tipo_documento = result?.Invoice?.InvoiceTypeCode?.[0]._ ?? result?.Invoice?.InvoiceTypeCode?.[0] ?? null;
      if (!codigo_tipo_documento || codigo_tipo_documento != "01") {
        logger.error(line(), "El código del tipo de documento [" + codigo_tipo_documento + "] del archivo XML no corresponde al de una factura.");
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

      const empresa = await empresaDao.getEmpresaByIdusuarioAndRuc(transaction, req.session_user.usuario._idusuario, factura.proveedor_ruc, 1);
      //logger.info(line(),empresa);
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

      var cliente = await getEmpresaByRUCSinoExisteCrear(transaction, facturaJson.cliente.ruc, facturaJson.cliente);
      facturaJson.cliente.empresaid = cliente[0].empresaid;

      var proveedor = await getEmpresaByRUCSinoExisteCrear(transaction, facturaJson.proveedor.ruc, facturaJson.proveedor);
      facturaJson.proveedor.empresaid = proveedor[0].empresaid;

      var moneda = await monedaDao.getMonedaByCodigo(transaction, facturaJson.codigo_tipo_moneda);
      facturaJson.monedaid = moneda.monedaid;

      var facturaFiltered = jsonUtils.removeAttributesPrivates(facturaJson);
      facturaFiltered = jsonUtils.removeAttributes(facturaJson, ["items", "terminos_pago", "notas", "medios_pago"]);

      const origen = storageUtils.STORAGE_PATH_PROCESAR + "/" + file.filename;
      const destino = storageUtils.STORAGE_PATH_SUCCESS + "/" + file.filename;
      fs.renameSync(origen, destino);

      await transaction.commit();
      response(res, 200, facturaFiltered);
    } catch (error) {
      await safeRollback(transaction);
      throw error;
    }
  }
};

export const getEmployees = async (req, res) => {
  logger.debug(line(), "controller::getEmployees");
  try {
    const [rows] = await poolFactoring.query("SELECT * FROM employee");
    res.json(rows);
  } catch (error) {
    logger.error(line(), error.message);
    return res.status(500).json({ message: "Ocurrió un error. Vuelva a intentarlo en unos momentos." });
  }
};

export const getTrabajadoresPorRuc = async (req, res) => {
  logger.debug(line(), "controller::getTrabajadoresPorRuc");
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
    logger.error(line(), error.message);
    return res.status(500).json({ message: "Ocurrió un error. Vuelva a intentarlo en unos momentos." });
  }
};

export const deleteEmployee = async (req, res) => {
  logger.debug(line(), "controller::deleteEmployee");
  try {
    const { id } = req.params;
    const [rows] = await poolFactoring.query("DELETE FROM employee WHERE id = ?", [id]);

    if (rows.affectedRows <= 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.sendStatus(204);
  } catch (error) {
    logger.error(line(), error.message);
    return res.status(500).json({ message: "Ocurrió un error. Vuelva a intentarlo en unos momentos." });
  }
};

export const createEmployee = async (req, res) => {
  logger.debug(line(), "controller::createEmployee");
  try {
    const { name, salary } = req.body;
    const [rows] = await poolFactoring.query("INSERT INTO employee (name, salary) VALUES (?, ?)", [name, salary]);
    res.status(201).json({ id: rows.insertId, name, salary });
  } catch (error) {
    logger.error(line(), error.message);
    return res.status(500).json({ message: "Ocurrió un error. Vuelva a intentarlo en unos momentos." });
  }
};

export const updateEmployee = async (req, res) => {
  logger.debug(line(), "controller::updateEmployee");
  try {
    const { id } = req.params;
    const { name, salary } = req.body;

    const [result] = await poolFactoring.query("UPDATE employee SET name = IFNULL(?, name), salary = IFNULL(?, salary) WHERE id = ?", [name, salary, id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Employee not found" });

    const [rows] = await poolFactoring.query("SELECT * FROM employee WHERE id = ?", [id]);

    res.json(rows[0]);
  } catch (error) {
    logger.error(line(), error.message);
    return res.status(500).json({ message: "Ocurrió un error. Vuelva a intentarlo en unos momentos." });
  }
};

const getEmpresaByRUCSinoExisteCrear = async (transaction, ruc, empresa) => {
  var cliente = await empresaDao.getEmpresaByRuc(transaction, ruc);
  if (cliente.length == 0) {
    const empresaCreateSchema = yup
      .object()
      .shape({
        ruc: yup.string().trim().required().min(11).max(11),
        razon_social: yup.string().required().max(200),
      })
      .required();
    var empresaValidated = empresaCreateSchema.validateSync(empresa, { abortEarly: false, stripUnknown: true });
    logger.debug(line(), "empresaValidated:", empresaValidated);

    var camposAdicionales = {};
    camposAdicionales.empresaid = uuidv4();
    camposAdicionales.code = uuidv4().split("-")[0];

    var camposAuditoria = {};
    camposAuditoria.idusuariocrea = 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const empresaCreated = await empresaDao.insertEmpresa(transaction, { ...camposAdicionales, ...empresaValidated, ...camposAuditoria });
    logger.debug(line(), "Create empresa: ID:" + empresaCreated.idempresa + " | " + camposAdicionales.empresaid);
    logger.debug(line(), "empresaCreated:", empresaCreated.dataValues);
    if (empresaCreated) {
      cliente = await empresaDao.getEmpresaByRuc(transaction, ruc);
    }
  }
  return cliente;
};
