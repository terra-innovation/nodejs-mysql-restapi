import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getInversionistas = async (transaction, estados) => {
  try {
    const inversionistas = await modelsFT.Inversionista.findAll({
      include: [
        {
          model: modelsFT.Persona,
          as: "persona_persona",
        },
      ],
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),inversionistas);
    return inversionistas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistaByIdinversionista = async (transaction, idinversionista) => {
  try {
    const inversionista = await modelsFT.Inversionista.findByPk(idinversionista, { transaction });
    logger.info(line(), inversionista);

    //const inversionistas = await inversionista.getInversionistas();
    //logger.info(line(),inversionistas);

    return inversionista;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistaByInversionistaid = async (transaction, inversionistaid) => {
  try {
    const inversionista = await modelsFT.Inversionista.findOne({
      where: {
        inversionistaid: inversionistaid,
      },
      transaction,
    });
    //logger.info(line(),inversionista);
    return inversionista;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findInversionistaPk = async (transaction, inversionistaid) => {
  try {
    const inversionista = await modelsFT.Inversionista.findOne({
      attributes: ["_idinversionista"],
      where: {
        inversionistaid: inversionistaid,
      },
      transaction,
    });
    //logger.info(line(),inversionista);
    return inversionista;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertInversionista = async (transaction, inversionista) => {
  try {
    const inversionista_nuevo = await modelsFT.Inversionista.create(inversionista, { transaction });
    // logger.info(line(),inversionista_nuevo);
    return inversionista_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateInversionista = async (transaction, inversionista) => {
  try {
    const result = await modelsFT.Inversionista.update(inversionista, {
      where: {
        inversionistaid: inversionista.inversionistaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteInversionista = async (transaction, inversionista) => {
  try {
    const result = await modelsFT.Inversionista.update(inversionista, {
      where: {
        inversionistaid: inversionista.inversionistaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateInversionista = async (transaction, inversionista) => {
  try {
    const result = await modelsFT.Inversionista.update(inversionista, {
      where: {
        inversionistaid: inversionista.inversionistaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
