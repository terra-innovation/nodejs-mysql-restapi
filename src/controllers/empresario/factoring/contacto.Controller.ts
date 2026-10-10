import { Request, Response } from "express";
import { line, log } from "#src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { z } from "zod";
import { objectInput, stringInput, inputEmailPattern } from "#src/utils/validationInputs.js";
import { getContactosForFactoringService, createContactoForFactoringService, getContactoMasterForFactoringService, ContactoFactoringFilterDto, CreateContactoForFactoringDto } from "#root/src/services/empresario/contacto.Service.js";

export const getContactos = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactos");
  const session_idusuario = req.session_user.usuario.idusuario;

  const contactoSchema = objectInput(
    z.object({
      facturaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      empresaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const contactoValidated = contactoSchema.parse({ ...req.body }) as ContactoFactoringFilterDto;
  log.debug(line(), "contactoValidated:", contactoValidated);

  const contactosFiltered = await getContactosForFactoringService(session_idusuario, contactoValidated);
  response(res, 201, contactosFiltered);
};

export const createContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createContacto");
  const session_idusuario = req.session_user.usuario.idusuario;

  const contactoCreateSchema = objectInput(
    z.object({
      facturaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
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

  const contactoValidated = contactoCreateSchema.parse({ ...req.body }) as CreateContactoForFactoringDto;
  log.debug(line(), "contactoValidated:", contactoValidated);

  const contactoFiltered = await createContactoForFactoringService(session_idusuario, contactoValidated);
  response(res, 201, { ...contactoFiltered });
};

export const getContactoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactoMaster");
  const session_idusuario = req.session_user.usuario.idusuario;

  const contactoSchema = objectInput(
    z.object({
      facturaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      empresaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const contactoValidated = contactoSchema.parse({ ...req.body }) as ContactoFactoringFilterDto;
  log.debug(line(), "contactoValidated:", contactoValidated);

  const contactoMasterFiltered = await getContactoMasterForFactoringService(session_idusuario, contactoValidated);
  response(res, 201, contactoMasterFiltered);
};
