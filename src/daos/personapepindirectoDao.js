import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

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
    //logger.info(line(),personapepindirectos);
    return personapepindirectos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepIndirectoByIdpersonapepindirecto = async (req, idpersonapepindirecto) => {
  try {
    const { models } = req.app.locals;

    const personapepindirecto = await models.PersonaPepIndirecto.findByPk(idpersonapepindirecto, {});
    logger.info(line(), personapepindirecto);

    //const personapepindirectos = await personapepindirecto.getPersonapepindirectos();
    //logger.info(line(),personapepindirectos);

    return personapepindirecto;
  } catch (error) {
    logger.error(line(), error);
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
    //logger.info(line(),personapepindirecto);
    return personapepindirecto;
  } catch (error) {
    logger.error(line(), error);
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
    //logger.info(line(),personapepindirecto);
    return personapepindirecto;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaPepIndirecto = async (req, personapepindirecto) => {
  try {
    const { models } = req.app.locals;
    const personapepindirecto_nuevo = await models.PersonaPepIndirecto.create(personapepindirecto);
    // logger.info(line(),personapepindirecto_nuevo);
    return personapepindirecto_nuevo;
  } catch (error) {
    logger.error(line(), error);
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
    logger.error(line(), error);
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
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
