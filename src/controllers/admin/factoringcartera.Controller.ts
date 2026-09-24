import { line, log } from "#root/src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { Request, Response } from "express";
import * as factoringcarteraService from "#src/services/factoringcartera.Service.js";

export const getFactoringcarteraResumen = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringcarteraResumen");
  const resumen = await factoringcarteraService.getFactoringcarteraResumenService();
  response(res, 200, resumen);
};
