import { Request, Response } from "express";
import * as yup from "yup";
import * as accionistaService from "#root/src/services/admin/accionista.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getAccionistasByEmpresaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getAccionistasByEmpresaid");
  const { id } = req.params;

  const accionistaSearchSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const accionistaValidated = accionistaSearchSchema.validateSync(
    { empresaid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "accionistaValidated:", accionistaValidated);

  const accionistasJson = await accionistaService.getAccionistasByEmpresaidService(accionistaValidated.empresaid);

  response(res, 201, accionistasJson);
};
