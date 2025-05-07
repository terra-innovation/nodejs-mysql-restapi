import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getEmpresasByIdempresas = async (transaction, _idempresas, estados) => {
  try {
    const empresas = await modelsFT.Empresa.findAll({
      include: [],
      where: {
        _idempresa: {
          [Op.in]: _idempresas,
        },
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return empresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

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
              [Op.in]: estados,
            },
          },
        },
      ],
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return empresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
              [Op.in]: estados,
            },
          },
        },
      ],
      where: {
        ruc: ruc,
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return empresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return empresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresas = async (transaction, estados) => {
  try {
    const empresas = await modelsFT.Empresa.findAll({
      include: [
        {
          all: true,
        },
      ],
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return empresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    //const colaboradores = await empresa.getColaboradors();

    return empresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return empresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return empresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return empresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertEmpresa = async (transaction, empresa) => {
  try {
    const empresa_nuevo = await modelsFT.Empresa.create(empresa, { transaction });

    return empresa_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
