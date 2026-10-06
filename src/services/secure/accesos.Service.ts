import jwt from "jsonwebtoken";
import { env } from "#src/config.js";
import { prismaFT } from "#src/models/prisma/db-factoring.js";
import { getUsuarioAccesosByIdusuario } from "#src/daos/usuario.Dao.js";
import { getMenuService } from "#src/services/usuario/menu.Service.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { removeAttributesPrivates, removeAttributesUsusarioPrivates } from "#src/utils/jsonUtils.js";
import type { UsuarioSession } from "#src/types/UsuarioSession.types.js";

export const actualizarAccesosService = async (session: UsuarioSession) => {
  const idusuario = session?.usuario?.idusuario;
  const exp = session?.exp;
  if (!idusuario || !Number.isFinite(exp) || exp <= Date.now() / 1000) {
    throw new ClientError("Tu sesión venció. Inicia sesión para continuar.", 401);
  }

  return prismaFT.client.$transaction(async (tx) => {
    const usuarioActual = await getUsuarioAccesosByIdusuario(tx, idusuario);
    if (!usuarioActual) throw new ClientError("La cuenta no está disponible. Inicia sesión para continuar.", 401);
    if (exp <= Date.now() / 1000) throw new ClientError("Tu sesión venció. Inicia sesión para continuar.", 401);

    const usuario = removeAttributesUsusarioPrivates(usuarioActual);
    // La sincronización cambia los accesos, sin extender la sesión original.
    const token = jwt.sign({ usuario, exp, ...(session.iat ? { iat: session.iat } : {}) }, env.TOKEN_KEY_JWT, {
      algorithm: "HS256",
    });
    return {
      token,
      usuarioid: usuarioActual.usuarioid,
      usuario: removeAttributesPrivates(usuario),
      menu: getMenuService(usuario),
    };
  }, { timeout: prismaFT.transactionTimeout });
};
