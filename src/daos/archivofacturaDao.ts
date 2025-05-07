import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

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
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return archivofacturas;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivofacturas = async (transaction, estados) => {
  try {
    const archivofacturas = await modelsFT.ArchivoFactura.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return archivofacturas;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoFacturaByIdarchivofactura = async (transaction, idarchivofactura) => {
  try {
    const archivofactura = await modelsFT.ArchivoFactura.findByPk(idarchivofactura, { transaction });

    //const archivofacturas = await archivofactura.getArchivofacturas();

    return archivofactura;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoFacturaByArchivoFacturaid = async (transaction, archivofactura) => {
  try {
    const result = await modelsFT.ArchivoFactura.findOne({
      where: {
        _idarchivo: archivofactura._idarchivo,
        _idfactura: archivofactura._idfactura,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivoFacturaPk = async (transaction, archivofactura) => {
  try {
    const result = await modelsFT.ArchivoFactura.findOne({
      attributes: ["_idarchivofactura"],
      where: {
        _idarchivo: archivofactura._idarchivo,
        _idfactura: archivofactura._idfactura,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoFactura = async (transaction, archivofactura) => {
  try {
    const archivofactura_nuevo = await modelsFT.ArchivoFactura.create(archivofactura, { transaction });

    return archivofactura_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoFactura = async (transaction, archivofactura) => {
  try {
    const result = await modelsFT.ArchivoFactura.update(archivofactura, {
      where: {
        _idarchivo: archivofactura._idarchivo,
        _idfactura: archivofactura._idfactura,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoFactura = async (transaction, archivofactura) => {
  try {
    const result = await modelsFT.ArchivoFactura.update(archivofactura, {
      where: {
        _idarchivo: archivofactura._idarchivo,
        _idfactura: archivofactura._idfactura,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoFactura = async (transaction, archivofactura) => {
  try {
    const result = await modelsFT.ArchivoFactura.update(archivofactura, {
      where: {
        _idarchivo: archivofactura._idarchivo,
        _idfactura: archivofactura._idfactura,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
