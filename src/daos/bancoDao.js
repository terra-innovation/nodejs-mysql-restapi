import { ClientError } from "../utils/CustomErrors.js";

export const getBancosActivas = async (req) => {
  try {
    const { models } = req.app.locals;
    const bancos = await models.Banco.findAll({
      where: {
        estado: 1,
      },
    });
    //console.log(bancos);
    return bancos;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getBancoByIdbanco = async (req, idbanco) => {
  try {
    const { models } = req.app.locals;

    const banco = await models.Banco.findByPk(idbanco, {});
    console.log(banco);

    //const bancos = await banco.getBancos();
    //console.log(bancos);

    return banco;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getBancoByBancoid = async (req, bancoid) => {
  try {
    const { models } = req.app.locals;
    const banco = await models.Banco.findOne({
      where: {
        bancoid: bancoid,
      },
    });
    //console.log(banco);
    return banco;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findBancoPk = async (req, bancoid) => {
  try {
    const { models } = req.app.locals;
    const banco = await models.Banco.findOne({
      attributes: ["_idbanco"],
      where: {
        bancoid: bancoid,
      },
      raw: true,
    });
    //console.log(banco);
    return banco;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertBanco = async (req, banco) => {
  try {
    const { models } = req.app.locals;
    const banco_nuevo = await models.Banco.create(banco);
    // console.log(banco_nuevo);
    return banco_nuevo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateBanco = async (req, banco) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Banco.update(banco, {
      where: {
        bancoid: banco.bancoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteBanco = async (req, banco) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Banco.update(banco, {
      where: {
        bancoid: banco.bancoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
