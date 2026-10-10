import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { getFactoringpropuestahistorialestadoMasterService, getFactoringpropuestahistorialestadosByFactoringpropuestaidService, getFactoringpropuestahistorialestadosService } from "#src/services/financiero/factoringpropuestahistorialestado.Service.js";

export const getFactoringpropuestahistorialestadosByFactoringpropuestaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestadosByFactoringpropuestaid");
  const { id } = req.params;
  const factoringpropuestahistorialestadoSchema = objectInput(
    z.object({
      factoringpropuestaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validated = factoringpropuestahistorialestadoSchema.parse({ factoringpropuestaid: id, ...req.body });
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
