import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import type { Prisma, zlaboratorio_usuario } from "#src/models/prisma/ft_factoring/client";
import { TxClient } from "#src/types/Prisma.types.js";

export const getZlaboratorioUsuarios = async (tx: TxClient, estados: number[]): Promise<zlaboratorio_usuario[]> => {
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

export const getZlaboratorioUsuarioByIdzlaboratoriousuario = async (tx: TxClient, idzlaboratoriousuario: number): Promise<zlaboratorio_usuario> => {
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

export const getZlaboratorioUsuarioByZlaboratorioUsuarioid = async (tx: TxClient, idzlaboratoriousuario: number): Promise<zlaboratorio_usuario> => {
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

export const findZlaboratorioUsuarioPk = async (tx: TxClient, zlaboratoriousuarioid: number): Promise<zlaboratorio_usuario> => {
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

export const insertZlaboratorioUsuario = async (tx: TxClient, zlaboratoriousuario: Prisma.zlaboratorio_usuarioCreateInput): Promise<zlaboratorio_usuario> => {
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

export const updateZlaboratorioUsuario = async (tx: TxClient, zlaboratoriousuario: Partial<zlaboratorio_usuario>): Promise<zlaboratorio_usuario> => {
  try {
    const result = await tx.zlaboratorio_usuario.update({
      where: {
        idusuario: zlaboratoriousuario.idusuario,
      },
      data: zlaboratoriousuario,
    });
    return result;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};

export const deleteZlaboratorioUsuario = async (tx: TxClient, zlaboratoriousuario: Partial<zlaboratorio_usuario>): Promise<zlaboratorio_usuario> => {
  try {
    const result = await tx.zlaboratorio_usuario.delete({
      where: {
        idusuario: zlaboratoriousuario.idusuario,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};
