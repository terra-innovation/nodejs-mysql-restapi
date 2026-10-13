import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { getFactoringhistorialestadoMasterService, getFactoringhistorialestadosByFactoringidService, getFactoringhistorialestadosService } from "#src/services/financiero/factoringhistorialestado.Service.js";

export const getFactoringhistorialestadosByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestadosByFactoringid");
  const { id } = req.params;
  const factoringhistorialestadoSchema = objectInput(
    z.object({
      factoringid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validated = factoringhistorialestadoSchema.parse({ factoringid: id, ...req.body });
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
