import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getArchivoempresas = async (transaction, estados) => {
  try {
    const archivoempresas = await modelsFT.ArchivoEmpresa.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return archivoempresas;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoEmpresaByIdarchivoempresa = async (transaction, idarchivoempresa) => {
  try {
    const archivoempresa = await modelsFT.ArchivoEmpresa.findByPk(idarchivoempresa, { transaction });

    //const archivoempresas = await archivoempresa.getArchivoempresas();

    return archivoempresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoEmpresaByArchivoEmpresaid = async (transaction, archivoempresa) => {
  try {
    const result = await modelsFT.ArchivoEmpresa.findOne({
      where: {
        _idarchivo: archivoempresa._idarchivo,
        _idempresa: archivoempresa._idempresa,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoEmpresaPk = async (transaction, archivoempresa) => {
  try {
    const result = await modelsFT.ArchivoEmpresa.findOne({
      attributes: ["_idarchivoempresa"],
      where: {
        _idarchivo: archivoempresa._idarchivo,
        _idempresa: archivoempresa._idempresa,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoEmpresa = async (transaction, archivoempresa) => {
  try {
    const archivoempresa_nuevo = await modelsFT.ArchivoEmpresa.create(archivoempresa, { transaction });

    return archivoempresa_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoEmpresa = async (transaction, archivoempresa) => {
  try {
    const result = await modelsFT.ArchivoEmpresa.update(archivoempresa, {
      where: {
        _idarchivo: archivoempresa._idarchivo,
        _idempresa: archivoempresa._idempresa,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoEmpresa = async (transaction, archivoempresa) => {
  try {
    const result = await modelsFT.ArchivoEmpresa.update(archivoempresa, {
      where: {
        _idarchivo: archivoempresa._idarchivo,
        _idempresa: archivoempresa._idempresa,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoEmpresa = async (transaction, archivoempresa) => {
  try {
    const result = await modelsFT.ArchivoEmpresa.update(archivoempresa, {
      where: {
        _idarchivo: archivoempresa._idarchivo,
        _idempresa: archivoempresa._idempresa,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
