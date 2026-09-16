/**
 * src/scripts/email_venta_frio.ts
 *
 * Runner para el proceso de envío de emails de Venta en Frío.
 * Lee un archivo Excel (.xlsx), toma el primer registro pendiente,
 * envía el email y actualiza el estado en el mismo archivo.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Uso:
 *   El archivo Excel se puede pasar como argumento o se toma el valor por defecto.
 *
 * Ejecución en DESARROLLO (sin compilar):
 *   npx tsx src/scripts/email_venta_frio.ts
 *   npx tsx src/scripts/email_venta_frio.ts /ruta/al/archivo.xlsx
 *   npm run cron:email-venta-frio
 *
 * Ejecución en PRODUCCIÓN (código compilado):
 *   node dist/scripts/email_venta_frio.js
 *   node dist/scripts/email_venta_frio.js /ruta/al/archivo.xlsx
 *   npm run cron:email-venta-frio:prod
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Crontab Linux (cada 2 minutos):
 *   Expresión cron : cada-2-min * * * *
 *   Comando        : cd /opt/finanzatech/ft-app-backend && /usr/bin/node dist/scripts/email_venta_frio.js >> /var/log/ft_cron_email.log 2>&1
 *   Nota           : Reemplaza "cada-2-min" por la expresión: asterisco/2 (sin espacios)
 *
 * Programador de Tareas Windows:
 *   - Programa o script : node
 *   - Argumentos        : dist/scripts/email_venta_frio.js
 *   - Iniciar en        : D:\06_Workspace_nodejs\ft-app-backend
 *   - Desencadenador    : Diariamente, repetir cada 2 minutos
 */

import dotenv from "dotenv";
import { join } from "path";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: join(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`) });
} else {
  dotenv.config();
}

import fs from "fs";
import path from "path";
import * as df from "#src/utils/dateUtils.js";
import { sendEmailVentaFrioXlsxLogic } from "#src/logics/emailVentaFrio.Logic.js";

// El archivo puede pasarse como argumento o usa el valor por defecto
const filePath = process.argv[2] ?? path.resolve(process.cwd(), "temporal", "20260127_BASE_2.xlsx");

/**
 * Valida que el archivo exista y tenga permisos de lectura y escritura.
 */
function assertFileAccessible(fp: string): void {
  if (!fs.existsSync(fp)) {
    console.error("❌ Archivo no encontrado");
    console.error(`   Ruta esperada : ${fp}`);
    process.exit(1);
  }
  try {
    fs.accessSync(fp, fs.constants.R_OK | fs.constants.W_OK);
  } catch {
    console.error("❌ Archivo sin permisos suficientes (se requiere lectura y escritura)");
    console.error(`   Ruta : ${fp}`);
    process.exit(1);
  }
}

async function main() {
  const startTime = Date.now();

  console.log("==================================================");
  console.log("📧 CRON: Envío de Emails — Venta en Frío");
  console.log(`📅 Inicio        : ${df.formatDateForLogLocale(new Date())}`);
  console.log(`🌍 Entorno       : ${process.env.NODE_ENV || "development"}`);
  console.log(`📂 Archivo       : ${filePath}`);
  console.log("==================================================");

  assertFileAccessible(filePath);

  try {
    const resultado = await sendEmailVentaFrioXlsxLogic(filePath);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n--------------------------------------------------");
    if (!resultado) {
      console.log("📭 No hay registros pendientes para procesar");
    } else if (resultado.resultado === "OK") {
      console.log("✅ Email enviado exitosamente");
      console.log(`   • RUC          : ${resultado.ruc}`);
      console.log(`   • Empresa      : ${resultado.razon_social}`);
      console.log(`   • Correo       : ${resultado.correo}`);
    } else {
      console.error("❌ Error al enviar email");
      console.error(`   • RUC         : ${resultado.ruc}`);
      console.error(`   • Empresa     : ${resultado.razon_social}`);
      console.error(`   • Correo      : ${resultado.correo}`);
      console.error(`   • Error       : ${resultado.error}`);
    }
    console.log(`   ⏱️ Duración    : ${duration}s`);
    console.log("==================================================");
    process.exit(0);
  } catch (error: any) {
    console.error("\n💥 Error fatal en el script de email:");
    console.error(`   Mensaje: ${error?.message || error}`);
    process.exit(1);
  }
}

main();
