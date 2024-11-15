import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getEmpresasByIdusuario = async (req, _idusuario, estados) => {
  try {
    const { models } = req.app.locals;
    const empresas = await models.Empresa.findAll({
      include: [
        {
          model: models.UsuarioEmpresa,
          as: "usuario_empresas",
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
    //logger.info(line(),empresas);
    return empresas;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByIdusuarioAndRuc = async (req, _idusuario, ruc, estado) => {
  try {
    const { models } = req.app.locals;
    const empresas = await models.Empresa.findOne({
      include: [
        {
          model: models.UsuarioEmpresa,
          as: "usuario_empresas",
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
    //logger.info(line(),empresas);
    return empresas;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByIdusuarioAndEmpresaid = async (req, _idusuario, empresaid, estado) => {
  try {
    const { models } = req.app.locals;
    const empresas = await models.Empresa.findOne({
      include: [
        {
          model: models.UsuarioEmpresa,
          as: "usuario_empresas",
          where: {
            _idusuario: _idusuario,
            estado: estado,
          },
        },
      ],
      where: {
        empresaid: empresaid,
        estado: estado,
      },
    });
    //logger.info(line(),empresas);
    return empresas;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresas = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const empresas = await models.Empresa.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),empresas);
    return empresas;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByIdempresa = async (req, idempresa) => {
  try {
    const { models } = req.app.locals;

    const empresa = await models.Empresa.findByPk(idempresa, {
      include: [
        {
          model: models.Colaborador,
          as: "colaboradors",
        },
      ],
    });
    logger.info(line(), empresa);

    //const colaboradores = await empresa.getColaboradors();
    //logger.info(line(),colaboradores);

    return empresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByEmpresaid = async (req, empresaid) => {
  try {
    const { models } = req.app.locals;
    const empresa = await models.Empresa.findAll({
      include: [
        {
          model: models.Colaborador,
          as: "colaboradors",
        },
      ],
      where: {
        empresaid: empresaid,
      },
    });
    //logger.info(line(),empresa);
    return empresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByRuc = async (req, ruc) => {
  try {
    const { models } = req.app.locals;
    const empresa = await models.Empresa.findAll({
      where: {
        ruc: ruc,
      },
    });
    //logger.info(line(),empresa);
    return empresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findEmpresaPk = async (req, empresaid) => {
  try {
    const { models } = req.app.locals;
    const empresa = await models.Empresa.findOne({
      attributes: ["_idempresa"],
      where: {
        empresaid: empresaid,
      },
    });
    //logger.info(line(),empresa);
    return empresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertEmpresa = async (req, empresa) => {
  try {
    const { models } = req.app.locals;
    const empresa_nuevo = await models.Empresa.create(empresa);
    // logger.info(line(),empresa_nuevo);
    return empresa_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateEmpresa = async (req, empresa) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Empresa.update(empresa, {
      where: {
        empresaid: empresa.empresaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteEmpresa = async (req, empresa) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Empresa.update(empresa, {
      where: {
        empresaid: empresa.empresaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateEmpresa = async (req, empresa) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Empresa.update(empresa, {
      where: {
        empresaid: empresa.empresaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
