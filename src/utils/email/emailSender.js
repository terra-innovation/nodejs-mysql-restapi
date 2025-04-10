import nodemailer from "nodemailer";
import * as config from "#src/config.js";

class EmailSender {
  constructor() {}

  async sendContactoFinanzatech(mailOptions) {
    const transporter = this.createTransporterZohoMail(config.MAIL_CONTACTO_FINANZATECH_USER, config.MAIL_CONTACTO_FINANZATECH_PASS);
    const options = {
      ...mailOptions,
      from: '"' + config.MAIL_CONTACTO_FINANZATECH_NAME + '" <' + config.MAIL_CONTACTO_FINANZATECH_USER + ">",
      bcc: config.MAIL_BACKUP,
    };
    return this.sendEmail(transporter, options);
  }

  createTransporterZohoMail(user, pass) {
    return nodemailer.createTransport({
      host: config.SMTP_ZOHO_HOST,
      port: config.SMTP_ZOHO_PORT, // 587 o 465 para SSL
      secure: config.SMTP_ZOHO_SECURE,
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
