import { env } from "#src/config.js";
import * as df from "#src/utils/dateUtils.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import axios from "axios";

import { getContext } from "#src/utils/context/loggerContext.js";

const formatAndSendTelegramMessage = async (level: string, json: any, sendFn: (message: string) => Promise<void>): Promise<void> => {
  const store = getContext();
  const newline = "\r\n";

  let mensaje = "";
  mensaje += "[" + df.formatDateTimeWithZoneLocale(new Date()) + "]" + newline;
  mensaje += newline;
  mensaje += `<b>API.FINANZATECH.COM: ${level}</b>` + newline;
  mensaje += newline;

  mensaje +=
    jsonUtils.jsonForTelegram(
      {
        ...(store && typeof store === "object" && !Array.isArray(store) ? store : {}),
        env: env.NODE_ENV,
      },
      newline,
    ) + newline;
  mensaje += newline;
  mensaje += jsonUtils.jsonForTelegram(json, newline) + newline;
  mensaje += newline;

  await sendFn(mensaje);
};

export const sendMessageImportant = async (json: any): Promise<void> => {
  await formatAndSendTelegramMessage("Important", json, sendMessageTelegramImportant);
};

export const sendMessageError = async (json: any): Promise<void> => {
  await formatAndSendTelegramMessage("Error", json, sendMessageTelegramError);
};

export const sendMessageInfo = async (json: any): Promise<void> => {
  await formatAndSendTelegramMessage("Info", json, sendMessageTelegramImportant);
};

export const sendMessageWaring = async (json: any): Promise<void> => {
  await formatAndSendTelegramMessage("Waring", json, sendMessageTelegramImportant);
};

export const sendMessageException = async (err: Error): Promise<void> => {
  const escapeHtml = (str = "") => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let stack = escapeHtml(err.stack || "");
  const maxLengthStack = 3096;
  const originalLengthStack = stack.length;

  if (originalLengthStack > maxLengthStack) {
    stack = stack.substring(0, 3000) + `...(tiene ${originalLengthStack} caracteres y supera el máximo de ${maxLengthStack} para mostrar el stack)`;
  }
  const reasonToLog =
    err instanceof Error
      ? {
          name: err.name,
          message: err.message,
          stack: `<pre>${stack}</pre>`,
        }
      : err;

  await formatAndSendTelegramMessage("Error", reasonToLog, sendMessageTelegramError);
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

  if (env.TELEGRAM_ACTIVE) {
    try {
      await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      });
    } catch (error) {
      log.error(line(), "Error enviando mensaje a Telegram:", error);
    }
  }
};
