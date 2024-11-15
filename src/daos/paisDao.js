import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getPaises = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const paises = await models.Pais.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),paises);
    return paises;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPaisByIdpais = async (req, idpais) => {
  try {
    const { models } = req.app.locals;

    const pais = await models.Pais.findByPk(idpais, {});
    logger.info(line(), pais);

    //const paises = await pais.getPaises();
    //logger.info(line(),paises);

    return pais;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPaisByPaisid = async (req, paisid) => {
  try {
    const { models } = req.app.locals;
    const pais = await models.Pais.findOne({
      where: {
        paisid: paisid,
      },
    });
    //logger.info(line(),pais);
    return pais;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPaisPk = async (req, paisid) => {
  try {
    const { models } = req.app.locals;
    const pais = await models.Pais.findOne({
      attributes: ["_idpais"],
      where: {
        paisid: paisid,
      },
    });
    //logger.info(line(),pais);
    return pais;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPais = async (req, pais) => {
  try {
    const { models } = req.app.locals;
    const pais_nuevo = await models.Pais.create(pais);
    // logger.info(line(),pais_nuevo);
    return pais_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePais = async (req, pais) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Pais.update(pais, {
      where: {
        paisid: pais.paisid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePais = async (req, pais) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Pais.update(pais, {
      where: {
        paisid: pais.paisid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
