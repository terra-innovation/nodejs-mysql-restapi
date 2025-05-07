import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getArchivopersonas = async (transaction, estados) => {
  try {
    const archivopersonas = await modelsFT.ArchivoPersona.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return archivopersonas;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoPersonaByIdarchivopersona = async (transaction, idarchivopersona) => {
  try {
    const archivopersona = await modelsFT.ArchivoPersona.findByPk(idarchivopersona, { transaction });

    return archivopersona;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoPersonaByArchivoPersonaid = async (transaction, archivopersona) => {
  try {
    const result = await modelsFT.ArchivoPersona.findOne({
      where: {
        _idarchivo: archivopersona._idarchivo,
        _idpersona: archivopersona._idpersona,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoPersonaPk = async (transaction, archivopersona) => {
  try {
    const result = await modelsFT.ArchivoPersona.findOne({
      attributes: ["_idarchivopersona"],
      where: {
        _idarchivo: archivopersona._idarchivo,
        _idpersona: archivopersona._idpersona,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoPersona = async (transaction, archivopersona) => {
  try {
    const archivopersona_nuevo = await modelsFT.ArchivoPersona.create(archivopersona, { transaction });

    return archivopersona_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoPersona = async (transaction, archivopersona) => {
  try {
    const result = await modelsFT.ArchivoPersona.update(archivopersona, {
      where: {
        _idarchivo: archivopersona._idarchivo,
        _idpersona: archivopersona._idpersona,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoPersona = async (transaction, archivopersona) => {
  try {
    const result = await modelsFT.ArchivoPersona.update(archivopersona, {
      where: {
        _idarchivo: archivopersona._idarchivo,
        _idpersona: archivopersona._idpersona,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoPersona = async (transaction, archivopersona) => {
  try {
    const result = await modelsFT.ArchivoPersona.update(archivopersona, {
      where: {
        _idarchivo: archivopersona._idarchivo,
        _idpersona: archivopersona._idpersona,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
