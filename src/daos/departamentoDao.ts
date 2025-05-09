import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getDepartamentos = async (transaction, estados) => {
  try {
    const departamentos = await modelsFT.Departamento.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return departamentos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDepartamentoByIddepartamento = async (transaction, iddepartamento) => {
  try {
    const departamento = await modelsFT.Departamento.findByPk(iddepartamento, { transaction });

    //const departamentos = await departamento.getDepartamentos();

    return departamento;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return departamento;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return departamento;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDepartamento = async (transaction, departamento) => {
  try {
    const departamento_nuevo = await modelsFT.Departamento.create(departamento, { transaction });

    return departamento_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
