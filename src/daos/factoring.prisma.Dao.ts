import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFactoringsOportunidades = async (tx: TxClient, idfactoringestados, estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
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
        idfactoringestado: {
          in: idfactoringestados,
        },
        estado: {
          in: estados,
        },
      },
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsByIdfactoringestado = async (tx: TxClient, idfactoringestados, estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
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
        idfactoringestado: {
          in: idfactoringestados,
        },
        estado: {
          in: estados,
        },
      },
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsByIdcedentes = async (tx: TxClient, idcedentes, estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
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
        idcedente: {
          in: idcedentes,
        },
        estado: {
          in: estados,
        },
      },
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByRucCedenteAndCodigoFactura = async (tx: TxClient, ruc_cedente, factura_serie, factura_numero, estados: number[]) => {
  try {
    const factoring = await tx.factoring.findFirst({
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
          in: estados,
        },
      },
    });
    return factoring;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByFactoringidAndIdcontactocedente = async (tx: TxClient, factoringid, idcontactocedete, estados: number[]) => {
  try {
    const factoring = await tx.factoring.findFirst({
      include: [
        {
          all: true,
        },
      ],
      where: {
        idcontactocedente: idcontactocedete,
        factoringid: factoringid,
        estado: {
          in: estados,
        },
      },
    });
    //log.debug(line(),"factoring: ", factoring);
    return factoring;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsCotizacionesByIdcontactocedente = async (tx: TxClient, idcontactocedete, estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
      include: [
        {
          all: true,
        },
      ],
      where: {
        estado: {
          in: estados,
        },
        idcontactocedente: idcontactocedete,
      },
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsByEstados = async (tx: TxClient, estados: number[]): Promise<factoring[]> => {
  try {
    const factorings = await tx.factoring.findMany({
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
          in: estados,
        },
      },
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByIdfactoring = async (tx: TxClient, idfactoring: number): Promise<factoring> => {
  try {
    const factoring = await tx.factoring.findByPk(idfactoring, {
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
    });

    return factoring;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByFactoringid = async (tx: TxClient, factoringid: string): Promise<factoring> => {
  try {
    const factoring = await tx.factoring.findFirst({
      include: [
        {
          all: true,
        },
      ],
      where: {
        factoringid: factoringid,
      },
    });
    //log.debug(line(),"factoring: ", factoring);
    return factoring;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringPk = async (tx: TxClient, factoringid: string): Promise<{ idfactoring: number }> => {
  try {
    const factoring = await tx.factoring.findFirst({
      select: { idfactoring: true },
      where: {
        factoringid: factoringid,
      },
    });

    return factoring;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoring = async (tx: TxClient, factoring: Prisma.factoringCreateInput): Promise<factoring> => {
  try {
    const nuevo = await tx.factoring.create({ data: factoring });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoring = async (tx: TxClient, factoring: Partial<factoring>): Promise<factoring> => {
  try {
    const result = await tx.factoring.update({
      data: factoring,
      where: {
        factoringid: factoring.factoringid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoring = async (tx: TxClient, factoring: Partial<factoring>): Promise<factoring> => {
  try {
    const result = await tx.factoring.update({
      data: factoring,
      where: {
        factoringid: factoring.factoringid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactoring = async (tx: TxClient, factoring: Partial<factoring>): Promise<factoring> => {
  try {
    const result = await tx.factoring.update({
      data: factoring,
      where: {
        factoringid: factoring.factoringid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
