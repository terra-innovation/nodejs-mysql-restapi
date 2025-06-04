import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, colaborador_tipo } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getColaboradortipos = async (tx: TxClient, estados: number[]) => {
  try {
    const colaboradortipos = await tx.colaborador_tipo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return colaboradortipos;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradortipoByIdcolaboradortipo = async (tx: TxClient, idcolaboradortipo: number) => {
  try {
    const colaboradortipo = await tx.colaborador_tipo.findUnique({
      where: { idcolaboradortipo: idcolaboradortipo },
    });

    return colaboradortipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradortipoByColaboradortipoid = async (tx: TxClient, colaboradortipoid: string) => {
  try {
    const colaboradortipo = await tx.colaborador_tipo.findFirst({
      where: {
        colaboradortipoid: colaboradortipoid,
      },
    });

    return colaboradortipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findColaboradortipoPk = async (tx: TxClient, colaboradortipoid: string) => {
  try {
    const colaboradortipo = await tx.colaborador_tipo.findFirst({
      select: { idcolaboradortipo: true },
      where: {
        colaboradortipoid: colaboradortipoid,
      },
    });

    return colaboradortipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertColaboradortipo = async (tx: TxClient, colaboradortipo: Prisma.colaborador_tipoCreateInput) => {
  try {
    const colaboradortipo_nuevo = await tx.colaborador_tipo.create({ data: colaboradortipo });

    return colaboradortipo_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateColaboradortipo = async (tx: TxClient, colaboradortipoid: string, colaboradortipo: Prisma.colaborador_tipoUpdateInput) => {
  try {
    const result = await tx.colaborador_tipo.update({
      data: colaboradortipo,
      where: {
        colaboradortipoid: colaboradortipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteColaboradortipo = async (tx: TxClient, colaboradortipoid: string, idusuariomod: number) => {
  try {
    const result = await tx.colaborador_tipo.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        colaboradortipoid: colaboradortipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
