import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as administracionbdService from "#src/services/administracionbd.Service.js";

export const getTimezones = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getTimezones");
  const usuariopedidoCreateSchema = yup.object().shape({}).required();
  const usuariopedidoValidated = usuariopedidoCreateSchema.validateSync(
    req.body,
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "usuariopedidoValidated:", usuariopedidoValidated);

  const data = await administracionbdService.getTimezonesService();
  response(res, 201, data);
};
