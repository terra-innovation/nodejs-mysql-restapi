import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getArchivos = async (transaction, estados) => {
  try {
    const archivos = await modelsFT.Archivo.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return archivos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoByIdarchivo = async (transaction, idarchivo) => {
  try {
    const archivo = await modelsFT.Archivo.findByPk(idarchivo, { transaction });

    //const archivos = await archivo.getArchivos();

    return archivo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoByArchivoid = async (transaction, archivoid) => {
  try {
    const archivo = await modelsFT.Archivo.findOne({
      where: {
        archivoid: archivoid,
      },
      transaction,
    });

    return archivo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoPk = async (transaction, archivoid) => {
  try {
    const archivo = await modelsFT.Archivo.findOne({
      attributes: ["_idarchivo"],
      where: {
        archivoid: archivoid,
      },
      transaction,
    });

    return archivo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivo = async (transaction, archivo) => {
  try {
    const archivo_nuevo = await modelsFT.Archivo.create(archivo, { transaction });

    return archivo_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivo = async (transaction, archivo) => {
  try {
    const result = await modelsFT.Archivo.update(archivo, {
      where: {
        archivoid: archivo.archivoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivo = async (transaction, archivo) => {
  try {
    const result = await modelsFT.Archivo.update(archivo, {
      where: {
        archivoid: archivo.archivoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivo = async (transaction, archivo) => {
  try {
    const result = await modelsFT.Archivo.update(archivo, {
      where: {
        archivoid: archivo.archivoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
