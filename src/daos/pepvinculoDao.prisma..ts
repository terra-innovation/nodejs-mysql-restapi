import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, pep_vinculo } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getPepvinculos = async (tx: TxClient, estados: number[]) => {
  try {
    const pepvinculos = await tx.pep_vinculo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return pepvinculos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPepvinculoByIdpepvinculo = async (tx: TxClient, idpepvinculo: number): Promise<pep_vinculo> => {
  try {
    const pepvinculo = await tx.pep_vinculo.findUnique({
      where: {
        idpepvinculo: idpepvinculo,
      },
    });

    return pepvinculo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPepvinculoByPepvinculoid = async (tx: TxClient, pepvinculoid: string): Promise<pep_vinculo> => {
  try {
    const pepvinculo = await tx.pep_vinculo.findUnique({
      where: {
        pepvinculoid: pepvinculoid,
      },
    });

    return pepvinculo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPepvinculoPk = async (tx: TxClient, pepvinculoid: string): Promise<{ idpepvinculo: number }> => {
  try {
    const pepvinculo = await tx.pep_vinculo.findUnique({
      select: { idpepvinculo: true },
      where: {
        pepvinculoid: pepvinculoid,
      },
    });

    return pepvinculo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPepvinculo = async (tx: TxClient, pepvinculo: Prisma.pep_vinculoCreateInput): Promise<pep_vinculo> => {
  try {
    const nuevo = await tx.pep_vinculo.create({ data: pepvinculo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePepvinculo = async (tx: TxClient, pepvinculo: Partial<pep_vinculo>): Promise<pep_vinculo> => {
  try {
    const result = await tx.pep_vinculo.update({
      data: pepvinculo,
      where: {
        pepvinculoid: pepvinculo.pepvinculoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePepvinculo = async (tx: TxClient, pepvinculo: Partial<pep_vinculo>): Promise<pep_vinculo> => {
  try {
    const result = await tx.pep_vinculo.update({
      data: pepvinculo,
      where: {
        pepvinculoid: pepvinculo.pepvinculoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
