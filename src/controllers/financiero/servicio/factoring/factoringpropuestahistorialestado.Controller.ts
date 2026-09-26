import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import {
  getFactoringpropuestahistorialestadoMasterService,
  getFactoringpropuestahistorialestadosByFactoringpropuestaidService,
  getFactoringpropuestahistorialestadosService,
} from "#src/services/financiero/factoringpropuestahistorialestado.Service.js";

export const getFactoringpropuestahistorialestadosByFactoringpropuestaid = async (
  req: Request,
  res: Response,
) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestadosByFactoringpropuestaid");
  const { id } = req.params;
  const factoringpropuestahistorialestadoSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = factoringpropuestahistorialestadoSchema.validateSync(
    { factoringpropuestaid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", validated);

  const data = await getFactoringpropuestahistorialestadosByFactoringpropuestaidService({
    factoringpropuestaid: validated.factoringpropuestaid,
  });

  response(res, 201, data);
};

export const getFactoringpropuestahistorialestadoMaster = async (_req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestadoMaster");
  const data = await getFactoringpropuestahistorialestadoMasterService();
  response(res, 201, data);
};

export const getFactoringpropuestahistorialestados = async (_req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestados");
  const data = await getFactoringpropuestahistorialestadosService();
  response(res, 201, data);
};
