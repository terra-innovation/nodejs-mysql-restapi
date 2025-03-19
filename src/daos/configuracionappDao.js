import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getIGV = async (transaction) => {
  return await getConfiguracionappByIdconfiguracionapp(transaction, 1);
};

export const getCostoCAVALI = async (transaction) => {
  return await getConfiguracionappByIdconfiguracionapp(transaction, 2);
};

export const getComisionBCP = async (transaction) => {
  return await getConfiguracionappByIdconfiguracionapp(transaction, 3);
};

export const getConfiguracionapps = async (transaction, estados) => {
  try {
    const configuracionapps = await modelsFT.ConfiguracionApp.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),configuracionapps);
    return configuracionapps;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getConfiguracionappByIdconfiguracionapp = async (transaction, idconfiguracionapp) => {
  try {
    const configuracionapp = await modelsFT.ConfiguracionApp.findByPk(idconfiguracionapp, { transaction });
    logger.info(line(), configuracionapp);

    //const configuracionapps = await configuracionapp.getConfiguracionapps();
    //logger.info(line(),configuracionapps);

    return configuracionapp;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getConfiguracionappByConfiguracionappid = async (transaction, configuracionappid) => {
  try {
    const configuracionapp = await modelsFT.ConfiguracionApp.findOne({
      where: {
        configuracionappid: configuracionappid,
      },
      transaction,
    });
    //logger.info(line(),configuracionapp);
    return configuracionapp;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findConfiguracionappPk = async (transaction, configuracionappid) => {
  try {
    const configuracionapp = await modelsFT.ConfiguracionApp.findOne({
      attributes: ["_idconfiguracionapp"],
      where: {
        configuracionappid: configuracionappid,
      },
      transaction,
    });
    //logger.info(line(),configuracionapp);
    return configuracionapp;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertConfiguracionapp = async (transaction, configuracionapp) => {
  try {
    const configuracionapp_nuevo = await modelsFT.ConfiguracionApp.create(configuracionapp, { transaction });
    // logger.info(line(),configuracionapp_nuevo);
    return configuracionapp_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateConfiguracionapp = async (transaction, configuracionapp) => {
  try {
    const result = await modelsFT.ConfiguracionApp.update(configuracionapp, {
      where: {
        configuracionappid: configuracionapp.configuracionappid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteConfiguracionapp = async (transaction, configuracionapp) => {
  try {
    const result = await modelsFT.ConfiguracionApp.update(configuracionapp, {
      where: {
        configuracionappid: configuracionapp.configuracionappid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
