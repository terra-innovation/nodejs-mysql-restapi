import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import * as cuentabancariaDao from "#src/daos/cuentabancariaDao.js";
import * as empresaDao from "#src/daos/empresaDao.js";
import * as personaDao from "#src/daos/personaDao.js";
import * as factoringDao from "#src/daos/factoringDao.js";
import * as factoringfacturaDao from "#src/daos/factoringfacturaDao.js";
import * as factoringhistorialestadoDao from "#src/daos/factoringhistorialestadoDao.js";
import * as facturaDao from "#src/daos/facturaDao.js";
import * as contactoDao from "#src/daos/contactoDao.js";
import * as colaboradorDao from "#src/daos/colaboradorDao.js";
import * as monedaDao from "#src/daos/monedaDao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { log, line } from "#src/utils/logger.pino.js";
import { safeRollback } from "#src/utils/transactionUtils.js";

import * as luxon from "luxon";
import { Sequelize, Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { FactoringAttributes } from "#root/src/models/ft_factoring/Factoring";
import { FactoringFacturaAttributes } from "#root/src/models/ft_factoring/FactoringFactura";

export const getFactorings = async (req, res) => {
  log.debug(line(), "controller::getFactorings");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const _idusuario_session = req.session_user.usuario._idusuario;
    const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(transaction, _idusuario_session, filter_estados);
    const _idcedentes = empresas_cedentes.map((empresa) => empresa._idempresa);
    const factorings = await factoringDao.getFactoringsByIdcedentes(transaction, _idcedentes, filter_estados);
    await transaction.commit();
    response(res, 201, factorings);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getFactoringMaster = async (req, res) => {
  log.debug(line(), "controller::getFactoringsMaster");
  const filter_estados = [1];

  const transaction = await sequelizeFT.transaction();
  try {
    await transaction.commit();
    response(res, 201, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createFactoring = async (req, res) => {
  log.debug(line(), "controller::createFactoring");
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
      contactoaceptanteid: yup.string().trim().required().min(36).max(36),
      monto_neto: yup.string().required(),
      fecha_pago_estimado: yup.string().required(),
      dias_pago_estimado: yup.string().required(),
    })
    .required();
  var factoringValidated = factoringCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  //log.debug(line(),"factoringValidated:", factoringValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estados = [1];
    const facturas = [];

    for (const [index, facturaid] of factoringValidated.facturas.entries()) {
      var factura = await facturaDao.getFacturaByFacturaid(transaction, facturaid.facturaid);
      if (!factura) {
        log.warn(line(), "Factura no existe: [" + facturaid.facturaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      // Validar si el factoring ya existe
      //JCHR:20250213: Habillitar para producción
      /*
      const filter_estados_factoring = [1];
      const factoring_existe = await factoringDao.getFactoringByRucCedenteAndCodigoFactura(transaction, factura.proveedor_ruc, factura.serie, factura.numero_comprobante, filter_estados_factoring);
      if (factoring_existe) {
        log.warn(line(), "Factoring ya existe: [" + factura.proveedor_ruc + ", " + factura.serie + ", " + factura.numero_comprobante + ", " + filter_estados_factoring + "]");
        throw new ClientError("La factura seleccionada ya está vinculada a una operación de factoring activa. Por favor, elija otra factura para continuar con el proceso.", 404);
      }
        */

      facturas.push(factura);
    }

    var cedente = await empresaDao.findEmpresaPk(transaction, factoringValidated.cedenteid);
    if (!cedente) {
      log.warn(line(), "Cedente no existe: [" + factoringValidated.cedenteid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var aceptante = await empresaDao.findEmpresaPk(transaction, factoringValidated.aceptanteid);
    if (!aceptante) {
      log.warn(line(), "Aceptante no existe: [" + factoringValidated.aceptanteid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentabancaria = await cuentabancariaDao.findCuentabancariaPk(transaction, factoringValidated.cuentabancariaid);
    if (!cuentabancaria) {
      log.warn(line(), "Cuenta bancaria  no existe: [" + factoringValidated.cuentabancariaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var moneda = await monedaDao.findMonedaPk(transaction, factoringValidated.monedaid);
    if (!moneda) {
      log.warn(line(), "Moneda no existe: [" + factoringValidated.monedaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var persona = await personaDao.getPersonaByIdusuario(transaction, session_idusuario);
    if (!persona) {
      log.warn(line(), "Persona no existe: [" + session_idusuario + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var contactoaceptante = await contactoDao.getContactoByContactoid(transaction, factoringValidated.contactoaceptanteid);
    if (!contactoaceptante) {
      log.warn(line(), "Contacto aceptante no existe: [" + factoringValidated.contactoaceptanteid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var colaborador = await colaboradorDao.getColaboradorByIdEmpresaAndIdpersona(transaction, cedente._idempresa, persona._idpersona);
    if (!colaborador) {
      log.warn(line(), "Contacto cedente no existe: [" + cedente._idempresa + ", " + persona._idpersona + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposFk: Partial<FactoringAttributes> = {};
    camposFk._idcedente = cedente._idempresa;
    camposFk._idaceptante = aceptante._idempresa;
    camposFk._idcuentabancaria = cuentabancaria._idcuentabancaria;
    camposFk._idmoneda = moneda._idmoneda;
    camposFk._idcontactoaceptante = contactoaceptante._idcontacto;
    camposFk._idcontactocedente = colaborador._idcolaborador;
    camposFk._idfactoringestado = 1; // Por defecto

    var camposAdicionales: Partial<FactoringAttributes> = {};
    camposAdicionales.factoringid = uuidv4();
    camposAdicionales.code = uuidv4().split("-")[0];
    camposAdicionales.fecha_registro = Sequelize.fn("now", 3);
    camposAdicionales.fecha_emision = facturas.reduce((min, item) => (!min || new Date(item.fecha_emision) < new Date(min) ? item.fecha_emision : min), null);
    camposAdicionales.cantidad_facturas = factoringValidated.facturas.length;
    camposAdicionales.monto_factura = facturas.reduce((acc, item) => acc + (typeof item.importe_bruto === "number" ? item.importe_bruto : 0), 0);
    camposAdicionales.monto_detraccion = facturas.reduce((acc, item) => acc + (typeof item.detraccion_monto === "number" ? item.detraccion_monto : 0), 0);
    camposAdicionales.monto_neto = facturas.reduce((acc, item) => acc + (typeof item.importe_neto === "number" ? item.importe_neto : 0), 0);

    var camposAuditoria: Partial<FactoringAttributes> = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const factoringCreated = await factoringDao.insertFactoring(transaction, { ...camposFk, ...camposAdicionales, ...factoringValidated, ...camposAuditoria });
    log.debug(line(), "factoringCreated:", factoringCreated.dataValues);

    const factoringhistorialestadoCreate = {
      factoringhistorialestadoid: uuidv4(),
      code: uuidv4().split("-")[0],
      _idfactoring: factoringCreated._idfactoring,
      _idfactoringestado: camposFk._idfactoringestado,
      _idusuariomodifica: req.session_user.usuario._idusuario,
      comentario: "",
      idusuariocrea: req.session_user.usuario._idusuario ?? 1,
      fechacrea: Sequelize.fn("now", 3),
      idusuariomod: req.session_user.usuario._idusuario ?? 1,
      fechamod: Sequelize.fn("now", 3),
      estado: 1,
    };
    const factoringhistorialestadoCreated = await factoringhistorialestadoDao.insertFactoringhistorialestado(transaction, factoringhistorialestadoCreate);
    log.debug(line(), "factoringhistorialestadoCreated:", factoringhistorialestadoCreated.dataValues);

    for (const [index, factura] of facturas.entries()) {
      var factoringfacturaFk: Partial<FactoringFacturaAttributes> = {};
      factoringfacturaFk._idfactoring = factoringCreated._idfactoring;
      factoringfacturaFk._idfactura = factura._idfactura;
      const factoringfacturaCreated = await factoringfacturaDao.insertFactoringfactura(transaction, { ...factoringfacturaFk, ...camposAuditoria });
      log.debug(line(), "factoringfacturaCreated:", factoringfacturaCreated.dataValues);
    }

    await transaction.commit();
    response(res, 201, { ...camposAdicionales, ...factoringValidated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
