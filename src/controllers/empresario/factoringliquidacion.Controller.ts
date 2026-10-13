import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { unlink } from "fs/promises";
import * as factoringliquidacionService from "#src/services/empresario/factoringliquidacion.Service.js";

export const downloadFactoringliquidacionPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringliquidacionPDF");
  const { factoringliquidacionid } = req.params;
  const schema = objectInput(
    z.object({
      factoringliquidacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = schema.parse({ factoringliquidacionid });
  log.debug(line(), "validated:", validated);

  const { filePath, filenameDownload } = await factoringliquidacionService.generateFactoringliquidacionPDFService({
    factoringliquidacionid: validated.factoringliquidacionid,
  });

  setDownloadHeaders(res, filenameDownload);
  await sendFileAsync(req, res, filePath);
  await unlink(filePath);
};

export const getFactoringliquidacionsByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionsByFactoringid");
  const { factoringid } = req.params;
  const factoringliquidacionSearchSchema = objectInput(
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
  const factoringliquidacionValidated = factoringliquidacionSearchSchema.parse({ factoringid: factoringid, ...req.body });
  log.debug(line(), "factoringliquidacionValidated:", factoringliquidacionValidated);

  const factoringliquidacionsJson = await factoringliquidacionService.getFactoringliquidacionsByFactoringidService({
    factoringid: factoringliquidacionValidated.factoringid,
  });

  response(res, 201, factoringliquidacionsJson);
};
