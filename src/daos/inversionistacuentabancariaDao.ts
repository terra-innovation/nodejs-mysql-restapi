import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getInversionistacuentabancariaByIdinversionistaAndIdusuario = async (transaction, _idinversionista, _idusuario, estados) => {
  try {
    const empresacuentabancaria = await modelsFT.InversionistaCuentaBancaria.findOne({
      include: [
        {
          model: modelsFT.Inversionista,
          required: true,
          as: "inversionista_inversionistum",
          where: {
            _idinversionista: _idinversionista,
          },
          include: [
            {
              model: modelsFT.Persona,
              required: true,
              as: "persona_persona",
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

export const getInversionistacuentabancariasByIdusuario = async (transaction, _idusuario, estados) => {
  try {
    const empresacuentabancaria = await modelsFT.InversionistaCuentaBancaria.findAll({
      include: [
        {
          model: modelsFT.Inversionista,
          required: true,
          as: "inversionista_inversionistum",
          include: [
            {
              model: modelsFT.Persona,
              required: true,
              as: "persona_persona",
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

export const getInversionistacuentabancariasByIdinversionistaAndAlias = async (transaction, _idinversionista, alias, estados) => {
  try {
    const empresacuentabancaria = await modelsFT.InversionistaCuentaBancaria.findAll({
      include: [
        {
          model: modelsFT.Inversionista,
          required: true,
          as: "inversionista_inversionistum",
          where: {
            _idinversionista: _idinversionista,
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

export const getInversionistacuentabancarias = async (transaction, estados) => {
  try {
    const inversionistacuentabancarias = await modelsFT.InversionistaCuentaBancaria.findAll({
      include: [
        {
          model: modelsFT.Inversionista,
          required: true,
          as: "inversionista_inversionistum",
          include: [
            {
              model: modelsFT.Persona,
              required: true,
              as: "persona_persona",
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

    return inversionistacuentabancarias;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistacuentabancariaByIdinversionistacuentabancaria = async (transaction, idinversionistacuentabancaria) => {
  try {
    const inversionistacuentabancaria = await modelsFT.InversionistaCuentaBancaria.findByPk(idinversionistacuentabancaria, { transaction });

    return inversionistacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistacuentabancariaByInversionistacuentabancariaid = async (transaction, inversionistacuentabancariaid) => {
  try {
    const inversionistacuentabancaria = await modelsFT.InversionistaCuentaBancaria.findOne({
      where: {
        inversionistacuentabancariaid: inversionistacuentabancariaid,
      },
      transaction,
    });

    return inversionistacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findInversionistacuentabancariaPk = async (transaction, inversionistacuentabancariaid) => {
  try {
    const inversionistacuentabancaria = await modelsFT.InversionistaCuentaBancaria.findOne({
      attributes: ["_idinversionistacuentabancaria"],
      where: {
        inversionistacuentabancariaid: inversionistacuentabancariaid,
      },
      transaction,
    });

    return inversionistacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertInversionistacuentabancaria = async (transaction, inversionistacuentabancaria) => {
  try {
    const inversionistacuentabancaria_nuevo = await modelsFT.InversionistaCuentaBancaria.create(inversionistacuentabancaria, { transaction });

    return inversionistacuentabancaria_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateInversionistacuentabancaria = async (transaction, inversionistacuentabancaria) => {
  try {
    const result = await modelsFT.InversionistaCuentaBancaria.update(inversionistacuentabancaria, {
      where: {
        inversionistacuentabancariaid: inversionistacuentabancaria.inversionistacuentabancariaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteInversionistacuentabancaria = async (transaction, inversionistacuentabancaria) => {
  try {
    const result = await modelsFT.InversionistaCuentaBancaria.update(inversionistacuentabancaria, {
      where: {
        inversionistacuentabancariaid: inversionistacuentabancaria.inversionistacuentabancariaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateInversionistacuentabancaria = async (transaction, inversionistacuentabancaria) => {
  try {
    const result = await modelsFT.InversionistaCuentaBancaria.update(inversionistacuentabancaria, {
      where: {
        inversionistacuentabancariaid: inversionistacuentabancaria.inversionistacuentabancariaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
