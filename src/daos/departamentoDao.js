import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getDepartamentos = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const departamentos = await models.Departamento.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),departamentos);
    return departamentos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDepartamentoByIddepartamento = async (req, iddepartamento) => {
  try {
    const { models } = req.app.locals;

    const departamento = await models.Departamento.findByPk(iddepartamento, {});
    logger.info(line(), departamento);

    //const departamentos = await departamento.getDepartamentos();
    //logger.info(line(),departamentos);

    return departamento;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDepartamentoByDepartamentoid = async (req, departamentoid) => {
  try {
    const { models } = req.app.locals;
    const departamento = await models.Departamento.findOne({
      where: {
        departamentoid: departamentoid,
      },
    });
    //logger.info(line(),departamento);
    return departamento;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findDepartamentoPk = async (req, departamentoid) => {
  try {
    const { models } = req.app.locals;
    const departamento = await models.Departamento.findOne({
      attributes: ["_iddepartamento"],
      where: {
        departamentoid: departamentoid,
      },
    });
    //logger.info(line(),departamento);
    return departamento;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDepartamento = async (req, departamento) => {
  try {
    const { models } = req.app.locals;
    const departamento_nuevo = await models.Departamento.create(departamento);
    // logger.info(line(),departamento_nuevo);
    return departamento_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateDepartamento = async (req, departamento) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Departamento.update(departamento, {
      where: {
        departamentoid: departamento.departamentoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteDepartamento = async (req, departamento) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Departamento.update(departamento, {
      where: {
        departamentoid: departamento.departamentoid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
