import { Request } from "express";
import { Multer } from "multer";
import type { Prisma, usuario } from "#src/models/prisma/ft_factoring/client";

interface UsuarioSession {
  usuario?: usuario;
}

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      session_user?: UsuarioSession;
      file?: Multer.File; // para upload.single()
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] }; // para upload.array() o upload.fields()
    }
  }
}
