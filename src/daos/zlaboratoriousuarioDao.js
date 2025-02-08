import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getZlaboratorioUsuarios = async (transaction, estados) => {
  try {
    const zlaboratoriousuarios = await modelsFT.ZlaboratorioUsuario.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),zlaboratoriousuarios);
    return zlaboratoriousuarios;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getZlaboratorioUsuarioByIdzlaboratoriousuario = async (transaction, idzlaboratoriousuario) => {
  try {
    const zlaboratoriousuario = await modelsFT.ZlaboratorioUsuario.findByPk(idzlaboratoriousuario, { transaction });
    logger.info(line(), zlaboratoriousuario);

    //const zlaboratoriousuarios = await zlaboratoriousuario.getZlaboratorioUsuarios();
    //logger.info(line(),zlaboratoriousuarios);

    return zlaboratoriousuario;
  } catch (error) {
    logger.error(line(), error);
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
    //logger.info(line(),zlaboratoriousuario);
    return zlaboratoriousuario;
  } catch (error) {
    logger.error(line(), error);
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
    //logger.info(line(),zlaboratoriousuario);
    return zlaboratoriousuario;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertZlaboratorioUsuario = async (transaction, zlaboratoriousuario) => {
  try {
    const zlaboratoriousuario_nuevo = await modelsFT.ZlaboratorioUsuario.create(zlaboratoriousuario, { transaction });
    // logger.info(line(),zlaboratoriousuario_nuevo);
    return zlaboratoriousuario_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateZlaboratorioUsuario = async (transaction, zlaboratoriousuario) => {
  try {
    const result = await modelsFT.ZlaboratorioUsuario.update(zlaboratoriousuario, {
      where: {
        zlaboratoriousuarioid: zlaboratoriousuario.zlaboratoriousuarioid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteZlaboratorioUsuario = async (transaction, zlaboratoriousuario) => {
  try {
    const result = await modelsFT.ZlaboratorioUsuario.update(zlaboratoriousuario, {
      where: {
        zlaboratoriousuarioid: zlaboratoriousuario.zlaboratoriousuarioid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
