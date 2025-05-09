import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getPaises = async (transaction, estados) => {
  try {
    const paises = await modelsFT.Pais.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return paises;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPaisByIdpais = async (transaction, idpais) => {
  try {
    const pais = await modelsFT.Pais.findByPk(idpais, { transaction });

    //const paises = await pais.getPaises();

    return pais;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return pais;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return pais;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPais = async (transaction, pais) => {
  try {
    const pais_nuevo = await modelsFT.Pais.create(pais, { transaction });

    return pais_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
