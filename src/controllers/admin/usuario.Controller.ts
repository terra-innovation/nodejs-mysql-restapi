import { Request, Response } from "express";
import * as yup from "yup";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

import {
  activateUsuarioService,
  deleteUsuarioService,
  getUsuarioMasterService,
  getUsuariosService,
} from "#src/services/usuario.Service.js";

export const getUsuarios = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarios");
  const data = await getUsuariosService();
  response(res, 201, data);
};

export const getUsuarioMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioMaster");
  const data = await getUsuarioMasterService();
  response(res, 201, data);
};

export const activateUsuario = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateUsuario");
  const { id } = req.params;
  const usuarioSchema = yup
    .object()
    .shape({
      usuarioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = usuarioSchema.validateSync({ usuarioid: id }, { abortEarly: false, stripUnknown: true });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await activateUsuarioService(validated.usuarioid, idusuario);
  response(res, 204, data);
};

export const deleteUsuario = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteUsuario");
  const { id } = req.params;
  const usuarioSchema = yup
    .object()
    .shape({
      usuarioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = usuarioSchema.validateSync({ usuarioid: id }, { abortEarly: false, stripUnknown: true });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await deleteUsuarioService(validated.usuarioid, idusuario);
  response(res, 204, data);
};
