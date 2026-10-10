import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import * as zlaboratorioService from "#root/src/services/admin/zlaboratorio.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const validateTransaction = async (req: Request, res: Response) => {
  log.debug(line(), "controller::validateTransaction");
  const session_idusuario = req.session_user.usuario.idusuario;

  const usuariopedidoCreateSchema = objectInput(
    z.object({
      nombre: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      pedido: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
    }),
  );

  const usuariopedidoValidated = usuariopedidoCreateSchema.parse(req.body);
  log.debug(line(), "usuariopedidoValidated:", usuariopedidoValidated);

  const resultado = await zlaboratorioService.validateTransactionService(session_idusuario, usuariopedidoValidated as zlaboratorioService.ValidateTransactionPayload);

  response(res, 201, { ...resultado });
};
