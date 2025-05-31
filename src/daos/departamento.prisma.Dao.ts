import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, departamento } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getDepartamentos = async (tx: TxClient, estados: number[]) => {
  try {
    const departamentos = await tx.departamento.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return departamentos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDepartamentoByIddepartamento = async (tx: TxClient, iddepartamento: number) => {
  try {
    const departamento = await tx.departamento.findUnique({ where: { iddepartamento: iddepartamento } });

    //const departamentos = await departamento.getDepartamentos();

    return departamento;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDepartamentoByDepartamentoid = async (tx: TxClient, departamentoid: string) => {
  try {
    const departamento = await tx.departamento.findFirst({
      where: {
        departamentoid: departamentoid,
      },
    });

    return departamento;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findDepartamentoPk = async (tx: TxClient, departamentoid: string) => {
  try {
    const departamento = await tx.departamento.findFirst({
      select: { iddepartamento: true },
      where: {
        departamentoid: departamentoid,
      },
    });

    return departamento;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDepartamento = async (tx: TxClient, departamento: Prisma.departamentoCreateInput) => {
  try {
    const nuevo = await tx.departamento.create({ data: departamento });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateDepartamento = async (tx: TxClient, departamentoid: string, departamento: Prisma.departamentoUpdateInput) => {
  try {
    const result = await tx.departamento.update({
      data: departamento,
      where: {
        departamentoid: departamentoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteDepartamento = async (tx: TxClient, departamentoid: string, departamento: Prisma.departamentoUpdateInput) => {
  try {
    const result = await tx.departamento.update({
      data: departamento,
      where: {
        departamentoid: departamentoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
