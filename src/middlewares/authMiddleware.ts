import { env } from "#src/config.js";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { updateContext } from "#src/utils/context/loggerContext.js";
import { UsuarioSession } from "#root/src/types/UsuarioSession.types.js";
import { getUsuarioAccesosByIdusuario } from "#src/daos/usuario.Dao.js";
import { prismaFT } from "#src/models/prisma/db-factoring.js";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.body?.token || req.query.token || req.params.token || req.headers["authorization"];

  if (!authHeader) {
    log.warn(line(), "Se requiere un token para la autenticación");
    res.status(403).json({ error: true, message: "Se requiere un token para la autenticación" });
    return;
  }

  // Verificamos si el token está en el formato correcto
  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    log.warn(line(), "Formato de token inválido");
    res.status(401).json({ error: true, message: "Formato de token inválido" });
    return;
  }

  const token = tokenParts[1];
  // Verificamos y decodificamos el token
  try {
    const decoded = jwt.verify(token, env.TOKEN_KEY_JWT);

    // Verificación segura: asegurarse de que decoded sea del tipo esperado
    if (typeof decoded !== "object" || !decoded || !("usuario" in decoded)) {
      log.warn(line(), "Token malformado");
      res.status(401).json({ error: true, message: "Token malformado" });
      return;
    }

    const payload = decoded as UsuarioSession;

    // Si el token es válido, almacenamos la información decodificada en el objeto de solicitud para uso posterior
    req.session_user = payload;

    updateContext({ userId: decoded.usuario.idusuario });
    next();
  } catch (err) {
    log.warn(line(), "Token inválido");
    res.status(401).json({ error: true, message: "Token inválido" });
  }
};

// Middleware para verificar si el usuario tiene alguno de los roles especificados
export const isRole = (roles: number[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Verifica si req.user existe y tiene la propiedad 'roles'
    if (req.session_user && req.session_user.usuario.usuario_roles) {
      //jsonUtils.prettyPrint(session_user);
      // Comprueba si al menos uno de los roles especificados está presente en los roles del usuario
      const rolesUsuario = req.session_user.usuario.usuario_roles.map((role) => role.idrol);
      const tieneRol = roles.some((rol) => rolesUsuario.includes(rol));
      if (tieneRol) {
        const idusuario = req.session_user.usuario.idusuario;
        if (!Number.isInteger(idusuario) || idusuario <= 0) {
          res.status(401).json({ error: true, message: "Sesión no válida." });
          return;
        }
        try {
          // Una lectura vigente por solicitud; no amplía los roles que traía el JWT.
          const actual = await getUsuarioAccesosByIdusuario(prismaFT.client, idusuario);
          if (!actual) {
            res.status(401).json({ error: true, message: "Sesión no válida." });
            return;
          }
          const vigentes = new Set(actual.usuario_roles.map(role => role.idrol));
          req.session_user.usuario.usuario_roles = req.session_user.usuario.usuario_roles.filter(role => vigentes.has(role.idrol));
          if (!roles.some(role => req.session_user.usuario.usuario_roles.some(current => current.idrol === role))) {
            res.status(403).json({ error: true, message: "Acceso denegado" });
            return;
          }
          next();
        } catch (error) {
          next(error); // Nunca autorizar con el JWT si falla la lectura vigente.
        }
      } else {
        // Si el usuario no tiene ninguno de los roles especificados, devuelve un error de acceso denegado
        log.warn(line(), "Acceso denegado");
        res.status(403).json({ error: true, message: "Acceso denegado" });
      }
    } else {
      // Si req.user no existe o no tiene la propiedad 'roles', devuelve un error de acceso denegado
      log.warn(line(), "Acceso denegado");
      res.status(403).json({ error: true, message: "Acceso denegado" });
    }
  };
};
