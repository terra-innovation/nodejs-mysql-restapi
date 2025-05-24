import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ContactoAttributes } from "#root/src/models/ft_factoring/Contacto";

import * as contactoDao from "#src/daos/contactoDao.js";
import * as empresaDao from "#src/daos/empresaDao.js";
import * as factoringDao from "#src/daos/factoringDao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#root/src/utils/logger.pino.js";

import { Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const updateContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateContacto");
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
  log.debug(line(), "contactoValidated:", contactoValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1, 2];
      const _idusuario_session = req.session_user.usuario._idusuario;
      const contacto = await contactoDao.getContactoByContactoid(tx, contactoValidated.contactoid);
      if (!contacto) {
        log.warn(line(), "Contacto no existe: [" + contactoValidated.contactoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(tx, _idusuario_session, filter_estados);
      const _idcedentes = empresas_cedentes.map((empresa) => empresa._idempresa);
      const factorings = await factoringDao.getFactoringsByIdcedentes(tx, _idcedentes, filter_estados);
      const contactoAllowed = factorings.find((factoring) => factoring._idaceptante === contacto._idempresa);

      if (!contactoAllowed) {
        log.warn(line(), "Empresa aceptante no asociada al usuario: [" + contacto._idempresa + ", " + _idusuario_session + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var camposContactoAdicionales: Partial<ContactoAttributes> = {};
      camposContactoAdicionales.contactoid = contacto.contactoid;

      var camposContactoAuditoria: Partial<ContactoAttributes> = {};
      camposContactoAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposContactoAuditoria.fechamod = new Date();

      const contactoUpdated = await contactoDao.updateContacto(tx, {
        ...camposContactoAdicionales,
        ...contactoValidated,
        ...camposContactoAuditoria,
      });
      log.debug(line(), "contactoUpdated", contactoUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, {});
};

export const createContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createContacto");
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
  log.debug(line(), "contactoValidated:", contactoValidated);

  const contactoFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      var empresa = await empresaDao.getEmpresaByEmpresaid(tx, contactoValidated.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + contactoValidated.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(tx, session_idusuario, filter_estados);
      const _idcedentes = empresas_cedentes.map((empresa) => empresa._idempresa);
      const factorings = await factoringDao.getFactoringsByIdcedentes(tx, _idcedentes, filter_estados);
      const empresa_aceptante_por_idusuario = factorings.find((factoring) => factoring._idaceptante === empresa._idempresa);

      if (!empresa_aceptante_por_idusuario) {
        log.warn(line(), "Empresa aceptante no asociada al usuario: [" + contactoValidated.empresaid + ", " + session_idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var contacto_por_email = await contactoDao.getContactosByIdempresaAndEmail(tx, empresa_aceptante_por_idusuario._idaceptante, contactoValidated.email, filter_estado);
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
      camposContactoAuditoria.fechacrea = new Date();
      camposContactoAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposContactoAuditoria.fechamod = new Date();
      camposContactoAuditoria.estado = 1;

      const contactoCreated = await contactoDao.insertContacto(tx, {
        ...camposContactoFk,
        ...camposContactoAdicionales,
        ...contactoValidated,
        ...camposContactoAuditoria,
      });
      log.debug(line(), "contactoCreated:", contactoCreated);

      const contactoFiltered = jsonUtils.removeAttributesPrivates(contactoCreated.dataValues);

      return contactoFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...contactoFiltered });
};

export const getContactos = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactos");
  const contactosFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      //log.info(line(),req.session_user.usuario._idusuario);

      const session_idusuario = req.session_user.usuario._idusuario;
      const filter_estados = [1];
      const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(tx, session_idusuario, filter_estados);
      const _idcedentes = empresas_cedentes.map((empresa) => empresa._idempresa);
      const factorings = await factoringDao.getFactoringsByIdcedentes(tx, _idcedentes, filter_estados);
      const _idaceptantes = factorings.map((factoring) => factoring._idaceptante);
      const contactos = await contactoDao.getContactosByIdempresas(tx, _idaceptantes, filter_estados);
      var contactosJson = jsonUtils.sequelizeToJSON(contactos);
      //log.info(line(),empresaObfuscated);

      var contactosFiltered = jsonUtils.removeAttributes(contactosJson, ["score"]);
      contactosFiltered = jsonUtils.removeAttributesPrivates(contactosFiltered);
      return contactosFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, contactosFiltered);
};

export const getContactoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactoMaster");
  const contactoMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const session_idusuario = req.session_user.usuario.idusuario;
      //log.info(line(),req.session_user.usuario.rol_rols);
      const roles = [2]; // Administrador
      const rolesUsuario = req.session_user.usuario.rol_rols.map((role) => role._idrol);
      const tieneRol = roles.some((rol) => rolesUsuario.includes(rol));

      const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(tx, session_idusuario, filter_estados);
      const _idcedentes = empresas_cedentes.map((empresa) => empresa._idempresa);
      const factorings = await factoringDao.getFactoringsByIdcedentes(tx, _idcedentes, filter_estados);
      const _idaceptantes = factorings.map((factoring) => factoring._idaceptante);
      const aceptantes = await empresaDao.getEmpresasByIdempresas(tx, _idaceptantes, filter_estados);

      var contactoMaster: Record<string, any> = {};
      contactoMaster.aceptantes = aceptantes;

      var contactoMasterJSON = jsonUtils.sequelizeToJSON(contactoMaster);
      //jsonUtils.prettyPrint(contactoMasterJSON);
      var contactoMasterObfuscated = contactoMasterJSON;
      //jsonUtils.prettyPrint(contactoMasterObfuscated);
      var contactoMasterFiltered = jsonUtils.removeAttributesPrivates(contactoMasterObfuscated);
      //jsonUtils.prettyPrint(contactoMaster);
      return contactoMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, contactoMasterFiltered);
};
