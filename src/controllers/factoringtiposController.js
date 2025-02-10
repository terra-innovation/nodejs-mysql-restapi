import * as factoringtipoDao from "../daos/factoringtipoDao.js";
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

export const getFactoringtipos = async (req, res) => {
  logger.debug(line(), "controller::getFactoringtipos");
  const filter_estados = [1];

  const transaction = await sequelizeFT.transaction();
  try {
    const factoringtipos = await factoringtipoDao.getFactoringtipos(transaction, filter_estados);
    var factoringtiposJSON = jsonUtils.sequelizeToJSON(factoringtipos);
    //jsonUtils.prettyPrint(factoringtiposJSON);
    var factoringtiposObfuscated = factoringtiposJSON;
    //jsonUtils.prettyPrint(factoringtiposObfuscated);
    var factoringtiposFiltered = jsonUtils.removeAttributesPrivates(factoringtiposObfuscated);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getFactoringtiposMiosByEmpresaidActivos = async (req, res) => {
  logger.debug(line(), "controller::getFactoringtiposMiosByEmpresaidActivos");
  //logger.info(line(),req.session_user.usuario._idusuario);
  const { id } = req.params;
  const factoringtipoSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringtipoValidated = factoringtipoSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });

  const transaction = await sequelizeFT.transaction();
  try {
    const empresa = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(transaction, req.session_user.usuario._idusuario, factoringtipoValidated.empresaid, 1);
    //logger.info(line(),empresa);
    if (!empresa) {
      throw new ClientError("Empresa no existe", 404);
    }
    const filter_empresaid = factoringtipoValidated.empresaid;
    const filter_monedaid = factoringtipoValidated.monedaid;
    const filter_idfactoringtipoestado = [2];
    const filter_estado = [1, 2];
    const factoringtipos = await factoringtipoDao.getFactoringtiposByEmpresaidAndMoneda(transaction, filter_empresaid, filter_monedaid, filter_idfactoringtipoestado, filter_estado);
    var factoringtiposObfuscated = jsonUtils.ofuscarAtributos(factoringtipos, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var factoringtiposFiltered = jsonUtils.removeAttributes(factoringtiposObfuscated, ["score"]);
    factoringtiposFiltered = jsonUtils.removeAttributesPrivates(factoringtiposFiltered);
    await transaction.commit();
    response(res, 201, factoringtiposFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getFactoringtipo = async (req, res) => {
  logger.debug(line(), "controller::getFactoringtipo");
  const { id } = req.params;
  const factoringtipoSchema = yup
    .object()
    .shape({
      factoringtipoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringtipoValidated = factoringtipoSchema.validateSync({ factoringtipoid: id }, { abortEarly: false, stripUnknown: true });

  const transaction = await sequelizeFT.transaction();
  try {
    const factoringtipo = await factoringtipoDao.getFactoringtipoByFactoringtipoid(transaction, factoringtipoValidated.factoringtipoid);
    if (!factoringtipo) {
      throw new ClientError("Factoringtipo no existe", 404);
    }
    var factoringtipoObfuscated = jsonUtils.ofuscarAtributos(factoringtipo, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var factoringtipoFiltered = jsonUtils.removeAttributesPrivates(factoringtipoObfuscated);
    await transaction.commit();
    response(res, 200, factoringtipoFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const createFactoringtipo = async (req, res) => {
  logger.debug(line(), "controller::createFactoringtipo");
  const factoringtipoCreateSchema = yup
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
  var factoringtipoValidated = factoringtipoCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "factoringtipoValidated:", factoringtipoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var empresa = await empresaDao.findEmpresaPk(transaction, factoringtipoValidated.empresaid);
    if (!empresa) {
      throw new ClientError("Empresa no existe", 404);
    }

    var banco = await bancoDao.findBancoPk(transaction, factoringtipoValidated.bancoid);
    if (!banco) {
      throw new ClientError("Banco no existe", 404);
    }

    var cuentatipo = await cuentatipoDao.findCuentatipoPk(transaction, factoringtipoValidated.cuentatipoid);
    if (!cuentatipo) {
      throw new ClientError("Cuenta tipo no existe", 404);
    }
    var moneda = await monedaDao.findMonedaPk(transaction, factoringtipoValidated.monedaid);
    if (!moneda) {
      throw new ClientError("Moneda no existe", 404);
    }

    var camposFk = {};
    camposFk._idempresa = empresa._idempresa;
    camposFk._idbanco = banco._idbanco;
    camposFk._idcuentatipo = cuentatipo._idcuentatipo;
    camposFk._idmoneda = moneda._idmoneda;
    camposFk._idfactoringtipoestado = 1; // Por defecto

    var camposAdicionales = {};
    camposAdicionales.factoringtipoid = uuidv4();

    var camposAuditoria = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const factoringtipoCreated = await factoringtipoDao.insertFactoringtipo(transaction, { ...camposFk, ...camposAdicionales, ...factoringtipoValidated, ...camposAuditoria });
    logger.debug(line(), "Create factoringtipo: ID:" + factoringtipoCreated.idfactoringtipo + " | " + camposAdicionales.factoringtipoid);
    logger.debug(line(), "factoringtipoCreated:", factoringtipoCreated.dataValues);
    // Retiramos los IDs internos
    delete camposAdicionales.idempresa;
    await transaction.commit();
    response(res, 201, { ...camposAdicionales, ...factoringtipoValidated });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateFactoringtipo = async (req, res) => {
  logger.debug(line(), "controller::updateFactoringtipo");
  const { id } = req.params;
  const factoringtipoUpdateSchema = yup
    .object()
    .shape({
      factoringtipoid: yup.string().trim().required().min(36).max(36),

      alias: yup.string().required().max(50),
    })
    .required();
  const factoringtipoValidated = factoringtipoUpdateSchema.validateSync({ factoringtipoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "factoringtipoValidated:", factoringtipoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAdicionales = {};
    camposAdicionales.factoringtipoid = id;

    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const result = await factoringtipoDao.updateFactoringtipo(transaction, { ...camposAdicionales, ...factoringtipoValidated, ...camposAuditoria });
    if (result[0] === 0) {
      throw new ClientError("Factoringtipo no existe", 404);
    }
    logger.info(line(), id);
    const factoringtipoUpdated = await factoringtipoDao.getFactoringtipoByFactoringtipoid(transaction, id);
    if (!factoringtipoUpdated) {
      throw new ClientError("Factoringtipo no existe", 404);
    }

    var factoringtipoObfuscated = jsonUtils.ofuscarAtributos(factoringtipoUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var factoringtipoFiltered = jsonUtils.removeAttributesPrivates(factoringtipoObfuscated);
    await transaction.commit();
    response(res, 200, factoringtipoFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteFactoringtipo = async (req, res) => {
  logger.debug(line(), "controller::deleteFactoringtipo");
  const { id } = req.params;
  const factoringtipoSchema = yup
    .object()
    .shape({
      factoringtipoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtipoValidated = factoringtipoSchema.validateSync({ factoringtipoid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "factoringtipoValidated:", factoringtipoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const factoringtipoDeleted = await factoringtipoDao.deleteFactoringtipo(transaction, { ...factoringtipoValidated, ...camposAuditoria });
    if (factoringtipoDeleted[0] === 0) {
      throw new ClientError("Factoringtipo no existe", 404);
    }
    logger.debug(line(), "factoringtipoDeleted:", factoringtipoDeleted);
    await transaction.commit();
    response(res, 204, factoringtipoDeleted);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
