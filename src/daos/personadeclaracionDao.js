import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

export const getPersonadeclaracions = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const personadeclaracions = await models.PersonaDeclaracion.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //console.log(personadeclaracions);
    return personadeclaracions;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonadeclaracionByIdpersonadeclaracion = async (req, idpersonadeclaracion) => {
  try {
    const { models } = req.app.locals;

    const personadeclaracion = await models.PersonaDeclaracion.findByPk(idpersonadeclaracion, {});
    console.log(personadeclaracion);

    //const personadeclaracions = await personadeclaracion.getPersonadeclaracions();
    //console.log(personadeclaracions);

    return personadeclaracion;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonadeclaracionByPersonadeclaracionid = async (req, personadeclaracionid) => {
  try {
    const { models } = req.app.locals;
    const personadeclaracion = await models.PersonaDeclaracion.findOne({
      where: {
        personadeclaracionid: personadeclaracionid,
      },
    });
    //console.log(personadeclaracion);
    return personadeclaracion;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonadeclaracionPk = async (req, personadeclaracionid) => {
  try {
    const { models } = req.app.locals;
    const personadeclaracion = await models.PersonaDeclaracion.findOne({
      attributes: ["_idpersonadeclaracion"],
      where: {
        personadeclaracionid: personadeclaracionid,
      },
    });
    //console.log(personadeclaracion);
    return personadeclaracion;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonadeclaracion = async (req, personadeclaracion) => {
  try {
    const { models } = req.app.locals;
    const personadeclaracion_nuevo = await models.PersonaDeclaracion.create(personadeclaracion);
    // console.log(personadeclaracion_nuevo);
    return personadeclaracion_nuevo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonadeclaracion = async (req, personadeclaracion) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PersonaDeclaracion.update(personadeclaracion, {
      where: {
        personadeclaracionid: personadeclaracion.personadeclaracionid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonadeclaracion = async (req, personadeclaracion) => {
  try {
    const { models } = req.app.locals;
    const result = await models.PersonaDeclaracion.update(personadeclaracion, {
      where: {
        personadeclaracionid: personadeclaracion.personadeclaracionid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
