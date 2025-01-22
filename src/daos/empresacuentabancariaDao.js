import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getEmpresacuentabancarias = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const empresacuentabancarias = await models.EmpresaCuentaBancaria.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),empresacuentabancarias);
    return empresacuentabancarias;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariaByIdempresacuentabancaria = async (req, idempresacuentabancaria) => {
  try {
    const { models } = req.app.locals;

    const empresacuentabancaria = await models.EmpresaCuentaBancaria.findByPk(idempresacuentabancaria, {});
    logger.info(line(), empresacuentabancaria);

    //const empresacuentabancarias = await empresacuentabancaria.getEmpresacuentabancarias();
    //logger.info(line(),empresacuentabancarias);

    return empresacuentabancaria;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariaByEmpresacuentabancariaid = async (req, empresacuentabancariaid) => {
  try {
    const { models } = req.app.locals;
    const empresacuentabancaria = await models.EmpresaCuentaBancaria.findOne({
      where: {
        empresacuentabancariaid: empresacuentabancariaid,
      },
    });
    //logger.info(line(),empresacuentabancaria);
    return empresacuentabancaria;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findEmpresacuentabancariaPk = async (req, empresacuentabancariaid) => {
  try {
    const { models } = req.app.locals;
    const empresacuentabancaria = await models.EmpresaCuentaBancaria.findOne({
      attributes: ["_idempresacuentabancaria"],
      where: {
        empresacuentabancariaid: empresacuentabancariaid,
      },
    });
    //logger.info(line(),empresacuentabancaria);
    return empresacuentabancaria;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertEmpresacuentabancaria = async (req, empresacuentabancaria) => {
  try {
    const { models } = req.app.locals;
    const empresacuentabancaria_nuevo = await models.EmpresaCuentaBancaria.create(empresacuentabancaria);
    // logger.info(line(),empresacuentabancaria_nuevo);
    return empresacuentabancaria_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateEmpresacuentabancaria = async (req, empresacuentabancaria) => {
  try {
    const { models } = req.app.locals;
    const result = await models.EmpresaCuentaBancaria.update(empresacuentabancaria, {
      where: {
        empresacuentabancariaid: empresacuentabancaria.empresacuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteEmpresacuentabancaria = async (req, empresacuentabancaria) => {
  try {
    const { models } = req.app.locals;
    const result = await models.EmpresaCuentaBancaria.update(empresacuentabancaria, {
      where: {
        empresacuentabancariaid: empresacuentabancaria.empresacuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
