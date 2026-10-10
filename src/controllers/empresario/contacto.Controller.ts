import { Request, Response } from "express";
import { line, log } from "#root/src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { z } from "zod";
import { objectInput, stringInput, inputEmailPattern } from "#src/utils/validationInputs.js";
import { updateContactoService, createContactoService, getContactosService, getContactoMasterService, UpdateContactoDto, CreateContactoDto } from "#root/src/services/empresario/contacto.Service.js";

export const updateContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateContacto");
  const { id } = req.params;
  const session_idusuario = req.session_user.usuario.idusuario;

  const contactoUpdateSchema = objectInput(
    z.object({
      contactoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      nombrecontacto: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
      ),
      apellidocontacto: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
      ),
      cargo: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
      ),
      email: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value === "" || inputEmailPattern.test(value), "Debe ser un correo válido")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
      ),
      celular: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
      ),
      telefono: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
      ),
    }),
  );

  const contactoValidated = contactoUpdateSchema.parse({ contactoid: id, ...req.body }) as UpdateContactoDto;
  log.debug(line(), "contactoValidated:", contactoValidated);

  const resultado = await updateContactoService(session_idusuario, contactoValidated);
  response(res, 200, resultado);
};

export const createContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createContacto");
  const session_idusuario = req.session_user.usuario.idusuario;

  const contactoCreateSchema = objectInput(
    z.object({
      empresaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      nombrecontacto: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
      ),
      apellidocontacto: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
      ),
      cargo: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
      ),
      email: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value === "" || inputEmailPattern.test(value), "Debe ser un correo válido")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
      ),
      celular: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
      ),
      telefono: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
      ),
    }),
  );

  const contactoValidated = contactoCreateSchema.parse({ ...req.body }) as CreateContactoDto;
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
