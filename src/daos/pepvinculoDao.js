import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

export const getPepvinculos = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const pepvinculos = await models.PepVinculo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //console.log(pepvinculos);
    return pepvinculos;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPepvinculoByIdpepvinculo = async (req, idpepvinculo) => {
  try {
    const { models } = req.app.locals;

    const pepvinculo = await models.PepVinculo.findByPk(idpepvinculo, {});
    console.log(pepvinculo);

    //const pepvinculos = await pepvinculo.getPepvinculos();
    //console.log(pepvinculos);

    return pepvinculo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPepvinculoByPepvinculoid = async (req, pepvinculoid) => {
  try {
    const { models } = req.app.locals;
    const pepvinculo = await models.PepVinculo.findOne({
      where: {
        pepvinculoid: pepvinculoid,
      },
    });
    //console.log(pepvinculo);
    return pepvinculo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPepvinculoPk = async (req, pepvinculoid) => {
  try {
    const { models } = req.app.locals;
    const pepvinculo = await models.PepVinculo.findOne({
      attributes: ["_idpepvinculo"],
      where: {
        pepvinculoid: pepvinculoid,
      },
    });
    //console.log(pepvinculo);
    return pepvinculo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPepvinculo = async (req, pepvinculo) => {
  try {
    const { models } = req.app.locals;
    const pepvinculo_nuevo = await models.PepVinculo.create(pepvinculo);
    // console.log(pepvinculo_nuevo);
    return pepvinculo_nuevo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePepvinculo = async (req, pepvinculo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PepVinculo.update(pepvinculo, {
      where: {
        pepvinculoid: pepvinculo.pepvinculoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePepvinculo = async (req, pepvinculo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PepVinculo.update(pepvinculo, {
      where: {
        pepvinculoid: pepvinculo.pepvinculoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
