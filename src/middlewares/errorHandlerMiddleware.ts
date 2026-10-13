import * as telegramService from "#src/providers/telegram/telegram.Provider.js";
import { ArchivoError, AuthClientError, ClientError, ConexionError, CORSError } from "#src/utils/CustomErrors.js";
import { customResponseError } from "#src/utils/CustomResponseError.js";
import { line, log } from "#src/utils/logger.pino.js";
import { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";

export function errorHandlerMiddleware(err: any, req: Request, res: Response, next: NextFunction): void {
  let { statusCode, message } = err;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Datos no válidos";

    const mensajeError = err.issues.map((dato) => ({
      message: dato.message,
      path: dato.path.join("."),
    }));

    log.error(line(), "ZodError:", mensajeError);
  }

  if (statusCode === undefined) {
    statusCode = 500;
    message = "Ocurrió un error";
  }

  const esErrorConocido = err instanceof CORSError || err instanceof ArchivoError || err instanceof ClientError || err instanceof ConexionError || err instanceof AuthClientError || err instanceof ZodError;

  if (!esErrorConocido) {
    //log.error(line(), "Uncaught Error:", util.inspect(err, { colors: true, depth: null }));
    log.error(line(), "Uncaught Error:", err);
    telegramService.sendMessageException(err);
  }

  customResponseError(res, statusCode, message);
}
