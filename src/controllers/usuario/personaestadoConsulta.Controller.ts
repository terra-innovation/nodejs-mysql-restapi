import type { Request, Response } from "express";
import { getEstadoPersonaService } from "#src/services/usuario/personaestadoConsulta.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";

export const getEstadoPersona = async (req: Request, res: Response) => {
  const estado = await getEstadoPersonaService(req.session_user.usuario.idusuario);
  res.setHeader("Cache-Control", "no-store");
  response(res, 200, estado);
};
