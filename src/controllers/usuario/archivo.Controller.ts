import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import {
  cargarArchivoService,
  deleteArchivoService,
  getRutaDescargaArchivoService,
} from "#src/services/usuario/archivo.Service.js";

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
  const archivoUploadSchema = yup
    .object()
    .shape({
      idusuario: yup.number().required(),
      archivotipo_code: yup.string().trim().min(8).max(8),
    })
    .required();

  const bodyValidated = archivoUploadSchema.validateSync(
    { ...req.body, idusuario },
    { abortEarly: false, stripUnknown: true },
  );
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
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync({ archivoid: id }, { abortEarly: false, stripUnknown: true });
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
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync({ archivoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "archivoValidated:", archivoValidated);

  await deleteArchivoService({
    archivoid: archivoValidated.archivoid,
    idusuario: req.session_user.usuario.idusuario,
  });

  response(res, 204, {});
};
