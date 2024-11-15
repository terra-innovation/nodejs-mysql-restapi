import { Sequelize } from "sequelize";
import Empresa from "../models/ft_factoring/Empresa.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getColaboradoresActivas = async (req) => {
  try {
    const { models } = req.app.locals;
    const colaboradores = await models.Colaborador.findAll({
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
    });
    //logger.info(line(),colaboradores);
    return colaboradores;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradorByIdcolaborador = async (req, idcolaborador) => {
  try {
    const { models } = req.app.locals;

    const colaborador = await models.Colaborador.findByPk(idcolaborador, {});
    logger.info(line(), colaborador);

    //const colaboradores = await colaborador.getColaboradors();
    //logger.info(line(),colaboradores);

    return colaborador;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradorByColaboradorid = async (req, colaboradorid) => {
  try {
    const { models } = req.app.locals;
    const colaborador = await models.Colaborador.findAll({
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
    });
    //logger.info(line(),colaborador);
    return colaborador;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findColaboradorPk = async (req, colaboradorid) => {
  try {
    const { models } = req.app.locals;
    const colaborador = await models.Colaborador.findAll({
      attributes: ["idcolaborador"],
      where: {
        colaboradorid: colaboradorid,
      },
    });
    //logger.info(line(),colaborador);
    return colaborador;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertColaborador = async (req, colaborador) => {
  try {
    const { models } = req.app.locals;
    const colaborador_nuevo = await models.Colaborador.create(colaborador);
    // logger.info(line(),colaborador_nuevo);
    return colaborador_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateColaborador = async (req, colaborador) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Colaborador.update(colaborador, {
      where: {
        colaboradorid: colaborador.colaboradorid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteColaborador = async (req, colaborador) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Colaborador.update(colaborador, {
      where: {
        colaboradorid: colaborador.colaboradorid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
