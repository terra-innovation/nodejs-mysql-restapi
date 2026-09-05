import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factor_cuenta_bancaria } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactorcuentabancariasByIdfactorIdmonedaIdbanco = async (tx: TxClient, idfactor: number, idmoneda: number, idbanco: number, estados: number[]) => {
  try {
    const factorcuentabancaria = await tx.factor_cuenta_bancaria.findFirst({
      include: {
        factor: true,
        cuenta_bancaria: {
          include: {
            banco: true,
            moneda: true,
            cuenta_tipo: true,
            cuenta_bancaria_estado: true,
          },
        },
      },
      where: {
        idfactor: idfactor,
        estado: {
          in: estados,
        },
        cuenta_bancaria: {
          idmoneda: idmoneda,
          idbanco: idbanco,
          estado: {
            in: estados,
          },
        },
      },
    });

    return factorcuentabancaria;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactorcuentabancariasByIdfactorIdmoneda = async (tx: TxClient, idfactor: number, idmoneda: number, estados: number[]) => {
  try {
    const factorcuentabancaria = await tx.factor_cuenta_bancaria.findMany({
      include: {
        factor: true,
        cuenta_bancaria: {
          include: {
            banco: true,
            moneda: true,
            cuenta_tipo: true,
            cuenta_bancaria_estado: true,
          },
        },
      },
      where: {
        idfactor: idfactor,
        estado: {
          in: estados,
        },
        cuenta_bancaria: {
          estado: {
            in: estados,
          },
          moneda: {
            idmoneda: idmoneda,
          },
        },
      },
    });

    return factorcuentabancaria;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactorcuentabancariasByIdfactor = async (tx: TxClient, idfactor: number, estados: number[]) => {
  try {
    const factorcuentabancaria = await tx.factor_cuenta_bancaria.findMany({
      include: {
        factor: true,
        cuenta_bancaria: {
          include: {
            banco: true,
            moneda: true,
            cuenta_tipo: true,
            cuenta_bancaria_estado: true,
          },
        },
      },
      where: {
        idfactor: idfactor,
        estado: {
          in: estados,
        },
        cuenta_bancaria: {
          estado: {
            in: estados,
          },
        },
      },
    });

    return factorcuentabancaria;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactorcuentabancarias = async (tx: TxClient, estados: number[]) => {
  try {
    const factorcuentabancarias = await tx.factor_cuenta_bancaria.findMany({
      include: {
        factor: true,
        cuenta_bancaria: {
          include: {
            banco: true,
            moneda: true,
            cuenta_tipo: true,
            cuenta_bancaria_estado: true,
            archivo_cuenta_bancarias: {
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
      },
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factorcuentabancarias;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactorcuentabancariaByIdfactorcuentabancaria = async (tx: TxClient, idfactorcuentabancaria: number) => {
  try {
    const factorcuentabancaria = await tx.factor_cuenta_bancaria.findUnique({ where: { idfactorcuentabancaria: idfactorcuentabancaria } });

    return factorcuentabancaria;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactorcuentabancariaByFactorcuentabancariaid = async (tx: TxClient, factorcuentabancariaid: string) => {
  try {
    const factorcuentabancaria = await tx.factor_cuenta_bancaria.findFirst({
      where: {
        factorcuentabancariaid: factorcuentabancariaid,
      },
    });

    return factorcuentabancaria;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactorcuentabancariaPk = async (tx: TxClient, factorcuentabancariaid: string) => {
  try {
    const factorcuentabancaria = await tx.factor_cuenta_bancaria.findFirst({
      select: { idfactorcuentabancaria: true },
      where: {
        factorcuentabancariaid: factorcuentabancariaid,
      },
    });

    return factorcuentabancaria;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactorcuentabancaria = async (tx: TxClient, factorcuentabancaria: Prisma.factor_cuenta_bancariaCreateInput) => {
  try {
    const nuevo = await tx.factor_cuenta_bancaria.create({ data: factorcuentabancaria });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactorcuentabancaria = async (tx: TxClient, factorcuentabancariaid: string, factorcuentabancaria: Prisma.factor_cuenta_bancariaUpdateInput) => {
  try {
    const result = await tx.factor_cuenta_bancaria.update({
      data: factorcuentabancaria,
      where: {
        factorcuentabancariaid: factorcuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactorcuentabancaria = async (tx: TxClient, factorcuentabancariaid: string, idusuariomod: number) => {
  try {
    const result = await tx.factor_cuenta_bancaria.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factorcuentabancariaid: factorcuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
