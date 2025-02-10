import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getCredencials = async (transaction, estados) => {
  try {
    const credencials = await modelsFT.Credencial.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),credencials);
    return credencials;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCredencialByIdusuario = async (transaction, _idusuario) => {
  try {
    const credencial = await modelsFT.Credencial.findOne({
      where: {
        _idusuario: _idusuario,
      },
      transaction,
    });
    //logger.info(line(),credencial);
    return credencial;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCredencialByIdcredencial = async (transaction, idcredencial) => {
  try {
    const credencial = await modelsFT.Credencial.findByPk(idcredencial, { transaction });
    logger.info(line(), credencial);

    //const credencials = await credencial.getCredencials();
    //logger.info(line(),credencials);

    return credencial;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCredencialByCredencialid = async (transaction, credencialid) => {
  try {
    const credencial = await modelsFT.Credencial.findOne({
      where: {
        credencialid: credencialid,
      },
      transaction,
    });
    //logger.info(line(),credencial);
    return credencial;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCredencialPk = async (transaction, credencialid) => {
  try {
    const credencial = await modelsFT.Credencial.findOne({
      attributes: ["_idcredencial"],
      where: {
        credencialid: credencialid,
      },
      transaction,
    });
    //logger.info(line(),credencial);
    return credencial;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCredencial = async (transaction, credencial) => {
  try {
    const credencial_nuevo = await modelsFT.Credencial.create(credencial, { transaction });
    // logger.info(line(),credencial_nuevo);
    return credencial_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCredencial = async (transaction, credencial) => {
  try {
    const result = await modelsFT.Credencial.update(credencial, {
      where: {
        credencialid: credencial.credencialid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCredencial = async (transaction, credencial) => {
  try {
    const result = await modelsFT.Credencial.update(credencial, {
      where: {
        credencialid: credencial.credencialid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
