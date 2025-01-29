import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getArchivocuentabancarias = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const archivocuentabancarias = await models.ArchivoCuentaBancaria.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),archivocuentabancarias);
    return archivocuentabancarias;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoCuentaBancariaByIdarchivocuentabancaria = async (req, idarchivocuentabancaria) => {
  try {
    const { models } = req.app.locals;

    const archivocuentabancaria = await models.ArchivoCuentaBancaria.findByPk(idarchivocuentabancaria, {});
    logger.info(line(), archivocuentabancaria);

    //const archivocuentabancarias = await archivocuentabancaria.getArchivocuentabancarias();
    //logger.info(line(),archivocuentabancarias);

    return archivocuentabancaria;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoCuentaBancariaByArchivoCuentaBancariaid = async (req, archivocuentabancariaid) => {
  try {
    const { models } = req.app.locals;
    const archivocuentabancaria = await models.ArchivoCuentaBancaria.findOne({
      where: {
        archivocuentabancariaid: archivocuentabancariaid,
      },
    });
    //logger.info(line(),archivocuentabancaria);
    return archivocuentabancaria;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoCuentaBancariaPk = async (req, archivocuentabancariaid) => {
  try {
    const { models } = req.app.locals;
    const archivocuentabancaria = await models.ArchivoCuentaBancaria.findOne({
      attributes: ["_idarchivocuentabancaria"],
      where: {
        archivocuentabancariaid: archivocuentabancariaid,
      },
    });
    //logger.info(line(),archivocuentabancaria);
    return archivocuentabancaria;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoCuentaBancaria = async (req, archivocuentabancaria) => {
  try {
    const { models } = req.app.locals;
    const archivocuentabancaria_nuevo = await models.ArchivoCuentaBancaria.create(archivocuentabancaria);
    // logger.info(line(),archivocuentabancaria_nuevo);
    return archivocuentabancaria_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoCuentaBancaria = async (req, archivocuentabancaria) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ArchivoCuentaBancaria.update(archivocuentabancaria, {
      where: {
        archivocuentabancariaid: archivocuentabancaria.archivocuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoCuentaBancaria = async (req, archivocuentabancaria) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ArchivoCuentaBancaria.update(archivocuentabancaria, {
      where: {
        archivocuentabancariaid: archivocuentabancaria.archivocuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
