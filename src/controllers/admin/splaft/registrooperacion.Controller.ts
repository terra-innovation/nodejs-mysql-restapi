import { Request, Response } from "express";
import * as registrooperacionService from "#root/src/services/admin/registrooperacion.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getSplaftRegistroOperaciones = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSplaftRegistroOperaciones");

  const registros = await registrooperacionService.getSplaftRegistroOperacionesService();

  response(res, 200, registros);
};
