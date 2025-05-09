import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getZlaboratorioUsuarios = async (transaction, estados) => {
  try {
    const zlaboratoriousuarios = await modelsFT.ZlaboratorioUsuario.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return zlaboratoriousuarios;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getZlaboratorioUsuarioByIdzlaboratoriousuario = async (transaction, idzlaboratoriousuario) => {
  try {
    const zlaboratoriousuario = await modelsFT.ZlaboratorioUsuario.findByPk(idzlaboratoriousuario, { transaction });

    //const zlaboratoriousuarios = await zlaboratoriousuario.getZlaboratorioUsuarios();

    return zlaboratoriousuario;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getZlaboratorioUsuarioByZlaboratorioUsuarioid = async (transaction, zlaboratoriousuarioid) => {
  try {
    const zlaboratoriousuario = await modelsFT.ZlaboratorioUsuario.findOne({
      where: {
        idusuariocrea: zlaboratoriousuarioid,
      },
      transaction,
    });

    return zlaboratoriousuario;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findZlaboratorioUsuarioPk = async (transaction, zlaboratoriousuarioid) => {
  try {
    const zlaboratoriousuario = await modelsFT.ZlaboratorioUsuario.findOne({
      attributes: ["_idusuario"],
      where: {
        idusuariocrea: zlaboratoriousuarioid,
      },
      transaction,
    });

    return zlaboratoriousuario;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertZlaboratorioUsuario = async (transaction, zlaboratoriousuario) => {
  try {
    const zlaboratoriousuario_nuevo = await modelsFT.ZlaboratorioUsuario.create(zlaboratoriousuario, { transaction });

    return zlaboratoriousuario_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateZlaboratorioUsuario = async (transaction, zlaboratoriousuario) => {
  try {
    const result = await modelsFT.ZlaboratorioUsuario.update(zlaboratoriousuario, {
      where: {
        _idusuario: zlaboratoriousuario._idusuario,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteZlaboratorioUsuario = async (transaction, zlaboratoriousuario) => {
  try {
    const result = await modelsFT.ZlaboratorioUsuario.update(zlaboratoriousuario, {
      where: {
        _idusuario: zlaboratoriousuario._idusuario,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
