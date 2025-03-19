import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getFacturasByIdfactoring = async (transaction, _idfactoring, estados) => {
  try {
    const facturas = await modelsFT.Factura.findAll({
      include: [
        { all: true },
        {
          model: modelsFT.Factoring,
          required: true,
          as: "factoring_factorings",
          where: {
            _idfactoring: _idfactoring,
          },
        },
        {
          model: modelsFT.Archivo,
          required: true,
          as: "archivo_archivo_archivo_facturas",
          include: [
            { model: modelsFT.ArchivoTipo, required: true, as: "archivotipo_archivo_tipo" },
            { model: modelsFT.ArchivoEstado, required: true, as: "archivoestado_archivo_estado" },
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
    return facturas;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturasActivas = async (transaction) => {
  try {
    const facturas = await modelsFT.Factura.findAll({
      where: {
        estado: 1,
      },
      transaction,
    });
    //logger.info(line(),facturas);
    return facturas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaByIdfactura = async (transaction, idfactura) => {
  try {
    const factura = await modelsFT.Factura.findByPk(idfactura, { transaction });
    logger.info(line(), factura);

    //const facturas = await factura.getFacturas();
    //logger.info(line(),facturas);

    return factura;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaByIdfacturaAndIdusuarioupload = async (transaction, _idfactura, _idusuarioupload) => {
  try {
    const factura = await modelsFT.Factura.findOne({
      where: {
        _idfactura: _idfactura,
        _idusuarioupload: _idusuarioupload,
      },
      transaction,
    });
    //logger.info(line(),factura);
    return factura;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaByFacturaid = async (transaction, facturaid) => {
  try {
    const factura = await modelsFT.Factura.findOne({
      where: {
        facturaid: facturaid,
      },
      transaction,
    });
    //logger.info(line(),factura);
    return factura;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturaPk = async (transaction, facturaid) => {
  try {
    const factura = await modelsFT.Factura.findOne({
      attributes: ["_idfactura"],
      where: {
        facturaid: facturaid,
      },
      transaction,
    });
    //logger.info(line(),factura);
    return factura;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactura = async (transaction, factura) => {
  try {
    const factura_nuevo = await modelsFT.Factura.create(factura, { transaction });
    // logger.info(line(),factura_nuevo);
    return factura_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactura = async (transaction, factura) => {
  try {
    const result = await modelsFT.Factura.update(factura, {
      where: {
        facturaid: factura.facturaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactura = async (transaction, factura) => {
  try {
    const result = await modelsFT.Factura.update(factura, {
      where: {
        facturaid: factura.facturaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
