import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getArchivofactoringhistorialestados = async (transaction, estados) => {
  try {
    const archivofactoringhistorialestados = await modelsFT.ArchivoFactoringHistorialEstado.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return archivofactoringhistorialestados;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivofactoringhistorialestadoByIdarchivofactoringhistorialestado = async (transaction, idarchivofactoringhistorialestado) => {
  try {
    const archivofactoringhistorialestado = await modelsFT.ArchivoFactoringHistorialEstado.findByPk(idarchivofactoringhistorialestado, { transaction });

    //const archivofactoringhistorialestados = await archivofactoringhistorialestado.getArchivofactoringhistorialestados();

    return archivofactoringhistorialestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivofactoringhistorialestadoByArchivofactoringhistorialestadoid = async (transaction, archivofactoringhistorialestado) => {
  try {
    const result = await modelsFT.ArchivoFactoringHistorialEstado.findOne({
      where: {
        _idarchivo: archivofactoringhistorialestado._idarchivo,
        _idfactoringhistorialestado: archivofactoringhistorialestado._idfactoringhistorialestado,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivofactoringhistorialestadoPk = async (transaction, archivofactoringhistorialestado) => {
  try {
    const result = await modelsFT.ArchivoFactoringHistorialEstado.findOne({
      attributes: ["_idarchivofactoringhistorialestado"],
      where: {
        _idarchivo: archivofactoringhistorialestado._idarchivo,
        _idfactoringhistorialestado: archivofactoringhistorialestado._idfactoringhistorialestado,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivofactoringhistorialestado = async (transaction, archivofactoringhistorialestado) => {
  try {
    const archivofactoringhistorialestado_nuevo = await modelsFT.ArchivoFactoringHistorialEstado.create(archivofactoringhistorialestado, { transaction });

    return archivofactoringhistorialestado_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivofactoringhistorialestado = async (transaction, archivofactoringhistorialestado) => {
  try {
    const result = await modelsFT.ArchivoFactoringHistorialEstado.update(archivofactoringhistorialestado, {
      where: {
        _idarchivo: archivofactoringhistorialestado._idarchivo,
        _idfactoringhistorialestado: archivofactoringhistorialestado._idfactoringhistorialestado,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivofactoringhistorialestado = async (transaction, archivofactoringhistorialestado) => {
  try {
    const result = await modelsFT.ArchivoFactoringHistorialEstado.update(archivofactoringhistorialestado, {
      where: {
        _idarchivo: archivofactoringhistorialestado._idarchivo,
        _idfactoringhistorialestado: archivofactoringhistorialestado._idfactoringhistorialestado,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
