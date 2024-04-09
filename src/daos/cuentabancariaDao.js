import { ClientError } from "../utils/CustomErrors.js";

export const getCuentasbancariasActivas = async (req) => {
  try {
    const { models } = req.app.locals;
    const cuentasbancarias = await models.CuentaBancaria.findAll({
      include: [
        {
          model: models.Empresa,
        },
        {
          model: models.Banco,
        },
        {
          model: models.Moneda,
        },
        {
          model: models.CuentaTipo,
        },
        {
          model: models.CuentaBancariaEstado,
        },
      ],
      where: {
        estado: 1,
      },
    });
    //console.log(cuentasbancarias);
    return cuentasbancarias;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentabancariaByIdcuentabancaria = async (req, idcuentabancaria) => {
  try {
    const { models } = req.app.locals;

    const cuentabancaria = await models.CuentaBancaria.findByPk(idcuentabancaria, {});
    console.log(cuentabancaria);

    //const cuentasbancarias = await cuentabancaria.getCuentabancarias();
    //console.log(cuentasbancarias);

    return cuentabancaria;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancariasByEmpresaid = async (req, empresaid, estado) => {
  try {
    const { models } = req.app.locals;
    const cuentasbancarias = await models.CuentaBancaria.findAll({
      include: [
        {
          model: models.Empresa,
          where: {
            empresaid: empresaid,
          },
        },
        {
          model: models.Banco,
        },
        {
          model: models.Moneda,
        },
        {
          model: models.CuentaTipo,
        },
        {
          model: models.CuentaBancariaEstado,
        },
      ],
      where: {
        estado: estado,
      },
    });
    //console.log(cuentasbancarias);
    return cuentasbancarias;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
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
        },
        {
          model: models.Banco,
        },
        {
          model: models.Moneda,
        },
        {
          model: models.CuentaTipo,
        },
        {
          model: models.CuentaBancariaEstado,
        },
      ],
      where: {
        cuentabancariaid: cuentabancariaid,
      },
    });
    console.log(cuentabancaria);
    return cuentabancaria;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCuentabancariaPk = async (req, cuentabancariaid) => {
  try {
    const { models } = req.app.locals;
    const cuentabancaria = await models.CuentaBancaria.findOne({
      attributes: ["idcuentabancaria"],
      where: {
        cuentabancariaid: cuentabancariaid,
      },
      raw: true,
    });
    //console.log(cuentabancaria);
    return cuentabancaria;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentabancaria = async (req, cuentabancaria) => {
  try {
    const { models } = req.app.locals;
    const cuentabancaria_nuevo = await models.CuentaBancaria.create(cuentabancaria);
    // console.log(cuentabancaria_nuevo);
    return cuentabancaria_nuevo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
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
    console.error(error.code);
    console.error(error);
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
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
