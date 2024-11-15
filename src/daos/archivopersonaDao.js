import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getArchivopersonas = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const archivopersonas = await models.ArchivoPersona.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),archivopersonas);
    return archivopersonas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoPersonaByIdarchivopersona = async (req, idarchivopersona) => {
  try {
    const { models } = req.app.locals;

    const archivopersona = await models.ArchivoPersona.findByPk(idarchivopersona, {});
    logger.info(line(), archivopersona);

    //const archivopersonas = await archivopersona.getArchivopersonas();
    //logger.info(line(),archivopersonas);

    return archivopersona;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoPersonaByArchivoPersonaid = async (req, archivopersonaid) => {
  try {
    const { models } = req.app.locals;
    const archivopersona = await models.ArchivoPersona.findOne({
      where: {
        archivopersonaid: archivopersonaid,
      },
    });
    //logger.info(line(),archivopersona);
    return archivopersona;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoPersonaPk = async (req, archivopersonaid) => {
  try {
    const { models } = req.app.locals;
    const archivopersona = await models.ArchivoPersona.findOne({
      attributes: ["_idarchivopersona"],
      where: {
        archivopersonaid: archivopersonaid,
      },
    });
    //logger.info(line(),archivopersona);
    return archivopersona;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoPersona = async (req, archivopersona) => {
  try {
    const { models } = req.app.locals;
    const archivopersona_nuevo = await models.ArchivoPersona.create(archivopersona);
    // logger.info(line(),archivopersona_nuevo);
    return archivopersona_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoPersona = async (req, archivopersona) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ArchivoPersona.update(archivopersona, {
      where: {
        archivopersonaid: archivopersona.archivopersonaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoPersona = async (req, archivopersona) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ArchivoPersona.update(archivopersona, {
      where: {
        archivopersonaid: archivopersona.archivopersonaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
