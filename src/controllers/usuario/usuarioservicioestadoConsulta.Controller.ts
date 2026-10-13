import type { Request, Response } from "express";
import { z } from "zod";
import { stringInput, inputUuidPattern } from "#src/utils/validationInputs.js";
import { getEstadoSuscripcionService } from "#src/services/usuario/usuarioservicioestadoConsulta.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";

export const getEstadoSuscripcion = async (req: Request, res: Response) => {
  const id = stringInput(
    z
      .string()
      .refine((value) => value.length > 0, "Campo requerido")
      .regex(inputUuidPattern),
  ).parse(req.params.id);
  const estado = await getEstadoSuscripcionService(req.session_user.usuario.idusuario, id);
  res.setHeader("Cache-Control", "no-store");
  response(res, 200, estado);
};
