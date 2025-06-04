import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import type { Prisma, zlaboratorio_usuario } from "#src/models/prisma/ft_factoring/client";
import { TxClient } from "#src/types/Prisma.types.js";

export const getZlaboratorioUsuariosConPedidos = async (tx: TxClient, estados: number[]) => {
  try {
    const zlaboratoriousuarios = await tx.zlaboratorio_usuario.findMany({
      include: {
        zlaboratorio_pedidos: true,
      },
      where: {
        estado: {
          in: estados,
        },
      },
    });
    return zlaboratoriousuarios;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};

export const getZlaboratorioUsuarios = async (tx: TxClient, estados: number[]) => {
  try {
    const zlaboratoriousuarios = await tx.zlaboratorio_usuario.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });
    return zlaboratoriousuarios;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};

export const getZlaboratorioUsuarioByIdzlaboratoriousuario = async (tx: TxClient, idzlaboratoriousuario: number) => {
  try {
    const zlaboratoriousuario = await tx.zlaboratorio_usuario.findUnique({
      where: {
        idusuario: idzlaboratoriousuario,
      },
    });
    return zlaboratoriousuario;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};

export const getZlaboratorioUsuarioByZlaboratorioUsuarioid = async (tx: TxClient, idzlaboratoriousuario: number) => {
  try {
    const zlaboratoriousuario = await tx.zlaboratorio_usuario.findFirst({
      where: {
        idusuariocrea: idzlaboratoriousuario,
      },
    });
    return zlaboratoriousuario;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};

export const findZlaboratorioUsuarioPk = async (tx: TxClient, zlaboratoriousuarioid: number) => {
  try {
    const zlaboratoriousuario = await tx.zlaboratorio_usuario.findFirst({
      where: {
        idusuariocrea: zlaboratoriousuarioid,
      },
    });
    return zlaboratoriousuario;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};

export const insertZlaboratorioUsuario = async (tx: TxClient, zlaboratoriousuario: Prisma.zlaboratorio_usuarioCreateInput) => {
  try {
    const nuevo = await tx.zlaboratorio_usuario.create({
      data: zlaboratoriousuario,
    });
    return nuevo;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};

export const updateZlaboratorioUsuario = async (tx: TxClient, idusuario: number, zlaboratoriousuario: Prisma.zlaboratorio_usuarioUpdateInput) => {
  try {
    const result = await tx.zlaboratorio_usuario.update({
      where: {
        idusuario: idusuario,
      },
      data: zlaboratoriousuario,
    });
    return result;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};

export const deleteZlaboratorioUsuario = async (tx: TxClient, idusuario: number, idusuariomod: number) => {
  try {
    const result = await tx.zlaboratorio_usuario.delete({
      where: {
        idusuario: idusuario,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};
