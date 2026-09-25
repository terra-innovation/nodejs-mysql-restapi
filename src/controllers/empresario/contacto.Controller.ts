import { Request, Response } from "express";
import { line, log } from "#root/src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as yup from "yup";
import {
  updateContactoService,
  createContactoService,
  getContactosService,
  getContactoMasterService,
  UpdateContactoDto,
  CreateContactoDto,
} from "#root/src/services/empresario/contacto.Service.js";

export const updateContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateContacto");
  const { id } = req.params;
  const session_idusuario = req.session_user.usuario.idusuario;

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

  const contactoValidated = contactoUpdateSchema.validateSync(
    { contactoid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as UpdateContactoDto;
  log.debug(line(), "contactoValidated:", contactoValidated);

  const resultado = await updateContactoService(session_idusuario, contactoValidated);
  response(res, 200, resultado);
};

export const createContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createContacto");
  const session_idusuario = req.session_user.usuario.idusuario;

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

  const contactoValidated = contactoCreateSchema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as CreateContactoDto;
  log.debug(line(), "contactoValidated:", contactoValidated);

  const contactoFiltered = await createContactoService(session_idusuario, contactoValidated);
  response(res, 201, { ...contactoFiltered });
};

export const getContactos = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactos");
  const session_idusuario = req.session_user.usuario.idusuario;

  const contactosFiltered = await getContactosService(session_idusuario);
  response(res, 201, contactosFiltered);
};

export const getContactoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactoMaster");
  const session_idusuario = req.session_user.usuario.idusuario;

  const contactoMasterFiltered = await getContactoMasterService(session_idusuario);
  response(res, 201, contactoMasterFiltered);
};
