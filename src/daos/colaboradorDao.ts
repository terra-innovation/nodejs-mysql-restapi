import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { Empresa } from "#src/models/ft_factoring/Empresa.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getColaboradorByIdEmpresaAndIdpersona = async (transaction, _idempresa, _idpersona) => {
  try {
    const colaborador = await modelsFT.Colaborador.findOne({
      include: [],
      where: {
        _idempresa: _idempresa,
        _idpersona: _idpersona,
      },
      transaction,
    });
    return colaborador;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradoresActivas = async (transaction) => {
  try {
    const colaboradores = await modelsFT.Colaborador.findAll({
      include: [
        {
          model: Empresa,
          as: "empresa",
          attributes: {
            exclude: ["idempresa", "idusuariocrea", "fechacrea", "idusuariomod", "fechamod", "estado"],
          },
        },
      ],
      attributes: {
        exclude: ["idcolaborador", "idempresa", "idusuariocrea", "fechacrea", "idusuariomod", "fechamod", "estado"],
      },
      where: {
        estado: 1,
      },
      transaction,
    });

    return colaboradores;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradorByIdcolaborador = async (transaction, idcolaborador) => {
  try {
    const colaborador = await modelsFT.Colaborador.findByPk(idcolaborador, { transaction });

    //const colaboradores = await colaborador.getColaboradors();

    return colaborador;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradorByColaboradorid = async (transaction, colaboradorid) => {
  try {
    const colaborador = await modelsFT.Colaborador.findOne({
      include: [
        {
          model: Empresa,
          as: "empresa",
          attributes: {
            exclude: ["idempresa", "idusuariocrea", "fechacrea", "idusuariomod", "fechamod", "estado"],
          },
        },
      ],
      attributes: {
        exclude: ["idcolaborador", "idempresa", "idusuariocrea", "fechacrea", "idusuariomod", "fechamod", "estado"],
      },
      where: {
        colaboradorid: colaboradorid,
      },
      transaction,
    });

    return colaborador;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findColaboradorPk = async (transaction, colaboradorid) => {
  try {
    const colaborador = await modelsFT.Colaborador.findAll({
      attributes: ["idcolaborador"],
      where: {
        colaboradorid: colaboradorid,
      },
      transaction,
    });

    return colaborador;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertColaborador = async (transaction, colaborador) => {
  try {
    const colaborador_nuevo = await modelsFT.Colaborador.create(colaborador, { transaction });

    return colaborador_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateColaborador = async (transaction, colaborador) => {
  try {
    const result = await modelsFT.Colaborador.update(colaborador, {
      where: {
        colaboradorid: colaborador.colaboradorid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteColaborador = async (transaction, colaborador) => {
  try {
    const result = await modelsFT.Colaborador.update(colaborador, {
      where: {
        colaboradorid: colaborador.colaboradorid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
