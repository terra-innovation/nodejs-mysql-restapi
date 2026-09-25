import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import {
  getFactoringsService,
  getFactoringMasterService,
} from "#root/src/services/inversionista/factoring.Service.js";

export const getFactorings = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorings");
  const session_idusuario = req.session_user.usuario.idusuario;

  const factorings = await getFactoringsService(session_idusuario);
  response(res, 201, factorings);
};

export const getFactoringMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringMaster");
  const resultado = await getFactoringMasterService();
  response(res, 201, resultado);
};
