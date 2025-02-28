import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

export const getDocumentotiposByIdusuario = async (transaction, _idusuario, estados) => {
  try {
    const documentotipos = await modelsFT.DocumentoTipo.findAll({
      include: [
        {
          model: modelsFT.UsuarioDocumentotipo,
          as: "usuario_documentotipos",
          where: {
            _idusuario: _idusuario,
            estado: {
              [Sequelize.Op.in]: estados,
            },
          },
        },
      ],
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),documentotipos);
    return documentotipos;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByIdusuarioAndRuc = async (transaction, _idusuario, ruc, estado) => {
  try {
    const documentotipos = await modelsFT.DocumentoTipo.findOne({
      include: [
        {
          model: modelsFT.UsuarioDocumentotipo,
          as: "usuario_documentotipos",
          where: {
            _idusuario: _idusuario,
            estado: estado,
          },
        },
      ],
      where: {
        ruc: ruc,
        estado: estado,
      },
      transaction,
    });
    //logger.info(line(),documentotipos);
    return documentotipos;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByIdusuarioAndDocumentotipoid = async (transaction, _idusuario, documentotipoid, estado) => {
  try {
    const documentotipos = await modelsFT.DocumentoTipo.findOne({
      include: [
        {
          model: modelsFT.UsuarioDocumentotipo,
          as: "usuario_documentotipos",
          where: {
            _idusuario: _idusuario,
            estado: estado,
          },
        },
      ],
      where: {
        documentotipoid: documentotipoid,
        estado: estado,
      },
      transaction,
    });
    //logger.info(line(),documentotipos);
    return documentotipos;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipos = async (transaction, estados) => {
  try {
    const documentotipos = await modelsFT.DocumentoTipo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),documentotipos);
    return documentotipos;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    logger.info(line(), documentotipo);

    //const colaboradores = await documentotipo.getColaboradors();
    //logger.info(line(),colaboradores);

    return documentotipo;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    //logger.info(line(),documentotipo);
    return documentotipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByRuc = async (transaction, ruc) => {
  try {
    const documentotipo = await modelsFT.DocumentoTipo.findAll({
      where: {
        ruc: ruc,
      },
      transaction,
    });
    //logger.info(line(),documentotipo);
    return documentotipo;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    //logger.info(line(),documentotipo);
    return documentotipo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDocumentotipo = async (transaction, documentotipo) => {
  try {
    const documentotipo_nuevo = await modelsFT.DocumentoTipo.create(documentotipo, { transaction });
    // logger.info(line(),documentotipo_nuevo);
    return documentotipo_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
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
    logger.error(line(), formatError(error));
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
    logger.error(line(), formatError(error));
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
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
