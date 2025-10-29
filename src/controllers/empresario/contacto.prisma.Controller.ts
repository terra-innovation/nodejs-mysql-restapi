import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import type { contacto } from "#root/generated/prisma/ft_factoring/client.js";

import * as contactoDao from "#src/daos/contacto.prisma.Dao.js";
import * as usuarioservicioempresaDao from "#src/daos/usuarioservicioempresa.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#root/src/utils/logger.pino.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const createContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createContacto");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [1, 2];
  const idservicio = 1;
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

      const usuarioservicioempresa = await usuarioservicioempresaDao.getUsuarioservicioempresaByIdusuarioIdServicioIdempresa(tx, session_idusuario, idservicio, empresa.idempresa);
      if (!usuarioservicioempresa) {
        log.warn(line(), "Empresa aceptante no asociada al usuario: [" + contactoValidated.empresaid + ", " + session_idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var contacto_por_email = await contactoDao.getContactosByIdempresaAndEmail(tx, usuarioservicioempresa.idempresa, contactoValidated.email, filter_estado);
      if (contacto_por_email && contacto_por_email.length > 0) {
        log.warn(line(), "El email [" + contactoValidated.email + "] se encuentra registrado. Ingrese un contacto diferente.");
        throw new ClientError("El email [" + contactoValidated.email + "] se encuentra registrado. Ingrese un contacto diferente.", 404);
      }

      const contactoToCreate: Prisma.contactoCreateInput = {
        empresa: { connect: { idempresa: empresa.idempresa } },
        contactoid: uuidv4(),
        code: uuidv4().split("-")[0],

        nombrecontacto: contactoValidated.nombrecontacto,
        apellidocontacto: contactoValidated.apellidocontacto,
        cargo: contactoValidated.cargo,
        email: contactoValidated.email,
        celular: contactoValidated.celular,
        telefono: contactoValidated.telefono,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const contactoCreated = await contactoDao.insertContacto(tx, contactoToCreate);
      log.debug(line(), "contactoCreated:", contactoCreated);

      const contactoFiltered = jsonUtils.removeAttributesPrivates(contactoCreated);

      return contactoFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...contactoFiltered });
};

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
      const _idusuario_session = req.session_user.usuario.idusuario;
      const contacto = await contactoDao.getContactoByContactoid(tx, contactoValidated.contactoid);
      if (!contacto) {
        log.warn(line(), "Contacto no existe: [" + contactoValidated.contactoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(tx, _idusuario_session, filter_estados);
      const _idcedentes = empresas_cedentes.map((empresa) => empresa.idempresa);
      const factorings = await factoringDao.getFactoringsByIdcedentes(tx, _idcedentes, filter_estados);
      const contactoAllowed = factorings.find((factoring) => factoring.idaceptante === contacto.idempresa);

      if (!contactoAllowed) {
        log.warn(line(), "Empresa aceptante no asociada al usuario: [" + contacto.idempresa + ", " + _idusuario_session + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const contactoToUpdate: Prisma.contactoUpdateInput = {
        nombrecontacto: contactoValidated.nombrecontacto,
        apellidocontacto: contactoValidated.apellidocontacto,
        cargo: contactoValidated.cargo,
        email: contactoValidated.email,
        celular: contactoValidated.celular,
        telefono: contactoValidated.telefono,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const contactoUpdated = await contactoDao.updateContacto(tx, contacto.contactoid, contactoToUpdate);
      log.debug(line(), "contactoUpdated", contactoUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, {});
};

export const getContactos = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactos");
  const contactosFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      //log.info(line(),req.session_user.usuario.idusuario);

      const session_idusuario = req.session_user.usuario.idusuario;
      const filter_estados = [1];

      const contactos = await contactoDao.getContactosByIdusuario(tx, session_idusuario, filter_estados);

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

      const aceptantes = await empresaDao.getEmpresasByIdusuario(tx, session_idusuario, filter_estados);

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
