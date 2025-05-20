import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFactoringtipos = async (transaction, estados) => {
  try {
    const factoringtipos = await modelsFT.FactoringTipo.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factoringtipos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtipoByIdfactoringtipo = async (transaction, idfactoringtipo) => {
  try {
    const factoringtipo = await modelsFT.FactoringTipo.findByPk(idfactoringtipo, { transaction });

    //const factoringtipos = await factoringtipo.getFactoringtipos();

    return factoringtipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return factoringtipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return factoringtipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringtipo = async (transaction, factoringtipo) => {
  try {
    const factoringtipo_nuevo = await modelsFT.FactoringTipo.create(factoringtipo, { transaction });

    return factoringtipo_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
