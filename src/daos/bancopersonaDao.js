import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

export const getArchivopersonas = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const archivopersonas = await models.Archivopersona.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //console.log(archivopersonas);
    return archivopersonas;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivopersonaByIdarchivopersona = async (req, idarchivopersona) => {
  try {
    const { models } = req.app.locals;

    const archivopersona = await models.Archivopersona.findByPk(idarchivopersona, {});
    console.log(archivopersona);

    //const archivopersonas = await archivopersona.getArchivopersonas();
    //console.log(archivopersonas);

    return archivopersona;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivopersonaByArchivopersonaid = async (req, archivopersonaid) => {
  try {
    const { models } = req.app.locals;
    const archivopersona = await models.Archivopersona.findOne({
      where: {
        archivopersonaid: archivopersonaid,
      },
    });
    //console.log(archivopersona);
    return archivopersona;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivopersonaPk = async (req, archivopersonaid) => {
  try {
    const { models } = req.app.locals;
    const archivopersona = await models.Archivopersona.findOne({
      attributes: ["_idarchivopersona"],
      where: {
        archivopersonaid: archivopersonaid,
      },
    });
    //console.log(archivopersona);
    return archivopersona;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivopersona = async (req, archivopersona) => {
  try {
    const { models } = req.app.locals;
    const archivopersona_nuevo = await models.Archivopersona.create(archivopersona);
    // console.log(archivopersona_nuevo);
    return archivopersona_nuevo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivopersona = async (req, archivopersona) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Archivopersona.update(archivopersona, {
      where: {
        archivopersonaid: archivopersona.archivopersonaid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivopersona = async (req, archivopersona) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Archivopersona.update(archivopersona, {
      where: {
        archivopersonaid: archivopersona.archivopersonaid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
