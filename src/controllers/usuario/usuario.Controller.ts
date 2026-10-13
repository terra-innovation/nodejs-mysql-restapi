import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { getYoUsuarioService } from "#root/src/services/usuario/usuario.Service.js";

export const yoUsuario = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioYo");

  const { id } = req.params;
  const usuarioSchema = objectInput(
    z.object({
      usuarioid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const usuarioValidated = usuarioSchema.parse({ usuarioid: id });
  log.debug(line(), "usuarioValidated:", usuarioValidated);

  const session_idusuario = req.session_user?.usuario?.idusuario;
  const usuarioFiltered = await getYoUsuarioService(session_idusuario, usuarioValidated.usuarioid);

  response(res, 201, usuarioFiltered);
};
