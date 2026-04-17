import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, accionista } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getAccionistas = async (tx: TxClient, estados: number[]) => {
  try {
    const accionistas = await tx.accionista.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return accionistas;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getAccionistaByIdaccionista = async (tx: TxClient, idaccionista: number) => {
  try {
    const accionista = await tx.accionista.findUnique({ where: { idaccionista: idaccionista } });
    return accionista;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getAccionistaByAccionistaid = async (tx: TxClient, accionistaid: string) => {
  try {
    const accionista = await tx.accionista.findFirst({
      where: {
        accionistaid: accionistaid,
      },
    });

    return accionista;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findAccionistaPk = async (tx: TxClient, accionistaid: string) => {
  try {
    const accionista = await tx.accionista.findFirst({
      select: { idaccionista: true },
      where: {
        accionistaid: accionistaid,
      },
    });

    return accionista;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertAccionista = async (tx: TxClient, accionista: Prisma.accionistaCreateInput) => {
  try {
    const nuevo = await tx.accionista.create({ data: accionista });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateAccionista = async (tx: TxClient, accionistaid: string, accionista: Prisma.accionistaUpdateInput) => {
  try {
    const result = await tx.accionista.update({
      data: accionista,
      where: {
        accionistaid: accionistaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteAccionista = async (tx: TxClient, accionistaid: string, idusuariomod: number) => {
  try {
    const result = await tx.accionista.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        accionistaid: accionistaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateAccionista = async (tx: TxClient, accionistaid: string, idusuariomod: number) => {
  try {
    const result = await tx.accionista.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        accionistaid: accionistaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
