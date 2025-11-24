import axios from "axios";
import { log, line } from "#src/utils/logger.pino.js";
import { env } from "#src/config.js";

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
    log.error(line(), "Error enviando mensaje a Telegram:", error.response?.status || error.messag);
    throw new Error("No se pudo enviar el mensaje a Telegram");
  }
};
