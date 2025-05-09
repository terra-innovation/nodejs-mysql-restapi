import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getInversionistaByIdusuario = async (transaction, _idusuario, estados) => {
  try {
    const inversionista = await modelsFT.Inversionista.findOne({
      include: [
        {
          model: modelsFT.Persona,
          as: "persona_persona",
          where: {
            _idusuario,
          },
        },
      ],
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return inversionista;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

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
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return inversionistas;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistaByIdinversionista = async (transaction, idinversionista) => {
  try {
    const inversionista = await modelsFT.Inversionista.findByPk(idinversionista, { transaction });

    return inversionista;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return inversionista;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return inversionista;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertInversionista = async (transaction, inversionista) => {
  try {
    const inversionista_nuevo = await modelsFT.Inversionista.create(inversionista, { transaction });

    return inversionista_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
