import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getPaises = async (transaction, estados) => {
  try {
    const paises = await modelsFT.Pais.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),paises);
    return paises;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPaisByIdpais = async (transaction, idpais) => {
  try {
    const pais = await modelsFT.Pais.findByPk(idpais, { transaction });
    logger.info(line(), pais);

    //const paises = await pais.getPaises();
    //logger.info(line(),paises);

    return pais;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPaisByPaisid = async (transaction, paisid) => {
  try {
    const pais = await modelsFT.Pais.findOne({
      where: {
        paisid: paisid,
      },
      transaction,
    });
    //logger.info(line(),pais);
    return pais;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPaisPk = async (transaction, paisid) => {
  try {
    const pais = await modelsFT.Pais.findOne({
      attributes: ["_idpais"],
      where: {
        paisid: paisid,
      },
      transaction,
    });
    //logger.info(line(),pais);
    return pais;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPais = async (transaction, pais) => {
  try {
    const pais_nuevo = await modelsFT.Pais.create(pais, { transaction });
    // logger.info(line(),pais_nuevo);
    return pais_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePais = async (transaction, pais) => {
  try {
    const result = await modelsFT.Pais.update(pais, {
      where: {
        paisid: pais.paisid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePais = async (transaction, pais) => {
  try {
    const result = await modelsFT.Pais.update(pais, {
      where: {
        paisid: pais.paisid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
