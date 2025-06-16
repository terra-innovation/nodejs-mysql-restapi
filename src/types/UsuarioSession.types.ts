import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import type { UsuarioConRoles } from "#src/types/Prisma.types.js";

export interface UsuarioSession {
  usuario?: UsuarioConRoles;
  exp?: number;
  iat?: number;
}
