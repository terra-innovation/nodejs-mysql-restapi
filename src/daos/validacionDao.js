import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getValidacionsByIdusuario = async (req, _idusuario, estados) => {
  try {
    const { models } = req.app.locals;
    const validacions = await models.Validacion.findAll({
      include: [
        {
          model: models.UsuarioValidacion,
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
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndValor = async (req, _idusuario, valor, estados) => {
  try {
    const { models } = req.app.locals;
    const validacions = await models.Validacion.findOne({
      where: {
        _idusuario: _idusuario,
        valor: valor,
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndIdvalidaciontipo = async (req, _idusuario, _idvalidaciontipo, estados) => {
  try {
    const { models } = req.app.locals;
    const validacions = await models.Validacion.findOne({
      where: {
        _idusuario: _idusuario,
        _idvalidaciontipo: _idvalidaciontipo,
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndCodigo = async (req, _idusuario, codigo, estados) => {
  try {
    const { models } = req.app.locals;
    const validacions = await models.Validacion.findOne({
      where: {
        _idusuario: _idusuario,
        codigo: codigo,
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndRuc = async (req, _idusuario, ruc, estado) => {
  try {
    const { models } = req.app.locals;
    const validacions = await models.Validacion.findOne({
      include: [
        {
          model: models.UsuarioValidacion,
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
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndValidacionid = async (req, _idusuario, validacionid, estado) => {
  try {
    const { models } = req.app.locals;
    const validacions = await models.Validacion.findOne({
      include: [
        {
          model: models.UsuarioValidacion,
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
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacions = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const validacions = await models.Validacion.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),validacions);
    return validacions;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdvalidacion = async (req, idvalidacion) => {
  try {
    const { models } = req.app.locals;

    const validacion = await models.Validacion.findByPk(idvalidacion, {
      include: [
        {
          model: models.Colaborador,
          as: "colaboradors",
        },
      ],
    });
    logger.info(line(), validacion);

    //const colaboradores = await validacion.getColaboradors();
    //logger.info(line(),colaboradores);

    return validacion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByValidacionid = async (req, validacionid) => {
  try {
    const { models } = req.app.locals;
    const validacion = await models.Validacion.findAll({
      include: [
        {
          model: models.Colaborador,
          as: "colaboradors",
        },
      ],
      where: {
        validacionid: validacionid,
      },
    });
    //logger.info(line(),validacion);
    return validacion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByRuc = async (req, ruc) => {
  try {
    const { models } = req.app.locals;
    const validacion = await models.Validacion.findAll({
      where: {
        ruc: ruc,
      },
    });
    //logger.info(line(),validacion);
    return validacion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findValidacionPk = async (req, validacionid) => {
  try {
    const { models } = req.app.locals;
    const validacion = await models.Validacion.findOne({
      attributes: ["_idvalidacion"],
      where: {
        validacionid: validacionid,
      },
    });
    //logger.info(line(),validacion);
    return validacion;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertValidacion = async (req, validacion) => {
  try {
    const { models } = req.app.locals;
    const validacion_nuevo = await models.Validacion.create(validacion);
    // logger.info(line(),validacion_nuevo);
    return validacion_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateValidacion = async (req, validacion) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Validacion.update(validacion, {
      where: {
        validacionid: validacion.validacionid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteValidacion = async (req, validacion) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Validacion.update(validacion, {
      where: {
        validacionid: validacion.validacionid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateValidacion = async (req, validacion) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Validacion.update(validacion, {
      where: {
        validacionid: validacion.validacionid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
