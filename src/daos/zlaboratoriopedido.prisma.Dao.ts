import type { Prisma, zlaboratorio_pedido } from "#src/models/prisma/ft_factoring/client";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { TxClient } from "#src/types/Prisma.types.js";

export const getZlaboratorioPedidos = async (tx: TxClient, estados: number[]) => {
  try {
    const zlaboratoriopedidos = await tx.zlaboratorio_pedido.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return zlaboratoriopedidos;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};

export const getZlaboratorioPedidoByIdzlaboratoriopedido = async (tx: TxClient, idzlaboratoriopedido: number) => {
  try {
    const zlaboratoriopedido = await tx.zlaboratorio_pedido.findUnique({
      where: {
        idpedido: idzlaboratoriopedido,
      },
    });

    return zlaboratoriopedido;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};

export const findZlaboratorioPedidoPk = async (tx: TxClient, code: string) => {
  try {
    const archivo = await tx.zlaboratorio_pedido.findFirst({
      select: { idpedido: true },
      where: {
        code: code,
      },
    });

    return archivo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getZlaboratorioPedidoByZlaboratorioPedidoid = async (tx: TxClient, idpedido: number) => {
  try {
    const zlaboratoriopedido = await tx.zlaboratorio_pedido.findFirst({
      where: {
        idpedido: idpedido,
      },
    });

    return zlaboratoriopedido;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};

export const insertZlaboratorioPedido = async (tx: TxClient, zlaboratoriopedido: Prisma.zlaboratorio_pedidoCreateInput) => {
  try {
    const nuevo = await tx.zlaboratorio_pedido.create({
      data: zlaboratoriopedido,
    });

    return nuevo;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};

export const updateZlaboratorioPedido = async (tx: TxClient, idpedido: number, zlaboratoriopedido: Prisma.zlaboratorio_pedidoUpdateInput) => {
  try {
    const result = await tx.zlaboratorio_pedido.update({
      where: {
        idpedido: idpedido,
      },
      data: zlaboratoriopedido,
    });

    return result;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};

export const deleteZlaboratorioPedido = async (tx: TxClient, idpedido: number, zlaboratoriopedido: Prisma.zlaboratorio_pedidoUpdateInput) => {
  try {
    const result = await tx.zlaboratorio_pedido.delete({
      where: {
        idpedido: idpedido,
      },
    });

    return result;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};
