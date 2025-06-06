import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getCuentasbancariasByIdempresaAndAlias = async (transaction, idempresa, alias, estado) => {
  try {
    const cuentasbancarias = await modelsFT.CuentaBancaria.findAll({
      include: [
        {
          model: modelsFT.EmpresaCuentaBancaria,
          required: true,
          as: "empresa_cuenta_bancaria",
          where: {
            _idempresa: idempresa,
          },
        },
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
          [Op.in]: estado,
        },
      },
      transaction,
    });

    return cuentasbancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancariasByIdbancoAndNumero = async (transaction, idbanco, numero, estado) => {
  try {
    const cuentasbancarias = await modelsFT.CuentaBancaria.findAll({
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
        _idbanco: idbanco,
        numero: numero,
        estado: {
          [Op.in]: estado,
        },
      },
      transaction,
    });

    return cuentasbancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancariasByIdusuarioAndAlias = async (transaction, idusuario, alias, estado) => {
  try {
    const cuentasbancarias = await modelsFT.CuentaBancaria.findAll({
      include: [
        {
          model: modelsFT.EmpresaCuentaBancaria,
          required: true,
          as: "empresa_cuenta_bancaria",
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
                    _idusuario: idusuario,
                  },
                },
              ],
            },
          ],
        },
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
          [Op.in]: estado,
        },
      },
      transaction,
    });

    return cuentasbancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancariasByIdusuario = async (transaction, idusuario, estado) => {
  try {
    const cuentasbancarias = await modelsFT.CuentaBancaria.findAll({
      include: [
        {
          model: modelsFT.EmpresaCuentaBancaria,
          required: true,
          as: "empresa_cuenta_bancaria",
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
                    _idusuario: idusuario,
                  },
                },
              ],
            },
          ],
        },
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
        estado: {
          [Op.in]: estado,
        },
      },
      transaction,
    });

    return cuentasbancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentabancariaByIdcuentabancaria = async (transaction, idcuentabancaria) => {
  try {
    const cuentabancaria = await modelsFT.CuentaBancaria.findByPk(idcuentabancaria, { transaction });

    return cuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancariasByEmpresaidAndMoneda = async (transaction, empresaid, monedaid, _idcuentabancariaestado, estado) => {
  try {
    const cuentasbancarias = await modelsFT.CuentaBancaria.findAll({
      include: [
        {
          model: modelsFT.Empresa,
          as: "empresa_empresa",
          where: {
            empresaid: empresaid,
          },
        },
        {
          model: modelsFT.Banco,
          as: "banco_banco",
        },
        {
          model: modelsFT.Moneda,
          as: "moneda_moneda",
          where: {
            monedaid: monedaid,
          },
        },
        {
          model: modelsFT.CuentaTipo,
          as: "cuentatipo_cuenta_tipo",
        },
        {
          model: modelsFT.CuentaBancariaEstado,
          as: "cuentabancariaestado_cuenta_bancaria_estado",
        },
      ],
      where: {
        _idcuentabancariaestado: {
          [Op.in]: _idcuentabancariaestado,
        },
        estado: {
          [Op.in]: estado,
        },
      },
      transaction,
    });

    return cuentasbancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentabancariaByIdcuentabancariaIdempresaIdusuario = async (transaction, _idcuentabancaria, _idempresa, _idusuario) => {
  try {
    const cuentabancaria = await modelsFT.CuentaBancaria.findOne({
      include: [
        {
          model: modelsFT.EmpresaCuentaBancaria,
          required: true,
          as: "empresa_cuenta_bancaria",
          include: [
            {
              model: modelsFT.Empresa,
              required: true,
              as: "empresa_empresa",
              where: {
                _idempresa: _idempresa,
              },
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
          ],
        },
        {
          model: modelsFT.Banco,
          as: "banco_banco",
        },
        {
          model: modelsFT.Moneda,
          as: "moneda_moneda",
        },
        {
          model: modelsFT.CuentaTipo,
          as: "cuentatipo_cuenta_tipo",
        },
        {
          model: modelsFT.CuentaBancariaEstado,
          as: "cuentabancariaestado_cuenta_bancaria_estado",
        },
      ],
      where: {
        _idcuentabancaria: _idcuentabancaria,
      },
      transaction,
    });
    //log.debug(line(), cuentabancaria);
    return cuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentabancariaByCuentabancariaid = async (transaction, cuentabancariaid) => {
  try {
    const cuentabancaria = await modelsFT.CuentaBancaria.findOne({
      include: [
        {
          model: modelsFT.EmpresaCuentaBancaria,
          required: true,
          as: "empresa_cuenta_bancaria",
          include: [
            {
              model: modelsFT.Empresa,
              required: true,
              as: "empresa_empresa",
            },
          ],
        },
        {
          model: modelsFT.Banco,
          as: "banco_banco",
        },
        {
          model: modelsFT.Moneda,
          as: "moneda_moneda",
        },
        {
          model: modelsFT.CuentaTipo,
          as: "cuentatipo_cuenta_tipo",
        },
        {
          model: modelsFT.CuentaBancariaEstado,
          as: "cuentabancariaestado_cuenta_bancaria_estado",
        },
      ],
      where: {
        cuentabancariaid: cuentabancariaid,
      },
      transaction,
    });
    //log.debug(line(), cuentabancaria);
    return cuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCuentabancariaPk = async (transaction, cuentabancariaid) => {
  try {
    const cuentabancaria = await modelsFT.CuentaBancaria.findOne({
      attributes: ["_idcuentabancaria"],
      where: {
        cuentabancariaid: cuentabancariaid,
      },
      transaction,
    });

    return cuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancarias = async (transaction, estado) => {
  try {
    const cuentasbancarias = await modelsFT.CuentaBancaria.findAll({
      include: [
        {
          model: modelsFT.Empresa,
          required: true,
          as: "empresa_empresa",
        },
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
        estado: {
          [Op.in]: estado,
        },
      },
      transaction,
    });

    return cuentasbancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentabancaria = async (transaction, cuentabancaria) => {
  try {
    const cuentabancaria_nuevo = await modelsFT.CuentaBancaria.create(cuentabancaria, { transaction });

    return cuentabancaria_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentabancariaOnlyAliasByCuentabancariaid = async (transaction, cuentabancaria) => {
  try {
    const result = await modelsFT.CuentaBancaria.update(
      { alias: cuentabancaria.alias, idusuariomod: cuentabancaria.idusuariomod, fechamod: cuentabancaria.fechamod },
      {
        where: {
          cuentabancariaid: cuentabancaria.cuentabancariaid,
        },
        transaction,
      }
    );
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentabancaria = async (transaction, cuentabancaria) => {
  try {
    const result = await modelsFT.CuentaBancaria.update(cuentabancaria, {
      where: {
        cuentabancariaid: cuentabancaria.cuentabancariaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCuentabancaria = async (transaction, cuentabancaria) => {
  try {
    const result = await modelsFT.CuentaBancaria.update(cuentabancaria, {
      where: {
        cuentabancariaid: cuentabancaria.cuentabancariaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateCuentabancaria = async (transaction, cuentabancaria) => {
  try {
    const result = await modelsFT.CuentaBancaria.update(cuentabancaria, {
      where: {
        cuentabancariaid: cuentabancaria.cuentabancariaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
