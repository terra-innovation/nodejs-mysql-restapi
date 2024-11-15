import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getFacturasActivas = async (req) => {
  try {
    const { models } = req.app.locals;
    const facturas = await models.Factura.findAll({
      where: {
        estado: 1,
      },
    });
    //logger.info(line(),facturas);
    return facturas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaByIdfactura = async (req, idfactura) => {
  try {
    const { models } = req.app.locals;

    const factura = await models.Factura.findByPk(idfactura, {});
    logger.info(line(), factura);

    //const facturas = await factura.getFacturas();
    //logger.info(line(),facturas);

    return factura;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaByFacturaid = async (req, facturaid) => {
  try {
    const { models } = req.app.locals;
    const factura = await models.Factura.findOne({
      where: {
        facturaid: facturaid,
      },
    });
    //logger.info(line(),factura);
    return factura;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturaPk = async (req, facturaid) => {
  try {
    const { models } = req.app.locals;
    const factura = await models.Factura.findOne({
      attributes: ["_idfactura"],
      where: {
        facturaid: facturaid,
      },
    });
    //logger.info(line(),factura);
    return factura;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactura = async (req, factura) => {
  try {
    const { models } = req.app.locals;
    const factura_nuevo = await models.Factura.create(factura);
    // logger.info(line(),factura_nuevo);
    return factura_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactura = async (req, factura) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Factura.update(factura, {
      where: {
        facturaid: factura.facturaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactura = async (req, factura) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Factura.update(factura, {
      where: {
        facturaid: factura.facturaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
