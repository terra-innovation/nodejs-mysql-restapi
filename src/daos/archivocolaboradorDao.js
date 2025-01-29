import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getArchivocolaboradors = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const archivocolaboradors = await models.ArchivoColaborador.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),archivocolaboradors);
    return archivocolaboradors;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoColaboradorByIdarchivocolaborador = async (req, idarchivocolaborador) => {
  try {
    const { models } = req.app.locals;

    const archivocolaborador = await models.ArchivoColaborador.findByPk(idarchivocolaborador, {});
    logger.info(line(), archivocolaborador);

    //const archivocolaboradors = await archivocolaborador.getArchivocolaboradors();
    //logger.info(line(),archivocolaboradors);

    return archivocolaborador;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoColaboradorByArchivoColaboradorid = async (req, archivocolaboradorid) => {
  try {
    const { models } = req.app.locals;
    const archivocolaborador = await models.ArchivoColaborador.findOne({
      where: {
        archivocolaboradorid: archivocolaboradorid,
      },
    });
    //logger.info(line(),archivocolaborador);
    return archivocolaborador;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoColaboradorPk = async (req, archivocolaboradorid) => {
  try {
    const { models } = req.app.locals;
    const archivocolaborador = await models.ArchivoColaborador.findOne({
      attributes: ["_idarchivocolaborador"],
      where: {
        archivocolaboradorid: archivocolaboradorid,
      },
    });
    //logger.info(line(),archivocolaborador);
    return archivocolaborador;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoColaborador = async (req, archivocolaborador) => {
  try {
    const { models } = req.app.locals;
    const archivocolaborador_nuevo = await models.ArchivoColaborador.create(archivocolaborador);
    // logger.info(line(),archivocolaborador_nuevo);
    return archivocolaborador_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoColaborador = async (req, archivocolaborador) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ArchivoColaborador.update(archivocolaborador, {
      where: {
        archivocolaboradorid: archivocolaborador.archivocolaboradorid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoColaborador = async (req, archivocolaborador) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ArchivoColaborador.update(archivocolaborador, {
      where: {
        archivocolaboradorid: archivocolaborador.archivocolaboradorid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
