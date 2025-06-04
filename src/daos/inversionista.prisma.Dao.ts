import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, inversionista } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getInversionistaByIdusuario = async (tx: TxClient, idusuario: number, estados: number[]) => {
  try {
    const inversionista = await tx.inversionista.findFirst({
      include: {
        persona: true,
      },
      where: {
        estado: {
          in: estados,
        },
        persona: {
          idusuario: idusuario,
        },
      },
    });

    return inversionista;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistas = async (tx: TxClient, estados: number[]) => {
  try {
    const inversionistas = await tx.inversionista.findMany({
      include: {
        persona: true,
      },
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return inversionistas;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistaByIdinversionista = async (tx: TxClient, idinversionista: number) => {
  try {
    const inversionista = await tx.inversionista.findUnique({ where: { idinversionista: idinversionista } });

    return inversionista;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistaByInversionistaid = async (tx: TxClient, inversionistaid: string) => {
  try {
    const inversionista = await tx.inversionista.findFirst({
      where: {
        inversionistaid: inversionistaid,
      },
    });

    return inversionista;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findInversionistaPk = async (tx: TxClient, inversionistaid: string) => {
  try {
    const inversionista = await tx.inversionista.findFirst({
      select: { idinversionista: true },
      where: {
        inversionistaid: inversionistaid,
      },
    });

    return inversionista;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertInversionista = async (tx: TxClient, inversionista: Prisma.inversionistaCreateInput) => {
  try {
    const nuevo = await tx.inversionista.create({ data: inversionista });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateInversionista = async (tx: TxClient, inversionistaid: string, inversionista: Prisma.inversionistaUpdateInput) => {
  try {
    const result = await tx.inversionista.update({
      data: inversionista,
      where: {
        inversionistaid: inversionistaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteInversionista = async (tx: TxClient, inversionistaid: string, idusuariomod: number) => {
  try {
    const result = await tx.inversionista.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        inversionistaid: inversionistaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateInversionista = async (tx: TxClient, inversionistaid: string, idusuariomod: number) => {
  try {
    const result = await tx.inversionista.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        inversionistaid: inversionistaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
