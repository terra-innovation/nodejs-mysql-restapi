import { Request, Response } from "express";
import * as menuService from "#root/src/services/usuario/menu.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getMenu = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getMenu");

  const session_usuario = req.session_user.usuario;
  log.debug(line(), "session_idusuario", session_usuario?.idusuario);

  const menuItems = menuService.getMenuService(session_usuario);

  response(res, 201, menuItems);
};
