import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

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
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return configuracionapps;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getConfiguracionappByIdconfiguracionapp = async (transaction, idconfiguracionapp) => {
  try {
    const configuracionapp = await modelsFT.ConfiguracionApp.findByPk(idconfiguracionapp, { transaction });

    //const configuracionapps = await configuracionapp.getConfiguracionapps();

    return configuracionapp;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return configuracionapp;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return configuracionapp;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertConfiguracionapp = async (transaction, configuracionapp) => {
  try {
    const configuracionapp_nuevo = await modelsFT.ConfiguracionApp.create(configuracionapp, { transaction });

    return configuracionapp_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
