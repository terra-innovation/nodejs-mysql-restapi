import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getFactoringpropuestasByIdfactoring = async (transaction, _idfactoring, estados) => {
  try {
    const facturas = await modelsFT.FactoringPropuesta.findAll({
      include: [
        {
          all: true,
        },
        {
          model: modelsFT.FactoringPropuestaFinanciero,
          required: true,
          as: "factoring_propuesta_financieros",
          include: [
            {
              all: true,
            },
          ],
        },
      ],
      where: {
        _idfactoring: _idfactoring,
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });
    return facturas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestas = async (transaction, estados) => {
  try {
    const factoringpropuestas = await modelsFT.FactoringPropuesta.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factoringpropuestas;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestaByIdfactoringpropuesta = async (transaction, idfactoringpropuesta) => {
  try {
    const factoringpropuesta = await modelsFT.FactoringPropuesta.findByPk(idfactoringpropuesta, { transaction });

    //const factoringpropuestas = await factoringpropuesta.getFactoringpropuestas();

    return factoringpropuesta;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestaByFactoringpropuestaid = async (transaction, factoringpropuestaid) => {
  try {
    const factoringpropuesta = await modelsFT.FactoringPropuesta.findOne({
      include: [
        {
          all: true,
        },
        {
          model: modelsFT.FactoringPropuestaFinanciero,
          required: true,
          as: "factoring_propuesta_financieros",
          include: [
            {
              all: true,
            },
          ],
        },
      ],
      where: {
        factoringpropuestaid: factoringpropuestaid,
      },
      transaction,
    });

    return factoringpropuesta;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringpropuestaPk = async (transaction, factoringpropuestaid) => {
  try {
    const factoringpropuesta = await modelsFT.FactoringPropuesta.findOne({
      attributes: ["_idfactoringpropuesta"],
      where: {
        factoringpropuestaid: factoringpropuestaid,
      },
      transaction,
    });

    return factoringpropuesta;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringpropuesta = async (transaction, factoringpropuesta) => {
  try {
    const factoringpropuesta_nuevo = await modelsFT.FactoringPropuesta.create(factoringpropuesta, { transaction });

    return factoringpropuesta_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringpropuesta = async (transaction, factoringpropuesta) => {
  try {
    const result = await modelsFT.FactoringPropuesta.update(factoringpropuesta, {
      where: {
        factoringpropuestaid: factoringpropuesta.factoringpropuestaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringpropuesta = async (transaction, factoringpropuesta) => {
  try {
    const result = await modelsFT.FactoringPropuesta.update(factoringpropuesta, {
      where: {
        factoringpropuestaid: factoringpropuesta.factoringpropuestaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactoringpropuesta = async (transaction, factoringpropuesta) => {
  try {
    const result = await modelsFT.FactoringPropuesta.update(factoringpropuesta, {
      where: {
        factoringpropuestaid: factoringpropuesta.factoringpropuestaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
