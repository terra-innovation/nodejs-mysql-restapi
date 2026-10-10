import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import * as factoringpropuestaService from "#src/services/empresario/factoringpropuesta.Service.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { unlink } from "fs/promises";

export const downloadFactoringpropuestaPDF = async (req: Request, res: Response) => {
  const factoringpropuestaid = stringInput(
    z
      .string()
      .refine((value) => value.length > 0, "Campo requerido")
      .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
      .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
    { trim: true },
  ).parse(req.params.id);
  const { filePath, filenameDownload } = await factoringpropuestaService.generateFactoringpropuestaPDFService({
    factoringpropuestaid,
    idusuario: req.session_user.usuario.idusuario,
  });
  try {
    setDownloadHeaders(res, filenameDownload);
    await sendFileAsync(req, res, filePath);
  } finally {
    await unlink(filePath);
  }
};

export const acceptFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::acceptFactoringpropuesta");
  const { factoringid } = req.params;
  const factoringpropuestaUpdateSchema = objectInput(
    z.object({
      factoringid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
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
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.parse({ factoringid, ...req.body });
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  await factoringpropuestaService.acceptFactoringpropuestaService({
    factoringid: factoringpropuestaValidated.factoringid,
    factoringpropuestaid: factoringpropuestaValidated.factoringpropuestaid,
    idusuario: req.session_user.usuario.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const getFactoringpropuestaVigente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestaVigente");
  const { factoringid } = req.params;
  const factoringpropuestaSchema = objectInput(
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
  const factoringpropuestaValidated = factoringpropuestaSchema.parse({ factoringid, ...req.body });

  const factoringpropuesta = await factoringpropuestaService.getFactoringpropuestaVigenteService({
    factoringid: factoringpropuestaValidated.factoringid,
    idusuario: req.session_user.usuario.idusuario ?? 1,
  });

  response(res, 201, factoringpropuesta);
};
