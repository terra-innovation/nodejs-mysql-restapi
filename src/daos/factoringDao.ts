import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getFactoringsOportunidades = async (transaction, _idfactoringestados, estados) => {
  try {
    const factorings = await modelsFT.Factoring.findAll({
      include: [
        {
          model: modelsFT.Empresa,
          as: "aceptante_empresa",
        },
        {
          model: modelsFT.Moneda,
          as: "moneda_moneda",
        },
        {
          model: modelsFT.FactoringPropuesta,
          as: "factoringpropuestaaceptada_factoring_propuestum",
          include: [
            {
              model: modelsFT.FactoringTipo,
              as: "factoringtipo_factoring_tipo",
            },
            {
              model: modelsFT.Riesgo,
              as: "riesgooperacion_riesgo",
            },
          ],
        },
      ],
      where: {
        _idfactoringestado: {
          [Op.in]: _idfactoringestados,
        },
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsByIdfactoringestado = async (transaction, _idfactoringestados, estados) => {
  try {
    const factorings = await modelsFT.Factoring.findAll({
      include: [
        {
          all: true,
        },
        {
          model: modelsFT.FactoringPropuesta,
          as: "factoringpropuestaaceptada_factoring_propuestum",
          include: [
            {
              model: modelsFT.FactoringTipo,
              as: "factoringtipo_factoring_tipo",
            },
          ],
        },
        {
          model: modelsFT.FactoringPropuesta,
          as: "factoring_propuesta",
          include: [
            {
              model: modelsFT.FactoringPropuestaEstado,
              as: "factoringpropuestaestado_factoring_propuesta_estado",
            },
          ],
        },
        {
          model: modelsFT.CuentaBancaria,
          as: "cuentabancaria_cuenta_bancarium",
          include: [
            {
              model: modelsFT.Banco,
              as: "banco_banco",
            },
            {
              model: modelsFT.CuentaBancariaEstado,
              as: "cuentabancariaestado_cuenta_bancaria_estado",
            },
            {
              model: modelsFT.CuentaTipo,
              as: "cuentatipo_cuenta_tipo",
            },
            {
              model: modelsFT.Moneda,
              as: "moneda_moneda",
            },
          ],
        },
      ],
      where: {
        _idfactoringestado: {
          [Op.in]: _idfactoringestados,
        },
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsByIdcedentes = async (transaction, _idcedentes, estados) => {
  try {
    const factorings = await modelsFT.Factoring.findAll({
      include: [
        {
          all: true,
        },
        {
          model: modelsFT.FactoringPropuesta,
          as: "factoringpropuestaaceptada_factoring_propuestum",
          include: [
            {
              model: modelsFT.FactoringTipo,
              as: "factoringtipo_factoring_tipo",
            },
          ],
        },
        {
          model: modelsFT.FactoringPropuesta,
          as: "factoring_propuesta",
          include: [
            {
              model: modelsFT.FactoringPropuestaEstado,
              as: "factoringpropuestaestado_factoring_propuesta_estado",
            },
          ],
        },
        {
          model: modelsFT.CuentaBancaria,
          as: "cuentabancaria_cuenta_bancarium",
          include: [
            {
              model: modelsFT.Banco,
              as: "banco_banco",
            },
            {
              model: modelsFT.CuentaBancariaEstado,
              as: "cuentabancariaestado_cuenta_bancaria_estado",
            },
            {
              model: modelsFT.CuentaTipo,
              as: "cuentatipo_cuenta_tipo",
            },
            {
              model: modelsFT.Moneda,
              as: "moneda_moneda",
            },
          ],
        },
      ],
      where: {
        _idcedente: {
          [Op.in]: _idcedentes,
        },
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByRucCedenteAndCodigoFactura = async (transaction, ruc_cedente, factura_serie, factura_numero, estados) => {
  try {
    const factoring = await modelsFT.Factoring.findOne({
      include: [
        {
          model: modelsFT.Empresa,
          required: true,
          as: "cedente_empresa",
          where: {
            ruc: ruc_cedente,
          },
        },

        {
          model: modelsFT.Factura,
          required: true,
          as: "factura_factura_factoring_facturas",
          where: {
            serie: factura_serie,
            numero_comprobante: factura_numero,
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
    return factoring;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByFactoringidAndIdcontactocedente = async (transaction, factoringid, idcontactocedete, estados) => {
  try {
    const factoring = await modelsFT.Factoring.findOne({
      include: [
        {
          all: true,
        },
      ],
      where: {
        _idcontactocedente: idcontactocedete,
        factoringid: factoringid,
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });
    //log.debug(line(),"factoring: ", factoring);
    return factoring;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsCotizacionesByIdcontactocedente = async (transaction, idcontactocedete, estados) => {
  try {
    const factorings = await modelsFT.Factoring.findAll({
      include: [
        {
          all: true,
        },
      ],
      where: {
        estado: {
          [Op.in]: estados,
        },
        _idcontactocedente: idcontactocedete,
      },
      transaction,
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsByEstados = async (transaction, estados) => {
  try {
    const factorings = await modelsFT.Factoring.findAll({
      include: [
        {
          all: true,
        },
        {
          model: modelsFT.FactoringPropuesta,
          as: "factoringpropuestaaceptada_factoring_propuestum",
          include: [
            {
              model: modelsFT.FactoringTipo,
              as: "factoringtipo_factoring_tipo",
            },
          ],
        },
        {
          model: modelsFT.FactoringPropuesta,
          as: "factoring_propuesta",
          include: [
            {
              model: modelsFT.FactoringPropuestaEstado,
              as: "factoringpropuestaestado_factoring_propuesta_estado",
            },
          ],
        },
        {
          model: modelsFT.CuentaBancaria,
          as: "cuentabancaria_cuenta_bancarium",
          include: [
            {
              model: modelsFT.Banco,
              as: "banco_banco",
            },
            {
              model: modelsFT.CuentaBancariaEstado,
              as: "cuentabancariaestado_cuenta_bancaria_estado",
            },
            {
              model: modelsFT.CuentaTipo,
              as: "cuentatipo_cuenta_tipo",
            },
            {
              model: modelsFT.Moneda,
              as: "moneda_moneda",
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

    return factorings;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByIdfactoring = async (transaction, idfactoring) => {
  try {
    const factoring = await modelsFT.Factoring.findByPk(idfactoring, {
      include: [
        {
          all: true,
        },
        {
          model: modelsFT.FactoringPropuesta,
          as: "factoring_propuesta",
          include: [
            {
              model: modelsFT.FactoringPropuestaEstado,
              as: "factoringpropuestaestado_factoring_propuesta_estado",
            },
          ],
        },
        {
          model: modelsFT.CuentaBancaria,
          as: "cuentabancaria_cuenta_bancarium",
          include: [
            {
              model: modelsFT.Banco,
              as: "banco_banco",
            },
            {
              model: modelsFT.CuentaBancariaEstado,
              as: "cuentabancariaestado_cuenta_bancaria_estado",
            },
            {
              model: modelsFT.CuentaTipo,
              as: "cuentatipo_cuenta_tipo",
            },
            {
              model: modelsFT.Moneda,
              as: "moneda_moneda",
            },
          ],
        },
      ],
      transaction,
    });

    return factoring;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByFactoringid = async (transaction, factoringid) => {
  try {
    const factoring = await modelsFT.Factoring.findOne({
      include: [
        {
          all: true,
        },
      ],
      where: {
        factoringid: factoringid,
      },
      transaction,
    });
    //log.debug(line(),"factoring: ", factoring);
    return factoring;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringPk = async (transaction, factoringid) => {
  try {
    const factoring = await modelsFT.Factoring.findOne({
      attributes: ["_idfactoring"],
      where: {
        factoringid: factoringid,
      },
      transaction,
    });

    return factoring;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoring = async (transaction, factoring) => {
  try {
    const factoring_nuevo = await modelsFT.Factoring.create(factoring, { transaction });

    return factoring_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoring = async (transaction, factoring) => {
  try {
    const result = await modelsFT.Factoring.update(factoring, {
      where: {
        factoringid: factoring.factoringid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoring = async (transaction, factoring) => {
  try {
    const result = await modelsFT.Factoring.update(factoring, {
      where: {
        factoringid: factoring.factoringid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactoring = async (transaction, factoring) => {
  try {
    const result = await modelsFT.Factoring.update(factoring, {
      where: {
        factoringid: factoring.factoringid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
