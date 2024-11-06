import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

export const getArchivopersonas = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const archivopersonas = await models.ArchivoPersona.findAll({
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

export const getArchivoPersonaByIdarchivopersona = async (req, idarchivopersona) => {
  try {
    const { models } = req.app.locals;

    const archivopersona = await models.ArchivoPersona.findByPk(idarchivopersona, {});
    console.log(archivopersona);

    //const archivopersonas = await archivopersona.getArchivopersonas();
    //console.log(archivopersonas);

    return archivopersona;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoPersonaByArchivoPersonaid = async (req, archivopersonaid) => {
  try {
    const { models } = req.app.locals;
    const archivopersona = await models.ArchivoPersona.findOne({
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

export const findArchivoPersonaPk = async (req, archivopersonaid) => {
  try {
    const { models } = req.app.locals;
    const archivopersona = await models.ArchivoPersona.findOne({
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

export const insertArchivoPersona = async (req, archivopersona) => {
  try {
    const { models } = req.app.locals;
    const archivopersona_nuevo = await models.ArchivoPersona.create(archivopersona);
    // console.log(archivopersona_nuevo);
    return archivopersona_nuevo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoPersona = async (req, archivopersona) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ArchivoPersona.update(archivopersona, {
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

export const deleteArchivoPersona = async (req, archivopersona) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ArchivoPersona.update(archivopersona, {
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
