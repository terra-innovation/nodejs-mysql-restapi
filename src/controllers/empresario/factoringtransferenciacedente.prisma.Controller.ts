import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as factoringtransferenciacedenteDao from "#src/daos/factoringtransferenciacedente.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";

import * as yup from "yup";

import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import path from "path";

export const downloadConstanciaFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringtransferenciacedentePDF");
  const { factoringtransferenciacedenteid } = req.params;
  const schema = yup
    .object()
    .shape({
      factoringtransferenciacedenteid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = schema.validateSync({ factoringtransferenciacedenteid }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "validated:", validated);

  const { rutaAbsoluta, nombreoriginal } = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO];
      const factoringtransferenciacedente = await factoringtransferenciacedenteDao.getFactoringtransferenciacedentefForDownloadConstancia(tx, validated.factoringtransferenciacedenteid, filter_estado);
      if (!factoringtransferenciacedente) {
        log.warn(line(), "Factoringtransferenciacedente no existe: [" + validated.factoringtransferenciacedenteid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const relacionArchivo = factoringtransferenciacedente.archivo_factoring_transferencia_cedentes[0];
      if (!relacionArchivo || !relacionArchivo.archivo) {
        log.warn(line(), "Archivo no asociado a la transferencia: [" + validated.factoringtransferenciacedenteid + "]");
        throw new ClientError("Archivo no encontrado", 404);
      }
      const archivo = relacionArchivo.archivo;

      const archivoPath = path.join(storageUtils.STORAGE_PATH_SUCCESS, storageUtils.normalizarRuta(archivo.ruta), archivo.nombrealmacenamiento);
      log.debug(line(), "archivoPath:", archivoPath);

      const proyectoRutaAbsoluta = storageUtils.pathApp();
      log.debug(line(), "proyectoRutaAbsoluta:", proyectoRutaAbsoluta);

      const rutaAbsoluta = path.resolve(proyectoRutaAbsoluta, archivoPath);

      const numeroOperacionSanitizado = storageUtils.sanitizarNombreArchivo(factoringtransferenciacedente.numero_operacion);

      return {
        rutaAbsoluta,
        nombreoriginal: "Constancia_transferencia_" + numeroOperacionSanitizado + "." + archivo.extension,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );

  setDownloadHeaders(res, nombreoriginal);
  await sendFileAsync(req, res, rutaAbsoluta);
};

export const getFactoringtransferenciacedentesByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringtransferenciacedentesByFactoringid");
  //log.info(line(),req.session_user.usuario.idusuario);
  const { factoringid } = req.params;
  const factoringtransferenciacedenteSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSearchSchema.validateSync({ factoringid: factoringid, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedentesJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringtransferenciacedenteValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringtransferenciacedenteValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciacedentes = await factoringtransferenciacedenteDao.getFactoringtransferenciacedentesByIdfactoringAndVisisbleCendente(tx, factoring.idfactoring, filter_estado);

      var factoringtransferenciacedentesFiltered = jsonUtils.removeAttributesPrivates(factoringtransferenciacedentes);
      return factoringtransferenciacedentesFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringtransferenciacedentesJson);
};
