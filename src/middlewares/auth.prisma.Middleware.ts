import { env } from "#src/config.js";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { updateContext } from "#src/utils/context/loggerContext.js";
import { UsuarioSession } from "#root/src/types/UsuarioSession.types.js";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.body.token || req.query.token || req.params.token || req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ error: true, message: "Se requiere un token para la autenticación" });
  }

  // Verificamos si el token está en el formato correcto
  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return res.status(401).json({ error: true, message: "Formato de token inválido" });
  }

  const token = tokenParts[1];
  // Verificamos y decodificamos el token
  try {
    const decoded = jwt.verify(token, env.TOKEN_KEY_JWT);

    // Verificación segura: asegurarse de que decoded sea del tipo esperado
    if (typeof decoded !== "object" || !decoded || !("usuario" in decoded)) {
      return res.status(401).json({ error: true, message: "Token malformado" });
    }

    const payload = decoded as UsuarioSession;

    // Si el token es válido, almacenamos la información decodificada en el objeto de solicitud para uso posterior
    req.session_user = payload;

    updateContext({ userId: decoded.usuario.idusuario });
    return next();
  } catch (err) {
    return res.status(401).json({ error: true, message: "Token inválido" });
  }
};

// Middleware para verificar si el usuario tiene alguno de los roles especificados
export const checkRole = (roles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Verifica si req.user existe y tiene la propiedad 'roles'
    if (req.session_user && req.session_user.usuario.usuario_roles) {
      //jsonUtils.prettyPrint(session_user);
      // Comprueba si al menos uno de los roles especificados está presente en los roles del usuario
      const rolesUsuario = req.session_user.usuario.usuario_roles.map((role) => role.idrol);
      const tieneRol = roles.some((rol) => rolesUsuario.includes(rol));
      if (tieneRol) {
        // Si el usuario tiene al menos uno de los roles especificados, continúa con la siguiente función de middleware o ruta
        next();
      } else {
        // Si el usuario no tiene ninguno de los roles especificados, devuelve un error de acceso denegado
        res.status(403).json({ error: true, message: "Acceso denegado" });
      }
    } else {
      // Si req.user no existe o no tiene la propiedad 'roles', devuelve un error de acceso denegado
      res.status(403).json({ error: true, message: "Acceso denegado" });
    }
  };
};
