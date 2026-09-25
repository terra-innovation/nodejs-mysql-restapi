import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { getUsuarioService } from "#root/src/services/empresario/usuario.Service.js";

export const getUsuario = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuario");
  const session_idusuario = req.session_user.usuario.idusuario;

  const usuarioFiltered = await getUsuarioService(session_idusuario);
  response(res, 201, usuarioFiltered);
};
