import { Request } from "express";
import { Multer } from "multer";
import type { Prisma, usuario } from "#src/models/prisma/ft_factoring/client";
import type { UsuarioSession } from "#src/types/UsuarioSession.types.ts";

interface CustomFile extends Multer.File {
  codigo_archivo?: string;
  extension?: string;
  anio_upload?: string;
  mes_upload?: string;
  dia_upload?: string;
}

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      session_user?: UsuarioSession;
      file?: CustomFile; // para upload.single()
      files?: CustomFile[] | { [fieldname: string]: CustomFile[] }; // para upload.array() o upload.fields()
    }
  }
}
