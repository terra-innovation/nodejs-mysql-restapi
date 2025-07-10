// scripts/test-send-codigo-verificacion.ts

import dotenv from "dotenv";
dotenv.config(); // Carga tu archivo .env

import TemplateManager from "#src/utils/email/TemplateManager.ts";
import EmailSender from "#src/utils/email/emailSender.ts";
import { log, line } from "#src/utils/logger.pino.js";

// Instanciar clases
const templateManager = new TemplateManager();
const emailSender = new EmailSender();

async function main() {
  const testToEmail = "jonyhurtado.proyectos@gmail.com"; // <-- ⚠️ CAMBIA ESTO

  const dataEmail = {
    otp: "654321",
    duracion_minutos: 5,
    fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
  };

  try {
    console.log(line());
    console.log("🚧 Generando contenido del correo con plantilla...");

    const emailTemplate = await templateManager.templateCodigoVerificacion(dataEmail);

    const mailOptions = {
      to: testToEmail,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    await emailSender.sendContactoFinanzatech(mailOptions);

    console.log("✅ Correo enviado exitosamente.");
    console.log(line());
  } catch (error) {
    console.error("❌ Error durante la prueba de envío de correo:");
    log.error(line(), error);
  }
}

// Ejecutar en la consola: npx tsx .\tests\email\sendemail.test.ts
main();
