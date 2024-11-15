import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getArchivopersonas = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const archivopersonas = await models.Archivopersona.findAll({
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

export const getArchivopersonaByIdarchivopersona = async (req, idarchivopersona) => {
  try {
    const { models } = req.app.locals;

    const archivopersona = await models.Archivopersona.findByPk(idarchivopersona, {});
    logger.info(line(), archivopersona);

    //const archivopersonas = await archivopersona.getArchivopersonas();
    //logger.info(line(),archivopersonas);

    return archivopersona;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivopersonaByArchivopersonaid = async (req, archivopersonaid) => {
  try {
    const { models } = req.app.locals;
    const archivopersona = await models.Archivopersona.findOne({
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

export const findArchivopersonaPk = async (req, archivopersonaid) => {
  try {
    const { models } = req.app.locals;
    const archivopersona = await models.Archivopersona.findOne({
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

export const insertArchivopersona = async (req, archivopersona) => {
  try {
    const { models } = req.app.locals;
    const archivopersona_nuevo = await models.Archivopersona.create(archivopersona);
    // logger.info(line(),archivopersona_nuevo);
    return archivopersona_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivopersona = async (req, archivopersona) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Archivopersona.update(archivopersona, {
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

export const deleteArchivopersona = async (req, archivopersona) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Archivopersona.update(archivopersona, {
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
