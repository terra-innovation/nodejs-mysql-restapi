import { sequelizeFT } from "../../../config/bd/sequelize_db_factoring.js";
import * as cuentabancariaDao from "../../../daos/cuentabancariaDao.js";
import * as empresaDao from "../../../daos/empresaDao.js";
import * as factoringDao from "../../../daos/factoringDao.js";
import * as factoringfacturaDao from "../../../daos/factoringfacturaDao.js";
import * as facturaDao from "../../../daos/facturaDao.js";
import * as monedaDao from "../../../daos/monedaDao.js";
import { ClientError } from "../../../utils/CustomErrors.js";
import { response } from "../../../utils/CustomResponseOk.js";
import logger, { line } from "../../../utils/logger.js";

import * as luxon from "luxon";
import { Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const createFactoring = async (req, res) => {
  logger.debug(line(), "controller::createFactoring");
  const factoringCreateSchema = yup
    .object()
    .shape({
      facturas: yup
        .array()
        .of(
          yup.object({
            facturaid: yup.string().required().uuid(),
          })
        )
        .min(1),
      cedenteid: yup.string().trim().required().min(36).max(36),
      aceptanteid: yup.string().trim().required().min(36).max(36),
      cuentabancariaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      monto_neto: yup.string().required(),
      fecha_pago_estimado: yup.string().required(),
      dias_pago_estimado: yup.string().required(),
    })
    .required();
  var factoringValidated = factoringCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  //logger.debug(line(),"factoringValidated:", factoringValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const facturas = [];

    for (const [index, facturaid] of factoringValidated.facturas.entries()) {
      var factura = await facturaDao.getFacturaByFacturaid(transaction, facturaid.facturaid);
      if (!factura) {
        logger.warn(line(), "Factura no existe: [" + facturaid.facturaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      // Validar si el factoring ya existe
      /* JCHR:20250213: Habillitar para producción
      const factoring_existe = await factoringDao.getFactoringByRucAceptanteAndCodigoFactura(transaction, factura.cliente_ruc, factura.serie, factura.numero_comprobante, filter_estados);
      if (factoring_existe) {
        logger.warn(line(), "Factoring ya existe: [" + factura.cliente_ruc + ", " + factura.serie + ", " + factura.numero_comprobante + ", " + filter_estados + "]");
        throw new ClientError("La factura seleccionada ya está vinculada a una operación de factoring activa. Por favor, elija otra factura para continuar con el proceso.", 404);
      }
        */

      facturas.push(factura);
    }

    var cedente = await empresaDao.findEmpresaPk(transaction, factoringValidated.cedenteid);
    if (!cedente) {
      logger.warn(line(), "Cedente no existe: [" + factoringValidated.cedenteid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var aceptante = await empresaDao.findEmpresaPk(transaction, factoringValidated.aceptanteid);
    if (!aceptante) {
      logger.warn(line(), "Aceptante no existe: [" + factoringValidated.aceptanteid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentabancaria = await cuentabancariaDao.findCuentabancariaPk(transaction, factoringValidated.cuentabancariaid);
    if (!cuentabancaria) {
      logger.warn(line(), "Cuenta bancaria  no existe: [" + factoringValidated.cuentabancariaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var moneda = await monedaDao.findMonedaPk(transaction, factoringValidated.monedaid);
    if (!moneda) {
      logger.warn(line(), "Moneda no existe: [" + factoringValidated.monedaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposFk = {};
    camposFk._idcedente = cedente._idempresa;
    camposFk._idaceptante = aceptante._idempresa;
    camposFk._idcuentabancaria = cuentabancaria._idcuentabancaria;
    camposFk._idmoneda = moneda._idmoneda;
    camposFk._idfactoringtipo = 1; // Por defecto
    camposFk._idfactoringestado = 1; // Por defecto

    var camposAdicionales = {};
    camposAdicionales.factoringid = uuidv4();
    camposAdicionales.code = uuidv4().split("-")[0];
    camposAdicionales.fecha_registro = luxon.DateTime.now().toISO();
    camposAdicionales.cantidad_facturas = factoringValidated.facturas.length;

    var camposAuditoria = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const factoringCreated = await factoringDao.insertFactoring(transaction, { ...camposFk, ...camposAdicionales, ...factoringValidated, ...camposAuditoria });
    logger.debug(line(), "factoringCreated:", factoringCreated);

    for (const [index, factura] of facturas.entries()) {
      var factoringfacturaFk = {};
      factoringfacturaFk._idfactoring = factoringCreated._idfactoring;
      factoringfacturaFk._idfactura = factura._idfactura;
      const factoringfacturaCreated = await factoringfacturaDao.insertFactoringfactura(transaction, { ...factoringfacturaFk, ...camposAuditoria });
      logger.debug(line(), "factoringfacturaCreated:", factoringfacturaCreated);
    }

    await transaction.commit();
    response(res, 201, { ...camposAdicionales, ...factoringValidated });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
