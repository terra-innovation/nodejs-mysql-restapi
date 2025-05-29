import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, validacion } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getValidacionByIdusuarioAndValor = async (tx: TxClient, idusuario: bigint, valor: string, estados: number[]) => {
  try {
    const validacions = await tx.validacion.findFirst({
      where: {
        idusuario: idusuario,
        valor: valor,
        estado: {
          in: estados,
        },
      },
    });

    return validacions;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndIdvalidaciontipo = async (tx: TxClient, idusuario: bigint, idvalidaciontipo: number, estados: number[]) => {
  try {
    const validacions = await tx.validacion.findFirst({
      where: {
        idusuario: idusuario,
        idvalidaciontipo: idvalidaciontipo,
        estado: {
          in: estados,
        },
      },
    });

    return validacions;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndCodigo = async (tx: TxClient, idusuario: bigint, codigo: string, estados: number[]) => {
  try {
    const validacions = await tx.validacion.findFirst({
      where: {
        idusuario: idusuario,
        codigo: codigo,
        estado: {
          in: estados,
        },
      },
    });

    return validacions;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacions = async (tx: TxClient, estados: number[]) => {
  try {
    const validacions = await tx.validacion.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return validacions;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdvalidacion = async (tx: TxClient, idvalidacion: number) => {
  try {
    const validacion = await tx.validacion.findUnique({
      where: {
        idvalidacion: idvalidacion,
      },
    });

    return validacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByValidacionid = async (tx: TxClient, validacionid: string) => {
  try {
    const validacion = await tx.validacion.findUnique({
      where: {
        validacionid: validacionid,
      },
    });

    return validacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findValidacionPk = async (tx: TxClient, validacionid: string) => {
  try {
    const validacion = await tx.validacion.findUnique({
      select: { idvalidacion: true },
      where: {
        validacionid: validacionid,
      },
    });

    return validacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertValidacion = async (tx: TxClient, validacion: Prisma.validacionCreateInput) => {
  try {
    const nuevo = await tx.validacion.create({ data: validacion });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateValidacion = async (tx: TxClient, validacion: Partial<validacion>) => {
  try {
    const result = await tx.validacion.update({
      data: validacion,
      where: {
        validacionid: validacion.validacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteValidacion = async (tx: TxClient, validacion: Partial<validacion>) => {
  try {
    const result = await tx.validacion.update({
      data: validacion,
      where: {
        validacionid: validacion.validacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateValidacion = async (tx: TxClient, validacion: Partial<validacion>) => {
  try {
    const result = await tx.validacion.update({
      data: validacion,
      where: {
        validacionid: validacion.validacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
