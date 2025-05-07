import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getFactoringpropuestaestados = async (transaction, estados) => {
  try {
    const factoringpropuestaestados = await modelsFT.FactoringPropuestaEstado.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factoringpropuestaestados;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestaestadoByIdfactoringpropuestaestado = async (transaction, idfactoringpropuestaestado) => {
  try {
    const factoringpropuestaestado = await modelsFT.FactoringPropuestaEstado.findByPk(idfactoringpropuestaestado, { transaction });

    //const factoringpropuestaestados = await factoringpropuestaestado.getFactoringpropuestaestados();

    return factoringpropuestaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestaestadoByFactoringpropuestaestadoid = async (transaction, factoringpropuestaestadoid) => {
  try {
    const factoringpropuestaestado = await modelsFT.FactoringPropuestaEstado.findOne({
      where: {
        factoringpropuestaestadoid: factoringpropuestaestadoid,
      },
      transaction,
    });

    return factoringpropuestaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringpropuestaestadoPk = async (transaction, factoringpropuestaestadoid) => {
  try {
    const factoringpropuestaestado = await modelsFT.FactoringPropuestaEstado.findOne({
      attributes: ["_idfactoringpropuestaestado"],
      where: {
        factoringpropuestaestadoid: factoringpropuestaestadoid,
      },
      transaction,
    });

    return factoringpropuestaestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringpropuestaestado = async (transaction, factoringpropuestaestado) => {
  try {
    const factoringpropuestaestado_nuevo = await modelsFT.FactoringPropuestaEstado.create(factoringpropuestaestado, { transaction });

    return factoringpropuestaestado_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringpropuestaestado = async (transaction, factoringpropuestaestado) => {
  try {
    const result = await modelsFT.FactoringPropuestaEstado.update(factoringpropuestaestado, {
      where: {
        factoringpropuestaestadoid: factoringpropuestaestado.factoringpropuestaestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringpropuestaestado = async (transaction, factoringpropuestaestado) => {
  try {
    const result = await modelsFT.FactoringPropuestaEstado.update(factoringpropuestaestado, {
      where: {
        factoringpropuestaestadoid: factoringpropuestaestado.factoringpropuestaestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
