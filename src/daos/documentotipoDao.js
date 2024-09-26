import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

export const getDocumentotiposByIdusuario = async (req, _idusuario, estados) => {
  try {
    const { models } = req.app.locals;
    const documentotipos = await models.DocumentoTipo.findAll({
      include: [
        {
          model: models.UsuarioDocumentotipo,
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
    });
    //console.log(documentotipos);
    return documentotipos;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByIdusuarioAndRuc = async (req, _idusuario, ruc, estado) => {
  try {
    const { models } = req.app.locals;
    const documentotipos = await models.DocumentoTipo.findOne({
      include: [
        {
          model: models.UsuarioDocumentotipo,
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
    });
    //console.log(documentotipos);
    return documentotipos;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByIdusuarioAndDocumentotipoid = async (req, _idusuario, documentotipoid, estado) => {
  try {
    const { models } = req.app.locals;
    const documentotipos = await models.DocumentoTipo.findOne({
      include: [
        {
          model: models.UsuarioDocumentotipo,
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
    });
    //console.log(documentotipos);
    return documentotipos;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipos = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const documentotipos = await models.DocumentoTipo.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //console.log(documentotipos);
    return documentotipos;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByIddocumentotipo = async (req, iddocumentotipo) => {
  try {
    const { models } = req.app.locals;

    const documentotipo = await models.DocumentoTipo.findByPk(iddocumentotipo, {
      include: [
        {
          model: models.Colaborador,
          as: "colaboradors",
        },
      ],
    });
    console.log(documentotipo);

    //const colaboradores = await documentotipo.getColaboradors();
    //console.log(colaboradores);

    return documentotipo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByDocumentotipoid = async (req, documentotipoid) => {
  try {
    const { models } = req.app.locals;
    const documentotipo = await models.DocumentoTipo.findAll({
      include: [
        {
          model: models.Colaborador,
          as: "colaboradors",
        },
      ],
      where: {
        documentotipoid: documentotipoid,
      },
    });
    //console.log(documentotipo);
    return documentotipo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByRuc = async (req, ruc) => {
  try {
    const { models } = req.app.locals;
    const documentotipo = await models.DocumentoTipo.findAll({
      where: {
        ruc: ruc,
      },
    });
    //console.log(documentotipo);
    return documentotipo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findDocumentotipoPk = async (req, documentotipoid) => {
  try {
    const { models } = req.app.locals;
    const documentotipo = await models.DocumentoTipo.findOne({
      attributes: ["_iddocumentotipo"],
      where: {
        documentotipoid: documentotipoid,
      },
    });
    //console.log(documentotipo);
    return documentotipo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDocumentotipo = async (req, documentotipo) => {
  try {
    const { models } = req.app.locals;
    const documentotipo_nuevo = await models.DocumentoTipo.create(documentotipo);
    // console.log(documentotipo_nuevo);
    return documentotipo_nuevo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateDocumentotipo = async (req, documentotipo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.DocumentoTipo.update(documentotipo, {
      where: {
        documentotipoid: documentotipo.documentotipoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteDocumentotipo = async (req, documentotipo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.DocumentoTipo.update(documentotipo, {
      where: {
        documentotipoid: documentotipo.documentotipoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateDocumentotipo = async (req, documentotipo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.DocumentoTipo.update(documentotipo, {
      where: {
        documentotipoid: documentotipo.documentotipoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
