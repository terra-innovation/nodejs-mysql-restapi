import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getArchivocuentabancarias = async (transaction, estados) => {
  try {
    const archivocuentabancarias = await modelsFT.ArchivoCuentaBancaria.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),archivocuentabancarias);
    return archivocuentabancarias;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoCuentaBancariaByIdarchivocuentabancaria = async (transaction, idarchivocuentabancaria) => {
  try {
    const archivocuentabancaria = await modelsFT.ArchivoCuentaBancaria.findByPk(idarchivocuentabancaria, { transaction });
    logger.info(line(), archivocuentabancaria);

    //const archivocuentabancarias = await archivocuentabancaria.getArchivocuentabancarias();
    //logger.info(line(),archivocuentabancarias);

    return archivocuentabancaria;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoCuentaBancariaByArchivoCuentaBancariaid = async (transaction, archivocuentabancariaid) => {
  try {
    const archivocuentabancaria = await modelsFT.ArchivoCuentaBancaria.findOne({
      where: {
        archivocuentabancariaid: archivocuentabancariaid,
      },
      transaction,
    });
    //logger.info(line(),archivocuentabancaria);
    return archivocuentabancaria;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoCuentaBancariaPk = async (transaction, archivocuentabancariaid) => {
  try {
    const archivocuentabancaria = await modelsFT.ArchivoCuentaBancaria.findOne({
      attributes: ["_idarchivocuentabancaria"],
      where: {
        archivocuentabancariaid: archivocuentabancariaid,
      },
      transaction,
    });
    //logger.info(line(),archivocuentabancaria);
    return archivocuentabancaria;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoCuentaBancaria = async (transaction, archivocuentabancaria) => {
  try {
    const archivocuentabancaria_nuevo = await modelsFT.ArchivoCuentaBancaria.create(archivocuentabancaria, { transaction });
    // logger.info(line(),archivocuentabancaria_nuevo);
    return archivocuentabancaria_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoCuentaBancaria = async (transaction, archivocuentabancaria) => {
  try {
    const result = await modelsFT.ArchivoCuentaBancaria.update(archivocuentabancaria, {
      where: {
        archivocuentabancariaid: archivocuentabancaria.archivocuentabancariaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoCuentaBancaria = async (transaction, archivocuentabancaria) => {
  try {
    const result = await modelsFT.ArchivoCuentaBancaria.update(archivocuentabancaria, {
      where: {
        archivocuentabancariaid: archivocuentabancaria.archivocuentabancariaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
