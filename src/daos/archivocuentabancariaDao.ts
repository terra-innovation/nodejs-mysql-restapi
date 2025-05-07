import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getArchivocuentabancarias = async (transaction, estados) => {
  try {
    const archivocuentabancarias = await modelsFT.ArchivoCuentaBancaria.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return archivocuentabancarias;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoCuentaBancariaByIdarchivocuentabancaria = async (transaction, idarchivocuentabancaria) => {
  try {
    const archivocuentabancaria = await modelsFT.ArchivoCuentaBancaria.findByPk(idarchivocuentabancaria, { transaction });

    //const archivocuentabancarias = await archivocuentabancaria.getArchivocuentabancarias();

    return archivocuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoCuentaBancariaByArchivoCuentaBancariaid = async (transaction, archivocuentabancaria) => {
  try {
    const result = await modelsFT.ArchivoCuentaBancaria.findOne({
      where: {
        _idarchivo: archivocuentabancaria._idarchivo,
        _idcuentabancaria: archivocuentabancaria._idcuentabancaria,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoCuentaBancariaPk = async (transaction, archivocuentabancaria) => {
  try {
    const result = await modelsFT.ArchivoCuentaBancaria.findOne({
      attributes: ["_idarchivocuentabancaria"],
      where: {
        _idarchivo: archivocuentabancaria._idarchivo,
        _idcuentabancaria: archivocuentabancaria._idcuentabancaria,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoCuentaBancaria = async (transaction, archivocuentabancaria) => {
  try {
    const archivocuentabancaria_nuevo = await modelsFT.ArchivoCuentaBancaria.create(archivocuentabancaria, { transaction });

    return archivocuentabancaria_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoCuentaBancaria = async (transaction, archivocuentabancaria) => {
  try {
    const result = await modelsFT.ArchivoCuentaBancaria.update(archivocuentabancaria, {
      where: {
        _idarchivo: archivocuentabancaria._idarchivo,
        _idcuentabancaria: archivocuentabancaria._idcuentabancaria,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoCuentaBancaria = async (transaction, archivocuentabancaria) => {
  try {
    const result = await modelsFT.ArchivoCuentaBancaria.update(archivocuentabancaria, {
      where: {
        _idarchivo: archivocuentabancaria._idarchivo,
        _idcuentabancaria: archivocuentabancaria._idcuentabancaria,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoCuentaBancaria = async (transaction, archivocuentabancaria) => {
  try {
    const result = await modelsFT.ArchivoCuentaBancaria.update(archivocuentabancaria, {
      where: {
        _idarchivo: archivocuentabancaria._idarchivo,
        _idcuentabancaria: archivocuentabancaria._idcuentabancaria,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
