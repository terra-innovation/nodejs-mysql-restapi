import * as factoringestadoDao from "#src/daos/factoringestadoDao.js";
import * as empresaDao from "#src/daos/empresaDao.js";
import * as bancoDao from "#src/daos/bancoDao.js";
import * as cuentatipoDao from "#src/daos/cuentatipoDao.js";
import * as monedaDao from "#src/daos/monedaDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getFactoringestados = async (req, res) => {
  logger.debug(line(), "controller::getFactoringestados");
  const filter_estados = [1];

  const transaction = await sequelizeFT.transaction();
  try {
    const factoringestados = await factoringestadoDao.getFactoringestados(transaction, filter_estados);
    var factoringestadosJSON = jsonUtils.sequelizeToJSON(factoringestados);
    //jsonUtils.prettyPrint(factoringestadosJSON);
    var factoringestadosObfuscated = factoringestadosJSON;
    //jsonUtils.prettyPrint(factoringestadosObfuscated);
    var factoringestadosFiltered = jsonUtils.removeAttributesPrivates(factoringestadosObfuscated);
    await transaction.commit();
    response(res, 201, factoringestadosFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getFactoringestadosMiosByEmpresaidActivos = async (req, res) => {
  logger.debug(line(), "controller::getFactoringestadosMiosByEmpresaidActivos");
  //logger.info(line(),req.session_user.usuario._idusuario);
  const { id } = req.params;
  const factoringestadoSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringestadoValidated = factoringestadoSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });

  const transaction = await sequelizeFT.transaction();
  try {
    const empresa = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(transaction, req.session_user.usuario._idusuario, factoringestadoValidated.empresaid, 1);
    //logger.info(line(),empresa);
    if (!empresa) {
      throw new ClientError("Empresa no existe", 404);
    }
    const filter_empresaid = factoringestadoValidated.empresaid;
    const filter_monedaid = factoringestadoValidated.monedaid;
    const filter_idfactoringestadoestado = [2];
    const filter_estado = [1, 2];
    const factoringestados = await factoringestadoDao.getFactoringestadosByEmpresaidAndMoneda(transaction, filter_empresaid, filter_monedaid, filter_idfactoringestadoestado, filter_estado);
    var factoringestadosObfuscated = jsonUtils.ofuscarAtributos(factoringestados, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var factoringestadosFiltered = jsonUtils.removeAttributes(factoringestadosObfuscated, ["score"]);
    factoringestadosFiltered = jsonUtils.removeAttributesPrivates(factoringestadosFiltered);
    await transaction.commit();
    response(res, 201, factoringestadosFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getFactoringestado = async (req, res) => {
  logger.debug(line(), "controller::getFactoringestado");
  const { id } = req.params;
  const factoringestadoSchema = yup
    .object()
    .shape({
      factoringestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringestadoValidated = factoringestadoSchema.validateSync({ factoringestadoid: id }, { abortEarly: false, stripUnknown: true });

  const transaction = await sequelizeFT.transaction();
  try {
    const factoringestado = await factoringestadoDao.getFactoringestadoByFactoringestadoid(transaction, factoringestadoValidated.factoringestadoid);
    if (!factoringestado) {
      throw new ClientError("Factoringestado no existe", 404);
    }
    var factoringestadoObfuscated = jsonUtils.ofuscarAtributos(factoringestado, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var factoringestadoFiltered = jsonUtils.removeAttributesPrivates(factoringestadoObfuscated);
    await transaction.commit();
    response(res, 200, factoringestadoFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createFactoringestado = async (req, res) => {
  logger.debug(line(), "controller::createFactoringestado");
  const factoringestadoCreateSchema = yup
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
  var factoringestadoValidated = factoringestadoCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "factoringestadoValidated:", factoringestadoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var empresa = await empresaDao.findEmpresaPk(transaction, factoringestadoValidated.empresaid);
    if (!empresa) {
      throw new ClientError("Empresa no existe", 404);
    }

    var banco = await bancoDao.findBancoPk(transaction, factoringestadoValidated.bancoid);
    if (!banco) {
      throw new ClientError("Banco no existe", 404);
    }

    var cuentatipo = await cuentatipoDao.findCuentatipoPk(transaction, factoringestadoValidated.cuentatipoid);
    if (!cuentatipo) {
      throw new ClientError("Cuenta tipo no existe", 404);
    }
    var moneda = await monedaDao.findMonedaPk(transaction, factoringestadoValidated.monedaid);
    if (!moneda) {
      throw new ClientError("Moneda no existe", 404);
    }

    var camposFk = {};
    camposFk._idempresa = empresa._idempresa;
    camposFk._idbanco = banco._idbanco;
    camposFk._idcuentatipo = cuentatipo._idcuentatipo;
    camposFk._idmoneda = moneda._idmoneda;
    camposFk._idfactoringestadoestado = 1; // Por defecto

    var camposAdicionales = {};
    camposAdicionales.factoringestadoid = uuidv4();

    var camposAuditoria = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const factoringestadoCreated = await factoringestadoDao.insertFactoringestado(transaction, { ...camposFk, ...camposAdicionales, ...factoringestadoValidated, ...camposAuditoria });
    logger.debug(line(), "Create factoringestado: ID:" + factoringestadoCreated.idfactoringestado + " | " + camposAdicionales.factoringestadoid);
    logger.debug(line(), "factoringestadoCreated:", factoringestadoCreated.dataValues);
    // Retiramos los IDs internos
    delete camposAdicionales.idempresa;
    await transaction.commit();
    response(res, 201, { ...camposAdicionales, ...factoringestadoValidated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const updateFactoringestado = async (req, res) => {
  logger.debug(line(), "controller::updateFactoringestado");
  const { id } = req.params;
  const factoringestadoUpdateSchema = yup
    .object()
    .shape({
      factoringestadoid: yup.string().trim().required().min(36).max(36),

      alias: yup.string().required().max(50),
    })
    .required();
  const factoringestadoValidated = factoringestadoUpdateSchema.validateSync({ factoringestadoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "factoringestadoValidated:", factoringestadoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAdicionales = {};
    camposAdicionales.factoringestadoid = id;

    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const result = await factoringestadoDao.updateFactoringestado(transaction, { ...camposAdicionales, ...factoringestadoValidated, ...camposAuditoria });
    if (result[0] === 0) {
      throw new ClientError("Factoringestado no existe", 404);
    }
    logger.info(line(), id);
    const factoringestadoUpdated = await factoringestadoDao.getFactoringestadoByFactoringestadoid(transaction, id);
    if (!factoringestadoUpdated) {
      throw new ClientError("Factoringestado no existe", 404);
    }

    var factoringestadoObfuscated = jsonUtils.ofuscarAtributos(factoringestadoUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var factoringestadoFiltered = jsonUtils.removeAttributesPrivates(factoringestadoObfuscated);
    await transaction.commit();
    response(res, 200, factoringestadoFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deleteFactoringestado = async (req, res) => {
  logger.debug(line(), "controller::deleteFactoringestado");
  const { id } = req.params;
  const factoringestadoSchema = yup
    .object()
    .shape({
      factoringestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringestadoValidated = factoringestadoSchema.validateSync({ factoringestadoid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "factoringestadoValidated:", factoringestadoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const factoringestadoDeleted = await factoringestadoDao.deleteFactoringestado(transaction, { ...factoringestadoValidated, ...camposAuditoria });
    if (factoringestadoDeleted[0] === 0) {
      throw new ClientError("Factoringestado no existe", 404);
    }
    logger.debug(line(), "factoringestadoDeleted:", factoringestadoDeleted);
    await transaction.commit();
    response(res, 204, factoringestadoDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
