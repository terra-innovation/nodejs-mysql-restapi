// scripts/test-send-codigo-verificacion.ts

import dotenv from "dotenv";
dotenv.config(); // Carga tu archivo .env

import { log, line } from "#src/utils/logger.pino.js";

import * as df from "#src/utils/dateUtils.js";
import * as nf from "#src/utils/numberUtils.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";

import * as telegramService from "#src/services/telegram.Service.js";

async function main() {
  testSendTelegramMensaje();
}

async function testSendTelegramMensaje() {
  try {
    console.log(line());
    console.log("🚀 Iniciando prueba de envío de mensajes a Telegram...");

    const mensajeInfo = "Hola telegram <b>información</b>\r\nhola";
    await telegramService.sendMessageTelegramInformation(mensajeInfo);
    console.log("✅ Mensaje de *información* enviado correctamente.");

    const mensajeImpor = "Hola telegram Importante";
    //await telegramService.sendMessageTelegramImportant(mensajeImpor);
    console.log("✅ Mensaje de *importante* enviado correctamente.");

    const mensajeWari = "Hola telegram Cuidado";
    //await telegramService.sendMessageTelegramWaring(mensajeWari);
    console.log("✅ Mensaje de *advertencia* enviado correctamente.");

    console.log("🎯 Prueba finalizada sin errores.");
    console.log(line());
  } catch (error) {
    console.error("❌ Error durante la prueba de envío de mensajes a Telegram:");
    console.error(error);
  }
}

// Ejecutar en la consola: npx tsx .\tests\email\sendemail.test.ts
main();
