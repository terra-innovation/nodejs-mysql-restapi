import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";

import * as contactoDao from "#src/daos/contactoDao.js";
import * as empresaDao from "#src/daos/empresaDao.js";
import * as facturaDao from "#src/daos/facturaDao.js";
import * as factoringDao from "#src/daos/factoringDao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { safeRollback } from "#src/utils/transactionUtils.js";

import { Sequelize, Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { ContactoAttributes } from "#root/src/models/ft_factoring/Contacto";

export const getContactos = async (req, res) => {
  log.debug(line(), "controller::getContactos");
  const contactoSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const contactoValidated = contactoSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "contactoValidated:", contactoValidated);
  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estados = [1];
    var empresa = await empresaDao.getEmpresaByEmpresaid(transaction, contactoValidated.empresaid);
    if (!empresa) {
      log.warn(line(), "Empresa no existe: [" + contactoValidated.empresaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factura = await facturaDao.getFacturaByFacturaid(transaction, contactoValidated.facturaid);
    if (!factura) {
      log.warn(line(), "Factura no existe: [" + contactoValidated.facturaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factura_upload = await facturaDao.getFacturaByIdfacturaAndIdusuarioupload(transaction, factura._idfactura, session_idusuario);
    if (!factura_upload) {
      log.warn(line(), "Factura no asociada al usuario: ", factura.dataValues, session_idusuario);
      throw new ClientError("Datos no válidos", 404);
    }

    const isEmpresaAllowed = empresa.ruc === factura_upload.cliente_ruc;
    if (!isEmpresaAllowed) {
      log.warn(line(), "Empresa aceptante no asociada a la factura: ", empresa.dataValues, factura_upload.dataValues);
      throw new ClientError("Datos no válidos", 404);
    }

    const contactos = await contactoDao.getContactosByIdempresas(transaction, [empresa._idempresa], filter_estados);
    var contactosJson = jsonUtils.sequelizeToJSON(contactos);
    //log.info(line(),empresaObfuscated);

    var contactosFiltered = jsonUtils.removeAttributes(contactosJson, ["score"]);
    contactosFiltered = jsonUtils.removeAttributesPrivates(contactosFiltered);
    await transaction.commit();
    response(res, 201, contactosFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createContacto = async (req, res) => {
  log.debug(line(), "controller::createContacto");
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const contactoCreateSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
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
  log.debug(line(), "contactoValidated:", contactoValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estados = [1];
    var empresa = await empresaDao.getEmpresaByEmpresaid(transaction, contactoValidated.empresaid);
    if (!empresa) {
      log.warn(line(), "Empresa no existe: [" + contactoValidated.empresaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factura = await facturaDao.getFacturaByFacturaid(transaction, contactoValidated.facturaid);
    if (!factura) {
      log.warn(line(), "Factura no existe: [" + contactoValidated.facturaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factura_upload = await facturaDao.getFacturaByIdfacturaAndIdusuarioupload(transaction, factura._idfactura, session_idusuario);
    if (!factura_upload) {
      log.warn(line(), "Factura no asociada al usuario: ", factura.dataValues, session_idusuario);
      throw new ClientError("Datos no válidos", 404);
    }

    const isEmpresaAllowed = empresa.ruc === factura_upload.cliente_ruc;
    if (!isEmpresaAllowed) {
      log.warn(line(), "Empresa aceptante no asociada a la factura: ", empresa.dataValues, factura_upload.dataValues);
      throw new ClientError("Datos no válidos", 404);
    }

    var contacto_por_email = await contactoDao.getContactosByIdempresaAndEmail(transaction, empresa._idempresa, contactoValidated.email, filter_estado);
    if (contacto_por_email && contacto_por_email.length > 0) {
      log.warn(line(), "El email [" + contactoValidated.email + "] se encuentra registrado. Ingrese un contacto diferente.");
      throw new ClientError("El email [" + contactoValidated.email + "] se encuentra registrado. Ingrese un contacto diferente.", 404);
    }

    var camposContactoFk: Partial<ContactoAttributes> = {};
    camposContactoFk._idempresa = empresa._idempresa;

    var camposContactoAdicionales: Partial<ContactoAttributes> = {};
    camposContactoAdicionales.contactoid = uuidv4();
    camposContactoAdicionales.code = uuidv4().split("-")[0];

    var camposContactoAuditoria: Partial<ContactoAttributes> = {};
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
    log.debug(line(), "contactoCreated:", contactoCreated);

    const contactoFiltered = jsonUtils.removeAttributesPrivates(contactoCreated.dataValues);

    await transaction.commit();
    response(res, 201, { ...contactoFiltered });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getContactoMaster = async (req, res) => {
  log.debug(line(), "controller::getContactoMaster");
  const contactoSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const contactoValidated = contactoSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "contactoValidated:", contactoValidated);
  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estados = [1];
    var empresa = await empresaDao.getEmpresaByEmpresaid(transaction, contactoValidated.empresaid);
    if (!empresa) {
      log.warn(line(), "Empresa no existe: [" + contactoValidated.empresaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factura = await facturaDao.getFacturaByFacturaid(transaction, contactoValidated.facturaid);
    if (!factura) {
      log.warn(line(), "Factura no existe: [" + contactoValidated.facturaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var factura_upload = await facturaDao.getFacturaByIdfacturaAndIdusuarioupload(transaction, factura._idfactura, session_idusuario);
    if (!factura_upload) {
      log.warn(line(), "Factura no asociada al usuario: ", factura.dataValues, session_idusuario);
      throw new ClientError("Datos no válidos", 404);
    }

    const isEmpresaAllowed = empresa.ruc === factura_upload.cliente_ruc;
    if (!isEmpresaAllowed) {
      log.warn(line(), "Empresa aceptante no asociada a la factura: ", empresa.dataValues, factura_upload.dataValues);
      throw new ClientError("Datos no válidos", 404);
    }

    var contactoMaster: Record<string, any> = {};
    contactoMaster.aceptantes = [empresa];

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
