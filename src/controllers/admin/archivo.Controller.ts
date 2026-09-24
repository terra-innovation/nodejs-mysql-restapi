import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as archivoService from "#src/services/archivo.Service.js";

export const descargarArchivo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::descargarArchivo");
  const { id } = req.params;
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync(
    { archivoid: id },
    { abortEarly: false, stripUnknown: true },
  );
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
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync(
    { archivoid: id },
    { abortEarly: false, stripUnknown: true },
  );
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
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync(
    { archivoid: id },
    { abortEarly: false, stripUnknown: true },
  );
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
  const archivoUpdateSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
      archivotipoid: yup.string().trim().required().min(36).max(36),
      archivoestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoUpdateSchema.validateSync(
    { archivoid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
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
