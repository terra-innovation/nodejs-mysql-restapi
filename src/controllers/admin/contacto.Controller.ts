import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as contactoService from "#src/services/contacto.Service.js";

export const getContactos = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactos");
  const contactos = await contactoService.getContactosService();
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
  const contactoValidated = contactoCreateSchema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "contactoValidated:", contactoValidated);

  const contactoCreated = await contactoService.createContactoService({
    empresaid: contactoValidated.empresaid,
    nombrecontacto: contactoValidated.nombrecontacto,
    apellidocontacto: contactoValidated.apellidocontacto,
    cargo: contactoValidated.cargo,
    email: contactoValidated.email,
    celular: contactoValidated.celular,
    telefono: contactoValidated.telefono,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

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
  const contactoValidated = contactoUpdateSchema.validateSync(
    { contactoid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "contactoValidated:", contactoValidated);

  await contactoService.updateContactoService({
    contactoid: contactoValidated.contactoid,
    empresaid: contactoValidated.empresaid,
    nombrecontacto: contactoValidated.nombrecontacto,
    apellidocontacto: contactoValidated.apellidocontacto,
    cargo: contactoValidated.cargo,
    email: contactoValidated.email,
    celular: contactoValidated.celular,
    telefono: contactoValidated.telefono,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

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
  const contactoValidated = contactoSchema.validateSync(
    { contactoid: id },
    { abortEarly: false, stripUnknown: true },
  );

  const result = await contactoService.deleteContactoService({
    contactoid: contactoValidated.contactoid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

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
  const contactoValidated = contactoSchema.validateSync(
    { contactoid: id },
    { abortEarly: false, stripUnknown: true },
  );

  const result = await contactoService.activateContactoService({
    contactoid: contactoValidated.contactoid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const getContactoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactoMaster");
  const contactoMasterFiltered = await contactoService.getContactoMasterService();
  response(res, 201, contactoMasterFiltered);
};
