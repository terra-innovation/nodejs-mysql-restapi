import { TOKEN_KEY } from "../config.js";
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
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
    const decoded = jwt.verify(token, TOKEN_KEY);
    //console.log(decoded);

    // Si el token es válido, almacenamos la información decodificada en el objeto de solicitud para uso posterior
    req.session_user = decoded;
  } catch (err) {
    return res.status(401).json({ error: true, message: "Token inválido" });
  }
  return next();
};

// Middleware para verificar si el usuario tiene alguno de los roles especificados
export const checkRole = (roles) => {
  return (req, res, next) => {
    // Verificamos si el usuario tiene alguno de los roles especificados
    if (req.session_user && roles.includes(req.session_user.rol)) {
      next(); // Si tiene el rol, pasamos al siguiente middleware o a la ruta
    } else {
      res.status(403).json({ error: true, message: "Acceso denegado. Se requiere el rol adecuado" });
    }
  };
};
