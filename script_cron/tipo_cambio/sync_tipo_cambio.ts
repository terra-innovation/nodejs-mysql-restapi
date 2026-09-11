/**
 * script_cron/tipo_cambio/sync_tipo_cambio.ts
 *
 * Script para ejecutar vía cron / programador de tareas en Linux.
 * Sincroniza los tipos de cambio diarios de SUNAT y SBS desde la API de Decolecta
 * y los almacena en MariaDB (tablas sunat_tipo_cambio y sbs_tipo_cambio).
 *
 * Ejemplo en Crontab (Lunes a Viernes 09:30 AM y 02:00 PM):
 * 30 9,14 * * 1-5 cd /ruta/al/proyecto && npx tsx script_cron/tipo_cambio/sync_tipo_cambio.ts >> logs/cron_tipo_cambio.log 2>&1
 *
 * Ejecución manual:
 * npx tsx script_cron/tipo_cambio/sync_tipo_cambio.ts
 */

import dotenv from "dotenv";
import { join } from "path";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: join(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`) });
} else {
  dotenv.config();
}

import { DateTime } from "luxon";
import * as df from "#src/utils/dateUtils.js";
import { env } from "#src/config.js";
import { sincronizarTipoCambioDelDiaLogic } from "#src/logics/tipocambio.Logic.js";

async function main() {
  const startTime = Date.now();

  console.log("==================================================");
  console.log("🕒 CRON: Sincronización de Tipos de Cambio");
  console.log(`📅 Inicio        : ${df.formatDateForLogLocale(new Date())}`);
  console.log(`🌍 Entorno       : ${process.env.NODE_ENV || "development"}`);
  console.log("==================================================");

  try {
    const resultado = await sincronizarTipoCambioDelDiaLogic();

    console.log("\n✅ Sincronización finalizada con éxito:");
    console.log("   --- SUNAT ---");
    console.log(`   Fecha         : ${DateTime.fromJSDate(resultado.sunat.fecha).toFormat("yyyy-MM-dd")}`);
    console.log(`   Compra        : ${resultado.sunat.precio_compra}`);
    console.log(`   Venta         : ${resultado.sunat.precio_venta}`);
    console.log(`   ID Registro   : ${resultado.sunat.idsunattipocambio}`);

    console.log("\n   --- SBS (USD) ---");
    console.log(`   Fecha         : ${DateTime.fromJSDate(resultado.sbs.fecha).toFormat("yyyy-MM-dd")}`);
    console.log(`   Compra        : ${resultado.sbs.precio_compra}`);
    console.log(`   Venta         : ${resultado.sbs.precio_venta}`);
    console.log(`   Contable      : ${resultado.sbs.precio_contable}`);
    console.log(`   ID Registro   : ${resultado.sbs.idsbstipocambio}`);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️ Tiempo transcurrido: ${duration}s`);
    console.log("==================================================");
    process.exit(0);
  } catch (error: any) {
    console.error("\n💥 Error fatal en sincronización de tipos de cambio:");
    console.error(`   Mensaje: ${error?.message || error}`);
    if (error?.status) {
      console.error(`   HTTP Status: ${error.status}`);
    }
    if (error?.data) {
      console.error("   Detalle API:", JSON.stringify(error.data, null, 2));
    }
    process.exit(1);
  }
}

main();
