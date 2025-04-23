import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getArchivofactoringhistorialestados = async (transaction, estados) => {
  try {
    const archivofactoringhistorialestados = await modelsFT.ArchivoFactoringHistorialEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),archivofactoringhistorialestados);
    return archivofactoringhistorialestados;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivofactoringhistorialestadoByIdarchivofactoringhistorialestado = async (transaction, idarchivofactoringhistorialestado) => {
  try {
    const archivofactoringhistorialestado = await modelsFT.ArchivoFactoringHistorialEstado.findByPk(idarchivofactoringhistorialestado, { transaction });
    logger.info(line(), archivofactoringhistorialestado);

    //const archivofactoringhistorialestados = await archivofactoringhistorialestado.getArchivofactoringhistorialestados();
    //logger.info(line(),archivofactoringhistorialestados);

    return archivofactoringhistorialestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivofactoringhistorialestadoByArchivofactoringhistorialestadoid = async (transaction, archivofactoringhistorialestadoid) => {
  try {
    const archivofactoringhistorialestado = await modelsFT.ArchivoFactoringHistorialEstado.findOne({
      where: {
        archivofactoringhistorialestadoid: archivofactoringhistorialestadoid,
      },
      transaction,
    });
    //logger.info(line(),archivofactoringhistorialestado);
    return archivofactoringhistorialestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivofactoringhistorialestadoPk = async (transaction, archivofactoringhistorialestadoid) => {
  try {
    const archivofactoringhistorialestado = await modelsFT.ArchivoFactoringHistorialEstado.findOne({
      attributes: ["_idarchivofactoringhistorialestado"],
      where: {
        archivofactoringhistorialestadoid: archivofactoringhistorialestadoid,
      },
      transaction,
    });
    //logger.info(line(),archivofactoringhistorialestado);
    return archivofactoringhistorialestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivofactoringhistorialestado = async (transaction, archivofactoringhistorialestado) => {
  try {
    const archivofactoringhistorialestado_nuevo = await modelsFT.ArchivoFactoringHistorialEstado.create(archivofactoringhistorialestado, { transaction });
    // logger.info(line(),archivofactoringhistorialestado_nuevo);
    return archivofactoringhistorialestado_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivofactoringhistorialestado = async (transaction, archivofactoringhistorialestado) => {
  try {
    const result = await modelsFT.ArchivoFactoringHistorialEstado.update(archivofactoringhistorialestado, {
      where: {
        archivofactoringhistorialestadoid: archivofactoringhistorialestado.archivofactoringhistorialestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivofactoringhistorialestado = async (transaction, archivofactoringhistorialestado) => {
  try {
    const result = await modelsFT.ArchivoFactoringHistorialEstado.update(archivofactoringhistorialestado, {
      where: {
        archivofactoringhistorialestadoid: archivofactoringhistorialestado.archivofactoringhistorialestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
