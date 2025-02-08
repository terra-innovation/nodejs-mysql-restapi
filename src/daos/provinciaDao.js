import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getProvincias = async (transaction, estados) => {
  try {
    const provincias = await modelsFT.Provincia.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),provincias);
    return provincias;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getProvinciaByIdprovincia = async (transaction, idprovincia) => {
  try {
    const provincia = await modelsFT.Provincia.findByPk(idprovincia, { transaction });
    //logger.info(line(),provincias);

    return provincia;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getProvinciaByProvinciaid = async (transaction, provinciaid) => {
  try {
    const provincia = await modelsFT.Provincia.findOne({
      where: {
        provinciaid: provinciaid,
      },
      transaction,
    });
    //logger.info(line(),provincia);
    return provincia;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findProvinciaPk = async (transaction, provinciaid) => {
  try {
    const provincia = await modelsFT.Provincia.findOne({
      attributes: ["_idprovincia"],
      where: {
        provinciaid: provinciaid,
      },
      transaction,
    });
    //logger.info(line(),provincia);
    return provincia;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertProvincia = async (transaction, provincia) => {
  try {
    const provincia_nuevo = await modelsFT.Provincia.create(provincia, { transaction });
    // logger.info(line(),provincia_nuevo);
    return provincia_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateProvincia = async (transaction, provincia) => {
  try {
    const result = await modelsFT.Provincia.update(provincia, {
      where: {
        provinciaid: provincia.provinciaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteProvincia = async (transaction, provincia) => {
  try {
    const result = await modelsFT.Provincia.update(provincia, {
      where: {
        provinciaid: provincia.provinciaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
