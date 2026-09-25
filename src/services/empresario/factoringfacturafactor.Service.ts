import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringfacturafactorDao from "#root/src/daos/factoringfacturafactor.Dao.js";
import * as facturaDao from "#root/src/daos/factura.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import path from "path";

export const getFactoringfacturafactoresByFactoringidService = async (factoringid: string) => {
  log.debug(line(), "service::getFactoringfacturafactoresByFactoringidService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringfacturafactores =
        await factoringfacturafactorDao.getFactoringfacturafactorsByIdfactoringAndVisibleCedente(
          tx,
          factoring.idfactoring,
          filter_estado,
        );

      const factoringfacturafactoresFiltered = jsonUtils.removeAttributesPrivates(factoringfacturafactores);
      return factoringfacturafactoresFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getDownloadArchivoInfoService = async (archivoid: string) => {
  log.debug(line(), "service::getDownloadArchivoInfoService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO];
      const archivo = await archivoDao.getArchivoByArchivoid(tx, archivoid);
      if (!archivo) {
        log.warn(line(), "Archivo no existe: [" + archivoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factura = await facturaDao.getFacturaByIdarchivo(tx, archivo.idarchivo, filter_estado);
      if (!factura) {
        log.warn(line(), "Factura no existe: [" + archivo.idarchivo + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const archivoPath = path.join(
        storageUtils.STORAGE_PATH_SUCCESS,
        storageUtils.normalizarRuta(archivo.ruta),
        archivo.nombrealmacenamiento,
      );
      log.debug(line(), "archivoPath:", archivoPath);

      const proyectoRutaAbsoluta = storageUtils.pathApp();
      log.debug(line(), "proyectoRutaAbsoluta:", proyectoRutaAbsoluta);

      const rutaAbsoluta = path.resolve(proyectoRutaAbsoluta, archivoPath);

      const tipoNombre = archivo.archivo_tipo?.nombre
        ? storageUtils.sanitizarNombreArchivo(archivo.archivo_tipo.nombre)
        : null;
      const serie = factura?.serie ? storageUtils.sanitizarNombreArchivo(factura.serie) : null;
      const numeroComprobante = factura?.numero_comprobante
        ? storageUtils.sanitizarNombreArchivo(factura.numero_comprobante)
        : null;

      const partes = [tipoNombre, serie, numeroComprobante].filter(Boolean);
      const nombreBase = partes.length > 0 ? partes.join("_") : storageUtils.sanitizarNombreArchivo(archivo.nombrereal);

      return {
        rutaAbsoluta,
        nombreoriginal: nombreBase + "." + archivo.extension,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
