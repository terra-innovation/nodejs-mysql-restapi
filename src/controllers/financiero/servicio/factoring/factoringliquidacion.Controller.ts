import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { unlink } from "fs/promises";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { sendCorreoFactoringliquidacionService, getFactoringliquidacionMasterByFactoringidService, getFactoringliquidacionDetalleService, getFactoringliquidacionByFactoringidService, generateFactoringliquidacionPDFService } from "#root/src/services/financiero/factoringliquidacion.Service.js";

export const sendCorreoFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendCorreoFactoringliquidacion");
  const { id } = req.params;
  const factoringliquidacionUpdateSchema = objectInput(
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
  const factoringliquidacionValidated = factoringliquidacionUpdateSchema.parse({ factoringliquidacionid: id, ...req.body });
  log.debug(line(), "factoringliquidacionValidated:", factoringliquidacionValidated);

  await sendCorreoFactoringliquidacionService(factoringliquidacionValidated.factoringliquidacionid);
  response(res, 200, {});
};

export const getFactoringliquidacionMasterByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionMasterByFactoringid");
  const { factoringid } = req.params;
  const usuarioservicioSchema = objectInput(
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
  const factoringliquidacionValidated = usuarioservicioSchema.parse({ factoringid });

  const result = await getFactoringliquidacionMasterByFactoringidService(factoringliquidacionValidated.factoringid);
  response(res, 200, result);
};

export const getFactoringliquidacionDetalle = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionDetalle");
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

  const result = await getFactoringliquidacionDetalleService(validated.factoringliquidacionid);
  response(res, 200, result);
};

export const getFactoringliquidacionByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionByFactoringid");
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
  const factoringliquidacionValidated = factoringliquidacionSearchSchema.parse({ factoringid, ...req.body });
  log.debug(line(), "factoringliquidacionValidated:", factoringliquidacionValidated);

  const factoringliquidacionesJson = await getFactoringliquidacionByFactoringidService(factoringliquidacionValidated.factoringid);
  response(res, 200, factoringliquidacionesJson);
};

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

  const { filePath, filenameDownload } = await generateFactoringliquidacionPDFService(validated.factoringliquidacionid);

  try {
    setDownloadHeaders(res, filenameDownload);
    await sendFileAsync(req, res, filePath);
  } finally {
    await unlink(filePath);
  }
};
