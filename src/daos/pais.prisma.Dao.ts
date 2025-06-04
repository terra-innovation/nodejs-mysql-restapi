import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, pais } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getPaises = async (tx: TxClient, estados: number[]) => {
  try {
    const paises = await tx.pais.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return paises;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPaisByIdpais = async (tx: TxClient, idpais: number) => {
  try {
    const pais = await tx.pais.findUnique({ where: { idpais: idpais } });

    //const paises = await pais.getPaises();

    return pais;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPaisByPaisid = async (tx: TxClient, paisid: string) => {
  try {
    const pais = await tx.pais.findFirst({
      where: {
        paisid: paisid,
      },
    });

    return pais;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPaisPk = async (tx: TxClient, paisid: string) => {
  try {
    const pais = await tx.pais.findFirst({
      select: { idpais: true },
      where: {
        paisid: paisid,
      },
    });

    return pais;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPais = async (tx: TxClient, pais: Prisma.paisCreateInput) => {
  try {
    const nuevo = await tx.pais.create({ data: pais });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePais = async (tx: TxClient, paisid: string, pais: Prisma.paisUpdateInput) => {
  try {
    const result = await tx.pais.update({
      data: pais,
      where: {
        paisid: paisid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePais = async (tx: TxClient, paisid: string, idusuariomod: number) => {
  try {
    const result = await tx.pais.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        paisid: paisid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
