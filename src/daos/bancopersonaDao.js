import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getArchivopersonas = async (transaction, estados) => {
  try {
    const archivopersonas = await modelsFT.Archivopersona.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),archivopersonas);
    return archivopersonas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivopersonaByIdarchivopersona = async (transaction, idarchivopersona) => {
  try {
    const archivopersona = await modelsFT.Archivopersona.findByPk(idarchivopersona, { transaction });
    logger.info(line(), archivopersona);

    //const archivopersonas = await archivopersona.getArchivopersonas();
    //logger.info(line(),archivopersonas);

    return archivopersona;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivopersonaByArchivopersonaid = async (transaction, archivopersonaid) => {
  try {
    const archivopersona = await modelsFT.Archivopersona.findOne({
      where: {
        archivopersonaid: archivopersonaid,
      },
      transaction,
    });
    //logger.info(line(),archivopersona);
    return archivopersona;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivopersonaPk = async (transaction, archivopersonaid) => {
  try {
    const archivopersona = await modelsFT.Archivopersona.findOne({
      attributes: ["_idarchivopersona"],
      where: {
        archivopersonaid: archivopersonaid,
      },
      transaction,
    });
    //logger.info(line(),archivopersona);
    return archivopersona;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivopersona = async (transaction, archivopersona) => {
  try {
    const archivopersona_nuevo = await modelsFT.Archivopersona.create(archivopersona, { transaction });
    // logger.info(line(),archivopersona_nuevo);
    return archivopersona_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivopersona = async (transaction, archivopersona) => {
  try {
    const result = await modelsFT.Archivopersona.update(archivopersona, {
      where: {
        archivopersonaid: archivopersona.archivopersonaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivopersona = async (transaction, archivopersona) => {
  try {
    const result = await modelsFT.Archivopersona.update(archivopersona, {
      where: {
        archivopersonaid: archivopersona.archivopersonaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
