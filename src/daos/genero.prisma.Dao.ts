import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, genero } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getGeneros = async (tx: TxClient, estados: number[]) => {
  try {
    const generos = await tx.genero.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return generos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getGeneroByIdgenero = async (tx: TxClient, idgenero: number) => {
  try {
    const genero = await tx.genero.findUnique({ where: { idgenero: idgenero } });

    //const generos = await genero.getGeneros();

    return genero;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getGeneroByGeneroid = async (tx: TxClient, generoid: string) => {
  try {
    const genero = await tx.genero.findFirst({
      where: {
        generoid: generoid,
      },
    });

    return genero;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findGeneroPk = async (tx: TxClient, generoid: string) => {
  try {
    const genero = await tx.genero.findFirst({
      select: { idgenero: true },
      where: {
        generoid: generoid,
      },
    });

    return genero;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertGenero = async (tx: TxClient, genero: Prisma.generoCreateInput) => {
  try {
    const nuevo = await tx.genero.create({ data: genero });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateGenero = async (tx: TxClient, generoid: string, genero: Prisma.generoUpdateInput) => {
  try {
    const result = await tx.genero.update({
      data: genero,
      where: {
        generoid: generoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteGenero = async (tx: TxClient, generoid: string, genero: Prisma.generoUpdateInput) => {
  try {
    const result = await tx.genero.update({
      data: genero,
      where: {
        generoid: generoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
