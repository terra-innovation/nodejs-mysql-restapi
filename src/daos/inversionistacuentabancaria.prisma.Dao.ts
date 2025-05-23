import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, inversionista_cuenta_bancaria } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getInversionistacuentabancariaByIdinversionistaAndIdusuario = async (tx: TxClient, idinversionista: bigint, idusuario: bigint, estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.inversionista_cuenta_bancaria.findFirst({
      include: {
        inversionista: {
          include: {
            persona: true,
          },
        },
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
        estado: {
          in: estados,
        },
        inversionista: {
          idinversionista: idinversionista,
          persona: {
            idusuario: idusuario,
          },
        },
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistacuentabancariasByIdusuario = async (tx: TxClient, idusuario: bigint, estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.inversionista_cuenta_bancaria.findMany({
      include: {
        inversionista: {
          include: {
            persona: true,
          },
        },
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
        estado: {
          in: estados,
        },
        inversionista: {
          persona: {
            idusuario: idusuario,
          },
        },
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistacuentabancariasByIdinversionistaAndAlias = async (tx: TxClient, idinversionista: bigint, alias: string, estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.inversionista_cuenta_bancaria.findMany({
      include: {
        inversionista: true,
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
        estado: {
          in: estados,
        },
        inversionista: {
          idinversionista: idinversionista,
        },
        cuenta_bancaria: {
          alias: alias,
          estado: {
            in: estados,
          },
        },
      },
    });
    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistacuentabancarias = async (tx: TxClient, estados: number[]): Promise<inversionista_cuenta_bancaria[]> => {
  try {
    const inversionistacuentabancarias = await tx.inversionista_cuenta_bancaria.findMany({
      include: {
        inversionista: {
          include: {
            persona: true,
          },
        },
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

    return inversionistacuentabancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistacuentabancariaByIdinversionistacuentabancaria = async (tx: TxClient, idinversionistacuentabancaria: number): Promise<inversionista_cuenta_bancaria> => {
  try {
    const inversionistacuentabancaria = await tx.inversionista_cuenta_bancaria.findUnique({
      where: {
        idinversionistacuentabancaria: idinversionistacuentabancaria,
      },
    });

    return inversionistacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistacuentabancariaByInversionistacuentabancariaid = async (tx: TxClient, inversionistacuentabancariaid: string): Promise<inversionista_cuenta_bancaria> => {
  try {
    const inversionistacuentabancaria = await tx.inversionista_cuenta_bancaria.findFirst({
      where: {
        inversionistacuentabancariaid: inversionistacuentabancariaid,
      },
    });

    return inversionistacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findInversionistacuentabancariaPk = async (tx: TxClient, inversionistacuentabancariaid: string): Promise<{ idinversionistacuentabancaria: number }> => {
  try {
    const inversionistacuentabancaria = await tx.inversionista_cuenta_bancaria.findFirst({
      select: { idinversionistacuentabancaria: true },
      where: {
        inversionistacuentabancariaid: inversionistacuentabancariaid,
      },
    });

    return inversionistacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertInversionistacuentabancaria = async (tx: TxClient, inversionistacuentabancaria: Prisma.inversionista_cuenta_bancariaCreateInput): Promise<inversionista_cuenta_bancaria> => {
  try {
    const nuevo = await tx.inversionista_cuenta_bancaria.create({ data: inversionistacuentabancaria });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateInversionistacuentabancaria = async (tx: TxClient, inversionistacuentabancaria: Partial<inversionista_cuenta_bancaria>): Promise<inversionista_cuenta_bancaria> => {
  try {
    const result = await tx.inversionista_cuenta_bancaria.update({
      data: inversionistacuentabancaria,
      where: {
        inversionistacuentabancariaid: inversionistacuentabancaria.inversionistacuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteInversionistacuentabancaria = async (tx: TxClient, inversionistacuentabancaria: Partial<inversionista_cuenta_bancaria>): Promise<inversionista_cuenta_bancaria> => {
  try {
    const result = await tx.inversionista_cuenta_bancaria.update({
      data: inversionistacuentabancaria,
      where: {
        inversionistacuentabancariaid: inversionistacuentabancaria.inversionistacuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateInversionistacuentabancaria = async (tx: TxClient, inversionistacuentabancaria: Partial<inversionista_cuenta_bancaria>): Promise<inversionista_cuenta_bancaria> => {
  try {
    const result = await tx.inversionista_cuenta_bancaria.update({
      data: inversionistacuentabancaria,
      where: {
        inversionistacuentabancariaid: inversionistacuentabancaria.inversionistacuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
