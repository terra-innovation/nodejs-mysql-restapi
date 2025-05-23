import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, usuario } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getUsuarioDatosContactoByIdusuario = async (tx: TxClient, idusuario: bigint, estado: number[]) => {
  try {
    const usuario = await tx.usuario.findFirst({
      select: {
        usuarioid: true,
        usuarionombres: true,
        apellidopaterno: true,
        apellidomaterno: true,
        email: true,
        celular: true,
      },
      where: {
        estado: {
          in: estado,
        },
      },
    });

    return usuario;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuariosActivos = async (tx: TxClient): Promise<usuario[]> => {
  try {
    const usuarios = await tx.usuario.findMany({
      where: {
        estado: 1,
      },
    });

    return usuarios;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByIdusuario = async (tx: TxClient, idusuario: number): Promise<usuario> => {
  try {
    const usuario = await tx.usuario.findUnique({
      include: {
        persona: true,
      },
      where: {
        idusuario: idusuario,
      },
    });

    return usuario;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const autenticarUsuario = async (tx: TxClient, email: string) => {
  try {
    const usuario = await tx.usuario.findUnique({
      select: {
        idusuario: true,
        usuarioid: true,
        email: true,
        credencial: {
          select: {
            password: true,
          },
        },
      },
      where: {
        email: email,
      },
    });

    return usuario;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioAndRolesByEmail = async (tx: TxClient, email: string): Promise<usuario[]> => {
  try {
    const usuario = await tx.usuario.findMany({
      include: {
        usuario_roles: {
          include: {
            rol: true,
          },
        },
      },
      where: {
        email: email,
      },
    });

    return usuario;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByUsuarioid = async (tx: TxClient, usuarioid: string): Promise<usuario> => {
  try {
    const usuario = await tx.usuario.findFirst({
      where: {
        usuarioid: usuarioid,
      },
    });
    return usuario;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByEmail = async (tx: TxClient, email: string): Promise<usuario> => {
  try {
    const usuario = await tx.usuario.findFirst({
      where: {
        email: email,
      },
    });

    return usuario;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByHash = async (tx: TxClient, hash: string): Promise<usuario> => {
  try {
    const usuario = await tx.usuario.findFirst({
      where: {
        hash: hash,
      },
    });

    return usuario;
  } catch (error) {
    log.error(line(), error.message, error.stack);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByNumerodocumento = async (tx: TxClient, documentonumero) => {
  try {
    const usuario = await tx.usuario.findFirst({
      where: {
        documentonumero: documentonumero,
      },
    });

    return usuario;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioPk = async (tx: TxClient, usuarioid: string): Promise<{ idusuario: bigint }> => {
  try {
    const usuario = await tx.usuario.findFirst({
      select: { idusuario: true },
      where: {
        usuarioid: usuarioid,
      },
    });

    return usuario;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuario = async (tx: TxClient, usuario: Prisma.usuarioCreateInput): Promise<usuario> => {
  try {
    const nuevo = await tx.usuario.create({ data: usuario });

    return nuevo;
  } catch (error) {
    log.error(line(), error.original, error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuario = async (tx: TxClient, usuario: Partial<usuario>): Promise<usuario> => {
  try {
    const result = await tx.usuario.update({
      data: usuario,
      where: {
        usuarioid: usuario.usuarioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuario = async (tx: TxClient, usuario: Partial<usuario>): Promise<usuario> => {
  try {
    const result = await tx.usuario.update({
      data: usuario,
      where: {
        usuarioid: usuario.usuarioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
