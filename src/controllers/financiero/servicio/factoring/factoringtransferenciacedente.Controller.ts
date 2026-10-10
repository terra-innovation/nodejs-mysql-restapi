import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { sendCorreoFactoringtransferenciacedenteService, getFactoringtransferenciacedentesByFactoringidService, getFactoringtransferenciacedenteMasterByFactoringidService } from "#root/src/services/financiero/factoringtransferenciacedente.Service.js";

export const sendCorreoFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendCorreoFactoringtransferenciacedente");
  const { id } = req.params;
  const factoringtransferenciacedenteUpdateSchema = objectInput(
    z.object({
      factoringtransferenciacedenteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteUpdateSchema.parse({ factoringtransferenciacedenteid: id, ...req.body });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  await sendCorreoFactoringtransferenciacedenteService(factoringtransferenciacedenteValidated.factoringtransferenciacedenteid);
  response(res, 200, {});
};

export const getFactoringtransferenciacedentesByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringtransferenciacedentesByFactoringid");
  const { id } = req.params;
  const factoringtransferenciacedenteSearchSchema = objectInput(
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
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSearchSchema.parse({ factoringid: id, ...req.body });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedentesJson = await getFactoringtransferenciacedentesByFactoringidService(factoringtransferenciacedenteValidated.factoringid);
  response(res, 201, factoringtransferenciacedentesJson);
};

export const getFactoringtransferenciacedenteMasterByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringtransferenciacedenteMaster");
  const { factoringid } = req.params;
  const factoringtransferenciacedenteSchema = objectInput(
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
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSchema.parse({ factoringid });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedentesMasterFiltered = await getFactoringtransferenciacedenteMasterByFactoringidService(factoringtransferenciacedenteValidated.factoringid);
  response(res, 201, factoringtransferenciacedentesMasterFiltered);
};
