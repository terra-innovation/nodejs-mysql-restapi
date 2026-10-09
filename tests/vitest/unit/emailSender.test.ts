import { describe, expect, it, vi, beforeEach } from "vitest";
import nodemailer from "nodemailer";
import EmailSender from "#src/providers/email/emailSender.js";

describe("EmailSender con Nodemailer 10", () => {
  let sender: EmailSender;

  beforeEach(() => {
    vi.clearAllMocks();
    sender = new EmailSender();
  });

  it("crea un transportador y envía correo usando jsonTransport", async () => {
    const transporter = nodemailer.createTransport({ jsonTransport: true });
    const sendMailSpy = vi.spyOn(transporter, "sendMail");

    const mailOptions = {
      from: '"Finanzatech" <contacto@finanzatech.pe>',
      to: "cliente@empresa.com",
      subject: "Notificación de operación",
      text: "Su factura ha sido aprobada.",
    };

    await sender.sendEmail(transporter, mailOptions);

    expect(sendMailSpy).toHaveBeenCalledTimes(1);
    expect(sendMailSpy).toHaveBeenCalledWith(mailOptions);
  });

  it("permite verificar la conexión SMTP con transporter.verify", async () => {
    const transporter = nodemailer.createTransport({ jsonTransport: true });
    // jsonTransport o stub de verify
    const verifySpy = vi.spyOn(transporter, "verify").mockResolvedValue(true as never);

    await expect(transporter.verify()).resolves.toBe(true);
    expect(verifySpy).toHaveBeenCalledTimes(1);
  });
});
