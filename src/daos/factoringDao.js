import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getFactoringByFactoringidAndIdcontactocedente = async (transaction, factoringid, idcontactocedete, estados) => {
  try {
    const factoring = await modelsFT.Factoring.findOne({
      include: [
        {
          all: true,
        },
      ],
      where: {
        _idcontactocedente: idcontactocedete,
        factoringid: factoringid,
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.debug(line(),"factoring: ", factoring);
    return factoring;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsCotizacionesByIdcontactocedente = async (transaction, idcontactocedete, estados) => {
  try {
    const factorings = await modelsFT.Factoring.findAll({
      include: [
        {
          all: true,
        },
      ],
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
        _idcontactocedente: idcontactocedete,
      },
      transaction,
    });
    //logger.info(line(),factorings);
    return factorings;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsActivas = async (transaction) => {
  try {
    const factorings = await modelsFT.Factoring.findAll({
      include: [
        {
          all: true,
        },
      ],
      where: {
        estado: 1,
      },
      transaction,
    });
    //logger.info(line(),factorings);
    return factorings;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByIdfactoring = async (transaction, idfactoring) => {
  try {
    const factoring = await modelsFT.Factoring.findByPk(idfactoring, { transaction });
    logger.info(line(), factoring);

    //const factorings = await factoring.getFactorings();
    //logger.info(line(),factorings);

    return factoring;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByFactoringid = async (transaction, factoringid) => {
  try {
    const factoring = await modelsFT.Factoring.findOne({
      include: [
        {
          all: true,
        },
      ],
      where: {
        factoringid: factoringid,
      },
      transaction,
    });
    //logger.debug(line(),"factoring: ", factoring);
    return factoring;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringPk = async (transaction, factoringid) => {
  try {
    const factoring = await modelsFT.Factoring.findOne({
      attributes: ["_idfactoring"],
      where: {
        factoringid: factoringid,
      },
      transaction,
    });
    //logger.info(line(),factoring);
    return factoring;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoring = async (transaction, factoring) => {
  try {
    const factoring_nuevo = await modelsFT.Factoring.create(factoring, { transaction });
    // logger.info(line(),factoring_nuevo);
    return factoring_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoring = async (transaction, factoring) => {
  try {
    const result = await modelsFT.Factoring.update(factoring, {
      where: {
        factoringid: factoring.factoringid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoring = async (transaction, factoring) => {
  try {
    const result = await modelsFT.Factoring.update(factoring, {
      where: {
        factoringid: factoring.factoringid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
