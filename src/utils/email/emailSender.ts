import nodemailer from "nodemailer";
import { env } from "#src/config.js";

class EmailSender {
  constructor() {}

  async sendContactoFinanzatech(mailOptions) {
    const transporter = this.createTransporterZohoMail(env.MAIL_CONTACTO_FINANZATECH_USER, env.MAIL_CONTACTO_FINANZATECH_PASS);
    const options = {
      ...mailOptions,
      from: '"' + env.MAIL_CONTACTO_FINANZATECH_NAME + '" <' + env.MAIL_CONTACTO_FINANZATECH_USER + ">",
      bcc: env.MAIL_BACKUP,
    };
    if (env.MAIL_CONTACTO_FINANZATECH_ACTIVE) {
      return this.sendEmail(transporter, options);
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
