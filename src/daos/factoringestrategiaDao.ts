import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getFactoringestrategias = async (transaction, estados) => {
  try {
    const factoringestrategias = await modelsFT.FactoringEstrategia.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factoringestrategias;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringestrategiaByIdfactoringestrategia = async (transaction, idfactoringestrategia) => {
  try {
    const factoringestrategia = await modelsFT.FactoringEstrategia.findByPk(idfactoringestrategia, { transaction });

    //const factoringestrategias = await factoringestrategia.getFactoringestrategias();

    return factoringestrategia;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringestrategiaByFactoringestrategiaid = async (transaction, factoringestrategiaid) => {
  try {
    const factoringestrategia = await modelsFT.FactoringEstrategia.findOne({
      where: {
        factoringestrategiaid: factoringestrategiaid,
      },
      transaction,
    });

    return factoringestrategia;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringestrategiaPk = async (transaction, factoringestrategiaid) => {
  try {
    const factoringestrategia = await modelsFT.FactoringEstrategia.findOne({
      attributes: ["_idfactoringestrategia"],
      where: {
        factoringestrategiaid: factoringestrategiaid,
      },
      transaction,
    });

    return factoringestrategia;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringestrategia = async (transaction, factoringestrategia) => {
  try {
    const factoringestrategia_nuevo = await modelsFT.FactoringEstrategia.create(factoringestrategia, { transaction });

    return factoringestrategia_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringestrategia = async (transaction, factoringestrategia) => {
  try {
    const result = await modelsFT.FactoringEstrategia.update(factoringestrategia, {
      where: {
        factoringestrategiaid: factoringestrategia.factoringestrategiaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringestrategia = async (transaction, factoringestrategia) => {
  try {
    const result = await modelsFT.FactoringEstrategia.update(factoringestrategia, {
      where: {
        factoringestrategiaid: factoringestrategia.factoringestrategiaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
