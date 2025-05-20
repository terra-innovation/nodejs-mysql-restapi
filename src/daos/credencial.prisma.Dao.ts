import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getCredencials = async (transaction, estados) => {
  try {
    const credencials = await modelsFT.Credencial.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return credencials;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
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

    return credencial;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCredencialByIdcredencial = async (transaction, idcredencial) => {
  try {
    const credencial = await modelsFT.Credencial.findByPk(idcredencial, { transaction });

    //const credencials = await credencial.getCredencials();

    return credencial;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return credencial;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return credencial;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCredencial = async (transaction, credencial) => {
  try {
    const credencial_nuevo = await modelsFT.Credencial.create(credencial, { transaction });

    return credencial_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
