import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

export const getDistritos = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const distritos = await models.Distrito.findAll({
      include: [
        {
          model: models.Provincia,
          required: true,
          as: "provincia_provincium",
          include: [
            {
              model: models.Departamento,
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
    });
    //console.log(distritos);
    return distritos;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDistritoByIddistrito = async (req, iddistrito) => {
  try {
    const { models } = req.app.locals;

    const distrito = await models.Distrito.findByPk(iddistrito, {});
    console.log(distrito);

    //const distritos = await distrito.getDistritos();
    //console.log(distritos);

    return distrito;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDistritoByDistritoid = async (req, distritoid) => {
  try {
    const { models } = req.app.locals;
    const distrito = await models.Distrito.findOne({
      where: {
        distritoid: distritoid,
      },
    });
    //console.log(distrito);
    return distrito;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findDistritoPk = async (req, distritoid) => {
  try {
    const { models } = req.app.locals;
    const distrito = await models.Distrito.findOne({
      attributes: ["_iddistrito"],
      where: {
        distritoid: distritoid,
      },
    });
    //console.log(distrito);
    return distrito;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDistrito = async (req, distrito) => {
  try {
    const { models } = req.app.locals;
    const distrito_nuevo = await models.Distrito.create(distrito);
    // console.log(distrito_nuevo);
    return distrito_nuevo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateDistrito = async (req, distrito) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Distrito.update(distrito, {
      where: {
        distritoid: distrito.distritoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteDistrito = async (req, distrito) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Distrito.update(distrito, {
      where: {
        distritoid: distrito.distritoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
