import * as factoringDao from "../daos/factoringDao.js";
import * as facturaDao from "../daos/facturaDao.js";
import * as factoringfacturaDao from "../daos/factoringfacturaDao.js";
import * as factoringtipoDao from "../daos/factoringtipoDao.js";
import * as cuentabancariaDao from "../daos/cuentabancariaDao.js";
import * as empresaDao from "../daos/empresaDao.js";
import * as bancoDao from "../daos/bancoDao.js";
import * as cuentatipoDao from "../daos/cuentatipoDao.js";
import * as monedaDao from "../daos/monedaDao.js";
import { response } from "../utils/CustomResponseOk.js";
import { ClientError } from "../utils/CustomErrors.js";
import * as jsonUtils from "../utils/jsonUtils.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";
import * as luxon from "luxon";

export const getFactorings = async (req, res) => {
  const factorings = await factoringDao.getFactoringsActivas(req);
  response(res, 201, factorings);
};

export const getFactoring = async (req, res) => {
  const { id } = req.params;
  const factoringSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringValidated = factoringSchema.validateSync({ factoringid: id }, { abortEarly: false, stripUnknown: true });
  const rows = await factoringDao.getFactoringByFactoringid(req, factoringValidated.factoringid);
  if (rows.length <= 0) {
    throw new ClientError("Factoring no existe", 404);
  }
  response(res, 200, rows[0]);
};

export const createFactoring = async (req, res) => {
  const factoringCreateSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
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
  console.debug("factoringValidated:", factoringValidated);

  var factura = await facturaDao.findFacturaPk(req, factoringValidated.facturaid);
  if (!factura) {
    throw new ClientError("Factura no existe", 404);
  }
  var cedente = await empresaDao.findEmpresaPk(req, factoringValidated.cedenteid);
  if (!cedente) {
    throw new ClientError("Cedente no existe", 404);
  }

  var aceptante = await empresaDao.findEmpresaPk(req, factoringValidated.aceptanteid);
  if (!aceptante) {
    throw new ClientError("Aceptante no existe", 404);
  }

  var cuentabancaria = await cuentabancariaDao.findCuentabancariaPk(req, factoringValidated.cuentabancariaid);
  if (!cuentabancaria) {
    throw new ClientError("Cuenta bancaria no existe", 404);
  }

  var moneda = await monedaDao.findMonedaPk(req, factoringValidated.monedaid);
  if (!moneda) {
    throw new ClientError("Moneda no existe", 404);
  }

  var camposFk = {};
  camposFk._idcedente = cedente._idempresa;
  camposFk._idaceptante = aceptante._idempresa;
  camposFk._idcuentabancaria = cuentabancaria._idcuentabancaria;
  camposFk._idmoneda = moneda._idmoneda;
  camposFk._idfactoringtipo = 1; // Por defecto
  camposFk._idfactoringestado = 1; // Por defecto

  console.log(camposFk);

  var camposAdicionales = {};
  camposAdicionales.factoringid = uuidv4();
  camposAdicionales.code = uuidv4().split("-")[0];
  camposAdicionales.fecha_registro = luxon.DateTime.now().toISO();

  console.log(camposAdicionales);

  var camposAuditoria = {};
  camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  console.log(camposAuditoria);

  /*
  // Validar si el factoring ya existe
  const factoring_existe = await factoringDao.getFactoringByRuc(req, factoringValidated.ruc);

  if (factoring_existe.length >= 1) {
    throw new ClientError("Factoring ya existe", 404);
  }
  */

  const factoringCreated = await factoringDao.insertFactoring(req, { ...camposFk, ...camposAdicionales, ...factoringValidated, ...camposAuditoria });
  console.debug("Create factoring: ID:" + factoringCreated._idfactoring + " | " + camposAdicionales.factoringid);
  console.debug("factoringCreated:", factoringCreated.dataValues);

  /* Insertar en la tabla intermedia */
  var factoringfacturaFk = {};
  factoringfacturaFk._idfactoring = factoringCreated._idfactoring;
  factoringfacturaFk._idfactura = factura._idfactura;
  const factoringfacturaCreated = await factoringfacturaDao.insertFactoringfactura(req, { ...factoringfacturaFk, ...camposAuditoria });
  response(res, 201, { ...camposAdicionales, ...factoringValidated });
};

export const updateFactoring = async (req, res) => {
  const { id } = req.params;
  const factoringUpdateSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),

      ruc: yup.string().trim().required().min(11).max(11),
      razon_social: yup.string().required().max(200),
      nombre_comercial: yup.string().max(200),
      fecha_inscripcion: yup.string(),
      domicilio_fiscal: yup.string().max(200),
      score: yup.string().max(5),
    })
    .required();
  const factoringValidated = factoringUpdateSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  console.debug("factoringValidated:", factoringValidated);

  var camposAdicionales = {};
  camposAdicionales.factoringid = id;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const factoring_por_ruc_existe = await factoringDao.getFactoringByRuc(req, factoringValidated.ruc);
  if (factoring_por_ruc_existe.length >= 1 && factoring_por_ruc_existe[0].factoringid != id) {
    throw new ClientError("Ruc duplicado", 404);
  }

  const result = await factoringDao.updateFactoring(req, { ...camposAdicionales, ...factoringValidated, ...camposAuditoria });
  if (result[0] === 0) {
    throw new ClientError("Factoring no existe", 404);
  }
  const factoring_actualizada = await factoringDao.getFactoringByFactoringid(req, id);
  if (factoring_actualizada.length === 0) {
    throw new ClientError("Factoring no existe", 404);
  }
  console.debug("factoringUpdated:", factoring_actualizada[0].dataValues);
  response(res, 200, factoring_actualizada[0]);
};

export const deleteFactoring = async (req, res) => {
  const { id } = req.params;
  const factoringSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringValidated = factoringSchema.validateSync({ factoringid: id }, { abortEarly: false, stripUnknown: true });
  console.debug("factoringValidated:", factoringValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const result = await factoringDao.deleteFactoring(req, { ...factoringValidated, ...camposAuditoria });
  if (result[0] === 0) {
    throw new ClientError("Factoring no existe", 404);
  }
  const factoring_actualizada = await factoringDao.getFactoringByFactoringid(req, id);
  if (factoring_actualizada.length === 0) {
    throw new ClientError("Factoring no existe", 404);
  }
  console.debug("factoringDeleted:", factoring_actualizada[0].dataValues);
  response(res, 204, factoring_actualizada[0]);
};
