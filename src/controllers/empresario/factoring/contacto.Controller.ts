import { Request, Response } from "express";
import { line, log } from "#src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as yup from "yup";
import {
  getContactosForFactoringService,
  createContactoForFactoringService,
  getContactoMasterForFactoringService,
  ContactoFactoringFilterDto,
  CreateContactoForFactoringDto,
} from "#root/src/services/empresario/contacto.Service.js";

export const getContactos = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactos");
  const session_idusuario = req.session_user.usuario.idusuario;

  const contactoSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const contactoValidated = contactoSchema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as ContactoFactoringFilterDto;
  log.debug(line(), "contactoValidated:", contactoValidated);

  const contactosFiltered = await getContactosForFactoringService(session_idusuario, contactoValidated);
  response(res, 201, contactosFiltered);
};

export const createContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createContacto");
  const session_idusuario = req.session_user.usuario.idusuario;

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

  const contactoValidated = contactoCreateSchema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as CreateContactoForFactoringDto;
  log.debug(line(), "contactoValidated:", contactoValidated);

  const contactoFiltered = await createContactoForFactoringService(session_idusuario, contactoValidated);
  response(res, 201, { ...contactoFiltered });
};

export const getContactoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactoMaster");
  const session_idusuario = req.session_user.usuario.idusuario;

  const contactoSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const contactoValidated = contactoSchema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as ContactoFactoringFilterDto;
  log.debug(line(), "contactoValidated:", contactoValidated);

  const contactoMasterFiltered = await getContactoMasterForFactoringService(session_idusuario, contactoValidated);
  response(res, 201, contactoMasterFiltered);
};
