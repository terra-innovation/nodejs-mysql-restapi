import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getProvincias = async (transaction, estados) => {
  try {
    const provincias = await modelsFT.Provincia.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return provincias;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getProvinciaByIdprovincia = async (transaction, idprovincia) => {
  try {
    const provincia = await modelsFT.Provincia.findByPk(idprovincia, { transaction });

    return provincia;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return provincia;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return provincia;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertProvincia = async (transaction, provincia) => {
  try {
    const provincia_nuevo = await modelsFT.Provincia.create(provincia, { transaction });

    return provincia_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
