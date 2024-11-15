import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getFactoringByFactoringidAndIdcontactocedente = async (req, factoringid, idcontactocedete, estados) => {
  try {
    const { models } = req.app.locals;
    const factoring = await models.Factoring.findOne({
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
    });
    //logger.debug(line(),"factoring: ", factoring);
    return factoring;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsCotizacionesByIdcontactocedente = async (req, idcontactocedete, estados) => {
  try {
    const { models } = req.app.locals;
    const factorings = await models.Factoring.findAll({
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
    });
    //logger.info(line(),factorings);
    return factorings;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsActivas = async (req) => {
  try {
    const { models } = req.app.locals;
    const factorings = await models.Factoring.findAll({
      include: [
        {
          all: true,
        },
      ],
      where: {
        estado: 1,
      },
    });
    //logger.info(line(),factorings);
    return factorings;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByIdfactoring = async (req, idfactoring) => {
  try {
    const { models } = req.app.locals;

    const factoring = await models.Factoring.findByPk(idfactoring, {});
    logger.info(line(), factoring);

    //const factorings = await factoring.getFactorings();
    //logger.info(line(),factorings);

    return factoring;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByFactoringid = async (req, factoringid) => {
  try {
    const { models } = req.app.locals;
    const factoring = await models.Factoring.findOne({
      include: [
        {
          all: true,
        },
      ],
      where: {
        factoringid: factoringid,
      },
    });
    //logger.debug(line(),"factoring: ", factoring);
    return factoring;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringPk = async (req, factoringid) => {
  try {
    const { models } = req.app.locals;
    const factoring = await models.Factoring.findOne({
      attributes: ["_idfactoring"],
      where: {
        factoringid: factoringid,
      },
    });
    //logger.info(line(),factoring);
    return factoring;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoring = async (req, factoring) => {
  try {
    const { models } = req.app.locals;
    const factoring_nuevo = await models.Factoring.create(factoring);
    // logger.info(line(),factoring_nuevo);
    return factoring_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoring = async (req, factoring) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Factoring.update(factoring, {
      where: {
        factoringid: factoring.factoringid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoring = async (req, factoring) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Factoring.update(factoring, {
      where: {
        factoringid: factoring.factoringid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
