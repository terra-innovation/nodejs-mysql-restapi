import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getDocumentotipos = async (transaction, estados) => {
  try {
    const documentotipos = await modelsFT.DocumentoTipo.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return documentotipos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByIddocumentotipo = async (transaction, iddocumentotipo) => {
  try {
    const documentotipo = await modelsFT.DocumentoTipo.findByPk(iddocumentotipo, {
      include: [
        {
          model: modelsFT.Colaborador,
          as: "colaboradors",
        },
      ],
      transaction,
    });

    //const colaboradores = await documentotipo.getColaboradors();

    return documentotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByDocumentotipoid = async (transaction, documentotipoid) => {
  try {
    const documentotipo = await modelsFT.DocumentoTipo.findAll({
      include: [
        {
          model: modelsFT.Colaborador,
          as: "colaboradors",
        },
      ],
      where: {
        documentotipoid: documentotipoid,
      },
      transaction,
    });

    return documentotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findDocumentotipoPk = async (transaction, documentotipoid) => {
  try {
    const documentotipo = await modelsFT.DocumentoTipo.findOne({
      attributes: ["_iddocumentotipo"],
      where: {
        documentotipoid: documentotipoid,
      },
      transaction,
    });

    return documentotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDocumentotipo = async (transaction, documentotipo) => {
  try {
    const documentotipo_nuevo = await modelsFT.DocumentoTipo.create(documentotipo, { transaction });

    return documentotipo_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateDocumentotipo = async (transaction, documentotipo) => {
  try {
    const result = await modelsFT.DocumentoTipo.update(documentotipo, {
      where: {
        documentotipoid: documentotipo.documentotipoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteDocumentotipo = async (transaction, documentotipo) => {
  try {
    const result = await modelsFT.DocumentoTipo.update(documentotipo, {
      where: {
        documentotipoid: documentotipo.documentotipoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateDocumentotipo = async (transaction, documentotipo) => {
  try {
    const result = await modelsFT.DocumentoTipo.update(documentotipo, {
      where: {
        documentotipoid: documentotipo.documentotipoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
