import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, validacion } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getValidacionByIdusuarioAndValor = async (tx: TxClient, idusuario: number, valor: string, estados: number[]) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndIdvalidaciontipo = async (tx: TxClient, idusuario: number, idvalidaciontipo: number, estados: number[]) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getValidacionByIdusuarioAndCodigo = async (tx: TxClient, idusuario: number, codigo: string, estados: number[]) => {
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
    log.error(line(), "", error);
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
    log.error(line(), "", error);
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
    log.error(line(), "", error);
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
    log.error(line(), "", error);
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertValidacion = async (tx: TxClient, validacion: Prisma.validacionCreateInput) => {
  try {
    const nuevo = await tx.validacion.create({ data: validacion });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateValidacion = async (tx: TxClient, validacionid: string, validacion: Prisma.validacionUpdateInput) => {
  try {
    const result = await tx.validacion.update({
      data: validacion,
      where: {
        validacionid: validacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteValidacion = async (tx: TxClient, validacionid: string, idusuariomod: number) => {
  try {
    const result = await tx.validacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        validacionid: validacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateValidacion = async (tx: TxClient, validacionid: string, idusuariomod: number) => {
  try {
    const result = await tx.validacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        validacionid: validacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
