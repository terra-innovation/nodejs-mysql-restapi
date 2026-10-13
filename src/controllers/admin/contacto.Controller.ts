import * as contactoService from "#root/src/services/admin/contacto.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput, inputEmailPattern } from "#src/utils/validationInputs.js";

export const getContactos = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getContactos");
  const contactos = await contactoService.getContactosService();
  response(res, 201, contactos);
};

export const createContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createContacto");
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
        { trim: true },
      ),
      apellidocontacto: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
        { trim: true },
      ),
      cargo: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
        { trim: true },
      ),
      email: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value === "" || inputEmailPattern.test(value), "Debe ser un correo válido")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
        { trim: true },
      ),
      celular: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
        { trim: true },
      ),
      telefono: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
    }),
  );
  const contactoValidated = contactoCreateSchema.parse({ ...req.body });
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
      empresaid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .optional(),
        { trim: true },
      ),
      nombrecontacto: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
        { trim: true },
      ),
      apellidocontacto: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
        { trim: true },
      ),
      cargo: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
        { trim: true },
      ),
      email: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value === "" || inputEmailPattern.test(value), "Debe ser un correo válido")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
        { trim: true },
      ),
      celular: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
        { trim: true },
      ),
      telefono: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
    }),
  );
  const contactoValidated = contactoUpdateSchema.parse({ contactoid: id, ...req.body });
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
  const contactoSchema = objectInput(
    z.object({
      contactoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const contactoValidated = contactoSchema.parse({ contactoid: id });

  const result = await contactoService.deleteContactoService({
    contactoid: contactoValidated.contactoid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const activateContacto = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateContacto");
  const { id } = req.params;
  const contactoSchema = objectInput(
    z.object({
      contactoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const contactoValidated = contactoSchema.parse({ contactoid: id });

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
