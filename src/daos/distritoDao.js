import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getDistritos = async (transaction, estados) => {
  try {
    const distritos = await modelsFT.Distrito.findAll({
      include: [
        {
          model: modelsFT.Provincia,
          required: true,
          as: "provincia_provincium",
          include: [
            {
              model: modelsFT.Departamento,
              required: true,
              as: "departamento_departamento",
            },
          ],
        },
      ],
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),distritos);
    return distritos;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDistritoByIddistrito = async (transaction, iddistrito) => {
  try {
    const distrito = await modelsFT.Distrito.findByPk(iddistrito, {});
    logger.info(line(), distrito);

    //const distritos = await distrito.getDistritos();
    //logger.info(line(),distritos);

    return distrito;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDistritoByDistritoid = async (transaction, distritoid) => {
  try {
    const distrito = await modelsFT.Distrito.findOne({
      where: {
        distritoid: distritoid,
      },
      transaction,
    });
    //logger.info(line(),distrito);
    return distrito;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findDistritoPk = async (transaction, distritoid) => {
  try {
    const distrito = await modelsFT.Distrito.findOne({
      attributes: ["_iddistrito"],
      where: {
        distritoid: distritoid,
      },
      transaction,
    });
    //logger.info(line(),distrito);
    return distrito;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDistrito = async (transaction, distrito) => {
  try {
    const distrito_nuevo = await modelsFT.Distrito.create(distrito, { transaction });
    // logger.info(line(),distrito_nuevo);
    return distrito_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateDistrito = async (transaction, distrito) => {
  try {
    const result = await modelsFT.Distrito.update(distrito, {
      where: {
        distritoid: distrito.distritoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteDistrito = async (transaction, distrito) => {
  try {
    const result = await modelsFT.Distrito.update(distrito, {
      where: {
        distritoid: distrito.distritoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
