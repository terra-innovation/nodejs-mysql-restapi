import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getArchivoempresas = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const archivoempresas = await models.ArchivoEmpresa.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),archivoempresas);
    return archivoempresas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoEmpresaByIdarchivoempresa = async (req, idarchivoempresa) => {
  try {
    const { models } = req.app.locals;

    const archivoempresa = await models.ArchivoEmpresa.findByPk(idarchivoempresa, {});
    logger.info(line(), archivoempresa);

    //const archivoempresas = await archivoempresa.getArchivoempresas();
    //logger.info(line(),archivoempresas);

    return archivoempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoEmpresaByArchivoEmpresaid = async (req, archivoempresaid) => {
  try {
    const { models } = req.app.locals;
    const archivoempresa = await models.ArchivoEmpresa.findOne({
      where: {
        archivoempresaid: archivoempresaid,
      },
    });
    //logger.info(line(),archivoempresa);
    return archivoempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoEmpresaPk = async (req, archivoempresaid) => {
  try {
    const { models } = req.app.locals;
    const archivoempresa = await models.ArchivoEmpresa.findOne({
      attributes: ["_idarchivoempresa"],
      where: {
        archivoempresaid: archivoempresaid,
      },
    });
    //logger.info(line(),archivoempresa);
    return archivoempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoEmpresa = async (req, archivoempresa) => {
  try {
    const { models } = req.app.locals;
    const archivoempresa_nuevo = await models.ArchivoEmpresa.create(archivoempresa);
    // logger.info(line(),archivoempresa_nuevo);
    return archivoempresa_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoEmpresa = async (req, archivoempresa) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ArchivoEmpresa.update(archivoempresa, {
      where: {
        archivoempresaid: archivoempresa.archivoempresaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoEmpresa = async (req, archivoempresa) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ArchivoEmpresa.update(archivoempresa, {
      where: {
        archivoempresaid: archivoempresa.archivoempresaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
