import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getDepartamentos = async (transaction, estados) => {
  try {
    const departamentos = await modelsFT.Departamento.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),departamentos);
    return departamentos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDepartamentoByIddepartamento = async (transaction, iddepartamento) => {
  try {
    const departamento = await modelsFT.Departamento.findByPk(iddepartamento, { transaction });
    logger.info(line(), departamento);

    //const departamentos = await departamento.getDepartamentos();
    //logger.info(line(),departamentos);

    return departamento;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDepartamentoByDepartamentoid = async (transaction, departamentoid) => {
  try {
    const departamento = await modelsFT.Departamento.findOne({
      where: {
        departamentoid: departamentoid,
      },
      transaction,
    });
    //logger.info(line(),departamento);
    return departamento;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findDepartamentoPk = async (transaction, departamentoid) => {
  try {
    const departamento = await modelsFT.Departamento.findOne({
      attributes: ["_iddepartamento"],
      where: {
        departamentoid: departamentoid,
      },
      transaction,
    });
    //logger.info(line(),departamento);
    return departamento;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDepartamento = async (transaction, departamento) => {
  try {
    const departamento_nuevo = await modelsFT.Departamento.create(departamento, { transaction });
    // logger.info(line(),departamento_nuevo);
    return departamento_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateDepartamento = async (transaction, departamento) => {
  try {
    const result = await modelsFT.Departamento.update(departamento, {
      where: {
        departamentoid: departamento.departamentoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteDepartamento = async (transaction, departamento) => {
  try {
    const result = await modelsFT.Departamento.update(departamento, {
      where: {
        departamentoid: departamento.departamentoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
