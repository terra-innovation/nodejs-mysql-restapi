import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getEmpresacuentabancarias = async (transaction, estados) => {
  try {
    const empresacuentabancarias = await modelsFT.EmpresaCuentaBancaria.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),empresacuentabancarias);
    return empresacuentabancarias;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariaByIdempresacuentabancaria = async (transaction, idempresacuentabancaria) => {
  try {
    const empresacuentabancaria = await modelsFT.EmpresaCuentaBancaria.findByPk(idempresacuentabancaria, { transaction });
    logger.info(line(), empresacuentabancaria);

    //const empresacuentabancarias = await empresacuentabancaria.getEmpresacuentabancarias();
    //logger.info(line(),empresacuentabancarias);

    return empresacuentabancaria;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariaByEmpresacuentabancariaid = async (transaction, empresacuentabancariaid) => {
  try {
    const empresacuentabancaria = await modelsFT.EmpresaCuentaBancaria.findOne({
      where: {
        empresacuentabancariaid: empresacuentabancariaid,
      },
      transaction,
    });
    //logger.info(line(),empresacuentabancaria);
    return empresacuentabancaria;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findEmpresacuentabancariaPk = async (transaction, empresacuentabancariaid) => {
  try {
    const empresacuentabancaria = await modelsFT.EmpresaCuentaBancaria.findOne({
      attributes: ["_idempresacuentabancaria"],
      where: {
        empresacuentabancariaid: empresacuentabancariaid,
      },
      transaction,
    });
    //logger.info(line(),empresacuentabancaria);
    return empresacuentabancaria;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertEmpresacuentabancaria = async (transaction, empresacuentabancaria) => {
  try {
    const empresacuentabancaria_nuevo = await modelsFT.EmpresaCuentaBancaria.create(empresacuentabancaria, { transaction });
    // logger.info(line(),empresacuentabancaria_nuevo);
    return empresacuentabancaria_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateEmpresacuentabancaria = async (transaction, empresacuentabancaria) => {
  try {
    const result = await modelsFT.EmpresaCuentaBancaria.update(empresacuentabancaria, {
      where: {
        empresacuentabancariaid: empresacuentabancaria.empresacuentabancariaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteEmpresacuentabancaria = async (transaction, empresacuentabancaria) => {
  try {
    const result = await modelsFT.EmpresaCuentaBancaria.update(empresacuentabancaria, {
      where: {
        empresacuentabancariaid: empresacuentabancaria.empresacuentabancariaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
