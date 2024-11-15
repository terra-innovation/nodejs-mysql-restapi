import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getArchivos = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const archivos = await models.Archivo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),archivos);
    return archivos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoByIdarchivo = async (req, idarchivo) => {
  try {
    const { models } = req.app.locals;

    const archivo = await models.Archivo.findByPk(idarchivo, {});
    logger.info(line(), archivo);

    //const archivos = await archivo.getArchivos();
    //logger.info(line(),archivos);

    return archivo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoByArchivoid = async (req, archivoid) => {
  try {
    const { models } = req.app.locals;
    const archivo = await models.Archivo.findOne({
      where: {
        archivoid: archivoid,
      },
    });
    //logger.info(line(),archivo);
    return archivo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoPk = async (req, archivoid) => {
  try {
    const { models } = req.app.locals;
    const archivo = await models.Archivo.findOne({
      attributes: ["_idarchivo"],
      where: {
        archivoid: archivoid,
      },
    });
    //logger.info(line(),archivo);
    return archivo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivo = async (req, archivo) => {
  try {
    const { models } = req.app.locals;
    const archivo_nuevo = await models.Archivo.create(archivo);
    // logger.info(line(),archivo_nuevo);
    return archivo_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivo = async (req, archivo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Archivo.update(archivo, {
      where: {
        archivoid: archivo.archivoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivo = async (req, archivo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Archivo.update(archivo, {
      where: {
        archivoid: archivo.archivoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
