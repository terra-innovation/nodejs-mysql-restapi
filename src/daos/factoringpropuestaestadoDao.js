import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getFactoringpropuestaestados = async (transaction, estados) => {
  try {
    const factoringpropuestaestados = await modelsFT.FactoringPropuestaEstado.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),factoringpropuestaestados);
    return factoringpropuestaestados;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestaestadoByIdfactoringpropuestaestado = async (transaction, idfactoringpropuestaestado) => {
  try {
    const factoringpropuestaestado = await modelsFT.FactoringPropuestaEstado.findByPk(idfactoringpropuestaestado, { transaction });
    logger.info(line(), factoringpropuestaestado);

    //const factoringpropuestaestados = await factoringpropuestaestado.getFactoringpropuestaestados();
    //logger.info(line(),factoringpropuestaestados);

    return factoringpropuestaestado;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    //logger.info(line(),factoringpropuestaestado);
    return factoringpropuestaestado;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    //logger.info(line(),factoringpropuestaestado);
    return factoringpropuestaestado;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringpropuestaestado = async (transaction, factoringpropuestaestado) => {
  try {
    const factoringpropuestaestado_nuevo = await modelsFT.FactoringPropuestaEstado.create(factoringpropuestaestado, { transaction });
    // logger.info(line(),factoringpropuestaestado_nuevo);
    return factoringpropuestaestado_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    logger.error(line(), formatError(error));
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
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
