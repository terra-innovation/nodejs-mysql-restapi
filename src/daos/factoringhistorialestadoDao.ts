import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getFactoringhistorialestadosByIdfactoring = async (transaction, _idfactoring, estados) => {
  try {
    const factoringhistorialestados = await modelsFT.FactoringHistorialEstado.findAll({
      include: [
        {
          all: true,
        },
        {
          model: modelsFT.Archivo,
          required: false,
          as: "archivo_archivo_archivo_factoring_historial_estados",
          include: [
            {
              all: true,
            },
          ],
        },
      ],
      where: {
        _idfactoring: _idfactoring,
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factoringhistorialestados;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringhistorialestados = async (transaction, estados) => {
  try {
    const factoringhistorialestados = await modelsFT.FactoringHistorialEstado.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factoringhistorialestados;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringhistorialestadoByIdfactoringhistorialestado = async (transaction, idfactoringhistorialestado) => {
  try {
    const factoringhistorialestado = await modelsFT.FactoringHistorialEstado.findByPk(idfactoringhistorialestado, { transaction });

    //const factoringhistorialestados = await factoringhistorialestado.getFactoringhistorialestados();

    return factoringhistorialestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringhistorialestadoByFactoringhistorialestadoid = async (transaction, factoringhistorialestadoid) => {
  try {
    const factoringhistorialestado = await modelsFT.FactoringHistorialEstado.findOne({
      where: {
        factoringhistorialestadoid: factoringhistorialestadoid,
      },
      transaction,
    });

    return factoringhistorialestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringhistorialestadoPk = async (transaction, factoringhistorialestadoid) => {
  try {
    const factoringhistorialestado = await modelsFT.FactoringHistorialEstado.findOne({
      attributes: ["_idfactoringhistorialestado"],
      where: {
        factoringhistorialestadoid: factoringhistorialestadoid,
      },
      transaction,
    });

    return factoringhistorialestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringhistorialestado = async (transaction, factoringhistorialestado) => {
  try {
    const factoringhistorialestado_nuevo = await modelsFT.FactoringHistorialEstado.create(factoringhistorialestado, { transaction });

    return factoringhistorialestado_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringhistorialestado = async (transaction, factoringhistorialestado) => {
  try {
    const result = await modelsFT.FactoringHistorialEstado.update(factoringhistorialestado, {
      where: {
        factoringhistorialestadoid: factoringhistorialestado.factoringhistorialestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringhistorialestado = async (transaction, factoringhistorialestado) => {
  try {
    const result = await modelsFT.FactoringHistorialEstado.update(factoringhistorialestado, {
      where: {
        factoringhistorialestadoid: factoringhistorialestado.factoringhistorialestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactoringhistorialestado = async (transaction, factoringhistorialestado) => {
  try {
    const result = await modelsFT.FactoringHistorialEstado.update(factoringhistorialestado, {
      where: {
        factoringhistorialestadoid: factoringhistorialestado.factoringhistorialestadoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
