import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringtransferenciacedenteDao from "#root/src/daos/factoringtransferenciacedente.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import path from "path";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface DownloadConstanciaFactoringtransferenciacedenteDto {
  factoringtransferenciacedenteid: string;
}

export interface GetFactoringtransferenciacedentesByFactoringidDto {
  factoringid: string;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const downloadConstanciaFactoringtransferenciacedenteService = async (
  dto: DownloadConstanciaFactoringtransferenciacedenteDto,
) => {
  log.debug(line(), "service::empresario::downloadConstanciaFactoringtransferenciacedenteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO];
      const factoringtransferenciacedente =
        await factoringtransferenciacedenteDao.getFactoringtransferenciacedentefForDownloadConstancia(
          tx,
          dto.factoringtransferenciacedenteid,
          filter_estado,
        );
      if (!factoringtransferenciacedente) {
        log.warn(line(), "Factoringtransferenciacedente no existe: [" + dto.factoringtransferenciacedenteid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const relacionArchivo = factoringtransferenciacedente.archivo_factoring_transferencia_cedentes[0];
      if (!relacionArchivo || !relacionArchivo.archivo) {
        log.warn(line(), "Archivo no asociado a la transferencia: [" + dto.factoringtransferenciacedenteid + "]");
        throw new ClientError("Archivo no encontrado", 404);
      }
      const archivo = relacionArchivo.archivo;

      const archivoPath = path.join(
        storageUtils.STORAGE_PATH_SUCCESS,
        storageUtils.normalizarRuta(archivo.ruta),
        archivo.nombrealmacenamiento,
      );
      log.debug(line(), "archivoPath:", archivoPath);

      const proyectoRutaAbsoluta = storageUtils.pathApp();
      log.debug(line(), "proyectoRutaAbsoluta:", proyectoRutaAbsoluta);

      const rutaAbsoluta = path.resolve(proyectoRutaAbsoluta, archivoPath);
      const numeroOperacionSanitizado = storageUtils.sanitizarNombreArchivo(
        factoringtransferenciacedente.numero_operacion,
      );

      return {
        rutaAbsoluta,
        nombreoriginal: "Constancia_transferencia_" + numeroOperacionSanitizado + "." + archivo.extension,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactoringtransferenciacedentesByFactoringidService = async (
  dto: GetFactoringtransferenciacedentesByFactoringidDto,
) => {
  log.debug(line(), "service::empresario::getFactoringtransferenciacedentesByFactoringidService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + dto.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciacedentes =
        await factoringtransferenciacedenteDao.getFactoringtransferenciacedentesByIdfactoringAndVisisbleCendente(
          tx,
          factoring.idfactoring,
          filter_estado,
        );

      const factoringtransferenciacedentesFiltered = jsonUtils.removeAttributesPrivates(factoringtransferenciacedentes);
      return factoringtransferenciacedentesFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
