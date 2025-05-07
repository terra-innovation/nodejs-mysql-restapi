import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getFactoringsfacturasEmpresasActivas = async (transaction) => {
  try {
    const factoringsfacturasempresas = await modelsFT.FactoringFactura.findAll({
      include: [
        {
          all: true,
        },
      ],
      where: {
        estado: 1,
      },
      transaction,
    });

    return factoringsfacturasempresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturaByIdfactoringfactura = async (transaction, idfactoringfactura) => {
  try {
    const factoringfactura = await modelsFT.FactoringFactura.findByPk(idfactoringfactura, { transaction });

    //const factoringsfacturasempresas = await factoringfactura.getFactoringsfacturasEmpresas();

    return factoringfactura;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturaByFactoringfacturaid = async (transaction, factoringfactura) => {
  try {
    const result = await modelsFT.FactoringFactura.findOne({
      where: {
        _idfactoring: factoringfactura._idfactoring,
        _idfactura: factoringfactura._idfactura,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringfacturaPk = async (transaction, factoringfactura) => {
  try {
    const result = await modelsFT.FactoringFactura.findOne({
      attributes: ["_idfactoringfactura"],
      where: {
        _idfactoring: factoringfactura._idfactoring,
        _idfactura: factoringfactura._idfactura,
      },
      transaction,
    });

    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringfactura = async (transaction, factoringfactura) => {
  try {
    const factoringfactura_nuevo = await modelsFT.FactoringFactura.create(factoringfactura, { transaction });

    return factoringfactura_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringfactura = async (transaction, factoringfactura) => {
  try {
    const result = await modelsFT.FactoringFactura.update(factoringfactura, {
      where: {
        _idfactoring: factoringfactura._idfactoring,
        _idfactura: factoringfactura._idfactura,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringfactura = async (transaction, factoringfactura) => {
  try {
    const result = await modelsFT.FactoringFactura.update(factoringfactura, {
      where: {
        _idfactoring: factoringfactura._idfactoring,
        _idfactura: factoringfactura._idfactura,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
