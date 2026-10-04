import * as factoringcarteraService from "#root/src/services/admin/factoringcartera.Service.js";
import { line, log } from "#root/src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { Request, Response } from "express";

export const getFactoringcarteraResumen = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringcarteraResumen");
  const resumen = await factoringcarteraService.getFactoringcarteraResumenService();
  response(res, 200, resumen);
};
