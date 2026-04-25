import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as contactoDao from "#src/daos/contacto.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#root/src/utils/logger.pino.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const getContactos = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactos");
  const contactos = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const contactos = await contactoDao.getContactos(tx, filter_estado);

      return contactos;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, contactos);
};

export const createContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createContacto");
  const contactoCreateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      nombrecontacto: yup.string().trim().required().max(100),
      apellidocontacto: yup.string().trim().required().max(100),
      cargo: yup.string().trim().required().max(100),
      email: yup.string().trim().required().email().min(5).max(100),
      celular: yup.string().trim().required().min(5).max(20),
      telefono: yup.string().trim().required().min(5).max(50),
    })
    .required();
  const contactoValidated = contactoCreateSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "contactoValidated:", contactoValidated);

  const contactoCreated = await prismaFT.client.$transaction(
    async (tx) => {
      const empresa = await empresaDao.getEmpresaByEmpresaid(tx, contactoValidated.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + contactoValidated.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const contacto_por_email = await contactoDao.getContactosByIdempresaAndEmail(tx, empresa.idempresa, contactoValidated.email, filter_estado);
      if (contacto_por_email && contacto_por_email.length > 0) {
        log.warn(line(), "El email [" + contactoValidated.email + "] se encuentra registrado para esta empresa.");
        throw new ClientError("El email [" + contactoValidated.email + "] se encuentra registrado para esta empresa.", 400);
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
        estado: ESTADO.ACTIVO,
      };

      const result = await contactoDao.insertContacto(tx, contactoToCreate);
      log.debug(line(), "contactoCreated:", result);

      return jsonUtils.removeAttributesPrivates(result);
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, contactoCreated);
};

export const updateContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateContacto");
  const { id } = req.params;
  const contactoUpdateSchema = yup
    .object()
    .shape({
      contactoid: yup.string().trim().required().min(36).max(36),
      empresaid: yup.string().trim().min(36).max(36),
      nombrecontacto: yup.string().trim().required().max(100),
      apellidocontacto: yup.string().trim().required().max(100),
      cargo: yup.string().trim().required().max(100),
      email: yup.string().trim().required().email().min(5).max(100),
      celular: yup.string().trim().required().min(5).max(20),
      telefono: yup.string().trim().required().min(5).max(50),
    })
    .required();
  const contactoValidated = contactoUpdateSchema.validateSync({ contactoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "contactoValidated:", contactoValidated);

  await prismaFT.client.$transaction(
    async (tx) => {
      const contacto = await contactoDao.getContactoByContactoid(tx, contactoValidated.contactoid);
      if (!contacto) {
        log.warn(line(), "Contacto no existe: [" + contactoValidated.contactoid + "]");
        throw new ClientError("Contacto no encontrado", 404);
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

      if (contactoValidated.empresaid) {
        const empresa = await empresaDao.getEmpresaByEmpresaid(tx, contactoValidated.empresaid);
        if (!empresa) {
          log.warn(line(), "Empresa no existe: [" + contactoValidated.empresaid + "]");
          throw new ClientError("Empresa no válida", 404);
        }
        contactoToUpdate.empresa = { connect: { idempresa: empresa.idempresa } };
      }

      const contactoUpdated = await contactoDao.updateContacto(tx, contacto.contactoid, contactoToUpdate);
      log.debug(line(), "contactoUpdated", contactoUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 200, {});
};

export const deleteContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteContacto");
  const { id } = req.params;
  const contactoSchema = yup
    .object()
    .shape({
      contactoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const contactoValidated = contactoSchema.validateSync({ contactoid: id }, { abortEarly: false, stripUnknown: true });

  const result = await prismaFT.client.$transaction(
    async (tx) => {
      const result = await contactoDao.deleteContacto(tx, contactoValidated.contactoid, req.session_user.usuario.idusuario);
      log.debug(line(), "contactoDeleted:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, result);
};

export const activateContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateContacto");
  const { id } = req.params;
  const contactoSchema = yup
    .object()
    .shape({
      contactoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const contactoValidated = contactoSchema.validateSync({ contactoid: id }, { abortEarly: false, stripUnknown: true });

  const result = await prismaFT.client.$transaction(
    async (tx) => {
      const result = await contactoDao.activateContacto(tx, contactoValidated.contactoid, req.session_user.usuario.idusuario);
      log.debug(line(), "contactoActivated:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, result);
};

export const getContactoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactoMaster");
  const contactoMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const empresas = await empresaDao.getEmpresas(tx, filter_estados);

      var contactoMaster: Record<string, any> = {};
      contactoMaster.empresas = empresas;

      var contactoMasterJSON = jsonUtils.sequelizeToJSON(contactoMaster);
      var contactoMasterFiltered = jsonUtils.removeAttributesPrivates(contactoMasterJSON);
      return contactoMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, contactoMasterFiltered);
};
