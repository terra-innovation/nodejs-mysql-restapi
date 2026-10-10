import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput, numberInput } from "#src/utils/validationInputs.js";
import { cargarArchivoService, deleteArchivoService, getRutaDescargaArchivoService } from "#src/services/usuario/archivo.Service.js";

export const cargarArchivo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::cargarArchivo");

  // 1. Extraer archivo del request (Multer lo pone en req.files)
  let archivoRaw: any;
  if (req.files && !Array.isArray(req.files) && "archivo" in req.files) {
    archivoRaw = req.files.archivo?.[0];
  }

  if (!archivoRaw) {
    throw new ClientError("Archivo es requerido", 400);
  }

  const idusuario = req.session_user?.usuario?.idusuario;
  const archivoUploadSchema = objectInput(
    z.object({
      idusuario: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value))),
      archivotipo_code: stringInput(
        z
          .string()
          .refine((value) => value.length >= 8, "Debe tener al menos 8 caracteres")
          .refine((value) => value.length <= 8, "Debe tener como máximo 8 caracteres")
          .optional(),
        { trim: true },
      ),
    }),
  );

  const bodyValidated = archivoUploadSchema.parse({ ...req.body, idusuario });
  log.debug(line(), "bodyValidated:", bodyValidated);

  const result = await cargarArchivoService({
    archivoRaw,
    idusuario: bodyValidated.idusuario,
    archivotipo_code: bodyValidated.archivotipo_code,
  });

  response(res, 200, { archivoid: result.archivoid });
};

export const descargarArchivo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::descargarArchivo");
  const { id } = req.params;
  const archivoSchema = objectInput(
    z.object({
      archivoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const archivoValidated = archivoSchema.parse({ archivoid: id });
  log.debug(line(), "archivoValidated:", archivoValidated);

  const rutaAbsoluta = await getRutaDescargaArchivoService({ archivoid: archivoValidated.archivoid });

  res.sendFile(rutaAbsoluta, (err) => {
    if (err) {
      log.error(line(), "Error al descargar el archivo:", err);
      res.status(500).send("Error");
    }
  });
};

export const deleteArchivo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteArchivo");
  const { id } = req.params;
  const archivoSchema = objectInput(
    z.object({
      archivoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const archivoValidated = archivoSchema.parse({ archivoid: id });
  log.debug(line(), "archivoValidated:", archivoValidated);

  await deleteArchivoService({
    archivoid: archivoValidated.archivoid,
    idusuario: req.session_user.usuario.idusuario,
  });

  response(res, 204, {});
};
