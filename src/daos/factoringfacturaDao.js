import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getFactoringsfacturasEmpresasActivas = async (req) => {
  try {
    const { models } = req.app.locals;
    const factoringsfacturasempresas = await models.FactoringFactura.findAll({
      include: [
        {
          all: true,
        },
      ],
      where: {
        estado: 1,
      },
    });
    //logger.info(line(),factoringsfacturasempresas);
    return factoringsfacturasempresas;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturaByIdfactoringfactura = async (req, idfactoringfactura) => {
  try {
    const { models } = req.app.locals;

    const factoringfactura = await models.FactoringFactura.findByPk(idfactoringfactura, {});
    logger.info(line(), factoringfactura);

    //const factoringsfacturasempresas = await factoringfactura.getFactoringsfacturasEmpresas();
    //logger.info(line(),factoringsfacturasempresas);

    return factoringfactura;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturaByFactoringfacturaid = async (req, factoringfacturaid) => {
  try {
    const { models } = req.app.locals;
    const factoringfactura = await models.FactoringFactura.findOne({
      where: {
        factoringfacturaid: factoringfacturaid,
      },
    });
    //logger.info(line(),factoringfactura);
    return factoringfactura;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringfacturaPk = async (req, factoringfacturaid) => {
  try {
    const { models } = req.app.locals;
    const factoringfactura = await models.FactoringFactura.findOne({
      attributes: ["_idfactoringfactura"],
      where: {
        factoringfacturaid: factoringfacturaid,
      },
    });
    //logger.info(line(),factoringfactura);
    return factoringfactura;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringfactura = async (req, factoringfactura) => {
  try {
    const { models } = req.app.locals;
    const factoringfactura_nuevo = await models.FactoringFactura.create(factoringfactura);
    // logger.info(line(),factoringfactura_nuevo);
    return factoringfactura_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringfactura = async (req, factoringfactura) => {
  try {
    const { models } = req.app.locals;
    const result = await models.FactoringFactura.update(factoringfactura, {
      where: {
        factoringfacturaid: factoringfactura.factoringfacturaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringfactura = async (req, factoringfactura) => {
  try {
    const { models } = req.app.locals;
    const result = await models.FactoringFactura.update(factoringfactura, {
      where: {
        factoringfacturaid: factoringfactura.factoringfacturaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
