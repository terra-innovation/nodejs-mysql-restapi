import nodemailer from "nodemailer";
import * as config from "../../config.js";

class EmailSender {
  constructor() {
    this.fromAddresses = {
      contacto: "tu_email_contacto@tu_dominio.com",
      gerenteGeneral: "tu_email_gerente@tu_dominio.com",
      contabilidad1: "tu_email_contabilidad1@tu_dominio.com",
      contabilidad2: "tu_email_contabilidad2@tu_dominio.com",
      // Agrega más direcciones aquí si es necesario
    };
  }

  async sendContactoFinanzatech(mailOptions) {
    const transporter = this.createTransporterZohoMail(config.MAIL_CONTACTO_FINANZATECH_USER, config.MAIL_CONTACTO_FINANZATECH_PASS);
    return this.sendEmail(transporter, { ...mailOptions, from: '"' + config.MAIL_CONTACTO_FINANZATECH_NAME + '" <' + config.MAIL_CONTACTO_FINANZATECH_USER + ">" });
  }

  async sendGerenteGeneralDominio1(mailOptions) {
    const transporter = this.createTransporterZohoMail("tu_email_gerente@tu_dominio.com", "tu_contraseña_gerente");
    return this.sendEmail(transporter, { ...mailOptions, from: this.fromAddresses.gerenteGeneral });
  }

  async sendContabilidadDominio1(mailOptions) {
    const transporter = this.createTransporterZohoMail("tu_email_contabilidad1@tu_dominio.com", "tu_contraseña_contabilidad1");
    return this.sendEmail(transporter, { ...mailOptions, from: this.fromAddresses.contabilidad1 });
  }

  async sendContabilidadDominio2(mailOptions) {
    const transporter = this.createTransporterZohoMail("tu_email_contabilidad2@tu_dominio.com", "tu_contraseña_contabilidad2");
    return this.sendEmail(transporter, { ...mailOptions, from: this.fromAddresses.contabilidad2 });
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
    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info(line(), "Correo enviado: " + info.response);
      return info;
    } catch (error) {
      logger.error(line(), "Error al enviar el correo:", error);
      throw error;
    }
  }
}

export default EmailSender;
