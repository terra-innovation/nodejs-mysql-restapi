import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, empresa_declaracion } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getEmpresadeclaracions = async (tx: TxClient, estados: number[]) => {
  try {
    const empresadeclaracions = await tx.empresa_declaracion.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return empresadeclaracions;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresadeclaracionByIdempresadeclaracion = async (tx: TxClient, idempresadeclaracion: number) => {
  try {
    const empresadeclaracion = await tx.empresa_declaracion.findUnique({ where: { idempresadeclaracion: idempresadeclaracion } });

    //const empresadeclaracions = await empresadeclaracion.getEmpresadeclaracions();

    return empresadeclaracion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresadeclaracionByEmpresadeclaracionid = async (tx: TxClient, empresadeclaracionid: string) => {
  try {
    const empresadeclaracion = await tx.empresa_declaracion.findFirst({
      where: {
        empresadeclaracionid: empresadeclaracionid,
      },
    });

    return empresadeclaracion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findEmpresadeclaracionPk = async (tx: TxClient, empresadeclaracionid: string) => {
  try {
    const empresadeclaracion = await tx.empresa_declaracion.findFirst({
      select: { idempresadeclaracion: true },
      where: {
        empresadeclaracionid: empresadeclaracionid,
      },
    });

    return empresadeclaracion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertEmpresadeclaracion = async (tx: TxClient, empresadeclaracion: Prisma.empresa_declaracionCreateInput) => {
  try {
    const nuevo = await tx.empresa_declaracion.create({ data: empresadeclaracion });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateEmpresadeclaracion = async (tx: TxClient, empresadeclaracionid: string, empresadeclaracion: Prisma.empresa_declaracionUpdateInput) => {
  try {
    const result = await tx.empresa_declaracion.update({
      data: empresadeclaracion,
      where: {
        empresadeclaracionid: empresadeclaracionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteEmpresadeclaracion = async (tx: TxClient, empresadeclaracionid: string, idusuariomod: number) => {
  try {
    const result = await tx.empresa_declaracion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        empresadeclaracionid: empresadeclaracionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
