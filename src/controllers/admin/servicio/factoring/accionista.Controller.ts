import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import * as accionistaService from "#root/src/services/admin/accionista.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getAccionistasByEmpresaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getAccionistasByEmpresaid");
  const { id } = req.params;

  const accionistaSearchSchema = objectInput(
    z.object({
      empresaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const accionistaValidated = accionistaSearchSchema.parse({ empresaid: id, ...req.body });
  log.debug(line(), "accionistaValidated:", accionistaValidated);

  const accionistasJson = await accionistaService.getAccionistasByEmpresaidService(accionistaValidated.empresaid);

  response(res, 201, accionistasJson);
};
