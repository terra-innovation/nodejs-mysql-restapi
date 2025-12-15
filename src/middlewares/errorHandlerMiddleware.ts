import { type Request, type Response, type NextFunction } from "express";
import { CORSError, ArchivoError, ClientError, ConexionError, AuthClientError } from "#src/utils/CustomErrors.js";
import { ValidationError } from "yup";
import { log, line } from "#src/utils/logger.pino.js";
import { customResponseError } from "#src/utils/CustomResponseError.js";
import util from "util";
import * as telegramService from "#src/services/telegram.Service.js";

export function errorHandlerMiddleware(err: any, req: Request, res: Response, next: NextFunction): void {
  let { statusCode, message } = err;

  if (err instanceof ValidationError) {
    statusCode = 400;
    message = "Datos no válidos";

    const mensajeError = err.inner.map((dato) => ({
      message: dato.message,
      originalValue: dato.value,
      path: dato.path,
    }));

    log.error(line(), "ValidationError:", mensajeError);
  }

  if (statusCode === undefined) {
    statusCode = 500;
    message = "Ocurrió un error";
  }

  const esErrorConocido = err instanceof CORSError || err instanceof ArchivoError || err instanceof ClientError || err instanceof ConexionError || err instanceof AuthClientError || err instanceof ValidationError;

  if (!esErrorConocido) {
    //log.error(line(), "Uncaught Error:", util.inspect(err, { colors: true, depth: null }));
    log.error(line(), "Uncaught Error:", err);
  }
  telegramService.sendMessageTelegramException(err);
  customResponseError(res, statusCode, message);
}
