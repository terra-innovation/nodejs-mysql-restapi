import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

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
    //logger.info(line(),factoringsfacturasempresas);
    return factoringsfacturasempresas;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturaByIdfactoringfactura = async (transaction, idfactoringfactura) => {
  try {
    const factoringfactura = await modelsFT.FactoringFactura.findByPk(idfactoringfactura, { transaction });
    logger.info(line(), factoringfactura);

    //const factoringsfacturasempresas = await factoringfactura.getFactoringsfacturasEmpresas();
    //logger.info(line(),factoringsfacturasempresas);

    return factoringfactura;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturaByFactoringfacturaid = async (transaction, factoringfacturaid) => {
  try {
    const factoringfactura = await modelsFT.FactoringFactura.findOne({
      where: {
        factoringfacturaid: factoringfacturaid,
      },
      transaction,
    });
    //logger.info(line(),factoringfactura);
    return factoringfactura;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringfacturaPk = async (transaction, factoringfacturaid) => {
  try {
    const factoringfactura = await modelsFT.FactoringFactura.findOne({
      attributes: ["_idfactoringfactura"],
      where: {
        factoringfacturaid: factoringfacturaid,
      },
      transaction,
    });
    //logger.info(line(),factoringfactura);
    return factoringfactura;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringfactura = async (transaction, factoringfactura) => {
  try {
    const factoringfactura_nuevo = await modelsFT.FactoringFactura.create(factoringfactura, { transaction });
    // logger.info(line(),factoringfactura_nuevo);
    return factoringfactura_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringfactura = async (transaction, factoringfactura) => {
  try {
    const result = await modelsFT.FactoringFactura.update(factoringfactura, {
      where: {
        factoringfacturaid: factoringfactura.factoringfacturaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringfactura = async (transaction, factoringfactura) => {
  try {
    const result = await modelsFT.FactoringFactura.update(factoringfactura, {
      where: {
        factoringfacturaid: factoringfactura.factoringfacturaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
