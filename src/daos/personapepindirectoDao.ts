import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getPersonapepindirectos = async (transaction, estados) => {
  try {
    const personapepindirectos = await modelsFT.PersonaPepIndirecto.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return personapepindirectos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepIndirectoByIdpersonapepindirecto = async (transaction, idpersonapepindirecto) => {
  try {
    const personapepindirecto = await modelsFT.PersonaPepIndirecto.findByPk(idpersonapepindirecto, { transaction });

    //const personapepindirectos = await personapepindirecto.getPersonapepindirectos();

    return personapepindirecto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepIndirectoByPersonaPepIndirectoid = async (transaction, personapepindirectoid) => {
  try {
    const personapepindirecto = await modelsFT.PersonaPepIndirecto.findOne({
      where: {
        personapepindirectoid: personapepindirectoid,
      },
      transaction,
    });

    return personapepindirecto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaPepIndirectoPk = async (transaction, personapepindirectoid) => {
  try {
    const personapepindirecto = await modelsFT.PersonaPepIndirecto.findOne({
      attributes: ["_idpersonapepindirecto"],
      where: {
        personapepindirectoid: personapepindirectoid,
      },
      transaction,
    });

    return personapepindirecto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaPepIndirecto = async (transaction, personapepindirecto) => {
  try {
    const personapepindirecto_nuevo = await modelsFT.PersonaPepIndirecto.create(personapepindirecto, { transaction });

    return personapepindirecto_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaPepIndirecto = async (transaction, personapepindirecto) => {
  try {
    const result = await modelsFT.PersonaPepIndirecto.update(personapepindirecto, {
      where: {
        personapepindirectoid: personapepindirecto.personapepindirectoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaPepIndirecto = async (transaction, personapepindirecto) => {
  try {
    const result = await modelsFT.PersonaPepIndirecto.update(personapepindirecto, {
      where: {
        personapepindirectoid: personapepindirecto.personapepindirectoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
