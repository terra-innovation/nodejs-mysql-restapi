import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getArchivofacturasByIdfactoring = async (transaction, _idfactoring, estados) => {
  try {
    const archivofacturas = await modelsFT.ArchivoFactura.findAll({
      include: [
        { all: true },
        {
          model: modelsFT.Archivo,
          required: true,
          as: "archivo_archivo",
          include: [{ all: true }],
        },
        {
          model: modelsFT.Factura,
          required: true,
          as: "factura_factura",
          include: [
            {
              model: modelsFT.Factoring,
              required: true,
              as: "factoring_factorings",
              where: {
                _idfactoring: _idfactoring,
              },
            },
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
    //logger.info(line(),archivofacturas);
    return archivofacturas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivofacturas = async (transaction, estados) => {
  try {
    const archivofacturas = await modelsFT.ArchivoFactura.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),archivofacturas);
    return archivofacturas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoFacturaByIdarchivofactura = async (transaction, idarchivofactura) => {
  try {
    const archivofactura = await modelsFT.ArchivoFactura.findByPk(idarchivofactura, { transaction });
    logger.info(line(), archivofactura);

    //const archivofacturas = await archivofactura.getArchivofacturas();
    //logger.info(line(),archivofacturas);

    return archivofactura;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoFacturaByArchivoFacturaid = async (transaction, archivofacturaid) => {
  try {
    const archivofactura = await modelsFT.ArchivoFactura.findOne({
      where: {
        archivofacturaid: archivofacturaid,
      },
      transaction,
    });
    //logger.info(line(),archivofactura);
    return archivofactura;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoFacturaPk = async (transaction, archivofacturaid) => {
  try {
    const archivofactura = await modelsFT.ArchivoFactura.findOne({
      attributes: ["_idarchivofactura"],
      where: {
        archivofacturaid: archivofacturaid,
      },
      transaction,
    });
    //logger.info(line(),archivofactura);
    return archivofactura;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoFactura = async (transaction, archivofactura) => {
  try {
    const archivofactura_nuevo = await modelsFT.ArchivoFactura.create(archivofactura, { transaction });
    // logger.info(line(),archivofactura_nuevo);
    return archivofactura_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoFactura = async (transaction, archivofactura) => {
  try {
    const result = await modelsFT.ArchivoFactura.update(archivofactura, {
      where: {
        archivofacturaid: archivofactura.archivofacturaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoFactura = async (transaction, archivofactura) => {
  try {
    const result = await modelsFT.ArchivoFactura.update(archivofactura, {
      where: {
        archivofacturaid: archivofactura.archivofacturaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
