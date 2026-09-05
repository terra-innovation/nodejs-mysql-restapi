import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFuncionariosByIdempresa = async (tx: TxClient, idempresa: number, estados: number[]) => {
  try {
    const funcionarios = await tx.funcionario.findMany({
      include: {
        pais: true,
        documento_tipo: true,
      },
      where: {
        idempresa: idempresa,
        estado: {
          in: estados,
        },
      },
    });
    return funcionarios;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFuncionarios = async (tx: TxClient, estados: number[]) => {
  try {
    const funcionarios = await tx.funcionario.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return funcionarios;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFuncionarioByIdfuncionario = async (tx: TxClient, idfuncionario: number) => {
  try {
    const funcionario = await tx.funcionario.findUnique({ where: { idfuncionario: idfuncionario } });
    return funcionario;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFuncionarioByFuncionarioid = async (tx: TxClient, funcionarioid: string) => {
  try {
    const funcionario = await tx.funcionario.findFirst({
      where: {
        funcionarioid: funcionarioid,
      },
    });

    return funcionario;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFuncionarioPk = async (tx: TxClient, funcionarioid: string) => {
  try {
    const funcionario = await tx.funcionario.findFirst({
      select: { idfuncionario: true },
      where: {
        funcionarioid: funcionarioid,
      },
    });

    return funcionario;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFuncionario = async (tx: TxClient, funcionario: Prisma.funcionarioCreateInput) => {
  try {
    const nuevo = await tx.funcionario.create({ data: funcionario });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFuncionario = async (tx: TxClient, funcionarioid: string, funcionario: Prisma.funcionarioUpdateInput) => {
  try {
    const result = await tx.funcionario.update({
      data: funcionario,
      where: {
        funcionarioid: funcionarioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFuncionario = async (tx: TxClient, funcionarioid: string, idusuariomod: number) => {
  try {
    const result = await tx.funcionario.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        funcionarioid: funcionarioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFuncionario = async (tx: TxClient, funcionarioid: string, idusuariomod: number) => {
  try {
    const result = await tx.funcionario.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        funcionarioid: funcionarioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
