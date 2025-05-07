import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

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

    return usuarioservicioempresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresas = async (transaction, estados) => {
  try {
    const usuarioservicioempresas = await modelsFT.UsuarioServicioEmpresa.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return usuarioservicioempresas;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioservicioempresaByIdusuarioservicioempresa = async (transaction, idusuarioservicioempresa) => {
  try {
    const usuarioservicioempresa = await modelsFT.UsuarioServicioEmpresa.findByPk(idusuarioservicioempresa, { transaction });

    //const usuarioservicioempresas = await usuarioservicioempresa.getUsuarioservicioempresas();

    return usuarioservicioempresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return usuarioservicioempresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return usuarioservicioempresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuarioservicioempresa = async (transaction, usuarioservicioempresa) => {
  try {
    const usuarioservicioempresa_nuevo = await modelsFT.UsuarioServicioEmpresa.create(usuarioservicioempresa, { transaction });

    return usuarioservicioempresa_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
