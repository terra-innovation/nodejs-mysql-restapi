import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import {
  getFactoringhistorialestadoMasterService,
  getFactoringhistorialestadosByFactoringidService,
  getFactoringhistorialestadosService,
} from "#src/services/financiero/factoringhistorialestado.Service.js";

export const getFactoringhistorialestadosByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestadosByFactoringid");
  const { id } = req.params;
  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = factoringhistorialestadoSchema.validateSync(
    { factoringid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringhistorialestadoValidated:", validated);

  const data = await getFactoringhistorialestadosByFactoringidService({
    factoringid: validated.factoringid,
  });

  response(res, 201, data);
};

export const getFactoringhistorialestadoMaster = async (_req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestadoMaster");
  const data = await getFactoringhistorialestadoMasterService();
  response(res, 201, data);
};

export const getFactoringhistorialestados = async (_req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestados");
  const data = await getFactoringhistorialestadosService();
  response(res, 201, data);
};
