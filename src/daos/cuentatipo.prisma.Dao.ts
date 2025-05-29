import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, cuenta_tipo } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getCuentatipos = async (tx: TxClient, estados: number[]) => {
  try {
    const cuentatipos = await tx.cuenta_tipo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return cuentatipos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentatipoByIdcuentatipo = async (tx: TxClient, idcuentatipo: number) => {
  try {
    const cuentatipo = await tx.cuenta_tipo.findUnique({ where: { idcuentatipo: idcuentatipo } });

    //const cuentatipos = await cuentatipo.getCuentatipos();

    return cuentatipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentatipoByCuentatipoid = async (tx: TxClient, cuentatipoid: string) => {
  try {
    const cuentatipo = await tx.cuenta_tipo.findFirst({
      where: {
        cuentatipoid: cuentatipoid,
      },
    });

    return cuentatipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCuentatipoPk = async (tx: TxClient, cuentatipoid: string) => {
  try {
    const cuentatipo = await tx.cuenta_tipo.findFirst({
      select: { idcuentatipo: true },
      where: {
        cuentatipoid: cuentatipoid,
      },
    });

    return cuentatipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentatipo = async (tx: TxClient, cuentatipo: Prisma.cuenta_tipoCreateInput) => {
  try {
    const nuevo = await tx.cuenta_tipo.create({ data: cuentatipo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentatipo = async (tx: TxClient, cuentatipo: Partial<cuenta_tipo>) => {
  try {
    const result = await tx.cuenta_tipo.update({
      data: cuentatipo,
      where: {
        cuentatipoid: cuentatipo.cuentatipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCuentatipo = async (tx: TxClient, cuentatipo: Partial<cuenta_tipo>) => {
  try {
    const result = await tx.cuenta_tipo.update({
      data: cuentatipo,
      where: {
        cuentatipoid: cuentatipo.cuentatipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
