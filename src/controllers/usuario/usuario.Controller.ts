import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as yup from "yup";
import { getYoUsuarioService } from "#root/src/services/usuario/usuario.Service.js";

export const yoUsuario = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioYo");

  const { id } = req.params;
  const usuarioSchema = yup
    .object()
    .shape({
      usuarioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const usuarioValidated = usuarioSchema.validateSync({ usuarioid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "usuarioValidated:", usuarioValidated);

  const session_idusuario = req.session_user?.usuario?.idusuario;
  const usuarioFiltered = await getYoUsuarioService(session_idusuario, usuarioValidated.usuarioid);

  response(res, 201, usuarioFiltered);
};
