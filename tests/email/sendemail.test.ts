// scripts/test-send-codigo-verificacion.ts

import dotenv from "dotenv";
dotenv.config(); // Carga tu archivo .env

import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as factoringtransferenciacedenteDao from "#src/daos/factoringtransferenciacedente.prisma.Dao.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";
import * as factoringpropuestaDao from "#src/daos/factoringpropuesta.prisma.Dao.js";
import * as factorcuentabancariaDao from "#src/daos/factorcuentabancaria.prisma.Dao.js";
import * as configuracionappDao from "#src/daos/configuracionapp.prisma.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";

import TemplateManager from "#src/utils/email/TemplateManager.ts";
import EmailSender from "#src/utils/email/emailSender.ts";
import { log, line } from "#src/utils/logger.pino.js";

import * as df from "#src/utils/dateUtils.js";
import * as nf from "#src/utils/numberUtils.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";

import * as emailService from "#src/services/email.Service.js";

// Instanciar clases
const templateManager = new TemplateManager();
const emailSender = new EmailSender();

async function main() {
  //testTemplateCodigoVerificacion();
  //testTemplateFactoringEmpresaServicioFactoringSolicitud();
  //testSendFactoringEmpresaServicioFactoringPropuestaDisponible();
  //testSendFactoringEmpresaServicioFactoringPropuestaAceptada();
  //testSendFactoringEmpresaServicioFactoringDeudorSolicitudConfirmacion();
  //testSendFactoringEmpresaServicioFactoringCedenteConfirmacionTransferencia();
  //testSendFactoringEmpresaServicioFactoringDeudorNotificacionTransferencia();
  //testSendFactoringEmpresaServicioFactoringCedenteNotificacionInicioOperacion();
  testSendEmailingVentaEnFrio();
}

async function testSendEmailingVentaEnFrio() {
  const testToEmail = "aalfaro@disal.com.pe"; // <-- ⚠️ CAMBIA ESTO

  var paramsEmail = {};

  console.log("paramsEmail: ", JSON.stringify(paramsEmail, null, 2));

  try {
    console.log(line());
    console.log("🚧 Generando contenido del correo con plantilla...");

    await emailService.sendEmailingVentaEnFrio(testToEmail, paramsEmail);

    console.log("✅ Correo enviado exitosamente.");
    console.log(line());
  } catch (error) {
    console.error("❌ Error durante la prueba de envío de correo:");
    console.error(error);
  }
}

async function testSendFactoringEmpresaServicioFactoringCedenteNotificacionInicioOperacion() {
  const testToEmail = "jonyhurtado.proyectos@gmail.com"; // <-- ⚠️ CAMBIA ESTO

  const idfactoring = 73;
  const factoring = await prismaFT.client.$transaction((tx) => factoringDao.getFactoringByIdfactoring(tx, idfactoring), { timeout: prismaFT.transactionTimeout });

  if (!factoring) {
    console.error("Factoring no existe: [" + idfactoring + "]");
  }

  //console.log("factoring: ", JSON.stringify(factoring, null, 2));

  const idusuario = 154;
  const session_usuario = await prismaFT.client.$transaction((tx) => usuarioDao.getUsuarioByIdusuario(tx, idusuario), { timeout: prismaFT.transactionTimeout });

  if (!session_usuario) {
    console.error("session_usuario no existe: [" + idusuario + "]");
  }

  const factoringpropuesta = await prismaFT.client.$transaction((tx) => factoringpropuestaDao.getFactoringpropuestaAceptadaByIdfactoringpropuesta(tx, factoring?.idfactoringpropuestaaceptada ?? 0, [1]), { timeout: prismaFT.transactionTimeout });

  if (!factoringpropuesta) {
    console.error("factoringpropuesta no existe: [" + (factoring?.idfactoringpropuestaaceptada ?? 0) + "]");
  }

  var paramsEmail = {
    factoring: factoring,
    factoringpropuesta: factoringpropuesta,
    usuario: session_usuario,
  };

  console.log("paramsEmail: ", JSON.stringify(paramsEmail, null, 2));

  try {
    console.log(line());
    console.log("🚧 Generando contenido del correo con plantilla...");

    await emailService.sendFactoringEmpresaServicioFactoringCedenteNotificacionInicioOperacion(testToEmail, paramsEmail);

    console.log("✅ Correo enviado exitosamente.");
    console.log(line());
  } catch (error) {
    console.error("❌ Error durante la prueba de envío de correo:");
    console.error(error);
  }
}

async function testSendFactoringEmpresaServicioFactoringDeudorNotificacionTransferencia() {
  const testToEmail = "jonyhurtado.proyectos@gmail.com"; // <-- ⚠️ CAMBIA ESTO

  configuracionappDao;
  const ccEmails = await prismaFT.client.$transaction((tx) => configuracionappDao.getEmailsCCDeudorSolicitaConfirmacion(tx), { timeout: prismaFT.transactionTimeout });

  const testCCEmail: string[] = JSON.parse(ccEmails?.valor || "[]");
  //testCCEmail.push("jonycaleb@gmail.com");
  //testCCEmail.push("calebjony@hotmail.com");

  const idfactoring = 71;
  const factoring = await prismaFT.client.$transaction((tx) => factoringDao.getFactoringByIdfactoring(tx, idfactoring), { timeout: prismaFT.transactionTimeout });

  if (!factoring) {
    console.error("Factoring no existe: [" + idfactoring + "]");
  }

  const idbanco = 1;
  const estados = [1];
  const factorcuentabancaria = await prismaFT.client.$transaction((tx) => factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmonedaIdbanco(tx, factoring?.idfactor ?? 0, factoring?.idmoneda ?? 0, idbanco, estados), { timeout: prismaFT.transactionTimeout });

  //console.log("factoring: ", JSON.stringify(factoring, null, 2));

  var paramsEmail = {
    factoring: factoring,
    factorcuentabancaria: factorcuentabancaria,
  };

  console.log("paramsEmail: ", JSON.stringify(paramsEmail, null, 2));

  try {
    console.log(line());
    console.log("🚧 Generando contenido del correo con plantilla...");

    await emailService.sendFactoringEmpresaServicioFactoringDeudorNotificacionTransferencia(testToEmail, testCCEmail, paramsEmail);

    console.log("✅ Correo enviado exitosamente.");
    console.log(line());
  } catch (error) {
    console.error("❌ Error durante la prueba de envío de correo:");
    console.error(error);
  }
}

async function testSendFactoringEmpresaServicioFactoringCedenteConfirmacionTransferencia() {
  const testToEmail = "jonyhurtado.proyectos@gmail.com"; // <-- ⚠️ CAMBIA ESTO

  const idusuario = 154;
  const session_usuario = await prismaFT.client.$transaction((tx) => usuarioDao.getUsuarioByIdusuario(tx, idusuario), { timeout: prismaFT.transactionTimeout });

  if (!session_usuario) {
    console.error("session_usuario no existe: [" + idusuario + "]");
  }

  const idfactoring = 73;
  const factoring = await prismaFT.client.$transaction((tx) => factoringDao.getFactoringByIdfactoring(tx, idfactoring), { timeout: prismaFT.transactionTimeout });

  if (!factoring) {
    console.error("Factoring no existe: [" + idfactoring + "]");
  }

  //console.log("factoring: ", JSON.stringify(factoring, null, 2));

  const idfactoringtransferenciacedente = 3;
  const factoringtransferenciacedente = await prismaFT.client.$transaction((tx) => factoringtransferenciacedenteDao.getFactoringtransferenciacedenteByIdfactoringtransferenciacedente(tx, idfactoringtransferenciacedente), { timeout: prismaFT.transactionTimeout });

  if (!factoring) {
    console.error("Factoringtransferenciacedente no existe: [" + idfactoring + "]");
  }

  var factoringtransferenciacedenteObfuscated = jsonUtils.ofuscarAtributos(factoringtransferenciacedente, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);

  var paramsEmail = {
    factoring: factoring,
    factoringtransferenciacedente: factoringtransferenciacedenteObfuscated,
    usuario: session_usuario,
  };

  console.log("paramsEmail: ", JSON.stringify(paramsEmail, null, 2));

  try {
    console.log(line());
    console.log("🚧 Generando contenido del correo con plantilla...");

    await emailService.sendFactoringEmpresaServicioFactoringCedenteConfirmacionTransferencia(testToEmail, paramsEmail);

    console.log("✅ Correo enviado exitosamente.");
    console.log(line());
  } catch (error) {
    console.error("❌ Error durante la prueba de envío de correo:");
    console.error(error);
  }
}

async function testSendFactoringEmpresaServicioFactoringDeudorSolicitudConfirmacion() {
  const testToEmail = "jonyhurtado.proyectos@gmail.com"; // <-- ⚠️ CAMBIA ESTO

  configuracionappDao;
  const ccEmails = await prismaFT.client.$transaction((tx) => configuracionappDao.getEmailsCCDeudorSolicitaConfirmacion(tx), { timeout: prismaFT.transactionTimeout });

  const testCCEmail: string[] = JSON.parse(ccEmails?.valor || "[]");
  //testCCEmail.push("jonycaleb@gmail.com");
  //testCCEmail.push("calebjony@hotmail.com");

  const idfactoring = 71;
  const factoring = await prismaFT.client.$transaction((tx) => factoringDao.getFactoringByIdfactoring(tx, idfactoring), { timeout: prismaFT.transactionTimeout });

  if (!factoring) {
    console.error("Factoring no existe: [" + idfactoring + "]");
  }

  //console.log("factoring: ", JSON.stringify(factoring, null, 2));

  var paramsEmail = {
    factoring: factoring,
  };

  console.log("paramsEmail: ", JSON.stringify(paramsEmail, null, 2));

  try {
    console.log(line());
    console.log("🚧 Generando contenido del correo con plantilla...");

    await emailService.sendFactoringEmpresaServicioFactoringDeudorSolicitudConfirmacion(testToEmail, testCCEmail, paramsEmail);

    console.log("✅ Correo enviado exitosamente.");
    console.log(line());
  } catch (error) {
    console.error("❌ Error durante la prueba de envío de correo:");
    console.error(error);
  }
}

async function testSendFactoringEmpresaServicioFactoringPropuestaAceptada() {
  const testToEmail = "jonyhurtado.proyectos@gmail.com"; // <-- ⚠️ CAMBIA ESTO

  const idfactoring = 71;
  const factoring = await prismaFT.client.$transaction((tx) => factoringDao.getFactoringByIdfactoring(tx, idfactoring), { timeout: prismaFT.transactionTimeout });

  if (!factoring) {
    console.error("Factoring no existe: [" + idfactoring + "]");
  }

  //console.log("factoring: ", JSON.stringify(factoring, null, 2));

  const idusuario = 154;
  const session_usuario = await prismaFT.client.$transaction((tx) => usuarioDao.getUsuarioByIdusuario(tx, idusuario), { timeout: prismaFT.transactionTimeout });

  if (!session_usuario) {
    console.error("session_usuario no existe: [" + idusuario + "]");
  }

  const idfactoringpropuesta = 42;
  const factoringpropuesta = await prismaFT.client.$transaction((tx) => factoringpropuestaDao.getFactoringpropuestaAceptadaByIdfactoringpropuesta(tx, idfactoringpropuesta, [1]), { timeout: prismaFT.transactionTimeout });

  if (!factoringpropuesta) {
    console.error("factoringpropuesta no existe: [" + idfactoringpropuesta + "]");
  }

  var paramsEmail = {
    factoring: factoring,
    factoringpropuesta: factoringpropuesta,
    usuario: session_usuario,
  };

  console.log("paramsEmail: ", JSON.stringify(paramsEmail, null, 2));

  try {
    console.log(line());
    console.log("🚧 Generando contenido del correo con plantilla...");

    await emailService.sendFactoringEmpresaServicioFactoringPropuestaAceptada(testToEmail, paramsEmail);

    console.log("✅ Correo enviado exitosamente.");
    console.log(line());
  } catch (error) {
    console.error("❌ Error durante la prueba de envío de correo:");
    console.error(error);
  }
}

async function testSendFactoringEmpresaServicioFactoringPropuestaDisponible() {
  const testToEmail = "jonyhurtado.proyectos@gmail.com"; // <-- ⚠️ CAMBIA ESTO

  const idfactoring = 71;
  const factoring = await prismaFT.client.$transaction((tx) => factoringDao.getFactoringByIdfactoring(tx, idfactoring), { timeout: prismaFT.transactionTimeout });

  if (!factoring) {
    console.error("Factoring no existe: [" + idfactoring + "]");
  }

  //console.log("factoring: ", JSON.stringify(factoring, null, 2));

  const idusuario = 154;
  const session_usuario = await prismaFT.client.$transaction((tx) => usuarioDao.getUsuarioByIdusuario(tx, idusuario), { timeout: prismaFT.transactionTimeout });

  if (!session_usuario) {
    console.error("session_usuario no existe: [" + idusuario + "]");
  }

  const idfactoringpropuesta = 42;
  const factoringpropuesta = await prismaFT.client.$transaction((tx) => factoringpropuestaDao.getFactoringpropuestaByIdfactoringpropuesta(tx, idfactoringpropuesta), { timeout: prismaFT.transactionTimeout });

  if (!factoringpropuesta) {
    console.error("factoringpropuesta no existe: [" + idfactoringpropuesta + "]");
  }

  var paramsEmail = {
    factoring: factoring,
    factoringpropuesta: factoringpropuesta,
    usuario: session_usuario,
  };

  console.log("paramsEmail: ", JSON.stringify(paramsEmail, null, 2));

  try {
    console.log(line());
    console.log("🚧 Generando contenido del correo con plantilla...");

    await emailService.sendFactoringEmpresaServicioFactoringPropuestaDisponible(testToEmail, paramsEmail);

    console.log("✅ Correo enviado exitosamente.");
    console.log(line());
  } catch (error) {
    console.error("❌ Error durante la prueba de envío de correo:");
    console.error(error);
  }
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
    usuario: session_usuario,
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
