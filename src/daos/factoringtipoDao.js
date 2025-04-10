import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getFactoringtipos = async (transaction, estados) => {
  try {
    const factoringtipos = await modelsFT.FactoringTipo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),factoringtipos);
    return factoringtipos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtipoByIdfactoringtipo = async (transaction, idfactoringtipo) => {
  try {
    const factoringtipo = await modelsFT.FactoringTipo.findByPk(idfactoringtipo, { transaction });
    logger.info(line(), factoringtipo);

    //const factoringtipos = await factoringtipo.getFactoringtipos();
    //logger.info(line(),factoringtipos);

    return factoringtipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtipoByFactoringtipoid = async (transaction, factoringtipoid) => {
  try {
    const factoringtipo = await modelsFT.FactoringTipo.findOne({
      where: {
        factoringtipoid: factoringtipoid,
      },
      transaction,
    });
    //logger.info(line(),factoringtipo);
    return factoringtipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringtipoPk = async (transaction, factoringtipoid) => {
  try {
    const factoringtipo = await modelsFT.FactoringTipo.findOne({
      attributes: ["_idfactoringtipo"],
      where: {
        factoringtipoid: factoringtipoid,
      },
      transaction,
    });
    //logger.info(line(),factoringtipo);
    return factoringtipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringtipo = async (transaction, factoringtipo) => {
  try {
    const factoringtipo_nuevo = await modelsFT.FactoringTipo.create(factoringtipo, { transaction });
    // logger.info(line(),factoringtipo_nuevo);
    return factoringtipo_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringtipo = async (transaction, factoringtipo) => {
  try {
    const result = await modelsFT.FactoringTipo.update(factoringtipo, {
      where: {
        factoringtipoid: factoringtipo.factoringtipoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringtipo = async (transaction, factoringtipo) => {
  try {
    const result = await modelsFT.FactoringTipo.update(factoringtipo, {
      where: {
        factoringtipoid: factoringtipo.factoringtipoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
