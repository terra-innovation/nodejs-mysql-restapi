import { ClientError } from "../utils/CustomErrors.js";

export const getFactoringsfacturasEmpresasActivas = async (req) => {
  try {
    const { models } = req.app.locals;
    const factoringsfacturasempresas = await models.FactoringFactura.findAll({
      include: [
        {
          all: true,
        },
      ],
      where: {
        estado: 1,
      },
    });
    //console.log(factoringsfacturasempresas);
    return factoringsfacturasempresas;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturaByIdfactoringfactura = async (req, idfactoringfactura) => {
  try {
    const { models } = req.app.locals;

    const factoringfactura = await models.FactoringFactura.findByPk(idfactoringfactura, {});
    console.log(factoringfactura);

    //const factoringsfacturasempresas = await factoringfactura.getFactoringsfacturasEmpresas();
    //console.log(factoringsfacturasempresas);

    return factoringfactura;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturaByFactoringfacturaid = async (req, factoringfacturaid) => {
  try {
    const { models } = req.app.locals;
    const factoringfactura = await models.FactoringFactura.findOne({
      where: {
        factoringfacturaid: factoringfacturaid,
      },
    });
    //console.log(factoringfactura);
    return factoringfactura;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringfacturaPk = async (req, factoringfacturaid) => {
  try {
    const { models } = req.app.locals;
    const factoringfactura = await models.FactoringFactura.findOne({
      attributes: ["_idfactoringfactura"],
      where: {
        factoringfacturaid: factoringfacturaid,
      },
      raw: true,
    });
    //console.log(factoringfactura);
    return factoringfactura;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringfactura = async (req, factoringfactura) => {
  try {
    const { models } = req.app.locals;
    const factoringfactura_nuevo = await models.FactoringFactura.create(factoringfactura);
    // console.log(factoringfactura_nuevo);
    return factoringfactura_nuevo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringfactura = async (req, factoringfactura) => {
  try {
    const { models } = req.app.locals;
    const result = await models.FactoringFactura.update(factoringfactura, {
      where: {
        factoringfacturaid: factoringfactura.factoringfacturaid,
      },
    });
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringfactura = async (req, factoringfactura) => {
  try {
    const { models } = req.app.locals;
    const result = await models.FactoringFactura.update(factoringfactura, {
      where: {
        factoringfacturaid: factoringfactura.factoringfacturaid,
      },
    });
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
