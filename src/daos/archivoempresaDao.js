import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getArchivoempresas = async (transaction, estados) => {
  try {
    const archivoempresas = await modelsFT.ArchivoEmpresa.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),archivoempresas);
    return archivoempresas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoEmpresaByIdarchivoempresa = async (transaction, idarchivoempresa) => {
  try {
    const archivoempresa = await modelsFT.ArchivoEmpresa.findByPk(idarchivoempresa, { transaction });
    logger.info(line(), archivoempresa);

    //const archivoempresas = await archivoempresa.getArchivoempresas();
    //logger.info(line(),archivoempresas);

    return archivoempresa;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoEmpresaByArchivoEmpresaid = async (transaction, archivoempresaid) => {
  try {
    const archivoempresa = await modelsFT.ArchivoEmpresa.findOne({
      where: {
        archivoempresaid: archivoempresaid,
      },
      transaction,
    });
    //logger.info(line(),archivoempresa);
    return archivoempresa;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoEmpresaPk = async (transaction, archivoempresaid) => {
  try {
    const archivoempresa = await modelsFT.ArchivoEmpresa.findOne({
      attributes: ["_idarchivoempresa"],
      where: {
        archivoempresaid: archivoempresaid,
      },
      transaction,
    });
    //logger.info(line(),archivoempresa);
    return archivoempresa;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoEmpresa = async (transaction, archivoempresa) => {
  try {
    const archivoempresa_nuevo = await modelsFT.ArchivoEmpresa.create(archivoempresa, { transaction });
    // logger.info(line(),archivoempresa_nuevo);
    return archivoempresa_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoEmpresa = async (transaction, archivoempresa) => {
  try {
    const result = await modelsFT.ArchivoEmpresa.update(archivoempresa, {
      where: {
        archivoempresaid: archivoempresa.archivoempresaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoEmpresa = async (transaction, archivoempresa) => {
  try {
    const result = await modelsFT.ArchivoEmpresa.update(archivoempresa, {
      where: {
        archivoempresaid: archivoempresa.archivoempresaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
