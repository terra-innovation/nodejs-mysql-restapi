import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getCuentasbancariasByIdbancoAndNumero = async (req, idbanco, numero, estado) => {
  try {
    const { models } = req.app.locals;
    const cuentasbancarias = await models.CuentaBancaria.findAll({
      include: [
        {
          model: models.Empresa,
          required: true,
          as: "empresa_empresa",
        },
        {
          model: models.Banco,
          required: true,
          as: "banco_banco",
        },
        {
          model: models.Moneda,
          required: true,
          as: "moneda_moneda",
        },
        {
          model: models.CuentaTipo,
          required: true,
          as: "cuentatipo_cuenta_tipo",
        },
        {
          model: models.CuentaBancariaEstado,
          required: true,
          as: "cuentabancariaestado_cuenta_bancaria_estado",
        },
      ],
      where: {
        _idbanco: idbanco,
        numero: numero,
        estado: {
          [Sequelize.Op.in]: estado,
        },
      },
    });
    //logger.info(line(),cuentasbancarias);
    return cuentasbancarias;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancariasByIdusuarioAndAlias = async (req, idusuario, alias, estado) => {
  try {
    const { models } = req.app.locals;
    const cuentasbancarias = await models.CuentaBancaria.findAll({
      include: [
        {
          model: models.Empresa,
          required: true,
          as: "empresa_empresa",
          include: [
            {
              model: models.UsuarioEmpresa,
              required: true,
              as: "usuario_empresas",
              where: {
                _idusuario: idusuario,
              },
            },
          ],
        },
        {
          model: models.Banco,
          required: true,
          as: "banco_banco",
        },
        {
          model: models.Moneda,
          required: true,
          as: "moneda_moneda",
        },
        {
          model: models.CuentaTipo,
          required: true,
          as: "cuentatipo_cuenta_tipo",
        },
        {
          model: models.CuentaBancariaEstado,
          required: true,
          as: "cuentabancariaestado_cuenta_bancaria_estado",
        },
      ],
      where: {
        alias: alias,
        estado: {
          [Sequelize.Op.in]: estado,
        },
      },
    });
    //logger.info(line(),cuentasbancarias);
    return cuentasbancarias;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancariasByIdusuario = async (req, idusuario, estado) => {
  try {
    const { models } = req.app.locals;
    const cuentasbancarias = await models.CuentaBancaria.findAll({
      include: [
        {
          model: models.Empresa,
          required: true,
          as: "empresa_empresa",
          include: [
            {
              model: models.UsuarioEmpresa,
              required: true,
              as: "usuario_empresas",
              where: {
                _idusuario: idusuario,
              },
            },
          ],
        },
        {
          model: models.Banco,
          required: true,
          as: "banco_banco",
        },
        {
          model: models.Moneda,
          required: true,
          as: "moneda_moneda",
        },
        {
          model: models.CuentaTipo,
          required: true,
          as: "cuentatipo_cuenta_tipo",
        },
        {
          model: models.CuentaBancariaEstado,
          required: true,
          as: "cuentabancariaestado_cuenta_bancaria_estado",
        },
      ],
      where: {
        estado: {
          [Sequelize.Op.in]: estado,
        },
      },
    });
    //logger.info(line(),cuentasbancarias);
    return cuentasbancarias;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentabancariaByIdcuentabancaria = async (req, idcuentabancaria) => {
  try {
    const { models } = req.app.locals;

    const cuentabancaria = await models.CuentaBancaria.findByPk(idcuentabancaria, {});
    logger.info(line(), cuentabancaria);

    //const cuentasbancarias = await cuentabancaria.getCuentabancarias();
    //logger.info(line(),cuentasbancarias);

    return cuentabancaria;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancariasByEmpresaidAndMoneda = async (req, empresaid, monedaid, _idcuentabancariaestado, estado) => {
  try {
    const { models } = req.app.locals;
    const cuentasbancarias = await models.CuentaBancaria.findAll({
      include: [
        {
          model: models.Empresa,
          as: "empresa_empresa",
          where: {
            empresaid: empresaid,
          },
        },
        {
          model: models.Banco,
          as: "banco_banco",
        },
        {
          model: models.Moneda,
          as: "moneda_moneda",
          where: {
            monedaid: monedaid,
          },
        },
        {
          model: models.CuentaTipo,
          as: "cuentatipo_cuenta_tipo",
        },
        {
          model: models.CuentaBancariaEstado,
          as: "cuentabancariaestado_cuenta_bancaria_estado",
        },
      ],
      where: {
        _idcuentabancariaestado: {
          [Sequelize.Op.in]: _idcuentabancariaestado,
        },
        estado: {
          [Sequelize.Op.in]: estado,
        },
      },
    });
    //logger.info(line(),cuentasbancarias);
    return cuentasbancarias;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentabancariaByCuentabancariaid = async (req, cuentabancariaid) => {
  try {
    const { models } = req.app.locals;
    const cuentabancaria = await models.CuentaBancaria.findOne({
      include: [
        {
          model: models.Empresa,
          as: "empresa_empresa",
        },
        {
          model: models.Banco,
          as: "banco_banco",
        },
        {
          model: models.Moneda,
          as: "moneda_moneda",
        },
        {
          model: models.CuentaTipo,
          as: "cuentatipo_cuenta_tipo",
        },
        {
          model: models.CuentaBancariaEstado,
          as: "cuentabancariaestado_cuenta_bancaria_estado",
        },
      ],
      where: {
        cuentabancariaid: cuentabancariaid,
      },
    });
    logger.info(line(), cuentabancaria);
    return cuentabancaria;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCuentabancariaPk = async (req, cuentabancariaid) => {
  try {
    const { models } = req.app.locals;
    const cuentabancaria = await models.CuentaBancaria.findOne({
      attributes: ["_idcuentabancaria"],
      where: {
        cuentabancariaid: cuentabancariaid,
      },
    });
    //logger.info(line(),cuentabancaria);
    return cuentabancaria;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancarias = async (req, estado) => {
  try {
    const { models } = req.app.locals;
    const cuentasbancarias = await models.CuentaBancaria.findAll({
      include: [
        {
          model: models.Empresa,
          required: true,
          as: "empresa_empresa",
        },
        {
          model: models.Banco,
          required: true,
          as: "banco_banco",
        },
        {
          model: models.Moneda,
          required: true,
          as: "moneda_moneda",
        },
        {
          model: models.CuentaTipo,
          required: true,
          as: "cuentatipo_cuenta_tipo",
        },
        {
          model: models.CuentaBancariaEstado,
          required: true,
          as: "cuentabancariaestado_cuenta_bancaria_estado",
        },
      ],
      where: {
        estado: {
          [Sequelize.Op.in]: estado,
        },
      },
    });
    //logger.info(line(),cuentasbancarias);
    return cuentasbancarias;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentabancaria = async (req, cuentabancaria) => {
  try {
    const { models } = req.app.locals;
    const cuentabancaria_nuevo = await models.CuentaBancaria.create(cuentabancaria);
    // logger.info(line(),cuentabancaria_nuevo);
    return cuentabancaria_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentabancariaOnlyAliasByCuentabancariaid = async (req, cuentabancaria) => {
  try {
    const { models } = req.app.locals;
    const result = await models.CuentaBancaria.update(
      { alias: cuentabancaria.alias, idusuariomod: cuentabancaria.idusuariomod, fechamod: cuentabancaria.fechamod },
      {
        where: {
          cuentabancariaid: cuentabancaria.cuentabancariaid,
        },
      }
    );
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentabancaria = async (req, cuentabancaria) => {
  try {
    const { models } = req.app.locals;
    const result = await models.CuentaBancaria.update(cuentabancaria, {
      where: {
        cuentabancariaid: cuentabancaria.cuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCuentabancaria = async (req, cuentabancaria) => {
  try {
    const { models } = req.app.locals;
    const result = await models.CuentaBancaria.update(cuentabancaria, {
      where: {
        cuentabancariaid: cuentabancaria.cuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateCuentabancaria = async (req, cuentabancaria) => {
  try {
    const { models } = req.app.locals;
    const result = await models.CuentaBancaria.update(cuentabancaria, {
      where: {
        cuentabancariaid: cuentabancaria.cuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
