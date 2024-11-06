import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

export const getPersonapepdirectos = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const personapepdirectos = await models.PersonaPepDirecto.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //console.log(personapepdirectos);
    return personapepdirectos;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepDirectoByIdpersonapepdirecto = async (req, idpersonapepdirecto) => {
  try {
    const { models } = req.app.locals;

    const personapepdirecto = await models.PersonaPepDirecto.findByPk(idpersonapepdirecto, {});
    console.log(personapepdirecto);

    //const personapepdirectos = await personapepdirecto.getPersonapepdirectos();
    //console.log(personapepdirectos);

    return personapepdirecto;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepDirectoByPersonaPepDirectoid = async (req, personapepdirectoid) => {
  try {
    const { models } = req.app.locals;
    const personapepdirecto = await models.PersonaPepDirecto.findOne({
      where: {
        personapepdirectoid: personapepdirectoid,
      },
    });
    //console.log(personapepdirecto);
    return personapepdirecto;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaPepDirectoPk = async (req, personapepdirectoid) => {
  try {
    const { models } = req.app.locals;
    const personapepdirecto = await models.PersonaPepDirecto.findOne({
      attributes: ["_idpersonapepdirecto"],
      where: {
        personapepdirectoid: personapepdirectoid,
      },
    });
    //console.log(personapepdirecto);
    return personapepdirecto;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaPepDirecto = async (req, personapepdirecto) => {
  try {
    const { models } = req.app.locals;
    const personapepdirecto_nuevo = await models.PersonaPepDirecto.create(personapepdirecto);
    // console.log(personapepdirecto_nuevo);
    return personapepdirecto_nuevo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaPepDirecto = async (req, personapepdirecto) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PersonaPepDirecto.update(personapepdirecto, {
      where: {
        personapepdirectoid: personapepdirecto.personapepdirectoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaPepDirecto = async (req, personapepdirecto) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PersonaPepDirecto.update(personapepdirecto, {
      where: {
        personapepdirectoid: personapepdirecto.personapepdirectoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
