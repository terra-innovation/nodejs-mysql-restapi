import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import type { UsuarioConRoles } from "#src/types/Prisma.types.js";

export interface UsuarioSession {
  usuario?: UsuarioConRoles;
  exp?: number;
  iat?: number;
}
