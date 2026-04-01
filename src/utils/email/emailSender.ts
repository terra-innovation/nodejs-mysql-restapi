import nodemailer from "nodemailer";
import { env } from "#src/config.js";
import { line, log } from "#src/utils/logger.pino.js";
import { logHtmlLink, logTxtLink } from "#src/utils/debug.js";
import { isProduction } from "#src/config.js";

class EmailSender {
  constructor() {}

  async sendContactoFinanzatech(mailOptions) {
    const transporter = this.createTransporterZohoMail(env.MAIL_CONTACTO_FINANZATECH_USER, env.MAIL_CONTACTO_FINANZATECH_PASS);
    const options = {
      ...mailOptions,
      subject: mailOptions.subject + (isProduction ? "" : " [Prueba]"),
      from: '"' + env.MAIL_CONTACTO_FINANZATECH_NAME + '" <' + env.MAIL_CONTACTO_FINANZATECH_USER + ">",
      bcc: env.MAIL_BACKUP,
    };

    log.debug(line(), "From: ", options.from);
    log.debug(line(), "To: ", options.to);
    log.debug(line(), "BCC: ", options.bcc);
    log.debug(line(), "Asunto: ", options.subject);
    logHtmlLink(options.html);
    logTxtLink(options.text);

    if (env.MAIL_CONTACTO_FINANZATECH_ACTIVE) {
      log.debug(line(), "El envío de correo está activado para: ", env.MAIL_CONTACTO_FINANZATECH_USER);
      return this.sendEmail(transporter, options);
    } else {
      log.debug(line(), "Advertencia: El envío de correo está desactivado. para: ", env.MAIL_CONTACTO_FINANZATECH_USER);
    }
  }

  createTransporterZohoMail(user, pass) {
    return nodemailer.createTransport({
      host: env.SMTP_ZOHO_HOST,
      port: env.SMTP_ZOHO_PORT, // 587 o 465 para SSL
      secure: env.SMTP_ZOHO_SECURE,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendEmail(transporter, mailOptions) {
    await transporter.sendMail(mailOptions);
  }
}

export default EmailSender;
