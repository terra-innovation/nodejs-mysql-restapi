import { ClientError } from "../utils/CustomErrors.js";

export const getFactoringtiposActivas = async (req) => {
  try {
    const { models } = req.app.locals;
    const factoringtipos = await models.FactoringTipo.findAll({
      where: {
        estado: 1,
      },
    });
    //console.log(factoringtipos);
    return factoringtipos;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtipoByIdfactoringtipo = async (req, idfactoringtipo) => {
  try {
    const { models } = req.app.locals;

    const factoringtipo = await models.FactoringTipo.findByPk(idfactoringtipo, {});
    console.log(factoringtipo);

    //const factoringtipos = await factoringtipo.getFactoringtipos();
    //console.log(factoringtipos);

    return factoringtipo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtipoByFactoringtipoid = async (req, factoringtipoid) => {
  try {
    const { models } = req.app.locals;
    const factoringtipo = await models.FactoringTipo.findOne({
      where: {
        factoringtipoid: factoringtipoid,
      },
    });
    //console.log(factoringtipo);
    return factoringtipo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringtipoPk = async (req, factoringtipoid) => {
  try {
    const { models } = req.app.locals;
    const factoringtipo = await models.FactoringTipo.findOne({
      attributes: ["_idfactoringtipo"],
      where: {
        factoringtipoid: factoringtipoid,
      },
      raw: true,
    });
    //console.log(factoringtipo);
    return factoringtipo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringtipo = async (req, factoringtipo) => {
  try {
    const { models } = req.app.locals;
    const factoringtipo_nuevo = await models.FactoringTipo.create(factoringtipo);
    // console.log(factoringtipo_nuevo);
    return factoringtipo_nuevo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringtipo = async (req, factoringtipo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.FactoringTipo.update(factoringtipo, {
      where: {
        factoringtipoid: factoringtipo.factoringtipoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringtipo = async (req, factoringtipo) => {
  try {
    const { models } = req.app.locals;
    const result = await models.FactoringTipo.update(factoringtipo, {
      where: {
        factoringtipoid: factoringtipo.factoringtipoid,
      },
    });
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
