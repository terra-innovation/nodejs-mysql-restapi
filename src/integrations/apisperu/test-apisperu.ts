/**
 * src/integrations/apisperu/test-apisperu.ts
 * Script de prueba manual para verificar la conectividad y respuesta de los endpoints de Apis Perú.
 *
 * Ejecutar con:
 * npx tsx src/integrations/apisperu/test-apisperu.ts
 */

import {
  getTipoCambioSunatHoy,
  getTipoCambioSunatPorFecha,
  getTipoCambioSunatHistorial,
  getTipoCambioSunatPorMes,
  getTipoCambioSbsHoy,
  getTipoCambioSbsPorFecha,
  getTipoCambioSbsHistorial,
  getTipoCambioTodos,
} from "./index.js";

async function main() {
  console.log("==================================================");
  console.log("🚀 Probando integración con Apis Perú API");
  console.log("==================================================\n");

  try {
    // 1. Tipo de cambio SUNAT - Hoy / Más reciente
    console.log("1️⃣ Consultando Tipo de Cambio SUNAT (Hoy / Reciente)...");
    const sunatHoy = await getTipoCambioSunatHoy();
    console.log("   ✅ SUNAT Hoy:", JSON.stringify(sunatHoy, null, 2));

    // 2. Tipo de cambio SUNAT - Por fecha específica
    const fechaPrueba = "2026-09-08";
    console.log(`\n2️⃣ Consultando Tipo de Cambio SUNAT para la fecha ${fechaPrueba}...`);
    const sunatFecha = await getTipoCambioSunatPorFecha(fechaPrueba);
    console.log("   ✅ SUNAT Fecha:", JSON.stringify(sunatFecha, null, 2));

    // 3. Tipo de cambio SUNAT - Historial por rango
    console.log("\n3️⃣ Consultando Historial SUNAT (2026-09-01 al 2026-09-05)...");
    const sunatHistorial = await getTipoCambioSunatHistorial("2026-09-01", "2026-09-05");
    console.log(`   ✅ SUNAT Historial: ${sunatHistorial.data?.length ?? 0} registros encontrados.`);

    // 4. Tipo de cambio SUNAT - Por mes
    console.log("\n4️⃣ Consultando Tipo de Cambio SUNAT por Mes (08/2025)...");
    const sunatMes = await getTipoCambioSunatPorMes(8, 2025);
    console.log(`   ✅ SUNAT Mes: ${sunatMes.data?.length ?? 0} registros encontrados.`);

    // 5. Tipo de cambio SBS - Hoy / Más reciente
    console.log("\n5️⃣ Consultando Tipo de Cambio SBS (Hoy / Reciente)...");
    const sbsHoy = await getTipoCambioSbsHoy();
    console.log("   ✅ SBS Hoy:", JSON.stringify(sbsHoy, null, 2));

    // 6. Tipo de cambio SBS - Por fecha específica
    console.log(`\n6️⃣ Consultando Tipo de Cambio SBS para la fecha ${fechaPrueba}...`);
    const sbsFecha = await getTipoCambioSbsPorFecha(fechaPrueba);
    console.log("   ✅ SBS Fecha:", JSON.stringify(sbsFecha, null, 2));

    // 7. Tipo de cambio SBS - Historial por rango
    console.log("\n7️⃣ Consultando Historial SBS (2026-09-01 al 2026-09-10)...");
    const sbsHistorial = await getTipoCambioSbsHistorial("2026-09-01", "2026-09-10");
    console.log(`   ✅ SBS Historial: ${sbsHistorial.data?.length ?? 0} registros encontrados.`);

    // 8. Tipo de cambio Combinado (/todos)
    console.log("\n8️⃣ Consultando Tipo de Cambio Combinado (SBS y SUNAT)...");
    const todos = await getTipoCambioTodos();
    console.log("   ✅ Combinado:", JSON.stringify(todos, null, 2));

    console.log("\n==================================================");
    console.log("🎉 ¡Todas las pruebas de Apis Perú finalizaron con éxito!");
    console.log("==================================================");
  } catch (error: any) {
    console.error("\n❌ Error durante la ejecución de las pruebas:");
    if (error?.status) {
      console.error(`   HTTP Status: ${error.status}`);
    }
    console.error(`   Mensaje: ${error?.message || error}`);
    if (error?.data) {
      console.error("   Detalles:", JSON.stringify(error.data, null, 2));
    }
    process.exit(1);
  }
}

main();
