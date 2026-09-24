import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as archivoestadoDao from "#root/src/daos/archivoestado.Dao.js";
import * as archivotipoDao from "#root/src/daos/archivotipo.Dao.js";
import * as distritoDao from "#root/src/daos/distrito.Dao.js";
import * as documentotipoDao from "#root/src/daos/documentotipo.Dao.js";
import * as generoDao from "#root/src/daos/genero.Dao.js";
import * as paisDao from "#root/src/daos/pais.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import path from "path";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface DescargarArchivoDto {
  archivoid: string;
}

export interface ActivateArchivoDto {
  archivoid: string;
  idusuario: number;
}

export interface DeleteArchivoDto {
  archivoid: string;
  idusuario: number;
}

export interface UpdateArchivoDto {
  archivoid: string;
  archivotipoid: string;
  archivoestadoid: string;
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const getRutaAbsolutaArchivoService = async (dto: DescargarArchivoDto): Promise<string> => {
  log.debug(line(), "service::getRutaAbsolutaArchivoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const archivo = await archivoDao.getArchivoByArchivoid(tx, dto.archivoid);
      if (!archivo) {
        throw new ClientError("Archivo no existe", 404);
      }
      log.debug(line(), "archivo:", archivo);

      const archivoPath = path.join(
        storageUtils.STORAGE_PATH_SUCCESS,
        storageUtils.normalizarRuta(archivo.ruta),
        archivo.nombrealmacenamiento,
      );
      log.debug(line(), "archivoPath:", archivoPath);

      const proyectoRutaAbsoluta = storageUtils.pathApp();
      log.debug(line(), "proyectoRutaAbsoluta:", proyectoRutaAbsoluta);

      const rutaAbsoluta = path.resolve(proyectoRutaAbsoluta, archivoPath);
      return rutaAbsoluta;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const activateArchivoService = async (dto: ActivateArchivoDto) => {
  log.debug(line(), "service::activateArchivoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const archivoActivated = await archivoDao.activateArchivo(tx, dto.archivoid, dto.idusuario);
      if (archivoActivated[0] === 0) {
        throw new ClientError("Archivo no existe", 404);
      }
      log.debug(line(), "archivoActivated:", archivoActivated);
      return archivoActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deleteArchivoService = async (dto: DeleteArchivoDto) => {
  log.debug(line(), "service::deleteArchivoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const archivo = await archivoDao.getArchivoByArchivoid(tx, dto.archivoid);
      if (!archivo) {
        log.warn(line(), "Archivo no existe: [" + dto.archivoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const archivoDeleted = await archivoDao.deleteArchivo(tx, dto.archivoid, dto.idusuario);
      log.debug(line(), "archivoDeleted:", archivoDeleted);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getArchivoMasterService = async () => {
  log.debug(line(), "service::getArchivoMasterService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const paises = await paisDao.getPaises(tx, filter_estados);
      const distritos = await distritoDao.getDistritos(tx, filter_estados);
      const documentotipos = await documentotipoDao.getDocumentotipos(tx, filter_estados);
      const generos = await generoDao.getGeneros(tx, filter_estados);

      const archivoMaster: Record<string, any> = {
        paises,
        distritos,
        documentotipos,
        generos,
      };

      const archivoMasterObfuscated = jsonUtils.ofuscarAtributosDefault(archivoMaster);
      const archivoMasterFiltered = jsonUtils.removeAttributesPrivates(archivoMasterObfuscated);
      return archivoMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const updateArchivoService = async (dto: UpdateArchivoDto) => {
  log.debug(line(), "service::updateArchivoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const archivo = await archivoDao.getArchivoByArchivoid(tx, dto.archivoid);
      if (!archivo) {
        log.warn(line(), "Archivo no existe: [" + dto.archivoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const archivotipo = await archivotipoDao.getArchivotipoByArchivotipoid(tx, dto.archivotipoid);
      if (!archivotipo) {
        log.warn(line(), "Archivotipo no existe: [" + dto.archivotipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const archivoestado = await archivoestadoDao.getArchivoestadoByArchivoestadoid(tx, dto.archivoestadoid);
      if (!archivoestado) {
        log.warn(line(), "Archivoestado no existe: [" + dto.archivoestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const archivoToUpdate: Prisma.archivoUpdateInput = {
        archivo_tipo: { connect: { idarchivotipo: archivotipo.idarchivotipo } },
        archivo_estado: { connect: { idarchivoestado: archivoestado.idarchivoestado } },
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
      };

      const result = await archivoDao.updateArchivo(tx, dto.archivoid, archivoToUpdate);
      if (result[0] === 0) {
        throw new ClientError("Archivo no existe", 404);
      }

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getArchivosService = async () => {
  log.debug(line(), "service::getArchivosService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const archivos = await archivoDao.getArchivos(tx, filter_estado);
      return archivos;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
