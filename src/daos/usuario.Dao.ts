import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, usuario } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getUsuarioPerfilByUsuarioid = async (tx: TxClient, usuarioid: string) => {
  try {
    const usuario = await tx.usuario.findFirst({
      include: {
        usuario_roles: {
          include: {
            rol: true,
          },
        },
      },
      where: {
        usuarioid: usuarioid,
      },
    });
    return usuario;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioDatosContactoByIdusuario = async (tx: TxClient, idusuario: number, estado: number[]) => {
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
        idusuario: idusuario,
        estado: {
          in: estado,
        },
      },
    });

    return usuario;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarios = async (tx: TxClient, estado: number[]) => {
  try {
    const usuarios = await tx.usuario.findMany({
      include: {
        usuario_roles: {
          include: {
            rol: true,
          },
        },
        usuario_servicios: {
          include: {
            servicio: true,
            usuario_servicio_estado: true,
            usuario_servicio_verificaciones: {
              include: {
                usuario_servicio_estado: true,
                usuario_verifica: {
                  select: {
                    idusuario: true,
                    usuarionombres: true,
                    apellidopaterno: true,
                    apellidomaterno: true,
                  },
                },
              },
            },
          },
        },
        usuario_servicio_empresas: {
          include: {
            empresa: true,
            servicio: true,
            usuario_servicio_empresa_estado: true,
            usuario_servicio_empresa_rol: true,
          },
        },
      },
      where: {
        estado: {
          in: estado,
        },
      },
    });

    return usuarios;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByIdusuario = async (tx: TxClient, idusuario: number) => {
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
    log.error(line(), "", error);
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioAndRolesByEmail = async (tx: TxClient, email: string) => {
  try {
    const usuario = await tx.usuario.findFirst({
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByUsuarioid = async (tx: TxClient, usuarioid: string) => {
  try {
    const usuario = await tx.usuario.findFirst({
      where: {
        usuarioid: usuarioid,
      },
    });
    return usuario;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByEmail = async (tx: TxClient, email: string) => {
  try {
    const usuario = await tx.usuario.findFirst({
      where: {
        email: email,
      },
    });

    return usuario;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getUsuarioByHash = async (tx: TxClient, hash: string) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findUsuarioPk = async (tx: TxClient, usuarioid: string) => {
  try {
    const usuario = await tx.usuario.findFirst({
      select: { idusuario: true },
      where: {
        usuarioid: usuarioid,
      },
    });

    return usuario;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertUsuario = async (tx: TxClient, usuario: Prisma.usuarioCreateInput) => {
  try {
    const nuevo = await tx.usuario.create({ data: usuario });

    return nuevo;
  } catch (error) {
    log.error(line(), error.original, error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateUsuario = async (tx: TxClient, usuarioid: string, usuario: Prisma.usuarioUpdateInput) => {
  try {
    const result = await tx.usuario.update({
      data: usuario,
      where: {
        usuarioid: usuarioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteUsuario = async (tx: TxClient, usuarioid: string, idusuariomod: number) => {
  try {
    const result = await tx.usuario.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        usuarioid: usuarioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateUsuario = async (tx: TxClient, usuarioid: string, idusuariomod: number) => {
  try {
    const result = await tx.usuario.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        usuarioid: usuarioid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
