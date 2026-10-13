import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { unlink } from "fs/promises";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { generateFactoringpropuestaPDFService, getFactoringpropuestasByFactoringidService, getFactoringpropuestaMasterService, getFactoringpropuestasService } from "#root/src/services/financiero/factoringpropuesta.Service.js";

export const downloadFactoringpropuestaPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringpropuestaPDF");
  const { id } = req.params;
  const factoringpropuestaUpdateSchema = objectInput(
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
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.parse({ factoringpropuestaid: id, ...req.body });
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const { filePath, filenameDownload } = await generateFactoringpropuestaPDFService(factoringpropuestaValidated.factoringpropuestaid);

  try {
    setDownloadHeaders(res, filenameDownload);
    await sendFileAsync(req, res, filePath);
  } finally {
    await unlink(filePath);
  }
};

export const getFactoringpropuestasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestasByFactoringid");
  const { id } = req.params;
  const factoringpropuestaSearchSchema = objectInput(
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
  const factoringpropuestaValidated = factoringpropuestaSearchSchema.parse({ factoringid: id, ...req.body });
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const factoringpropuestasJson = await getFactoringpropuestasByFactoringidService(factoringpropuestaValidated.factoringid);
  response(res, 201, factoringpropuestasJson);
};

export const getFactoringpropuestaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestaMaster");
  const factoringpropuestasMasterFiltered = await getFactoringpropuestaMasterService();
  response(res, 201, factoringpropuestasMasterFiltered);
};

export const getFactoringpropuestas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestas");
  const factoringpropuestasJson = await getFactoringpropuestasService();
  response(res, 201, factoringpropuestasJson);
};
