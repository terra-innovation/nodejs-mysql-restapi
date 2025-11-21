import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_transferencia_cedente } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringtransferenciacedentesByIdfactoring = async (tx: TxClient, idfactoring: number, estados: number[]) => {
  try {
    const facturas = await tx.factoring_transferencia_cedente.findMany({
      include: {
        factoring_transferencia_estado: true,
        factoring_transferencia_tipo: true,
        factoring: true,
        factor_cuenta_bancaria: {
          include: {
            cuenta_bancaria: {
              include: {
                banco: true,
                moneda: true,
              },
            },
            factor: true,
          },
        },
        empresa_cuenta_bancaria: {
          include: {
            cuenta_bancaria: {
              include: {
                banco: true,
                moneda: true,
              },
            },
            empresa: true,
          },
        },
        moneda: true,
        archivo_factoring_transferencia_cedentes: {
          include: {
            archivo: {
              include: {
                archivo_tipo: true,
              },
            },
          },
        },
      },
      where: {
        idfactoring: idfactoring,
        estado: {
          in: estados,
        },
      },
    });
    return facturas;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtransferenciacedentes = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringtransferenciacedentes = await tx.factoring_transferencia_cedente.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringtransferenciacedentes;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtransferenciacedenteByIdfactoringtransferenciacedente = async (tx: TxClient, idfactoringtransferenciacedente: number) => {
  try {
    const factoringtransferenciacedente = await tx.factoring_transferencia_cedente.findUnique({
      include: {
        factoring_transferencia_estado: true,
        factoring_transferencia_tipo: true,
        factoring: true,
        factor_cuenta_bancaria: {
          include: {
            cuenta_bancaria: {
              include: {
                banco: true,
                moneda: true,
              },
            },
            factor: true,
          },
        },
        empresa_cuenta_bancaria: {
          include: {
            cuenta_bancaria: {
              include: {
                banco: true,
                moneda: true,
              },
            },
            empresa: true,
          },
        },
        moneda: true,
        archivo_factoring_transferencia_cedentes: {
          include: {
            archivo: {
              include: {
                archivo_tipo: true,
              },
            },
          },
        },
      },
      where: { idfactoringtransferenciacedente: idfactoringtransferenciacedente },
    });
    return factoringtransferenciacedente;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringtransferenciacedenteByFactoringtransferenciacedenteid = async (tx: TxClient, factoringtransferenciacedenteid: string) => {
  try {
    const factoringtransferenciacedente = await tx.factoring_transferencia_cedente.findFirst({
      where: {
        factoringtransferenciacedenteid: factoringtransferenciacedenteid,
      },
    });

    return factoringtransferenciacedente;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringtransferenciacedentePk = async (tx: TxClient, factoringtransferenciacedenteid: string) => {
  try {
    const factoringtransferenciacedente = await tx.factoring_transferencia_cedente.findFirst({
      select: { idfactoringtransferenciacedente: true },
      where: {
        factoringtransferenciacedenteid: factoringtransferenciacedenteid,
      },
    });

    return factoringtransferenciacedente;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringtransferenciacedente = async (tx: TxClient, factoringtransferenciacedente: Prisma.factoring_transferencia_cedenteCreateInput) => {
  try {
    const nuevo = await tx.factoring_transferencia_cedente.create({ data: factoringtransferenciacedente });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringtransferenciacedente = async (tx: TxClient, factoringtransferenciacedenteid: string, factoringtransferenciacedente: Prisma.factoring_transferencia_cedenteUpdateInput) => {
  try {
    const result = await tx.factoring_transferencia_cedente.update({
      data: factoringtransferenciacedente,
      where: {
        factoringtransferenciacedenteid: factoringtransferenciacedenteid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringtransferenciacedente = async (tx: TxClient, factoringtransferenciacedenteid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_transferencia_cedente.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringtransferenciacedenteid: factoringtransferenciacedenteid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactoringtransferenciacedente = async (tx: TxClient, factoringtransferenciacedenteid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_transferencia_cedente.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        factoringtransferenciacedenteid: factoringtransferenciacedenteid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
