import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import * as factoringtransferenciacedenteService from "#src/services/empresario/factoringtransferenciacedente.Service.js";

export const downloadConstanciaFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringtransferenciacedentePDF");
  const { factoringtransferenciacedenteid } = req.params;
  const schema = objectInput(
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
  const validated = schema.parse({ factoringtransferenciacedenteid });
  log.debug(line(), "validated:", validated);

  const { rutaAbsoluta, nombreoriginal } = await factoringtransferenciacedenteService.downloadConstanciaFactoringtransferenciacedenteService({
    factoringtransferenciacedenteid: validated.factoringtransferenciacedenteid,
  });

  setDownloadHeaders(res, nombreoriginal);
  await sendFileAsync(req, res, rutaAbsoluta);
};

export const getFactoringtransferenciacedentesByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringtransferenciacedentesByFactoringid");
  const { factoringid } = req.params;
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
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSearchSchema.parse({ factoringid: factoringid, ...req.body });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedentesJson = await factoringtransferenciacedenteService.getFactoringtransferenciacedentesByFactoringidService({
    factoringid: factoringtransferenciacedenteValidated.factoringid,
  });

  response(res, 201, factoringtransferenciacedentesJson);
};
