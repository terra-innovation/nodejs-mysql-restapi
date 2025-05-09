import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getArchivotipos = async (transaction, estados) => {
  try {
    const archivotipos = await modelsFT.ArchivoTipo.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return archivotipos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivotipoByIdarchivotipo = async (transaction, idarchivotipo) => {
  try {
    const archivotipo = await modelsFT.ArchivoTipo.findByPk(idarchivotipo, { transaction });

    //const archivotipos = await archivotipo.getArchivotipos();

    return archivotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return archivotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return archivotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return archivotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivotipo = async (transaction, archivotipo) => {
  try {
    const archivotipo_nuevo = await modelsFT.ArchivoTipo.create(archivotipo, { transaction });

    return archivotipo_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
