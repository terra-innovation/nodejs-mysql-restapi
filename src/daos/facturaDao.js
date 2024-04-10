import { ClientError } from "../utils/CustomErrors.js";

export const getFacturasActivas = async (req) => {
  try {
    const { models } = req.app.locals;
    const facturas = await models.Factura.findAll({
      where: {
        estado: 1,
      },
    });
    //console.log(facturas);
    return facturas;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaByIdfactura = async (req, idfactura) => {
  try {
    const { models } = req.app.locals;

    const factura = await models.Factura.findByPk(idfactura, {});
    console.log(factura);

    //const facturas = await factura.getFacturas();
    //console.log(facturas);

    return factura;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFacturaByFacturaid = async (req, facturaid) => {
  try {
    const { models } = req.app.locals;
    const factura = await models.Factura.findOne({
      where: {
        facturaid: facturaid,
      },
    });
    //console.log(factura);
    return factura;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFacturaPk = async (req, facturaid) => {
  try {
    const { models } = req.app.locals;
    const factura = await models.Factura.findOne({
      attributes: ["_idfactura"],
      where: {
        facturaid: facturaid,
      },
      raw: true,
    });
    //console.log(factura);
    return factura;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactura = async (req, factura) => {
  try {
    const { models } = req.app.locals;
    const factura_nuevo = await models.Factura.create(factura);
    // console.log(factura_nuevo);
    return factura_nuevo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactura = async (req, factura) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Factura.update(factura, {
      where: {
        facturaid: factura.facturaid,
      },
    });
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactura = async (req, factura) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Factura.update(factura, {
      where: {
        facturaid: factura.facturaid,
      },
    });
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
