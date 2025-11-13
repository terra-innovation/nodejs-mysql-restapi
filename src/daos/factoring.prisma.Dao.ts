import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringByIdfactoringIdempresario = async (tx: TxClient, idfactoring: number, idempresario: number, estados: number[]) => {
  try {
    const factoring = await tx.factoring.findFirst({
      include: {
        empresa_cedente: true,
        factoring_facturas: {
          include: {
            factura: true,
          },
        },
      },
      where: {
        idfactoring: idfactoring,
        empresa_cedente: {
          usuario_servicio_empresas: {
            some: {
              idusuario: idempresario,
            },
          },
        },

        estado: {
          in: estados,
        },
      },
    });
    return factoring;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsOportunidades = async (tx: TxClient, idfactoringestados, estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
      include: {
        empresa_aceptante: true,
        factoring_propuesta_aceptada: {
          include: {
            factoring_tipo: true,
            riesgo_operacion: true,
          },
        },

        moneda: true,
      },
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsByIdfactoringestado = async (tx: TxClient, idfactoringestados, estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
      include: {
        contacto_aceptante: true,
        contacto_cedente: true,
        cuenta_bancaria: {
          include: {
            banco: true,
            cuenta_bancaria_estado: true,
            cuenta_tipo: true,
            moneda: true,
          },
        },
        empresa_aceptante: true,
        empresa_cedente: true,
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: true,
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: {
          include: {
            factoring_tipo: true,
          },
        },
        factoring_propuesta_factoringes: {
          include: {
            factoring_propuesta_estado: true,
          },
        },
        moneda: true,
      },
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsByIdcedentes = async (tx: TxClient, idcedentes: number[], estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
      include: {
        contacto_aceptante: true,
        contacto_cedente: true,
        cuenta_bancaria: {
          include: {
            banco: true,
            cuenta_bancaria_estado: true,
            cuenta_tipo: true,
            moneda: true,
          },
        },
        empresa_aceptante: true,
        empresa_cedente: true,
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: {
          include: {
            factura: true,
          },
        },
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: {
          include: {
            factoring_tipo: true,
          },
        },
        factoring_propuesta_factoringes: {
          include: {
            factoring_propuesta_estado: true,
          },
        },
        moneda: true,
      },
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByRucCedenteAndCodigoFactura = async (tx: TxClient, ruc_cedente, factura_serie, factura_numero, estados: number[]) => {
  try {
    const factoring = await tx.factoring.findFirst({
      include: {
        empresa_cedente: true,
        factoring_facturas: {
          include: {
            factura: true,
          },
        },
      },
      where: {
        empresa_cedente: {
          ruc: ruc_cedente,
        },
        factoring_facturas: {
          some: {
            factura: {
              serie: factura_serie,
              numero_comprobante: factura_numero,
            },
          },
        },
        estado: {
          in: estados,
        },
      },
    });
    return factoring;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByFactoringidAndIdcontactocedente = async (tx: TxClient, factoringid, idcontactocedete, estados: number[]) => {
  try {
    const factoring = await tx.factoring.findFirst({
      include: {
        contacto_aceptante: true,
        contacto_cedente: true,
        cuenta_bancaria: true,
        empresa_aceptante: true,
        empresa_cedente: true,
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: true,
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: true,
        factoring_propuesta_factoringes: true,
        moneda: true,
      },
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsCotizacionesByIdcontactocedente = async (tx: TxClient, idcontactocedete, estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
      include: {
        contacto_aceptante: true,
        contacto_cedente: true,
        cuenta_bancaria: true,
        empresa_aceptante: true,
        empresa_cedente: true,
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: true,
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: true,
        factoring_propuesta_factoringes: true,
        moneda: true,
      },
      where: {
        estado: {
          in: estados,
        },
        idcontactocedente: idcontactocedete,
      },
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsByEstados = async (tx: TxClient, estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
      include: {
        contacto_aceptante: true,
        contacto_cedente: true,
        cuenta_bancaria: {
          include: {
            banco: true,
            cuenta_bancaria_estado: true,
            cuenta_tipo: true,
            moneda: true,
          },
        },
        empresa_aceptante: true,
        empresa_cedente: true,
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: {
          include: {
            factura: true,
          },
        },
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: {
          include: {
            factoring_tipo: true,
          },
        },
        factoring_propuesta_factoringes: {
          include: {
            factoring_propuesta_estado: true,
          },
        },
        moneda: true,
      },
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByIdfactoring = async (tx: TxClient, idfactoring: number) => {
  try {
    const factoring = await tx.factoring.findUnique({
      include: {
        contacto_aceptante: true,
        contacto_cedente: true,
        cuenta_bancaria: {
          include: {
            banco: true,
            cuenta_bancaria_estado: true,
            cuenta_tipo: true,
            moneda: true,
          },
        },
        empresa_aceptante: true,
        empresa_cedente: true,
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: {
          include: {
            factura: true,
          },
        },
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: true,
        factoring_propuesta_factoringes: {
          include: {
            factoring_propuesta_estado: true,
          },
        },
        moneda: true,
      },
      where: {
        idfactoring: idfactoring,
      },
    });

    return factoring;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByFactoringid = async (tx: TxClient, factoringid: string) => {
  try {
    const factoring = await tx.factoring.findFirst({
      include: {
        contacto_aceptante: true,
        contacto_cedente: true,
        cuenta_bancaria: true,
        empresa_aceptante: true,
        empresa_cedente: true,
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: true,
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: true,
        factoring_propuesta_factoringes: true,
        moneda: true,
      },
      where: {
        factoringid: factoringid,
      },
    });
    return factoring;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringPk = async (tx: TxClient, factoringid: string) => {
  try {
    const factoring = await tx.factoring.findFirst({
      select: { idfactoring: true },
      where: {
        factoringid: factoringid,
      },
    });

    return factoring;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoring = async (tx: TxClient, factoring: Prisma.factoringCreateInput) => {
  try {
    const nuevo = await tx.factoring.create({ data: factoring });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoring = async (tx: TxClient, factoringid: string, factoring: Prisma.factoringUpdateInput) => {
  try {
    const result = await tx.factoring.update({
      data: factoring,
      where: {
        factoringid: factoringid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoring = async (tx: TxClient, factoringid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringid: factoringid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactoring = async (tx: TxClient, factoringid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        factoringid: factoringid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
