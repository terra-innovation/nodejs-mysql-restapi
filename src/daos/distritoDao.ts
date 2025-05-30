import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

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
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return distritos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDistritoByIddistrito = async (transaction, iddistrito) => {
  try {
    const distrito = await modelsFT.Distrito.findByPk(iddistrito, {});

    //const distritos = await distrito.getDistritos();

    return distrito;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return distrito;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return distrito;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDistrito = async (transaction, distrito) => {
  try {
    const distrito_nuevo = await modelsFT.Distrito.create(distrito, { transaction });

    return distrito_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
