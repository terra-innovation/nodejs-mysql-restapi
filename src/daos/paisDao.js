import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

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
    //console.log(paises);
    return paises;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPaisByIdpais = async (req, idpais) => {
  try {
    const { models } = req.app.locals;

    const pais = await models.Pais.findByPk(idpais, {});
    console.log(pais);

    //const paises = await pais.getPaises();
    //console.log(paises);

    return pais;
  } catch (error) {
    console.error(error);
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
    //console.log(pais);
    return pais;
  } catch (error) {
    console.error(error);
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
    //console.log(pais);
    return pais;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPais = async (req, pais) => {
  try {
    const { models } = req.app.locals;
    const pais_nuevo = await models.Pais.create(pais);
    // console.log(pais_nuevo);
    return pais_nuevo;
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
