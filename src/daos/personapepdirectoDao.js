import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

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
    //logger.info(line(),personapepdirectos);
    return personapepdirectos;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepDirectoByIdpersonapepdirecto = async (req, idpersonapepdirecto) => {
  try {
    const { models } = req.app.locals;

    const personapepdirecto = await models.PersonaPepDirecto.findByPk(idpersonapepdirecto, {});
    logger.info(line(), personapepdirecto);

    //const personapepdirectos = await personapepdirecto.getPersonapepdirectos();
    //logger.info(line(),personapepdirectos);

    return personapepdirecto;
  } catch (error) {
    logger.error(line(), error);
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
    //logger.info(line(),personapepdirecto);
    return personapepdirecto;
  } catch (error) {
    logger.error(line(), error);
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
    //logger.info(line(),personapepdirecto);
    return personapepdirecto;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaPepDirecto = async (req, personapepdirecto) => {
  try {
    const { models } = req.app.locals;
    const personapepdirecto_nuevo = await models.PersonaPepDirecto.create(personapepdirecto);
    // logger.info(line(),personapepdirecto_nuevo);
    return personapepdirecto_nuevo;
  } catch (error) {
    logger.error(line(), error);
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
    logger.error(line(), error);
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
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
