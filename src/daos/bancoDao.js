import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getBancos = async (transaction, estados) => {
  try {
    const bancos = await modelsFT.Banco.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),bancos);
    return bancos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getBancoByIdbanco = async (transaction, idbanco) => {
  try {
    const banco = await modelsFT.Banco.findByPk(idbanco, { transaction });
    logger.info(line(), banco);

    //const bancos = await banco.getBancos();
    //logger.info(line(),bancos);

    return banco;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getBancoByBancoid = async (transaction, bancoid) => {
  try {
    const banco = await modelsFT.Banco.findOne({
      where: {
        bancoid: bancoid,
      },
      transaction,
    });
    //logger.info(line(),banco);
    return banco;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findBancoPk = async (transaction, bancoid) => {
  try {
    const banco = await modelsFT.Banco.findOne({
      attributes: ["_idbanco"],
      where: {
        bancoid: bancoid,
      },
      transaction,
    });
    //logger.info(line(),banco);
    return banco;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertBanco = async (transaction, banco) => {
  try {
    const banco_nuevo = await modelsFT.Banco.create(banco, { transaction });
    // logger.info(line(),banco_nuevo);
    return banco_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateBanco = async (transaction, banco) => {
  try {
    const result = await modelsFT.Banco.update(banco, {
      where: {
        bancoid: banco.bancoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteBanco = async (transaction, banco) => {
  try {
    const result = await modelsFT.Banco.update(banco, {
      where: {
        bancoid: banco.bancoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
