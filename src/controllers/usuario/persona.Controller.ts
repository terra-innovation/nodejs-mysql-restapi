import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput, numberInput, booleanInput, dateInput } from "#src/utils/validationInputs.js";
import * as personaService from "#root/src/services/usuario/persona.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const verifyPersona = async (req: Request, res: Response) => {
  log.debug(line(), "controller::verifyPersona");
  const idusuario = req.session_user?.usuario?.idusuario;
  const NAME_REGX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

  const personaVerifySchema = objectInput(
    z.object({
      idusuario: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value))),
      identificacion_anverso: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      identificacion_reverso: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      identificacion_selfi: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      documentotipoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      documentonumero: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .regex(/^[0-9]*$/, "Ingrese solo números")
          .refine((value) => value.length === 8, "Debe tener exactamente 8 caracteres"),
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
      tienevinculopep: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine(Number.isInteger, "Debe ser un número entero")
          .refine((value) => value <= 1, "Debe ser menor o igual que 1"),
      ),
      espep: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine(Number.isInteger, "Debe ser un número entero")
          .refine((value) => value <= 1, "Debe ser menor o igual que 1"),
      ),
      isdatacorrect: booleanInput(z.boolean()),
    }),
  );

  const personaValidated = personaVerifySchema.parse({ ...req.files, ...req.body, idusuario });
  log.debug(line(), "personaValidated:", personaValidated);

  await personaService.verifyPersonaService(idusuario, personaValidated as personaService.VerifyPersonaPayload);

  response(res, 200, {});
};

export const getPersonaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonaMaster");
  const session_idusuario = req.session_user?.usuario?.idusuario;

  const personaMasterFiltered = await personaService.getPersonaMasterService(session_idusuario);

  response(res, 201, personaMasterFiltered);
};
