import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import {
  getUsuarioservicioempresasService,
  getUsuarioservicioempresaMasterService,
} from "#root/src/services/empresario/usuarioservicioempresa.Service.js";

export const getUsuarioservicioempresas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioservicioempresas");
  const session_idusuario = req.session_user.usuario.idusuario;

  const empresas = await getUsuarioservicioempresasService(session_idusuario);
  response(res, 201, empresas);
};

export const getUsuarioservicioempresaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioservicioempresaMaster");
  const empresasMasterFiltered = await getUsuarioservicioempresaMasterService();
  response(res, 201, empresasMasterFiltered);
};
