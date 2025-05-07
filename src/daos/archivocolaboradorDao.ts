import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getArchivocolaboradors = async (transaction, estados) => {
  try {
    const archivocolaboradors = await modelsFT.ArchivoColaborador.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return archivocolaboradors;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoColaboradorByIdarchivocolaborador = async (transaction, idarchivocolaborador) => {
  try {
    const archivocolaborador = await modelsFT.ArchivoColaborador.findByPk(idarchivocolaborador, { transaction });

    //const archivocolaboradors = await archivocolaborador.getArchivocolaboradors();

    return archivocolaborador;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoColaboradorByArchivoColaboradorid = async (transaction, archivocolaborador) => {
  try {
    const result = await modelsFT.ArchivoColaborador.findOne({
      where: {
        _idarchivo: archivocolaborador._idarchivo,
        _idcolaborador: archivocolaborador._idcolaborador,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoColaboradorPk = async (transaction, archivocolaborador) => {
  try {
    const result = await modelsFT.ArchivoColaborador.findOne({
      attributes: ["_idarchivocolaborador"],
      where: {
        _idarchivo: archivocolaborador._idarchivo,
        _idcolaborador: archivocolaborador._idcolaborador,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoColaborador = async (transaction, archivocolaborador) => {
  try {
    const archivocolaborador_nuevo = await modelsFT.ArchivoColaborador.create(archivocolaborador, { transaction });

    return archivocolaborador_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoColaborador = async (transaction, archivocolaborador) => {
  try {
    const result = await modelsFT.ArchivoColaborador.update(archivocolaborador, {
      where: {
        _idarchivo: archivocolaborador._idarchivo,
        _idcolaborador: archivocolaborador._idcolaborador,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoColaborador = async (transaction, archivocolaborador) => {
  try {
    const result = await modelsFT.ArchivoColaborador.update(archivocolaborador, {
      where: {
        _idarchivo: archivocolaborador._idarchivo,
        _idcolaborador: archivocolaborador._idcolaborador,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoColaborador = async (transaction, archivocolaborador) => {
  try {
    const result = await modelsFT.ArchivoColaborador.update(archivocolaborador, {
      where: {
        _idarchivo: archivocolaborador._idarchivo,
        _idcolaborador: archivocolaborador._idcolaborador,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
