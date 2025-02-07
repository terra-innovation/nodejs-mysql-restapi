import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getUsuarioservicioempresaByIdusuarioIdServicioIdempresa = async (req, _idusuario, _idservicio, _idempresa) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioempresa = await models.UsuarioServicioEmpresa.findOne({
      where: {
        _idusuario: _idusuario,
        _idservicio: _idservicio,
        _idempresa: _idempresa,
      },
    });
    //logger.info(line(),usuarioservicioempresa);
    return usuarioservicioempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresas = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioempresas = await models.UsuarioServicioEmpresa.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),usuarioservicioempresas);
    return usuarioservicioempresas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaByIdusuarioservicioempresa = async (req, idusuarioservicioempresa) => {
  try {
    const { models } = req.app.locals;

    const usuarioservicioempresa = await models.UsuarioServicioEmpresa.findByPk(idusuarioservicioempresa, {});
    logger.info(line(), usuarioservicioempresa);

    //const usuarioservicioempresas = await usuarioservicioempresa.getUsuarioservicioempresas();
    //logger.info(line(),usuarioservicioempresas);

    return usuarioservicioempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaByUsuarioservicioempresaid = async (req, usuarioservicioempresaid) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioempresa = await models.UsuarioServicioEmpresa.findOne({
      where: {
        usuarioservicioempresaid: usuarioservicioempresaid,
      },
    });
    //logger.info(line(),usuarioservicioempresa);
    return usuarioservicioempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioempresaPk = async (req, usuarioservicioempresaid) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioempresa = await models.UsuarioServicioEmpresa.findOne({
      attributes: ["_idusuarioservicioempresa"],
      where: {
        usuarioservicioempresaid: usuarioservicioempresaid,
      },
    });
    //logger.info(line(),usuarioservicioempresa);
    return usuarioservicioempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioempresa = async (req, usuarioservicioempresa) => {
  try {
    const { models } = req.app.locals;
    const usuarioservicioempresa_nuevo = await models.UsuarioServicioEmpresa.create(usuarioservicioempresa);
    // logger.info(line(),usuarioservicioempresa_nuevo);
    return usuarioservicioempresa_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioempresa = async (req, usuarioservicioempresa) => {
  try {
    const { models } = req.app.locals;
    const result = await models.UsuarioServicioEmpresa.update(usuarioservicioempresa, {
      where: {
        usuarioservicioempresaid: usuarioservicioempresa.usuarioservicioempresaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioempresa = async (req, usuarioservicioempresa) => {
  try {
    const { models } = req.app.locals;
    const result = await models.UsuarioServicioEmpresa.update(usuarioservicioempresa, {
      where: {
        usuarioservicioempresaid: usuarioservicioempresa.usuarioservicioempresaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
