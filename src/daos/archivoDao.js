import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

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
    //console.log(archivos);
    return archivos;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoByIdarchivo = async (req, idarchivo) => {
  try {
    const { models } = req.app.locals;

    const archivo = await models.Archivo.findByPk(idarchivo, {});
    console.log(archivo);

    //const archivos = await archivo.getArchivos();
    //console.log(archivos);

    return archivo;
  } catch (error) {
    console.error(error);
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
    //console.log(archivo);
    return archivo;
  } catch (error) {
    console.error(error);
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
    //console.log(archivo);
    return archivo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivo = async (req, archivo) => {
  try {
    const { models } = req.app.locals;
    const archivo_nuevo = await models.Archivo.create(archivo);
    // console.log(archivo_nuevo);
    return archivo_nuevo;
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
