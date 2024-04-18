import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

export const getRiesgos = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const riesgos = await models.Riesgo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //console.log(riesgos);
    return riesgos;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getRiesgoByIdriesgo = async (req, idriesgo) => {
  try {
    const { models } = req.app.locals;

    const riesgo = await models.Riesgo.findByPk(idriesgo, {});
    console.log(riesgo);

    //const riesgos = await riesgo.getRiesgos();
    //console.log(riesgos);

    return riesgo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getRiesgoByRiesgoid = async (req, riesgoid) => {
  try {
    const { models } = req.app.locals;
    const riesgo = await models.Riesgo.findOne({
      where: {
        riesgoid: riesgoid,
      },
    });
    //console.log(riesgo);
    return riesgo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findRiesgoPk = async (req, riesgoid) => {
  try {
    const { models } = req.app.locals;
    const riesgo = await models.Riesgo.findOne({
      attributes: ["_idriesgo"],
      where: {
        riesgoid: riesgoid,
      },
    });
    //console.log(riesgo);
    return riesgo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertRiesgo = async (req, riesgo) => {
  try {
    const { models } = req.app.locals;
    const riesgo_nuevo = await models.Riesgo.create(riesgo);
    // console.log(riesgo_nuevo);
    return riesgo_nuevo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateRiesgo = async (req, riesgo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Riesgo.update(riesgo, {
      where: {
        riesgoid: riesgo.riesgoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteRiesgo = async (req, riesgo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Riesgo.update(riesgo, {
      where: {
        riesgoid: riesgo.riesgoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
