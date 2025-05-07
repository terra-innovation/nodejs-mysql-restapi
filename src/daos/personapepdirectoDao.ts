import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getPersonapepdirectos = async (transaction, estados) => {
  try {
    const personapepdirectos = await modelsFT.PersonaPepDirecto.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return personapepdirectos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepDirectoByIdpersonapepdirecto = async (transaction, idpersonapepdirecto) => {
  try {
    const personapepdirecto = await modelsFT.PersonaPepDirecto.findByPk(idpersonapepdirecto, { transaction });

    //const personapepdirectos = await personapepdirecto.getPersonapepdirectos();

    return personapepdirecto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepDirectoByPersonaPepDirectoid = async (transaction, personapepdirectoid) => {
  try {
    const personapepdirecto = await modelsFT.PersonaPepDirecto.findOne({
      where: {
        personapepdirectoid: personapepdirectoid,
      },
      transaction,
    });

    return personapepdirecto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaPepDirectoPk = async (transaction, personapepdirectoid) => {
  try {
    const personapepdirecto = await modelsFT.PersonaPepDirecto.findOne({
      attributes: ["_idpersonapepdirecto"],
      where: {
        personapepdirectoid: personapepdirectoid,
      },
      transaction,
    });

    return personapepdirecto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaPepDirecto = async (transaction, personapepdirecto) => {
  try {
    const personapepdirecto_nuevo = await modelsFT.PersonaPepDirecto.create(personapepdirecto, { transaction });

    return personapepdirecto_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaPepDirecto = async (transaction, personapepdirecto) => {
  try {
    const result = await modelsFT.PersonaPepDirecto.update(personapepdirecto, {
      where: {
        personapepdirectoid: personapepdirecto.personapepdirectoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaPepDirecto = async (transaction, personapepdirecto) => {
  try {
    const result = await modelsFT.PersonaPepDirecto.update(personapepdirecto, {
      where: {
        personapepdirectoid: personapepdirecto.personapepdirectoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
