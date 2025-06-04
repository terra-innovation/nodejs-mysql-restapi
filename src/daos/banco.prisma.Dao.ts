import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, banco } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getBancos = async (tx: TxClient, estados: number[]) => {
  try {
    const bancos = await tx.banco.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return bancos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getBancoByIdbanco = async (tx: TxClient, idbanco: number) => {
  try {
    const banco = await tx.banco.findUnique({ where: { idbanco: idbanco } });
    return banco;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getBancoByBancoid = async (tx: TxClient, bancoid: string) => {
  try {
    const banco = await tx.banco.findFirst({
      where: {
        bancoid: bancoid,
      },
    });

    return banco;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findBancoPk = async (tx: TxClient, bancoid: string) => {
  try {
    const banco = await tx.banco.findFirst({
      select: { idbanco: true },
      where: {
        bancoid: bancoid,
      },
    });

    return banco;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertBanco = async (tx: TxClient, banco: Prisma.bancoCreateInput) => {
  try {
    const nuevo = await tx.banco.create({ data: banco });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateBanco = async (tx: TxClient, bancoid: string, banco: Prisma.bancoUpdateInput) => {
  try {
    const result = await tx.banco.update({
      data: banco,
      where: {
        bancoid: bancoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteBanco = async (tx: TxClient, bancoid: string, idusuariomod: number) => {
  try {
    const result = await tx.banco.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        bancoid: bancoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateBanco = async (tx: TxClient, bancoid: string, idusuariomod: number) => {
  try {
    const result = await tx.banco.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        bancoid: bancoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
