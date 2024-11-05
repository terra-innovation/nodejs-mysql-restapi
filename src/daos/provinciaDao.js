import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

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
    //console.log(provincias);
    return provincias;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getProvinciaByIdprovincia = async (req, idprovincia) => {
  try {
    const { models } = req.app.locals;

    const provincia = await models.Provincia.findByPk(idprovincia, {});
    console.log(provincia);

    //const provincias = await provincia.getProvincias();
    //console.log(provincias);

    return provincia;
  } catch (error) {
    console.error(error);
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
    //console.log(provincia);
    return provincia;
  } catch (error) {
    console.error(error);
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
    //console.log(provincia);
    return provincia;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertProvincia = async (req, provincia) => {
  try {
    const { models } = req.app.locals;
    const provincia_nuevo = await models.Provincia.create(provincia);
    // console.log(provincia_nuevo);
    return provincia_nuevo;
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
