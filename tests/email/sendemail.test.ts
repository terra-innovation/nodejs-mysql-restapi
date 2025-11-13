// scripts/test-send-codigo-verificacion.ts

import dotenv from "dotenv";
dotenv.config(); // Carga tu archivo .env

import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";

import TemplateManager from "#src/utils/email/TemplateManager.ts";
import EmailSender from "#src/utils/email/emailSender.ts";
import { log, line } from "#src/utils/logger.pino.js";

import * as df from "#src/utils/dateUtils.js";
import * as nf from "#src/utils/numberUtils.js";

import * as emailService from "#src/services/email.Service.js";

// Instanciar clases
const templateManager = new TemplateManager();
const emailSender = new EmailSender();

async function main() {
  //testTemplateCodigoVerificacion();
  testTemplateFactoringEmpresaServicioFactoringSolicitud();
}

async function testTemplateFactoringEmpresaServicioFactoringSolicitud() {
  const testToEmail = "jonyhurtado.proyectos@gmail.com"; // <-- ⚠️ CAMBIA ESTO

  const idfactoring = 71;
  const factoring = await prismaFT.client.$transaction((tx) => factoringDao.getFactoringByIdfactoring(tx, idfactoring), { timeout: prismaFT.transactionTimeout });

  if (!factoring) {
    console.error("Factoring no existe: [" + idfactoring + "]");
  }

  console.log("factoring: ", JSON.stringify(factoring, null, 2));

  const session_usuario = await prismaFT.client.$transaction(
    async (tx) => {
      const idusuario = 154;
      var session_usuario = await usuarioDao.getUsuarioByIdusuario(tx, idusuario);
      if (!session_usuario) {
        console.error("session_usuario no existe: [" + idusuario + "]");
      } else {
        //console.log("session_usuario: ", session_usuario);
      }

      return session_usuario;
    },
    { timeout: prismaFT.transactionTimeout }
  );

  var paramsEmail = {
    factoring: factoring,
    session_usuario: session_usuario,
  };

  //console.log("data_email: ", JSON.stringify(params, null, 2));

  try {
    console.log(line());
    console.log("🚧 Generando contenido del correo con plantilla...");

    await emailService.sendFactoringEmpresaServicioFactoringSolicitud(testToEmail, paramsEmail);

    console.log("✅ Correo enviado exitosamente.");
    console.log(line());
  } catch (error) {
    console.error("❌ Error durante la prueba de envío de correo:");
    console.error(error);
  }
}

async function testTemplateCodigoVerificacion() {
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
    console.error(error);
  }
}

// Ejecutar en la consola: npx tsx .\tests\email\sendemail.test.ts
main();
