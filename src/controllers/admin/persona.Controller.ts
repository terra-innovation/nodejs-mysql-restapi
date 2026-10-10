import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput, dateInput } from "#src/utils/validationInputs.js";

import { activatePersonaService, deletePersonaService, getPersonaMasterService, getPersonasService, updatePersonaService, type PersonaUpdateDto } from "#root/src/services/admin/persona.Service.js";

export const activatePersona = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activatePersona");
  const { id } = req.params;
  const personaSchema = objectInput(
    z.object({
      personaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = personaSchema.parse({ personaid: id });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await activatePersonaService(validated.personaid, idusuario);
  response(res, 204, data);
};

export const deletePersona = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deletePersona");
  const { id } = req.params;
  const personaSchema = objectInput(
    z.object({
      personaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = personaSchema.parse({ personaid: id });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await deletePersonaService(validated.personaid, idusuario);
  response(res, 204, data);
};

export const getPersonaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonaMaster");
  const data = await getPersonaMasterService();
  response(res, 201, data);
};

export const updatePersona = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updatePersona");
  const { id } = req.params;
  const NAME_REGX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
  const personaUpdateSchema = objectInput(
    z.object({
      personaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      personanombres: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .regex(NAME_REGX, "Debe ser un nombre válido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
        { trim: true },
      ),
      apellidopaterno: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .regex(NAME_REGX, "Debe ser un apellido válido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      apellidomaterno: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .regex(NAME_REGX, "Debe ser un apellido válido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      paisnacionalidadid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      paisnacimientoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      paisresidenciaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      distritoresidenciaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      generoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      fechanacimiento: dateInput(z.date()),
      direccion: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      direccionreferencia: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = personaUpdateSchema.parse({ personaid: id, ...req.body }) as unknown as PersonaUpdateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  await updatePersonaService(validated, idusuario);
  response(res, 200, {});
};

export const getPersonas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonas");
  const data = await getPersonasService();
  response(res, 201, data);
};
