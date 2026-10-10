import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { updateCredencialService, UpdateCredencialDto } from "#root/src/services/usuario/credencial.Service.js";

export const updateCredencial = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateCredencial");

  const { id } = req.params;
  const credencialSchema = objectInput(
    z
      .object({
        usuarioid: stringInput(
          z
            .string()
            .refine((value) => value.length > 0, "Campo requerido")
            .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
            .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
          { trim: true },
        ),
        old: stringInput(z.string({ error: "La contraseña es obligatoria" }).refine((value) => value.length > 0, "La contraseña es obligatoria")),
        password: stringInput(
          z
            .string({ error: "La nueva contraseña es obligatoria" })
            .refine((value) => value.length > 0, "La nueva contraseña es obligatoria")
            .refine((value) => value.length >= 8, "La nueva contraseña debe tener al menos 8 caracteres")
            .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
            .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
            .regex(/\d/, "Debe contener al menos un número")
            .regex(new RegExp("[@$!%*?&#^()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]"), "Debe contener al menos un carácter especial"),
        ),
        confirm: stringInput(
          z
            .string({ error: "La confirmación de la contraseña es obligatoria" })
            .refine((value) => value.length > 0, "La confirmación de la contraseña es obligatoria")
            .refine((value) => value.length >= 8, "La cofirmación del contraseña debe tener al menos 8 caracteres"),
        ),
      })
      .refine((value) => value.password === value.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden" }),
  );

  const credencialValidated = credencialSchema.parse({ usuarioid: id, ...req.body }) as UpdateCredencialDto;
  log.debug(line(), "credencialValidated:", credencialValidated);

  const session_idusuario = req.session_user?.usuario?.idusuario;
  const result = await updateCredencialService(session_idusuario, credencialValidated);

  response(res, 200, result);
};
