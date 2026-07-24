import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getFactoringfacturafactorAceptadaByIdfactoringfacturafactor = async (tx: TxClient, idfactoringfacturafactor: number, estados: number[]) => {
  try {
    const factoringfacturafactor = await tx.factoring_factura_factor.findFirst({
      include: {
        factoring: true,
        factura: {
          include: {
            archivo_facturas: {
              include: {
                archivo: {
                  include: {
                    archivo_tipo: true,
                  },
                },
              },
            },
          },
        },
        factura_estado: true,
        detraccion_estado: true,
      },
      where: {
        idfactoringfacturafactor: idfactoringfacturafactor,
        estado: {
          in: estados,
        },
      },
    });

    return factoringfacturafactor;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturafactorVigenteByIdfactoringfacturafactorIdfactoring = async (tx: TxClient, idfactoringfacturafactor: number, idfactoring: number, estados: number[]) => {
  try {
    const factoringfacturafactor = await tx.factoring_factura_factor.findFirst({
      include: {
        factoring: true,
        factura: {
          include: {
            archivo_facturas: {
              include: {
                archivo: {
                  include: {
                    archivo_tipo: true,
                  },
                },
              },
            },
          },
        },
        factura_estado: true,
        detraccion_estado: true,
      },
      where: {
        idfactoring: idfactoring,
        idfactoringfacturafactor: idfactoringfacturafactor,
        estado: {
          in: estados,
        },
      },
    });

    return factoringfacturafactor;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturafactorsByIdfactoring = async (tx: TxClient, idfactoring: number, estados: number[]) => {
  try {
    const factoringfacturafactors = await tx.factoring_factura_factor.findMany({
      include: {
        factoring: true,
        factura: {
          include: {
            archivo_facturas: {
              include: {
                archivo: {
                  include: {
                    archivo_tipo: true,
                  },
                },
              },
            },
          },
        },
        factura_estado: true,
        detraccion_estado: true,
      },
      where: {
        idfactoring: idfactoring,
        estado: {
          in: estados,
        },
      },
    });

    return factoringfacturafactors;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturafactorsByIdfactoringAndVisibleCedente = async (tx: TxClient, idfactoring: number, estados: number[]) => {
  try {
    const factoringfacturafactors = await tx.factoring_factura_factor.findMany({
      include: {
        factoring: true,
        factura: {
          include: {
            archivo_facturas: {
              include: {
                archivo: {
                  include: {
                    archivo_tipo: true,
                  },
                },
              },
            },
          },
        },
        factura_estado: true,
        detraccion_estado: true,
      },
      where: {
        idfactoring: idfactoring,
        estado: {
          in: estados,
        },
        factura_estado: {
          visible_cedente: 1,
        },
      },
    });

    return factoringfacturafactors;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturafactors = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringfacturafactors = await tx.factoring_factura_factor.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringfacturafactors;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturafactorByIdfactoringfacturafactor = async (tx: TxClient, idfactoringfacturafactor: number) => {
  try {
    const factoringfacturafactor = await tx.factoring_factura_factor.findUnique({
      where: {
        idfactoringfacturafactor: idfactoringfacturafactor,
      },
    });

    return factoringfacturafactor;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringfacturafactorByFactoringfacturafactorid = async (tx: TxClient, factoringfacturafactorid: string) => {
  try {
    const factoringfacturafactor = await tx.factoring_factura_factor.findUnique({
      include: {
        factoring: true,
        factura: {
          include: {
            archivo_facturas: {
              include: {
                archivo: {
                  include: {
                    archivo_tipo: true,
                  },
                },
              },
            },
          },
        },
        factura_estado: true,
        detraccion_estado: true,
      },
      where: {
        factoringfacturafactorid: factoringfacturafactorid,
      },
    });

    return factoringfacturafactor;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringfacturafactorPk = async (tx: TxClient, factoringfacturafactorid: string) => {
  try {
    const factoringfacturafactor = await tx.factoring_factura_factor.findUnique({
      select: { idfactoringfacturafactor: true },
      where: {
        factoringfacturafactorid: factoringfacturafactorid,
      },
    });

    return factoringfacturafactor;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringfacturafactor = async (tx: TxClient, factoringfacturafactor: Prisma.factoring_factura_factorCreateInput) => {
  try {
    const nuevo = await tx.factoring_factura_factor.create({
      data: factoringfacturafactor,
    });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringfacturafactor = async (tx: TxClient, factoringfacturafactorid: string, factoringfacturafactor: Prisma.factoring_factura_factorUpdateInput) => {
  try {
    const result = await tx.factoring_factura_factor.update({
      data: factoringfacturafactor,
      where: {
        factoringfacturafactorid: factoringfacturafactorid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringfacturafactor = async (tx: TxClient, factoringfacturafactorid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_factura_factor.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringfacturafactorid: factoringfacturafactorid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactoringfacturafactor = async (tx: TxClient, factoringfacturafactorid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_factura_factor.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        factoringfacturafactorid: factoringfacturafactorid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
