import * as usuarioDao from "../daos/usuarioDao.js";
import * as empresaDao from "../daos/empresaDao.js";
import * as bancoDao from "../daos/bancoDao.js";
import * as cuentatipoDao from "../daos/cuentatipoDao.js";
import * as monedaDao from "../daos/monedaDao.js";
import { response } from "../utils/CustomResponseOk.js";
import { ClientError } from "../utils/CustomErrors.js";
import * as jsonUtils from "../utils/jsonUtils.js";
import logger, { line } from "../utils/logger.js";
import { sequelizeFT } from "../config/bd/sequelize_db_factoring.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getUsuarios = async (req, res) => {
  logger.debug(line(), "controller::getUsuarios");
  const transaction = await sequelizeFT.transaction();
  try {
    const usuarios = await usuarioDao.getUsuariosActivas(transaction);
    var usuariosObfuscated = jsonUtils.ofuscarAtributos(usuarios, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var usuariosFiltered = jsonUtils.removeAttributesPrivates(usuariosObfuscated);
    await transaction.commit();
    response(res, 201, usuariosFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getUsuarioContactoMio = async (req, res) => {
  logger.debug(line(), "controller::getUsuarioContactoMio");
  const transaction = await sequelizeFT.transaction();
  try {
    //logger.info(line(),req.session_user.usuario._idusuario);
    const filter_idusuario = req.session_user.usuario._idusuario;
    const filter_estado = [1, 2];
    const usuario = await usuarioDao.getUsuarioDatosContactoByIdusuario(transaction, filter_idusuario, filter_estado);
    var usuarioObfuscated = jsonUtils.ofuscarAtributos(usuario, ["email"], jsonUtils.PATRON_OFUSCAR_EMAIL);
    usuarioObfuscated = jsonUtils.ofuscarAtributos(usuarioObfuscated, ["celular"], jsonUtils.PATRON_OFUSCAR_TELEFONO);
    //logger.info(line(),empresaObfuscated);
    var usuarioFiltered = jsonUtils.removeAttributesPrivates(usuarioObfuscated);
    await transaction.commit();
    response(res, 201, usuarioFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getUsuario = async (req, res) => {
  logger.debug(line(), "controller::getUsuario");
  const { id } = req.params;
  const usuarioSchema = yup
    .object()
    .shape({
      usuarioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var usuarioValidated = usuarioSchema.validateSync({ usuarioid: id }, { abortEarly: false, stripUnknown: true });

  const transaction = await sequelizeFT.transaction();
  try {
    const usuario = await usuarioDao.getUsuarioByUsuarioid(transaction, usuarioValidated.usuarioid);
    if (!usuario) {
      throw new ClientError("Usuario no existe", 404);
    }
    var usuarioObfuscated = jsonUtils.ofuscarAtributos(usuario, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var usuarioFiltered = jsonUtils.removeAttributesPrivates(usuarioObfuscated);
    await transaction.commit();
    response(res, 200, usuarioFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const createUsuario = async (req, res) => {
  logger.debug(line(), "controller::createUsuario");
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

  const transaction = await sequelizeFT.transaction();
  try {
    var empresa = await empresaDao.findEmpresaPk(transaction, usuarioValidated.empresaid);
    if (!empresa) {
      throw new ClientError("Empresa no existe", 404);
    }

    var banco = await bancoDao.findBancoPk(transaction, usuarioValidated.bancoid);
    if (!banco) {
      throw new ClientError("Banco no existe", 404);
    }

    var cuentatipo = await cuentatipoDao.findCuentatipoPk(transaction, usuarioValidated.cuentatipoid);
    if (!cuentatipo) {
      throw new ClientError("Cuenta tipo no existe", 404);
    }
    var moneda = await monedaDao.findMonedaPk(transaction, usuarioValidated.monedaid);
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
    camposAdicionales.code = uuidv4().split("-")[0];

    var camposAuditoria = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const usuarioCreated = await usuarioDao.insertUsuario(transaction, { ...camposFk, ...camposAdicionales, ...usuarioValidated, ...camposAuditoria });
    logger.debug(line(), "Create usuario: ID:" + usuarioCreated.idusuario + " | " + camposAdicionales.usuarioid);
    logger.debug(line(), "usuarioCreated:", usuarioCreated.dataValues);
    // Retiramos los IDs internos
    delete camposAdicionales.idempresa;
    await transaction.commit();
    response(res, 201, { ...camposAdicionales, ...usuarioValidated });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateUsuario = async (req, res) => {
  logger.debug(line(), "controller::updateUsuario");
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

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAdicionales = {};
    camposAdicionales.usuarioid = id;

    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const result = await usuarioDao.updateUsuario(transaction, { ...camposAdicionales, ...usuarioValidated, ...camposAuditoria });
    if (result[0] === 0) {
      throw new ClientError("Usuario no existe", 404);
    }
    logger.info(line(), id);
    const usuarioUpdated = await usuarioDao.getUsuarioByUsuarioid(transaction, id);
    if (!usuarioUpdated) {
      throw new ClientError("Usuario no existe", 404);
    }

    var usuarioObfuscated = jsonUtils.ofuscarAtributos(usuarioUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var usuarioFiltered = jsonUtils.removeAttributesPrivates(usuarioObfuscated);
    await transaction.commit();
    response(res, 200, usuarioFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteUsuario = async (req, res) => {
  logger.debug(line(), "controller::deleteUsuario");
  const { id } = req.params;
  const usuarioSchema = yup
    .object()
    .shape({
      usuarioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const usuarioValidated = usuarioSchema.validateSync({ usuarioid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "usuarioValidated:", usuarioValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const usuarioDeleted = await usuarioDao.deleteUsuario(transaction, { ...usuarioValidated, ...camposAuditoria });
    if (usuarioDeleted[0] === 0) {
      throw new ClientError("Usuario no existe", 404);
    }
    logger.debug(line(), "usuarioDeleted:", usuarioDeleted);
    await transaction.commit();
    response(res, 204, usuarioDeleted);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
