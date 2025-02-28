import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getArchivocolaboradors = async (transaction, estados) => {
  try {
    const archivocolaboradors = await modelsFT.ArchivoColaborador.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),archivocolaboradors);
    return archivocolaboradors;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoColaboradorByIdarchivocolaborador = async (transaction, idarchivocolaborador) => {
  try {
    const archivocolaborador = await modelsFT.ArchivoColaborador.findByPk(idarchivocolaborador, { transaction });
    logger.info(line(), archivocolaborador);

    //const archivocolaboradors = await archivocolaborador.getArchivocolaboradors();
    //logger.info(line(),archivocolaboradors);

    return archivocolaborador;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoColaboradorByArchivoColaboradorid = async (transaction, archivocolaboradorid) => {
  try {
    const archivocolaborador = await modelsFT.ArchivoColaborador.findOne({
      where: {
        archivocolaboradorid: archivocolaboradorid,
      },
      transaction,
    });
    //logger.info(line(),archivocolaborador);
    return archivocolaborador;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoColaboradorPk = async (transaction, archivocolaboradorid) => {
  try {
    const archivocolaborador = await modelsFT.ArchivoColaborador.findOne({
      attributes: ["_idarchivocolaborador"],
      where: {
        archivocolaboradorid: archivocolaboradorid,
      },
      transaction,
    });
    //logger.info(line(),archivocolaborador);
    return archivocolaborador;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoColaborador = async (transaction, archivocolaborador) => {
  try {
    const archivocolaborador_nuevo = await modelsFT.ArchivoColaborador.create(archivocolaborador, { transaction });
    // logger.info(line(),archivocolaborador_nuevo);
    return archivocolaborador_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoColaborador = async (transaction, archivocolaborador) => {
  try {
    const result = await modelsFT.ArchivoColaborador.update(archivocolaborador, {
      where: {
        archivocolaboradorid: archivocolaborador.archivocolaboradorid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoColaborador = async (transaction, archivocolaborador) => {
  try {
    const result = await modelsFT.ArchivoColaborador.update(archivocolaborador, {
      where: {
        archivocolaboradorid: archivocolaborador.archivocolaboradorid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
