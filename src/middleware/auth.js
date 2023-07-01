import { TOKEN_KEY } from "../config.js";
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.params.token ||
    req.headers["x-access-token"];

  if (!token) {
    return res
      .status(403)
      .json({ message: "A token is required for authentication" });
  }
  try {
    const decoded = jwt.verify(token, TOKEN_KEY);
    console.log(decoded);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
  return next();
};


