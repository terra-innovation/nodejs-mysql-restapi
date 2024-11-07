import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

export const getPersonapepindirectos = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const personapepindirectos = await models.PersonaPepIndirecto.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //console.log(personapepindirectos);
    return personapepindirectos;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepIndirectoByIdpersonapepindirecto = async (req, idpersonapepindirecto) => {
  try {
    const { models } = req.app.locals;

    const personapepindirecto = await models.PersonaPepIndirecto.findByPk(idpersonapepindirecto, {});
    console.log(personapepindirecto);

    //const personapepindirectos = await personapepindirecto.getPersonapepindirectos();
    //console.log(personapepindirectos);

    return personapepindirecto;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepIndirectoByPersonaPepIndirectoid = async (req, personapepindirectoid) => {
  try {
    const { models } = req.app.locals;
    const personapepindirecto = await models.PersonaPepIndirecto.findOne({
      where: {
        personapepindirectoid: personapepindirectoid,
      },
    });
    //console.log(personapepindirecto);
    return personapepindirecto;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaPepIndirectoPk = async (req, personapepindirectoid) => {
  try {
    const { models } = req.app.locals;
    const personapepindirecto = await models.PersonaPepIndirecto.findOne({
      attributes: ["_idpersonapepindirecto"],
      where: {
        personapepindirectoid: personapepindirectoid,
      },
    });
    //console.log(personapepindirecto);
    return personapepindirecto;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaPepIndirecto = async (req, personapepindirecto) => {
  try {
    const { models } = req.app.locals;
    const personapepindirecto_nuevo = await models.PersonaPepIndirecto.create(personapepindirecto);
    // console.log(personapepindirecto_nuevo);
    return personapepindirecto_nuevo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaPepIndirecto = async (req, personapepindirecto) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PersonaPepIndirecto.update(personapepindirecto, {
      where: {
        personapepindirectoid: personapepindirecto.personapepindirectoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaPepIndirecto = async (req, personapepindirecto) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PersonaPepIndirecto.update(personapepindirecto, {
      where: {
        personapepindirectoid: personapepindirecto.personapepindirectoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
