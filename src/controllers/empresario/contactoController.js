import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";

import * as contactoDao from "#src/daos/contactoDao.js";
import * as empresaDao from "#src/daos/empresaDao.js";
import * as factoringDao from "#src/daos/factoringDao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";

import { Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const updateContacto = async (req, res) => {
  logger.debug(line(), "controller::updateContacto");
  const { id } = req.params;
  const contactoUpdateSchema = yup
    .object()
    .shape({
      contactoid: yup.string().trim().required().min(36).max(36),
      nombrecontacto: yup.string().required().max(100),
      apellidocontacto: yup.string().required().max(100),
      cargo: yup.string().required().max(100),
      email: yup.string().required().email().min(5).max(100),
      celular: yup.string().required().min(5).max(20),
      telefono: yup.string().required().min(5).max(50),
    })
    .required();
  const contactoValidated = contactoUpdateSchema.validateSync({ contactoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "contactoValidated:", contactoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1, 2];
    const _idusuario_session = req.session_user.usuario._idusuario;
    const contacto = await contactoDao.getContactoByContactoid(transaction, contactoValidated.contactoid);
    if (!contacto) {
      logger.warn(line(), "Contacto no existe: [" + contactoValidated.contactoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(transaction, _idusuario_session, filter_estados);
    const _idcedentes = empresas_cedentes.map((empresa) => empresa._idempresa);
    const factorings = await factoringDao.getFactoringsByIdcedentes(transaction, _idcedentes, filter_estados);
    const contactoAllowed = factorings.find((factoring) => factoring._idaceptante === contacto._idempresa);

    if (!contactoAllowed) {
      logger.warn(line(), "Empresa aceptante no asociada al usuario: [" + contacto._idempresa + ", " + _idusuario_session + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var camposContactoAdicionales = {};
    camposContactoAdicionales.contactoid = contacto.contactoid;

    var camposContactoAuditoria = {};
    camposContactoAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposContactoAuditoria.fechamod = Sequelize.fn("now", 3);

    const contactoUpdated = await contactoDao.updateContacto(transaction, {
      ...camposContactoAdicionales,
      ...contactoValidated,
      ...camposContactoAuditoria,
    });
    logger.debug(line(), "contactoUpdated", contactoUpdated);

    await transaction.commit();
    response(res, 200, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createContacto = async (req, res) => {
  logger.debug(line(), "controller::createContacto");
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const contactoCreateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      nombrecontacto: yup.string().required().max(100),
      apellidocontacto: yup.string().required().max(100),
      cargo: yup.string().required().max(100),
      email: yup.string().required().email().min(5).max(100),
      celular: yup.string().required().min(5).max(20),
      telefono: yup.string().required().min(5).max(50),
    })
    .required();
  var contactoValidated = contactoCreateSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "contactoValidated:", contactoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    var empresa = await empresaDao.getEmpresaByEmpresaid(transaction, contactoValidated.empresaid);
    if (!empresa) {
      logger.warn(line(), "Empresa no existe: [" + contactoValidated.empresaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(transaction, session_idusuario, filter_estados);
    const _idcedentes = empresas_cedentes.map((empresa) => empresa._idempresa);
    const factorings = await factoringDao.getFactoringsByIdcedentes(transaction, _idcedentes, filter_estados);
    const empresa_aceptante_por_idusuario = factorings.find((factoring) => factoring._idaceptante === empresa._idempresa);

    if (!empresa_aceptante_por_idusuario) {
      logger.warn(line(), "Empresa aceptante no asociada al usuario: [" + session_idusuario + ", " + contactoValidated.monedaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var contacto_por_email = await contactoDao.getContactosByIdempresaAndEmail(transaction, empresa_aceptante_por_idusuario._idaceptante, contactoValidated.email, filter_estado);
    if (contacto_por_email && contacto_por_email.length > 0) {
      logger.warn(line(), "El email [" + contactoValidated.email + "] se encuentra registrado. Ingrese un contacto diferente.");
      throw new ClientError("El email [" + contactoValidated.email + "] se encuentra registrado. Ingrese un contacto diferente.", 404);
    }

    var camposContactoFk = {};
    camposContactoFk._idempresa = empresa._idempresa;

    var camposContactoAdicionales = {};
    camposContactoAdicionales.contactoid = uuidv4();
    camposContactoAdicionales.code = uuidv4().split("-")[0];

    var camposContactoAuditoria = {};
    camposContactoAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposContactoAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposContactoAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposContactoAuditoria.fechamod = Sequelize.fn("now", 3);
    camposContactoAuditoria.estado = 1;

    const contactoCreated = await contactoDao.insertContacto(transaction, {
      ...camposContactoFk,
      ...camposContactoAdicionales,
      ...contactoValidated,
      ...camposContactoAuditoria,
    });
    logger.debug(line(), "contactoCreated:", contactoCreated);

    const contactoFiltered = jsonUtils.removeAttributesPrivates(contactoCreated.dataValues);

    await transaction.commit();
    response(res, 201, { ...contactoFiltered });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getContactos = async (req, res) => {
  logger.debug(line(), "controller::getContactos");
  const transaction = await sequelizeFT.transaction();
  try {
    //logger.info(line(),req.session_user.usuario._idusuario);

    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estados = [1];
    const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(transaction, session_idusuario, filter_estados);
    const _idcedentes = empresas_cedentes.map((empresa) => empresa._idempresa);
    const factorings = await factoringDao.getFactoringsByIdcedentes(transaction, _idcedentes, filter_estados);
    const _idaceptantes = factorings.map((factoring) => factoring._idaceptante);
    const contactos = await contactoDao.getContactosByIdempresas(transaction, _idaceptantes, filter_estados);
    var contactosJson = jsonUtils.sequelizeToJSON(contactos);
    //logger.info(line(),empresaObfuscated);

    var contactosFiltered = jsonUtils.removeAttributes(contactosJson, ["score"]);
    contactosFiltered = jsonUtils.removeAttributesPrivates(contactosFiltered);
    await transaction.commit();
    response(res, 201, contactosFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getContactoMaster = async (req, res) => {
  logger.debug(line(), "controller::getContactoMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const session_idusuario = req.session_user.usuario._idusuario;
    //logger.info(line(),req.session_user.usuario.rol_rols);
    const roles = [2]; // Administrador
    const rolesUsuario = req.session_user.usuario.rol_rols.map((role) => role._idrol);
    const tieneRol = roles.some((rol) => rolesUsuario.includes(rol));

    const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(transaction, session_idusuario, filter_estados);
    const _idcedentes = empresas_cedentes.map((empresa) => empresa._idempresa);
    const factorings = await factoringDao.getFactoringsByIdcedentes(transaction, _idcedentes, filter_estados);
    const _idaceptantes = factorings.map((factoring) => factoring._idaceptante);
    const aceptantes = await empresaDao.getEmpresasByIdempresas(transaction, _idaceptantes, filter_estados);

    var contactoMaster = {};
    contactoMaster.aceptantes = aceptantes;

    var contactoMasterJSON = jsonUtils.sequelizeToJSON(contactoMaster);
    //jsonUtils.prettyPrint(contactoMasterJSON);
    var contactoMasterObfuscated = contactoMasterJSON;
    //jsonUtils.prettyPrint(contactoMasterObfuscated);
    var contactoMasterFiltered = jsonUtils.removeAttributesPrivates(contactoMasterObfuscated);
    //jsonUtils.prettyPrint(contactoMaster);
    await transaction.commit();
    response(res, 201, contactoMasterFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
