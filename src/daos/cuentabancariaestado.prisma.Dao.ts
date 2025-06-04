import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, cuenta_bancaria_estado } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getCuentabancariaestados = async (tx: TxClient, estados: number[]) => {
  try {
    const cuentabancariaestados = await tx.cuenta_bancaria_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return cuentabancariaestados;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentabancariaestadoByIdcuentabancariaestado = async (tx: TxClient, idcuentabancariaestado: number) => {
  try {
    const cuentabancariaestado = await tx.cuenta_bancaria_estado.findUnique({ where: { idcuentabancariaestado: idcuentabancariaestado } });

    //const cuentabancariaestados = await cuentabancariaestado.getCuentabancariaestados();

    return cuentabancariaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentabancariaestadoByCuentabancariaestadoid = async (tx: TxClient, cuentabancariaestadoid: string) => {
  try {
    const cuentabancariaestado = await tx.cuenta_bancaria_estado.findFirst({
      where: {
        cuentabancariaestadoid: cuentabancariaestadoid,
      },
    });

    return cuentabancariaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCuentabancariaestadoPk = async (tx: TxClient, cuentabancariaestadoid: string) => {
  try {
    const cuentabancariaestado = await tx.cuenta_bancaria_estado.findFirst({
      select: { idcuentabancariaestado: true },
      where: {
        cuentabancariaestadoid: cuentabancariaestadoid,
      },
    });

    return cuentabancariaestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentabancariaestado = async (tx: TxClient, cuentabancariaestado: Prisma.cuenta_bancaria_estadoCreateInput) => {
  try {
    const nuevo = await tx.cuenta_bancaria_estado.create({ data: cuentabancariaestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentabancariaestado = async (tx: TxClient, cuentabancariaestadoid: string, cuentabancariaestado: Prisma.cuenta_bancaria_estadoUpdateInput) => {
  try {
    const result = await tx.cuenta_bancaria_estado.update({
      data: cuentabancariaestado,
      where: {
        cuentabancariaestadoid: cuentabancariaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCuentabancariaestado = async (tx: TxClient, cuentabancariaestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.cuenta_bancaria_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        cuentabancariaestadoid: cuentabancariaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateCuentabancariaestado = async (tx: TxClient, cuentabancariaestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.cuenta_bancaria_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        cuentabancariaestadoid: cuentabancariaestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
