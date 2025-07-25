import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";

import * as contactoDao from "#src/daos/contacto.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as facturaDao from "#src/daos/factura.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import type { contacto } from "#root/generated/prisma/ft_factoring/client.js";

export const getContactos = async (req: Request, res: Response) => {
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
  const contactosFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user.usuario.idusuario;
      const filter_estados = [1];
      var empresa = await empresaDao.getEmpresaByEmpresaid(tx, contactoValidated.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + contactoValidated.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factura = await facturaDao.getFacturaByFacturaid(tx, contactoValidated.facturaid);
      if (!factura) {
        log.warn(line(), "Factura no existe: [" + contactoValidated.facturaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factura_upload = await facturaDao.getFacturaByIdfacturaAndIdusuarioupload(tx, factura.idfactura, session_idusuario);
      if (!factura_upload) {
        log.warn(line(), "Factura no asociada al usuario: ", { factura, session_idusuario });
        throw new ClientError("Datos no válidos", 404);
      }

      const isEmpresaAllowed = empresa.ruc === factura_upload.cliente_ruc;
      if (!isEmpresaAllowed) {
        log.warn(line(), "Empresa aceptante no asociada a la factura: ", { empresa, factura_upload });
        throw new ClientError("Datos no válidos", 404);
      }

      const contactos = await contactoDao.getContactosByIdempresas(tx, [empresa.idempresa], filter_estados);
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

export const createContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createContacto");
  const session_idusuario = req.session_user.usuario.idusuario;
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

  const contactoFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user.usuario.idusuario;
      const filter_estados = [1];
      var empresa = await empresaDao.getEmpresaByEmpresaid(tx, contactoValidated.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + contactoValidated.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factura = await facturaDao.getFacturaByFacturaid(tx, contactoValidated.facturaid);
      if (!factura) {
        log.warn(line(), "Factura no existe: [" + contactoValidated.facturaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factura_upload = await facturaDao.getFacturaByIdfacturaAndIdusuarioupload(tx, factura.idfactura, session_idusuario);
      if (!factura_upload) {
        log.warn(line(), "Factura no asociada al usuario: ", { factura, session_idusuario });
        throw new ClientError("Datos no válidos", 404);
      }

      const isEmpresaAllowed = empresa.ruc === factura_upload.cliente_ruc;
      if (!isEmpresaAllowed) {
        log.warn(line(), "Empresa aceptante no asociada a la factura: ", { empresa, factura_upload });
        throw new ClientError("Datos no válidos", 404);
      }

      var contacto_por_email = await contactoDao.getContactosByIdempresaAndEmail(tx, empresa.idempresa, contactoValidated.email, filter_estado);
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

export const getContactoMaster = async (req: Request, res: Response) => {
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
  const contactoMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user.usuario.idusuario;
      const filter_estados = [1];
      var empresa = await empresaDao.getEmpresaByEmpresaid(tx, contactoValidated.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + contactoValidated.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factura = await facturaDao.getFacturaByFacturaid(tx, contactoValidated.facturaid);
      if (!factura) {
        log.warn(line(), "Factura no existe: [" + contactoValidated.facturaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factura_upload = await facturaDao.getFacturaByIdfacturaAndIdusuarioupload(tx, factura.idfactura, session_idusuario);
      if (!factura_upload) {
        log.warn(line(), "Factura no asociada al usuario: ", { factura, session_idusuario });
        throw new ClientError("Datos no válidos", 404);
      }

      const isEmpresaAllowed = empresa.ruc === factura_upload.cliente_ruc;
      if (!isEmpresaAllowed) {
        log.warn(line(), "Empresa aceptante no asociada a la factura: ", { empresa, factura_upload });
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
      return contactoMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, contactoMasterFiltered);
};
