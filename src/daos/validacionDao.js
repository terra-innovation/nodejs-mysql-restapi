import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getValidacionsByIdusuario = async (transaction, _idusuario, estados) => {
  try {
    const validacions = await modelsFT.Validacion.findAll({
      include: [
        {
          model: modelsFT.UsuarioValidacion,
          as: "usuario_validacions",
          where: {
            _idusuario: _idusuario,
            estado: {
              [Sequelize.Op.in]: estados,
            },
          },
        },
      ],
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndValor = async (transaction, _idusuario, valor, estados) => {
  try {
    const validacions = await modelsFT.Validacion.findOne({
      where: {
        _idusuario: _idusuario,
        valor: valor,
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), formatError(error));
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
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), formatError(error));
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
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndRuc = async (transaction, _idusuario, ruc, estado) => {
  try {
    const validacions = await modelsFT.Validacion.findOne({
      include: [
        {
          model: modelsFT.UsuarioValidacion,
          as: "usuario_validacions",
          where: {
            _idusuario: _idusuario,
            estado: estado,
          },
        },
      ],
      where: {
        ruc: ruc,
        estado: estado,
      },
      transaction,
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndValidacionid = async (transaction, _idusuario, validacionid, estado) => {
  try {
    const validacions = await modelsFT.Validacion.findOne({
      include: [
        {
          model: modelsFT.UsuarioValidacion,
          as: "usuario_validacions",
          where: {
            _idusuario: _idusuario,
            estado: estado,
          },
        },
      ],
      where: {
        validacionid: validacionid,
        estado: estado,
      },
      transaction,
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacions = async (transaction, estados) => {
  try {
    const validacions = await modelsFT.Validacion.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    logger.info(line(), validacion);

    //const colaboradores = await validacion.getColaboradors();
    //logger.info(line(),colaboradores);

    return validacion;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    //logger.info(line(),validacion);
    return validacion;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByRuc = async (transaction, ruc) => {
  try {
    const validacion = await modelsFT.Validacion.findAll({
      where: {
        ruc: ruc,
      },
      transaction,
    });
    //logger.info(line(),validacion);
    return validacion;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    //logger.info(line(),validacion);
    return validacion;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertValidacion = async (transaction, validacion) => {
  try {
    const validacion_nuevo = await modelsFT.Validacion.create(validacion, { transaction });
    // logger.info(line(),validacion_nuevo);
    return validacion_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    logger.error(line(), formatError(error));
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
    logger.error(line(), formatError(error));
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
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
