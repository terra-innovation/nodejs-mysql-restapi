import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getArchivopersonas = async (transaction, estados) => {
  try {
    const archivopersonas = await modelsFT.ArchivoPersona.findAll({
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

export const getArchivoPersonaByIdarchivopersona = async (transaction, idarchivopersona) => {
  try {
    const archivopersona = await modelsFT.ArchivoPersona.findByPk(idarchivopersona, { transaction });
    logger.info(line(), archivopersona);

    //const archivopersonas = await archivopersona.getArchivopersonas();
    //logger.info(line(),archivopersonas);

    return archivopersona;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoPersonaByArchivoPersonaid = async (transaction, archivopersonaid) => {
  try {
    const archivopersona = await modelsFT.ArchivoPersona.findOne({
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

export const findArchivoPersonaPk = async (transaction, archivopersonaid) => {
  try {
    const archivopersona = await modelsFT.ArchivoPersona.findOne({
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

export const insertArchivoPersona = async (transaction, archivopersona) => {
  try {
    const archivopersona_nuevo = await modelsFT.ArchivoPersona.create(archivopersona, { transaction });
    // logger.info(line(),archivopersona_nuevo);
    return archivopersona_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoPersona = async (transaction, archivopersona) => {
  try {
    const result = await modelsFT.ArchivoPersona.update(archivopersona, {
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

export const deleteArchivoPersona = async (transaction, archivopersona) => {
  try {
    const result = await modelsFT.ArchivoPersona.update(archivopersona, {
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
