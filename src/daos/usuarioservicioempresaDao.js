import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getUsuarioservicioempresaByIdusuarioIdServicioIdempresa = async (transaction, _idusuario, _idservicio, _idempresa) => {
  try {
    const usuarioservicioempresa = await modelsFT.UsuarioServicioEmpresa.findOne({
      where: {
        _idusuario: _idusuario,
        _idservicio: _idservicio,
        _idempresa: _idempresa,
      },
      transaction,
    });
    //logger.info(line(),usuarioservicioempresa);
    return usuarioservicioempresa;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresas = async (transaction, estados) => {
  try {
    const usuarioservicioempresas = await modelsFT.UsuarioServicioEmpresa.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),usuarioservicioempresas);
    return usuarioservicioempresas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaByIdusuarioservicioempresa = async (transaction, idusuarioservicioempresa) => {
  try {
    const usuarioservicioempresa = await modelsFT.UsuarioServicioEmpresa.findByPk(idusuarioservicioempresa, { transaction });
    logger.info(line(), usuarioservicioempresa);

    //const usuarioservicioempresas = await usuarioservicioempresa.getUsuarioservicioempresas();
    //logger.info(line(),usuarioservicioempresas);

    return usuarioservicioempresa;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaByUsuarioservicioempresaid = async (transaction, usuarioservicioempresaid) => {
  try {
    const usuarioservicioempresa = await modelsFT.UsuarioServicioEmpresa.findOne({
      where: {
        usuarioservicioempresaid: usuarioservicioempresaid,
      },
      transaction,
    });
    //logger.info(line(),usuarioservicioempresa);
    return usuarioservicioempresa;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioservicioempresaPk = async (transaction, usuarioservicioempresaid) => {
  try {
    const usuarioservicioempresa = await modelsFT.UsuarioServicioEmpresa.findOne({
      attributes: ["_idusuarioservicioempresa"],
      where: {
        usuarioservicioempresaid: usuarioservicioempresaid,
      },
      transaction,
    });
    //logger.info(line(),usuarioservicioempresa);
    return usuarioservicioempresa;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioempresa = async (transaction, usuarioservicioempresa) => {
  try {
    const usuarioservicioempresa_nuevo = await modelsFT.UsuarioServicioEmpresa.create(usuarioservicioempresa, { transaction });
    // logger.info(line(),usuarioservicioempresa_nuevo);
    return usuarioservicioempresa_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuarioservicioempresa = async (transaction, usuarioservicioempresa) => {
  try {
    const result = await modelsFT.UsuarioServicioEmpresa.update(usuarioservicioempresa, {
      where: {
        usuarioservicioempresaid: usuarioservicioempresa.usuarioservicioempresaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuarioservicioempresa = async (transaction, usuarioservicioempresa) => {
  try {
    const result = await modelsFT.UsuarioServicioEmpresa.update(usuarioservicioempresa, {
      where: {
        usuarioservicioempresaid: usuarioservicioempresa.usuarioservicioempresaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
