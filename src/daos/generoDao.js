import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

export const getGeneros = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const generos = await models.Genero.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //console.log(generos);
    return generos;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getGeneroByIdgenero = async (req, idgenero) => {
  try {
    const { models } = req.app.locals;

    const genero = await models.Genero.findByPk(idgenero, {});
    console.log(genero);

    //const generos = await genero.getGeneros();
    //console.log(generos);

    return genero;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getGeneroByGeneroid = async (req, generoid) => {
  try {
    const { models } = req.app.locals;
    const genero = await models.Genero.findOne({
      where: {
        generoid: generoid,
      },
    });
    //console.log(genero);
    return genero;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findGeneroPk = async (req, generoid) => {
  try {
    const { models } = req.app.locals;
    const genero = await models.Genero.findOne({
      attributes: ["_idgenero"],
      where: {
        generoid: generoid,
      },
    });
    //console.log(genero);
    return genero;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertGenero = async (req, genero) => {
  try {
    const { models } = req.app.locals;
    const genero_nuevo = await models.Genero.create(genero);
    // console.log(genero_nuevo);
    return genero_nuevo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateGenero = async (req, genero) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Genero.update(genero, {
      where: {
        generoid: genero.generoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteGenero = async (req, genero) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Genero.update(genero, {
      where: {
        generoid: genero.generoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
