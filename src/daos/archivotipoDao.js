import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getArchivotipos = async (transaction, estados) => {
  try {
    const archivotipos = await modelsFT.ArchivoTipo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),archivotipos);
    return archivotipos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivotipoByIdarchivotipo = async (transaction, idarchivotipo) => {
  try {
    const archivotipo = await modelsFT.ArchivoTipo.findByPk(idarchivotipo, { transaction });
    logger.info(line(), archivotipo);

    //const archivotipos = await archivotipo.getArchivotipos();
    //logger.info(line(),archivotipos);

    return archivotipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivotipoByCode = async (transaction, code) => {
  try {
    const archivotipo = await modelsFT.ArchivoTipo.findOne({
      where: {
        code: code,
      },
      transaction,
    });
    //logger.info(line(),archivotipo);
    return archivotipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivotipoByArchivotipoid = async (transaction, archivotipoid) => {
  try {
    const archivotipo = await modelsFT.ArchivoTipo.findOne({
      where: {
        archivotipoid: archivotipoid,
      },
      transaction,
    });
    //logger.info(line(),archivotipo);
    return archivotipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivotipoPk = async (transaction, archivotipoid) => {
  try {
    const archivotipo = await modelsFT.ArchivoTipo.findOne({
      attributes: ["_idarchivotipo"],
      where: {
        archivotipoid: archivotipoid,
      },
      transaction,
    });
    //logger.info(line(),archivotipo);
    return archivotipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivotipo = async (transaction, archivotipo) => {
  try {
    const archivotipo_nuevo = await modelsFT.ArchivoTipo.create(archivotipo, { transaction });
    // logger.info(line(),archivotipo_nuevo);
    return archivotipo_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivotipo = async (transaction, archivotipo) => {
  try {
    const result = await modelsFT.ArchivoTipo.update(archivotipo, {
      where: {
        archivotipoid: archivotipo.archivotipoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivotipo = async (transaction, archivotipo) => {
  try {
    const result = await modelsFT.ArchivoTipo.update(archivotipo, {
      where: {
        archivotipoid: archivotipo.archivotipoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
