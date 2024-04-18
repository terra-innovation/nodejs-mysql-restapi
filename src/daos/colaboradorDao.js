import { Sequelize } from "sequelize";
import Empresa from "../models/ft_factoring/Empresa.js";
import { ClientError } from "../utils/CustomErrors.js";

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
    //console.log(colaboradores);
    return colaboradores;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradorByIdcolaborador = async (req, idcolaborador) => {
  try {
    const { models } = req.app.locals;

    const colaborador = await models.Colaborador.findByPk(idcolaborador, {});
    console.log(colaborador);

    //const colaboradores = await colaborador.getColaboradors();
    //console.log(colaboradores);

    return colaborador;
  } catch (error) {
    console.error(error);
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
    //console.log(colaborador);
    return colaborador;
  } catch (error) {
    console.error(error);
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
    //console.log(colaborador);
    return colaborador;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertColaborador = async (req, colaborador) => {
  try {
    const { models } = req.app.locals;
    const colaborador_nuevo = await models.Colaborador.create(colaborador);
    // console.log(colaborador_nuevo);
    return colaborador_nuevo;
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
