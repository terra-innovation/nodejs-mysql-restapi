import axios from "axios";
import { log, line } from "#src/utils/logger.pino.js";
import { env } from "#src/config.js";
import * as df from "#src/utils/dateUtils.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";

import { getContext } from "#src/utils/context/loggerContext.js";

export const sendMessageTelegramLogin = async (json: any): Promise<void> => {
  const store = getContext();

  const newline = "\r\n";
  var mensaje = "";

  mensaje += "[" + df.formatDateTimeWithZoneLocale(new Date()) + "]" + newline;
  mensaje += newline;
  mensaje += "<b>API.FINANZATECH.COM: Login</b>" + newline;
  mensaje += newline;

  // Información del error
  mensaje +=
    jsonUtils.jsonToPlainText(
      {
        ...(store && typeof store === "object" && !Array.isArray(store) ? store : {}),
        env: env.NODE_ENV,
      },
      newline
    ) + newline;
  mensaje += newline;
  mensaje += jsonUtils.jsonToPlainText(json, newline) + newline;
  mensaje += newline;

  sendMessageTelegramImportant(mensaje);
};

export const sendMessageTelegramException = async (err: Error): Promise<void> => {
  const store = getContext();

  const escapeHtml = (str = "") => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const reasonToLog =
    err instanceof Error
      ? {
          name: err.name,
          message: err.message,
          stack: `<pre>${escapeHtml(err.stack || "")}</pre>`,
        }
      : err; // si no es un Error, simplemente registramos el valor

  const newline = "\r\n";
  var mensaje = "";

  mensaje += "[" + df.formatDateTimeWithZoneLocale(new Date()) + "]" + newline;
  mensaje += newline;
  mensaje += "<b>API.FINANZATECH.COM: Error</b>" + newline;
  mensaje += newline;

  // Información del error
  mensaje +=
    jsonUtils.jsonToPlainText(
      {
        ...(store && typeof store === "object" && !Array.isArray(store) ? store : {}),
        env: env.NODE_ENV,
      },
      newline
    ) + newline;
  mensaje += newline;
  mensaje += jsonUtils.jsonToPlainText(reasonToLog, newline) + newline;
  mensaje += newline;

  sendMessageTelegramError(mensaje);
};

export const sendMessageTelegramEndPointNotFound = async (json: any): Promise<void> => {
  const store = getContext();

  const newline = "\r\n";
  var mensaje = "";

  mensaje += "[" + df.formatDateTimeWithZoneLocale(new Date()) + "]" + newline;
  mensaje += newline;
  mensaje += "<b>API.FINANZATECH.COM: Error</b>" + newline;
  mensaje += newline;

  // Información del error
  mensaje +=
    jsonUtils.jsonToPlainText(
      {
        ...(store && typeof store === "object" && !Array.isArray(store) ? store : {}),
        env: env.NODE_ENV,
      },
      newline
    ) + newline;
  mensaje += newline;
  mensaje += jsonUtils.jsonToPlainText(json, newline) + newline;
  mensaje += newline;

  sendMessageTelegramError(mensaje);
};

export const sendMessageTelegramImportant = async (message: string): Promise<void> => {
  const token = env.TELEGRAM_IMPORTANT_TOKEN;
  const chatID = env.TELEGRAM_IMPORTANT_CHATID;
  await sendMessageTelegram(token, chatID, message);
};

export const sendMessageTelegramInformation = async (message: string): Promise<void> => {
  const token = env.TELEGRAM_IMFORMATION_TOKEN;
  const chatID = env.TELEGRAM_IMFORMATION_CHATID;
  await sendMessageTelegram(token, chatID, message);
};

export const sendMessageTelegramWaring = async (message: string): Promise<void> => {
  const token = env.TELEGRAM_WARING_TOKEN;
  const chatID = env.TELEGRAM_WARRING_CHATID;
  await sendMessageTelegram(token, chatID, message);
};

export const sendMessageTelegramError = async (message: string): Promise<void> => {
  const token = env.TELEGRAM_ERROR_TOKEN;
  const chatID = env.TELEGRAM_ERROR_CHATID;
  await sendMessageTelegram(token, chatID, message);
};

/**
 * Envía un mensaje a Telegram usando la API oficial.
 * @param token Token del bot de Telegram
 * @param chatId ID del chat o canal
 * @param message Texto del mensaje (máximo 4096 caracteres)
 */
export const sendMessageTelegram = async (token: string, chatId: string, message: string): Promise<void> => {
  // Telegram soporta hasta 4096 caracteres
  const maxLength = 4096;
  const originalLength = message.length;

  if (originalLength > maxLength) {
    message = message.substring(0, 4000) + `...(tiene ${originalLength} caracteres y supera el máximo de ${maxLength})`;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    });
  } catch (error) {
    log.error(line(), "Error enviando mensaje a Telegram:", error);
  }
};
