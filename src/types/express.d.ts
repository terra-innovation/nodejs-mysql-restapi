import { Request } from "express";

interface UsuarioSession {
  usuario?: {
    _idusuario: number;
  };
}

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      session_user?: UsuarioSession;
    }
  }
}
