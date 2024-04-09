import { ClientError } from "../utils/CustomErrors.js";

export const getCuentatiposActivas = async (req) => {
  try {
    const { models } = req.app.locals;
    const cuentatipos = await models.CuentaTipo.findAll({
      where: {
        estado: 1,
      },
    });
    //console.log(cuentatipos);
    return cuentatipos;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentatipoByIdcuentatipo = async (req, idcuentatipo) => {
  try {
    const { models } = req.app.locals;

    const cuentatipo = await models.CuentaTipo.findByPk(idcuentatipo, {});
    console.log(cuentatipo);

    //const cuentatipos = await cuentatipo.getCuentatipos();
    //console.log(cuentatipos);

    return cuentatipo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentatipoByCuentatipoid = async (req, cuentatipoid) => {
  try {
    const { models } = req.app.locals;
    const cuentatipo = await models.CuentaTipo.findOne({
      where: {
        cuentatipoid: cuentatipoid,
      },
    });
    //console.log(cuentatipo);
    return cuentatipo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCuentatipoPk = async (req, cuentatipoid) => {
  try {
    const { models } = req.app.locals;
    const cuentatipo = await models.CuentaTipo.findOne({
      attributes: ["_idcuentatipo"],
      where: {
        cuentatipoid: cuentatipoid,
      },
      raw: true,
    });
    //console.log(cuentatipo);
    return cuentatipo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentatipo = async (req, cuentatipo) => {
  try {
    const { models } = req.app.locals;
    const cuentatipo_nuevo = await models.CuentaTipo.create(cuentatipo);
    // console.log(cuentatipo_nuevo);
    return cuentatipo_nuevo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentatipo = async (req, cuentatipo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.CuentaTipo.update(cuentatipo, {
      where: {
        cuentatipoid: cuentatipo.cuentatipoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCuentatipo = async (req, cuentatipo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.CuentaTipo.update(cuentatipo, {
      where: {
        cuentatipoid: cuentatipo.cuentatipoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
