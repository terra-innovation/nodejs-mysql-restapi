/**
 * src/scripts/sync_tipo_cambio.ts
 *
 * Script para ejecutar vía cron / programador de tareas en Linux o Windows cada 8 horas.
 * Sincroniza los tipos de cambio diarios de SUNAT y SBS aplicando:
 * 1. Estrategia Cache-Aside: Consulta primero si el tipo de cambio del día ya existe en la
 *    base de datos local. Si ya existe, NO consulta las APIs externas.
 * 2. Estrategia Fallback en Cascada (Failover Jerárquico): Si no existe en la BD local,
 *    consulta los servicios activos (estado 1) ordenados por prioridad de menor a mayor.
 *    Al recibir respuesta exitosa, persiste en la BD y detiene los intentos hacia los demás servicios.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Ejecución en DESARROLLO (sin compilar):
 *   npx tsx src/scripts/sync_tipo_cambio.ts
 *   npm run cron:tipo-cambio
 *
 * Ejecución en PRODUCCIÓN (código compilado):
 *   node dist/scripts/sync_tipo_cambio.js
 *   npm run cron:tipo-cambio:prod
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Crontab Linux (cada 8 horas: 00:00, 08:00, 16:00):
 *   0 0,8,16 * * * cd /opt/finanzatech/ft-app-backend && /usr/bin/node dist/scripts/sync_tipo_cambio.js >> /var/log/ft_cron_tipocambio.log 2>&1
 *
 * Programador de Tareas Windows:
 *   - Programa o script : node
 *   - Argumentos        : dist/scripts/sync_tipo_cambio.js
 *   - Iniciar en        : D:\06_Workspace_nodejs\ft-app-backend
 *   - Desencadenador    : Diariamente, repetir cada 8 horas
 */

import dotenv from "dotenv";
import { join } from "path";

console.log("A process.env.NODE_ENV", process.env.NODE_ENV);
console.log("A process.cwd()", process.cwd());
if (process.env.NODE_ENV !== "production") {
  console.log("B process.env.NODE_ENV", process.env.NODE_ENV);
  dotenv.config({ path: join(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`) });
  console.log("C process.env.NODE_ENV", process.env.NODE_ENV);
} else {
  console.log("D process.env.NODE_ENV", process.env.NODE_ENV);
  dotenv.config();
  console.log("E process.env.NODE_ENV", process.env.NODE_ENV);
}

import { sincronizarTipoCambioDelDiaLogic } from "#src/logics/tipocambio.Logic.js";
import * as df from "#src/utils/dateUtils.js";
import { DateTime } from "luxon";

async function main() {
  const startTime = Date.now();

  console.log("==================================================");
  console.log("🕒 CRON: Sincronización de Tipos de Cambio");
  console.log("⏰ Frecuencia    : Cada 8 Horas");
  console.log(`📅 Inicio        : ${df.formatDateForLogLocale(new Date())}`);
  console.log(`🌍 Entorno       : ${process.env.NODE_ENV || "development"}`);
  console.log("⚙️ Estrategia    : Cache-Aside + Failover Jerárquico");
  console.log("==================================================");

  try {
    console.log("\n🚀 Iniciando verificación de tipos de cambio del día...");
    const resultado = await sincronizarTipoCambioDelDiaLogic();

    const sunatMeta = resultado.sunat as any;
    const sbsMeta = resultado.sbs as any;

    console.log("\n--------------------------------------------------");
    console.log("📌 1. TIPO DE CAMBIO SUNAT (USD/PEN)");
    console.log("--------------------------------------------------");
    if (sunatMeta.origen === "CACHE_LOCAL") {
      console.log("   🟢 Estado      : [Cache-Aside: HIT] Ya existe en la base de datos local");
      console.log("   🚫 APIs        : No fue necesario consultar servicios externos");
    } else {
      console.log("   🌐 Estado      : [Cache-Aside: MISS] Sincronizado desde API externa");
      console.log(`   📡 Proveedor   : [Prioridad ${sunatMeta.prioridad || 1}] ${sunatMeta.proveedor || "Desconocido"}`);
      console.log("   ⏹️ Fallback    : Respuesta exitosa, se detuvo la cascada");
    }
    console.log(`   📅 Fecha       : ${DateTime.fromJSDate(resultado.sunat.fecha).toFormat("yyyy-MM-dd")}`);
    console.log(`   💵 Compra      : ${resultado.sunat.precio_compra}`);
    console.log(`   💴 Venta       : ${resultado.sunat.precio_venta}`);
    console.log(`   🆔 ID Registro : ${resultado.sunat.idsunattipocambio}`);

    console.log("\n--------------------------------------------------");
    console.log("📌 2. TIPO DE CAMBIO SBS (USD/PEN)");
    console.log("--------------------------------------------------");
    if (sbsMeta.origen === "CACHE_LOCAL") {
      console.log("   🟢 Estado      : [Cache-Aside: HIT] Ya existe en la base de datos local");
      console.log("   🚫 APIs        : No fue necesario consultar servicios externos");
    } else {
      console.log("   🌐 Estado      : [Cache-Aside: MISS] Sincronizado desde API externa");
      console.log(`   📡 Proveedor   : [Prioridad ${sbsMeta.prioridad || 1}] ${sbsMeta.proveedor || "Desconocido"}`);
      console.log("   ⏹️ Fallback    : Respuesta exitosa, se detuvo la cascada");
    }
    console.log(`   📅 Fecha       : ${DateTime.fromJSDate(resultado.sbs.fecha).toFormat("yyyy-MM-dd")}`);
    console.log(`   💵 Compra      : ${resultado.sbs.precio_compra}`);
    console.log(`   💴 Venta       : ${resultado.sbs.precio_venta}`);
    console.log(`   📊 Contable    : ${resultado.sbs.precio_contable ?? "N/A"}`);
    console.log(`   🆔 ID Registro : ${resultado.sbs.idsbstipocambio}`);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n==================================================");
    console.log("📊 RESUMEN DE EJECUCIÓN");
    console.log("==================================================");
    console.log(`   • SUNAT : ${sunatMeta.origen === "CACHE_LOCAL" ? "Caché Local (Sin llamadas externas)" : `Sincronizado vía ${sunatMeta.proveedor}`}`);
    console.log(`   • SBS   : ${sbsMeta.origen === "CACHE_LOCAL" ? "Caché Local (Sin llamadas externas)" : `Sincronizado vía ${sbsMeta.proveedor}`}`);
    console.log(`   ⏱️ Duración total: ${duration}s`);
    console.log("==================================================");
    process.exit(0);
  } catch (error: any) {
    console.error("\n💥 Error fatal en sincronización de tipos de cambio:");
    console.error(`   Mensaje: ${error?.message || error}`);
    if (error?.statusCode || error?.status) {
      console.error(`   HTTP Status: ${error.statusCode || error.status}`);
    }
    if (error?.data) {
      console.error("   Detalle API:", JSON.stringify(error.data, null, 2));
    }
    process.exit(1);
  }
}

main();
