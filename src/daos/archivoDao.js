import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getArchivos = async (transaction, estados) => {
  try {
    const archivos = await modelsFT.Archivo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),archivos);
    return archivos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoByIdarchivo = async (transaction, idarchivo) => {
  try {
    const archivo = await modelsFT.Archivo.findByPk(idarchivo, { transaction });
    logger.info(line(), archivo);

    //const archivos = await archivo.getArchivos();
    //logger.info(line(),archivos);

    return archivo;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    //logger.info(line(),archivo);
    return archivo;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    //logger.info(line(),archivo);
    return archivo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivo = async (transaction, archivo) => {
  try {
    const archivo_nuevo = await modelsFT.Archivo.create(archivo, { transaction });
    // logger.info(line(),archivo_nuevo);
    return archivo_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    logger.error(line(), formatError(error));
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
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
