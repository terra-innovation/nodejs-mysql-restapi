import * as usuarioDao from "../daos/usuarioDao.js";
import * as empresaDao from "../daos/empresaDao.js";
import * as bancoDao from "../daos/bancoDao.js";
import * as cuentatipoDao from "../daos/cuentatipoDao.js";
import * as monedaDao from "../daos/monedaDao.js";
import { response } from "../utils/CustomResponseOk.js";
import { ClientError } from "../utils/CustomErrors.js";
import * as jsonUtils from "../utils/jsonUtils.js";
import logger, { line } from "../utils/logger.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getUsuarios = async (req, res) => {
  const usuarios = await usuarioDao.getUsuariosActivas(req);
  var usuariosObfuscated = jsonUtils.ofuscarAtributos(usuarios, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //logger.info(line(),empresaObfuscated);

  var usuariosFiltered = jsonUtils.removeAttributesPrivates(usuariosObfuscated);
  response(res, 201, usuariosFiltered);
};

export const getUsuarioContactoMio = async (req, res) => {
  //logger.info(line(),req.session_user.usuario._idusuario);
  const filter_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const usuario = await usuarioDao.getUsuarioDatosContactoByIdusuario(req, filter_idusuario, filter_estado);
  var usuarioObfuscated = jsonUtils.ofuscarAtributos(usuario, ["email"], jsonUtils.PATRON_OFUSCAR_EMAIL);
  usuarioObfuscated = jsonUtils.ofuscarAtributos(usuarioObfuscated, ["celular"], jsonUtils.PATRON_OFUSCAR_TELEFONO);
  //logger.info(line(),empresaObfuscated);
  var usuarioFiltered = jsonUtils.removeAttributesPrivates(usuarioObfuscated);
  response(res, 201, usuarioFiltered);
};

export const getUsuario = async (req, res) => {
  const { id } = req.params;
  const usuarioSchema = yup
    .object()
    .shape({
      usuarioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var usuarioValidated = usuarioSchema.validateSync({ usuarioid: id }, { abortEarly: false, stripUnknown: true });
  const usuario = await usuarioDao.getUsuarioByUsuarioid(req, usuarioValidated.usuarioid);
  if (!usuario) {
    throw new ClientError("Usuario no existe", 404);
  }
  var usuarioObfuscated = jsonUtils.ofuscarAtributos(usuario, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //logger.info(line(),empresaObfuscated);

  var usuarioFiltered = jsonUtils.removeAttributesPrivates(usuarioObfuscated);
  response(res, 200, usuarioFiltered);
};

export const createUsuario = async (req, res) => {
  const usuarioCreateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      bancoid: yup.string().trim().required().min(36).max(36),
      cuentatipoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      numero: yup.string().required().max(20),
      cci: yup.string().required().max(20),
      alias: yup.string().required().max(50),
    })
    .required();
  var usuarioValidated = usuarioCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "usuarioValidated:", usuarioValidated);

  var empresa = await empresaDao.findEmpresaPk(req, usuarioValidated.empresaid);
  if (!empresa) {
    throw new ClientError("Empresa no existe", 404);
  }

  var banco = await bancoDao.findBancoPk(req, usuarioValidated.bancoid);
  if (!banco) {
    throw new ClientError("Banco no existe", 404);
  }

  var cuentatipo = await cuentatipoDao.findCuentatipoPk(req, usuarioValidated.cuentatipoid);
  if (!cuentatipo) {
    throw new ClientError("Cuenta tipo no existe", 404);
  }
  var moneda = await monedaDao.findMonedaPk(req, usuarioValidated.monedaid);
  if (!moneda) {
    throw new ClientError("Moneda no existe", 404);
  }

  var camposFk = {};
  camposFk._idempresa = empresa._idempresa;
  camposFk._idbanco = banco._idbanco;
  camposFk._idcuentatipo = cuentatipo._idcuentatipo;
  camposFk._idmoneda = moneda._idmoneda;
  camposFk._idusuarioestado = 1; // Por defecto

  var camposAdicionales = {};
  camposAdicionales.usuarioid = uuidv4();

  var camposAuditoria = {};
  camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const usuarioCreated = await usuarioDao.insertUsuario(req, { ...camposFk, ...camposAdicionales, ...usuarioValidated, ...camposAuditoria });
  logger.debug(line(), "Create usuario: ID:" + usuarioCreated.idusuario + " | " + camposAdicionales.usuarioid);
  logger.debug(line(), "usuarioCreated:", usuarioCreated.dataValues);
  // Retiramos los IDs internos
  delete camposAdicionales.idempresa;
  response(res, 201, { ...camposAdicionales, ...usuarioValidated });
};

export const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const usuarioUpdateSchema = yup
    .object()
    .shape({
      usuarioid: yup.string().trim().required().min(36).max(36),

      alias: yup.string().required().max(50),
    })
    .required();
  const usuarioValidated = usuarioUpdateSchema.validateSync({ usuarioid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "usuarioValidated:", usuarioValidated);

  var camposAdicionales = {};
  camposAdicionales.usuarioid = id;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const result = await usuarioDao.updateUsuario(req, { ...camposAdicionales, ...usuarioValidated, ...camposAuditoria });
  if (result[0] === 0) {
    throw new ClientError("Usuario no existe", 404);
  }
  logger.info(line(), id);
  const usuarioUpdated = await usuarioDao.getUsuarioByUsuarioid(req, id);
  if (!usuarioUpdated) {
    throw new ClientError("Usuario no existe", 404);
  }

  var usuarioObfuscated = jsonUtils.ofuscarAtributos(usuarioUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //logger.info(line(),empresaObfuscated);

  var usuarioFiltered = jsonUtils.removeAttributesPrivates(usuarioObfuscated);
  response(res, 200, usuarioFiltered);
};

export const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  const usuarioSchema = yup
    .object()
    .shape({
      usuarioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const usuarioValidated = usuarioSchema.validateSync({ usuarioid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "usuarioValidated:", usuarioValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const usuarioDeleted = await usuarioDao.deleteUsuario(req, { ...usuarioValidated, ...camposAuditoria });
  if (usuarioDeleted[0] === 0) {
    throw new ClientError("Usuario no existe", 404);
  }
  logger.debug(line(), "usuarioDeleted:", usuarioDeleted);
  response(res, 204, usuarioDeleted);
};
