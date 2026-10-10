import * as archivoService from "#root/src/services/admin/archivo.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";

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

  const rutaAbsoluta = await archivoService.getRutaAbsolutaArchivoService({
    archivoid: archivoValidated.archivoid,
  });

  res.sendFile(rutaAbsoluta, (err) => {
    if (err) {
      log.error(line(), "Error al descargar el archivo:", err);
      res.status(500).send("Error");
    }
  });
};

export const activateArchivo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateArchivo");
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

  await archivoService.activateArchivoService({
    archivoid: archivoValidated.archivoid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, {});
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

  await archivoService.deleteArchivoService({
    archivoid: archivoValidated.archivoid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, {});
};

export const getArchivoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getArchivoMaster");
  const archivoMasterFiltered = await archivoService.getArchivoMasterService();
  response(res, 201, archivoMasterFiltered);
};

export const updateArchivo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateArchivo");
  const { id } = req.params;
  const archivoUpdateSchema = objectInput(
    z.object({
      archivoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      archivotipoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      archivoestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const archivoValidated = archivoUpdateSchema.parse({ archivoid: id, ...req.body });
  log.debug(line(), "archivoValidated:", archivoValidated);

  await archivoService.updateArchivoService({
    archivoid: archivoValidated.archivoid,
    archivotipoid: archivoValidated.archivotipoid,
    archivoestadoid: archivoValidated.archivoestadoid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const getArchivos = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getArchivos");
  const archivos = await archivoService.getArchivosService();
  response(res, 201, archivos);
};
