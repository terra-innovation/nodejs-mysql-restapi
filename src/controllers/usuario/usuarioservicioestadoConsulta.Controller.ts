import type { Request, Response } from "express";
import * as yup from "yup";
import { getEstadoSuscripcionService } from "#src/services/usuario/usuarioservicioestadoConsulta.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";

export const getEstadoSuscripcion = async (req: Request, res: Response) => {
  const id = yup.string().required().uuid().validateSync(req.params.id);
  const estado = await getEstadoSuscripcionService(req.session_user.usuario.idusuario, id);
  res.setHeader("Cache-Control", "no-store");
  response(res, 200, estado);
};
