import type { Prisma } from "#src/models/prisma/ft_factoring/client";

export type TxClient = Prisma.TransactionClient;

// Tipo exacto del usuario con roles incluidos
export type UsuarioConRoles = Prisma.usuarioGetPayload<{
  include: {
    usuario_roles: {
      include: {
        rol: true;
      };
    };
  };
}>;
