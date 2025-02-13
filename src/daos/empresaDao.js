import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getEmpresasByIdusuario = async (transaction, _idusuario, estados) => {
  try {
    const empresas = await modelsFT.Empresa.findAll({
      include: [
        {
          model: modelsFT.UsuarioServicioEmpresa,
          as: "usuario_servicio_empresas",
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
    //logger.info(line(),empresas);
    return empresas;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByIdusuarioAndRuc = async (transaction, _idusuario, ruc, estados) => {
  try {
    const empresas = await modelsFT.Empresa.findOne({
      include: [
        {
          model: modelsFT.UsuarioServicioEmpresa,
          as: "usuario_servicio_empresas",
          where: {
            _idusuario: _idusuario,
            estado: {
              [Sequelize.Op.in]: estados,
            },
          },
        },
      ],
      where: {
        ruc: ruc,
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),empresas);
    return empresas;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByIdusuarioAndEmpresaid = async (transaction, _idusuario, empresaid, estado) => {
  try {
    const empresas = await modelsFT.Empresa.findOne({
      include: [
        {
          model: modelsFT.UsuarioServicioEmpresa,
          as: "usuario_servicio_empresas",
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
      transaction,
    });
    //logger.info(line(),empresas);
    return empresas;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresas = async (transaction, estados) => {
  try {
    const empresas = await modelsFT.Empresa.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),empresas);
    return empresas;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByIdempresa = async (transaction, idempresa) => {
  try {
    const empresa = await modelsFT.Empresa.findByPk(idempresa, {
      include: [
        {
          model: modelsFT.Colaborador,
          as: "colaboradors",
        },
      ],
      transaction,
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

export const getEmpresaByEmpresaid = async (transaction, empresaid) => {
  try {
    const empresa = await modelsFT.Empresa.findOne({
      include: [
        {
          model: modelsFT.Colaborador,
          as: "colaboradors",
        },
      ],
      where: {
        empresaid: empresaid,
      },
      transaction,
    });
    //logger.info(line(),empresa);
    return empresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByRuc = async (transaction, ruc) => {
  try {
    const empresa = await modelsFT.Empresa.findOne({
      where: {
        ruc: ruc,
      },
      transaction,
    });
    //logger.info(line(),empresa);
    return empresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findEmpresaPk = async (transaction, empresaid) => {
  try {
    const empresa = await modelsFT.Empresa.findOne({
      attributes: ["_idempresa"],
      where: {
        empresaid: empresaid,
      },
      transaction,
    });
    //logger.info(line(),empresa);
    return empresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertEmpresa = async (transaction, empresa) => {
  try {
    const empresa_nuevo = await modelsFT.Empresa.create(empresa, { transaction });
    // logger.info(line(),empresa_nuevo);
    return empresa_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateEmpresa = async (transaction, empresa) => {
  try {
    const result = await modelsFT.Empresa.update(empresa, {
      where: {
        empresaid: empresa.empresaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteEmpresa = async (transaction, empresa) => {
  try {
    const result = await modelsFT.Empresa.update(empresa, {
      where: {
        empresaid: empresa.empresaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateEmpresa = async (transaction, empresa) => {
  try {
    const result = await modelsFT.Empresa.update(empresa, {
      where: {
        empresaid: empresa.empresaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
