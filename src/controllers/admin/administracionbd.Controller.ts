import * as administracionbdService from "#root/src/services/admin/administracionbd.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput } from "#src/utils/validationInputs.js";

export const getTimezones = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getTimezones");
  const usuariopedidoCreateSchema = objectInput(z.object({}));
  const usuariopedidoValidated = usuariopedidoCreateSchema.parse(req.body);
  log.debug(line(), "usuariopedidoValidated:", usuariopedidoValidated);

  const data = await administracionbdService.getTimezonesService();
  response(res, 201, data);
};
