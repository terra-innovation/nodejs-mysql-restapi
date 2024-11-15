import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getProvincias = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const provincias = await models.Provincia.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),provincias);
    return provincias;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getProvinciaByIdprovincia = async (req, idprovincia) => {
  try {
    const { models } = req.app.locals;

    const provincia = await models.Provincia.findByPk(idprovincia, {});
    //logger.info(line(),provincias);

    return provincia;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getProvinciaByProvinciaid = async (req, provinciaid) => {
  try {
    const { models } = req.app.locals;
    const provincia = await models.Provincia.findOne({
      where: {
        provinciaid: provinciaid,
      },
    });
    //logger.info(line(),provincia);
    return provincia;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findProvinciaPk = async (req, provinciaid) => {
  try {
    const { models } = req.app.locals;
    const provincia = await models.Provincia.findOne({
      attributes: ["_idprovincia"],
      where: {
        provinciaid: provinciaid,
      },
    });
    //logger.info(line(),provincia);
    return provincia;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertProvincia = async (req, provincia) => {
  try {
    const { models } = req.app.locals;
    const provincia_nuevo = await models.Provincia.create(provincia);
    // logger.info(line(),provincia_nuevo);
    return provincia_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateProvincia = async (req, provincia) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Provincia.update(provincia, {
      where: {
        provinciaid: provincia.provinciaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteProvincia = async (req, provincia) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Provincia.update(provincia, {
      where: {
        provinciaid: provincia.provinciaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
