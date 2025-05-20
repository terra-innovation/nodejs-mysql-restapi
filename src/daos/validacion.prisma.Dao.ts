import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getValidacionByIdusuarioAndValor = async (transaction, _idusuario, valor, estados) => {
  try {
    const validacions = await modelsFT.Validacion.findOne({
      where: {
        _idusuario: _idusuario,
        valor: valor,
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return validacions;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndIdvalidaciontipo = async (transaction, _idusuario, _idvalidaciontipo, estados) => {
  try {
    const validacions = await modelsFT.Validacion.findOne({
      where: {
        _idusuario: _idusuario,
        _idvalidaciontipo: _idvalidaciontipo,
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return validacions;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndCodigo = async (transaction, _idusuario, codigo, estados) => {
  try {
    const validacions = await modelsFT.Validacion.findOne({
      where: {
        _idusuario: _idusuario,
        codigo: codigo,
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return validacions;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacions = async (transaction, estados) => {
  try {
    const validacions = await modelsFT.Validacion.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return validacions;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdvalidacion = async (transaction, idvalidacion) => {
  try {
    const validacion = await modelsFT.Validacion.findByPk(idvalidacion, {
      include: [
        {
          model: modelsFT.Colaborador,
          as: "colaboradors",
        },
      ],
      transaction,
    });

    //const colaboradores = await validacion.getColaboradors();

    return validacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByValidacionid = async (transaction, validacionid) => {
  try {
    const validacion = await modelsFT.Validacion.findAll({
      include: [
        {
          model: modelsFT.Colaborador,
          as: "colaboradors",
        },
      ],
      where: {
        validacionid: validacionid,
      },
      transaction,
    });

    return validacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findValidacionPk = async (transaction, validacionid) => {
  try {
    const validacion = await modelsFT.Validacion.findOne({
      attributes: ["_idvalidacion"],
      where: {
        validacionid: validacionid,
      },
      transaction,
    });

    return validacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertValidacion = async (transaction, validacion) => {
  try {
    const validacion_nuevo = await modelsFT.Validacion.create(validacion, { transaction });

    return validacion_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateValidacion = async (transaction, validacion) => {
  try {
    const result = await modelsFT.Validacion.update(validacion, {
      where: {
        validacionid: validacion.validacionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteValidacion = async (transaction, validacion) => {
  try {
    const result = await modelsFT.Validacion.update(validacion, {
      where: {
        validacionid: validacion.validacionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateValidacion = async (transaction, validacion) => {
  try {
    const result = await modelsFT.Validacion.update(validacion, {
      where: {
        validacionid: validacion.validacionid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
