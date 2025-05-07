import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getEmpresacuentabancariasForFactoring = async (transaction, _idempresa, _idmoneda, _idcuentabancariaestado, estados) => {
  try {
    const empresacuentabancaria = await modelsFT.EmpresaCuentaBancaria.findAll({
      include: [
        {
          model: modelsFT.CuentaBancaria,
          required: true,
          as: "cuentabancaria_cuenta_bancarium",
          include: [
            {
              model: modelsFT.Banco,
              required: true,
              as: "banco_banco",
            },
            {
              model: modelsFT.Moneda,
              required: true,
              as: "moneda_moneda",
              where: {
                _idmoneda: _idmoneda,
              },
            },
            {
              model: modelsFT.CuentaTipo,
              required: true,
              as: "cuentatipo_cuenta_tipo",
            },
            {
              model: modelsFT.CuentaBancariaEstado,
              required: true,
              as: "cuentabancariaestado_cuenta_bancaria_estado",
              where: {
                _idcuentabancariaestado: {
                  [Op.in]: _idcuentabancariaestado,
                },
              },
            },
          ],
          where: {
            estado: {
              [Op.in]: estados,
            },
          },
        },
      ],
      where: {
        _idempresa: _idempresa,
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariasByIdempresaAndAlias = async (transaction, _idempresa, alias, estados) => {
  try {
    const empresacuentabancaria = await modelsFT.EmpresaCuentaBancaria.findAll({
      include: [
        {
          model: modelsFT.Empresa,
          required: true,
          as: "empresa_empresa",
          where: {
            _idempresa: _idempresa,
          },
        },
        {
          model: modelsFT.CuentaBancaria,
          required: true,
          as: "cuentabancaria_cuenta_bancarium",
          include: [
            {
              model: modelsFT.Banco,
              required: true,
              as: "banco_banco",
            },
            {
              model: modelsFT.Moneda,
              required: true,
              as: "moneda_moneda",
            },
            {
              model: modelsFT.CuentaTipo,
              required: true,
              as: "cuentatipo_cuenta_tipo",
            },
            {
              model: modelsFT.CuentaBancariaEstado,
              required: true,
              as: "cuentabancariaestado_cuenta_bancaria_estado",
            },
          ],
          where: {
            alias: alias,
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

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariasByIdusuario = async (transaction, _idusuario, estados) => {
  try {
    const empresacuentabancaria = await modelsFT.EmpresaCuentaBancaria.findAll({
      include: [
        {
          model: modelsFT.Empresa,
          required: true,
          as: "empresa_empresa",
          include: [
            {
              model: modelsFT.UsuarioServicioEmpresa,
              required: true,
              as: "usuario_servicio_empresas",
              where: {
                _idusuario: _idusuario,
              },
            },
          ],
        },
        {
          model: modelsFT.CuentaBancaria,
          required: true,
          as: "cuentabancaria_cuenta_bancarium",
          include: [
            {
              model: modelsFT.Banco,
              required: true,
              as: "banco_banco",
            },
            {
              model: modelsFT.Moneda,
              required: true,
              as: "moneda_moneda",
            },
            {
              model: modelsFT.CuentaTipo,
              required: true,
              as: "cuentatipo_cuenta_tipo",
            },
            {
              model: modelsFT.CuentaBancariaEstado,
              required: true,
              as: "cuentabancariaestado_cuenta_bancaria_estado",
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

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancarias = async (transaction, estados) => {
  try {
    const empresacuentabancarias = await modelsFT.EmpresaCuentaBancaria.findAll({
      include: [
        {
          model: modelsFT.Empresa,
          required: true,
          as: "empresa_empresa",
          include: [
            {
              model: modelsFT.UsuarioServicioEmpresa,
              required: true,
              as: "usuario_servicio_empresas",
            },
          ],
        },
        {
          model: modelsFT.CuentaBancaria,
          required: true,
          as: "cuentabancaria_cuenta_bancarium",
          include: [
            {
              model: modelsFT.Banco,
              required: true,
              as: "banco_banco",
            },
            {
              model: modelsFT.Moneda,
              required: true,
              as: "moneda_moneda",
            },
            {
              model: modelsFT.CuentaTipo,
              required: true,
              as: "cuentatipo_cuenta_tipo",
            },
            {
              model: modelsFT.CuentaBancariaEstado,
              required: true,
              as: "cuentabancariaestado_cuenta_bancaria_estado",
            },
            {
              model: modelsFT.Archivo,
              required: false,
              as: "archivo_archivo_archivo_cuenta_bancaria",
              include: [
                {
                  model: modelsFT.ArchivoTipo,
                  required: true,
                  as: "archivotipo_archivo_tipo",
                },
              ],
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

    return empresacuentabancarias;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariaByIdempresaAndIdusuario = async (transaction, _idempresa, _idusuario, estados) => {
  try {
    const empresacuentabancaria = await modelsFT.EmpresaCuentaBancaria.findOne({
      include: [
        {
          model: modelsFT.Empresa,
          required: true,
          as: "empresa_empresa",
          include: [
            {
              model: modelsFT.UsuarioServicioEmpresa,
              required: true,
              as: "usuario_servicio_empresas",
              where: {
                _idempresa: _idempresa,
                _idusuario: _idusuario,
              },
            },
          ],
        },
        {
          model: modelsFT.CuentaBancaria,
          required: true,
          as: "cuentabancaria_cuenta_bancarium",
          include: [
            {
              model: modelsFT.Banco,
              required: true,
              as: "banco_banco",
            },
            {
              model: modelsFT.Moneda,
              required: true,
              as: "moneda_moneda",
            },
            {
              model: modelsFT.CuentaTipo,
              required: true,
              as: "cuentatipo_cuenta_tipo",
            },
            {
              model: modelsFT.CuentaBancariaEstado,
              required: true,
              as: "cuentabancariaestado_cuenta_bancaria_estado",
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

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariaByIdempresacuentabancaria = async (transaction, idempresacuentabancaria) => {
  try {
    const empresacuentabancaria = await modelsFT.EmpresaCuentaBancaria.findByPk(idempresacuentabancaria, { transaction });

    //const empresacuentabancarias = await empresacuentabancaria.getEmpresacuentabancarias();

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariaByEmpresacuentabancariaid = async (transaction, empresacuentabancariaid) => {
  try {
    const empresacuentabancaria = await modelsFT.EmpresaCuentaBancaria.findOne({
      where: {
        empresacuentabancariaid: empresacuentabancariaid,
      },
      transaction,
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findEmpresacuentabancariaPk = async (transaction, empresacuentabancariaid) => {
  try {
    const empresacuentabancaria = await modelsFT.EmpresaCuentaBancaria.findOne({
      attributes: ["_idempresacuentabancaria"],
      where: {
        empresacuentabancariaid: empresacuentabancariaid,
      },
      transaction,
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertEmpresacuentabancaria = async (transaction, empresacuentabancaria) => {
  try {
    const empresacuentabancaria_nuevo = await modelsFT.EmpresaCuentaBancaria.create(empresacuentabancaria, { transaction });

    return empresacuentabancaria_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateEmpresacuentabancaria = async (transaction, empresacuentabancaria) => {
  try {
    const result = await modelsFT.EmpresaCuentaBancaria.update(empresacuentabancaria, {
      where: {
        empresacuentabancariaid: empresacuentabancaria.empresacuentabancariaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteEmpresacuentabancaria = async (transaction, empresacuentabancaria) => {
  try {
    const result = await modelsFT.EmpresaCuentaBancaria.update(empresacuentabancaria, {
      where: {
        empresacuentabancariaid: empresacuentabancaria.empresacuentabancariaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
