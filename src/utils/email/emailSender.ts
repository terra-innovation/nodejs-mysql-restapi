import nodemailer from "nodemailer";
import { performance } from "perf_hooks";
import { env, isProduction } from "#src/config.js";
import { line, log } from "#src/utils/logger.pino.js";
import { logHtmlLink, logTxtLink } from "#src/utils/debug.js";
import { prismaFT } from "#src/models/prisma/db-factoring.js";
import * as configuracioncorreoDao from "#src/daos/configuracioncorreo.prisma.Dao.js";
import { decryptText } from "#src/utils/cryptoUtils.js";

class EmailSender {
  constructor() {}

  async sendContactoFinanzatech(mailOptions) {
    const config = await prismaFT.client.$transaction(
      async (tx) => {
        return await configuracioncorreoDao.getMAIL_CONTACTO_FINANZATECH(tx);
      },
      { timeout: prismaFT.transactionTimeout },
    );

    if (!config) {
      log.error(line(), "No se encontró la configuración de correo para contacto Finanzatech (ID 1)");
      return;
    }

    if (!config.is_enabled) {
      log.debug(line(), "Advertencia: El envío de correo está desactivado en la base de datos para: ", config.smtp_user);
      return;
    }

    const decryptedPass = decryptText(`${config.encryption_iv}|${config.smtp_pass}`, env.MAIL_ENCRYPTION_KEY_COFIG);

    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_secure,
      auth: {
        user: config.smtp_user,
        pass: decryptedPass,
      },
    });

    const options = {
      ...mailOptions,
      subject: mailOptions.subject + (isProduction ? "" : " [Prueba]"),
      from: '"' + config.smtp_name + '" <' + config.smtp_user + ">",
      bcc: config.mail_backup || "",
    };

    log.debug(line(), "From: ", options.from);
    log.debug(line(), "To: ", options.to);
    log.debug(line(), "BCC: ", options.bcc);
    log.debug(line(), "Asunto: ", options.subject);
    logHtmlLink(options.html);
    logTxtLink(options.text);

    log.debug(line(), "El envío de correo está activado para: ", config.smtp_user);
    return this.sendEmail(transporter, options);
  }

  async sendEmail(transporter, mailOptions) {
    await transporter.sendMail(mailOptions);
  }

  async testConnection(configuracioncorreoid: string, testEmail: string) {
    const startTime = performance.now();
    const logs: string[] = [];
    const stats: any[] = [];

    const addLog = (message: string) => {
      const time = ((performance.now() - startTime) / 1000).toFixed(3);
      logs.push(`[${time}s] ${message}`);
    };

    const addStat = (step: string, start: number) => {
      const end = performance.now();
      stats.push({
        step,
        duration: `${(end - start).toFixed(2)}ms`,
      });
      return end;
    };

    try {
      let stepStart = performance.now();
      addLog("Iniciando prueba de conexión...");

      addLog(`Buscando configuración con ID: ${configuracioncorreoid}`);
      const config = await prismaFT.client.$transaction(
        async (tx) => {
          return await configuracioncorreoDao.getConfiguracioncorreoByConfiguracioncorreoid(tx, configuracioncorreoid);
        },
        { timeout: prismaFT.transactionTimeout },
      );
      stepStart = addStat("Búsqueda en base de datos", stepStart);

      if (!config) {
        addLog("ERROR: No se encontró la configuración en la base de datos.");
        throw new Error("Configuración no encontrada");
      }

      addLog(`Configuración encontrada: ${config.alias} (${config.smtp_user})`);

      addLog("Desencriptando credenciales...");
      const decryptedPass = decryptText(`${config.encryption_iv}|${config.smtp_pass}`, env.MAIL_ENCRYPTION_KEY_COFIG);
      stepStart = addStat("Desencriptación de contraseña", stepStart);

      addLog(`Configurando transportador SMTP: ${config.smtp_host}:${config.smtp_port} (Secure: ${config.smtp_secure})`);
      const transporter = nodemailer.createTransport({
        host: config.smtp_host,
        port: config.smtp_port,
        secure: config.smtp_secure,
        auth: {
          user: config.smtp_user,
          pass: decryptedPass,
        },
      });
      stepStart = addStat("Configuración de transportador", stepStart);

      addLog("Verificando conexión con el servidor SMTP (verify)...");
      await transporter.verify();
      addLog("Conexión SMTP verificada exitosamente.");
      stepStart = addStat("Verificación de conexión SMTP", stepStart);

      const subject = `Correo de Prueba - ${config.alias} - App FT`;
      const body = `Este es un correo de prueba enviado desde la aplicación FT para validar la configuración SMTP.
      
Si has recibido este correo, la configuración funciona correctamente.`;

      addLog(`Preparando envío de correo de prueba a: ${testEmail}`);
      const mailOptions = {
        from: `"${config.smtp_name}" <${config.smtp_user}>`,
        to: testEmail,
        subject: subject,
        text: body,
      };

      addLog("Enviando correo...");
      await transporter.sendMail(mailOptions);
      addLog("Correo enviado exitosamente.");
      addStat("Envío de correo", stepStart);

      addLog("Prueba de conexión completada con éxito.");

      return {
        success: true,
        message: "Prueba completada exitosamente",
        consoleLog: logs.join("\n"),
        statistics: stats,
      };
    } catch (error: any) {
      addLog(`ERROR CRÍTICO: ${error.message}`);
      return {
        success: false,
        message: error.message,
        consoleLog: logs.join("\n"),
        statistics: stats,
      };
    }
  }
}

export default EmailSender;
