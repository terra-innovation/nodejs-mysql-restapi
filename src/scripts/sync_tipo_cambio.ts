/**
 * src/scripts/sync_tipo_cambio.ts
 *
 * Script para ejecutar vía cron / programador de tareas en Linux o Windows cada 8 horas,
 * o de forma manual especificando una fecha opcional.
 * Sincroniza los tipos de cambio diarios de SUNAT y SBS aplicando:
 * 1. Estrategia Cache-Aside: Consulta primero si el tipo de cambio del día ya existe en la
 *    base de datos local. Si ya existe, NO consulta las APIs externas.
 * 2. Estrategia Fallback en Cascada (Failover Jerárquico): Si no existe en la BD local,
 *    consulta los servicios activos (estado 1) ordenados por prioridad de menor a mayor.
 *    Al recibir respuesta exitosa, persiste en la BD y detiene los intentos hacia los demás servicios.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Ejecución en DESARROLLO (sin compilar):
 *   npx tsx src/scripts/sync_tipo_cambio.ts                     # Fecha de hoy por defecto
 *   npx tsx src/scripts/sync_tipo_cambio.ts 2026-09-17         # Fecha como parámetro posicional
 *   npx tsx src/scripts/sync_tipo_cambio.ts --fecha=2026-09-17 # Fecha con bandera
 *   npm run cron:tipo-cambio                                   # Vía npm script (hoy)
 *   npm run cron:tipo-cambio -- 2026-09-17                     # Vía npm script con parámetro
 *
 * Ejecución en PRODUCCIÓN (código compilado):
 *   node dist/scripts/sync_tipo_cambio.js
 *   node dist/scripts/sync_tipo_cambio.js 2026-09-17
 *   npm run cron:tipo-cambio:prod
 *   npm run cron:tipo-cambio:prod -- 2026-09-17
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

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: join(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`) });
} else {
  dotenv.config();
}

import { sincronizarTipoCambioDelDiaLogic } from "#src/logics/tipocambio.Logic.js";
import * as df from "#src/utils/dateUtils.js";
import { DateTime } from "luxon";

/**
 * Parsea el argumento opcional de fecha desde la línea de comandos (process.argv).
 * Soporta:
 *   - Posicional: node script.js 2026-09-17
 *   - Bandera: node script.js --fecha=2026-09-17 o --fecha 2026-09-17
 *   - Alias: -f 2026-09-17, --date 2026-09-17, -d 2026-09-17
 */
function parseFechaArg(): string | undefined {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i].trim();

    if (arg === "--help" || arg === "-h") {
      console.log(`
Uso:
  npx tsx src/scripts/sync_tipo_cambio.ts [fecha]
  npm run cron:tipo-cambio [-- [fecha]]

Opciones:
  [fecha]                   Fecha opcional en formato YYYY-MM-DD (ej: 2026-09-17).
                            Si no se especifica, toma la fecha del sistema por defecto.
  --fecha, -f, --date, -d   Bandera para pasar la fecha (ej: --fecha=2026-09-17 o -f 2026-09-17).
  --help, -h                Muestra este mensaje de ayuda.
`);
      process.exit(0);
    }

    if (arg.startsWith("--fecha=")) {
      return arg.split("=")[1]?.trim();
    }
    if (arg.startsWith("--date=")) {
      return arg.split("=")[1]?.trim();
    }
    if ((arg === "--fecha" || arg === "-f" || arg === "--date" || arg === "-d") && args[i + 1]) {
      return args[i + 1].trim();
    }
    if (!arg.startsWith("-")) {
      return arg;
    }
  }
  return undefined;
}

async function main() {
  const startTime = Date.now();

  const fechaParam = parseFechaArg();
  let fechaConsulta: string;
  let esFechaPorDefecto = false;

  if (fechaParam) {
    const match = fechaParam.match(/^(\d{4}-\d{2}-\d{2})$/);
    if (!match) {
      console.error(`\n❌ Error: El parámetro de fecha '${fechaParam}' no tiene un formato válido.`);
      console.error("   Formato requerido: YYYY-MM-DD (ejemplo: 2026-09-17)");
      process.exit(1);
    }
    const dt = DateTime.fromISO(match[1], { zone: "America/Lima" });
    if (!dt.isValid) {
      console.error(`\n❌ Error: La fecha '${fechaParam}' no es una fecha válida en el calendario (${dt.invalidReason}).`);
      process.exit(1);
    }
    fechaConsulta = match[1];
  } else {
    // Si no se pasó fecha, toma la fecha del sistema por defecto en la zona de Lima
    fechaConsulta = df.formatDateToYMD(df.getNowLima());
    esFechaPorDefecto = true;
  }

  console.log("==================================================");
  console.log("🕒 CRON: Sincronización de Tipos de Cambio");
  console.log("⏰ Frecuencia    : Cada 8 Horas");
  console.log(`📅 Inicio        : ${df.formatDateTimeWithZoneLocale(new Date())}`);
  console.log(`📅 Consulta      : ${df.formatDateWithZoneLocale(fechaConsulta)} ${esFechaPorDefecto ? "(Por defecto: Fecha del sistema)" : "(Parámetro recibido)"}`);
  console.log(`🌍 Entorno       : ${process.env.NODE_ENV || "development"}`);
  console.log(`🌍 CWD           : ${process.cwd()}`);
  console.log("⚙️ Estrategia    : Cache-Aside + Failover Jerárquico");
  console.log("==================================================");

  try {
    console.log(`\n🚀 Iniciando verificación de tipos de cambio (${esFechaPorDefecto ? "Fecha del sistema" : "Fecha parámetro"}): ${df.formatDateWithZoneLocale(fechaConsulta)}...`);
    const resultado = await sincronizarTipoCambioDelDiaLogic(fechaConsulta);

    const sunatMeta = resultado.sunat as any;
    const sbsMeta = resultado.sbs as any;

    console.log("\n--------------------------------------------------");
    console.log("📌 1. TIPO DE CAMBIO SUNAT (USD/PEN)");
    console.log("--------------------------------------------------");
    if (sunatMeta?.error || sunatMeta?.origen === "FALLO_EN_CASCADA") {
      console.log("   ❌ Estado      : [FALLO EN CASCADA] No se pudo obtener el tipo de cambio SUNAT");
      console.log(`   ⚠️ Detalle     : ${sunatMeta.mensaje || "Todos los servicios de tipo de cambio SUNAT fallaron en cascada"}`);
      if (Array.isArray(sunatMeta.errores)) {
        sunatMeta.errores.forEach((e: any) => {
          console.log(`   🚫 Proveedor   : [Prioridad ${e.prioridad}] ${e.servicio} ➔ ${e.error}`);
        });
      }
    } else if (sunatMeta?.origen === "CACHE_LOCAL") {
      console.log("   🟢 Estado      : [Cache-Aside: HIT] Ya existe en la base de datos local");
      console.log("   🚫 APIs        : No fue necesario consultar servicios externos");
      console.log(`   📅 Fecha       : ${df.formatDateWithZoneLocale(resultado.sunat.fecha)}`);
      console.log(`   💵 Compra      : ${resultado.sunat.precio_compra}`);
      console.log(`   💴 Venta       : ${resultado.sunat.precio_venta}`);
      console.log(`   🆔 ID Registro : ${resultado.sunat.idsunattipocambio}`);
    } else {
      console.log("   🌐 Estado      : [Cache-Aside: MISS] Sincronizado desde API externa");
      console.log(`   📡 Proveedor   : [Prioridad ${sunatMeta?.prioridad || 1}] ${sunatMeta?.proveedor || "Desconocido"}`);
      console.log("   ⏹️ Fallback    : Respuesta exitosa, se detuvo la cascada");
      console.log(`   📅 Fecha       : ${df.formatDateWithZoneLocale(resultado.sunat.fecha)}`);
      console.log(`   💵 Compra      : ${resultado.sunat.precio_compra}`);
      console.log(`   💴 Venta       : ${resultado.sunat.precio_venta}`);
      console.log(`   🆔 ID Registro : ${resultado.sunat.idsunattipocambio}`);
    }

    console.log("\n--------------------------------------------------");
    console.log("📌 2. TIPO DE CAMBIO SBS (USD/PEN)");
    console.log("--------------------------------------------------");
    if (sbsMeta?.error || sbsMeta?.origen === "FALLO_EN_CASCADA") {
      console.log("   ❌ Estado      : [FALLO EN CASCADA] No se pudo obtener el tipo de cambio SBS");
      console.log(`   ⚠️ Detalle     : ${sbsMeta.mensaje || "Todos los servicios de tipo de cambio SBS fallaron en cascada para la moneda USD"}`);
      if (Array.isArray(sbsMeta.errores)) {
        sbsMeta.errores.forEach((e: any) => {
          console.log(`   🚫 Proveedor   : [Prioridad ${e.prioridad}] ${e.servicio} ➔ ${e.error}`);
        });
      }
    } else if (sbsMeta?.origen === "CACHE_LOCAL") {
      console.log("   🟢 Estado      : [Cache-Aside: HIT] Ya existe en la base de datos local");
      console.log("   🚫 APIs        : No fue necesario consultar servicios externos");
      console.log(`   📅 Fecha       : ${df.formatDateWithZoneLocale(resultado.sbs.fecha)}`);
      console.log(`   💵 Compra      : ${resultado.sbs.precio_compra}`);
      console.log(`   💴 Venta       : ${resultado.sbs.precio_venta}`);
      console.log(`   📊 Contable    : ${resultado.sbs.precio_contable ?? "N/A"}`);
      console.log(`   🆔 ID Registro : ${resultado.sbs.idsbstipocambio}`);
    } else {
      console.log("   🌐 Estado      : [Cache-Aside: MISS] Sincronizado desde API externa");
      console.log(`   📡 Proveedor   : [Prioridad ${sbsMeta?.prioridad || 1}] ${sbsMeta?.proveedor || "Desconocido"}`);
      console.log("   ⏹️ Fallback    : Respuesta exitosa, se detuvo la cascada");
      console.log(`   📅 Fecha       : ${df.formatDateWithZoneLocale(resultado.sbs.fecha)}`);
      console.log(`   💵 Compra      : ${resultado.sbs.precio_compra}`);
      console.log(`   💴 Venta       : ${resultado.sbs.precio_venta}`);
      console.log(`   📊 Contable    : ${resultado.sbs.precio_contable ?? "N/A"}`);
      console.log(`   🆔 ID Registro : ${resultado.sbs.idsbstipocambio}`);
    }

    const sunatResumen = sunatMeta?.error || sunatMeta?.origen === "FALLO_EN_CASCADA"
      ? `❌ ${sunatMeta.mensaje || "Todos los servicios de tipo de cambio SUNAT fallaron en cascada"}`
      : sunatMeta?.origen === "CACHE_LOCAL"
      ? "Caché Local (Sin llamadas externas)"
      : `Sincronizado vía ${sunatMeta?.proveedor || "API externa"}`;

    const sbsResumen = sbsMeta?.error || sbsMeta?.origen === "FALLO_EN_CASCADA"
      ? `❌ ${sbsMeta.mensaje || "Todos los servicios de tipo de cambio SBS fallaron en cascada para la moneda USD"}`
      : sbsMeta?.origen === "CACHE_LOCAL"
      ? "Caché Local (Sin llamadas externas)"
      : `Sincronizado vía ${sbsMeta?.proveedor || "API externa"}`;

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n==================================================");
    console.log("📊 RESUMEN DE EJECUCIÓN");
    console.log("==================================================");
    console.log(`   • Consulta : ${df.formatDateWithZoneLocale(fechaConsulta)}`);
    console.log(`   • SUNAT    : ${sunatResumen}`);
    console.log(`   • SBS      : ${sbsResumen}`);
    console.log(`   • Fin      : ${df.formatDateTimeWithZoneLocale(new Date())}`);
    console.log(`   ⏱️ Duración total: ${duration}s`);
    console.log("==================================================");
    process.exit(0);
  } catch (error: any) {
    console.error("\n💥 Error fatal en sincronización de tipos de cambio:");
    console.error(`   Fecha: ${df.formatDateWithZoneLocale(fechaConsulta)}`);
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
