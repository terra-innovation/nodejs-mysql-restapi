import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

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
    //console.log(factorings);
    return factorings;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByIdfactoring = async (req, idfactoring) => {
  try {
    const { models } = req.app.locals;

    const factoring = await models.Factoring.findByPk(idfactoring, {});
    console.log(factoring);

    //const factorings = await factoring.getFactorings();
    //console.log(factorings);

    return factoring;
  } catch (error) {
    console.error(error);
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
    //console.debug("factoring: ", factoring);
    return factoring;
  } catch (error) {
    console.error(error);
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
    //console.log(factoring);
    return factoring;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoring = async (req, factoring) => {
  try {
    const { models } = req.app.locals;
    const factoring_nuevo = await models.Factoring.create(factoring);
    // console.log(factoring_nuevo);
    return factoring_nuevo;
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
