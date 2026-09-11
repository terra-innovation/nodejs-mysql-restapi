/**
 * src/integrations/decolecta/test-decolecta.ts
 * Script de prueba manual para verificar la conectividad y respuesta de los endpoints de Decolecta.
 *
 * Ejecutar con:
 * npx tsx src/integrations/decolecta/test-decolecta.ts
 */

import {
  getTipoCambioSunatHoy,
  getTipoCambioSunatPorFecha,
  getTipoCambioSunatPorMes,
  getTipoCambioSbsPromedioPorFecha,
  getTipoCambioSbsPromedioPorMes,
  getTipoCambioSbsContable,
} from "./index.js";

async function main() {
  console.log("==================================================");
  console.log("🚀 Probando integración con Decolecta API");
  console.log("==================================================\n");

  try {
    // 0. Probar por mes
    console.log("0️⃣ Consultando Tipo de Cambio SUNAT por Mes (08/2025)...");
    const sunatMes = await getTipoCambioSunatPorMes(8, 2025);
    console.log(`   ✅ SUNAT Mes: ${sunatMes.length} registros`, sunatMes[0]);

    console.log("0️⃣.1 Consultando Tipo de Cambio SBS Promedio por Mes (USD, 08/2025)...");
    const sbsMes = await getTipoCambioSbsPromedioPorMes("USD", 8, 2025);
    console.log(`   ✅ SBS Promedio Mes: ${sbsMes.length} registros`, sbsMes[0]);
    // 1. Tipo de cambio SUNAT - Hoy / Más reciente
    console.log("1️⃣ Consultando Tipo de Cambio SUNAT (Hoy / Reciente)...");
    const sunatHoy = await getTipoCambioSunatHoy();
    console.log("   ✅ SUNAT Hoy:", JSON.stringify(sunatHoy, null, 2));

    // 2. Tipo de cambio SUNAT - Por fecha específica
    const fechaPrueba = "2025-08-08";
    console.log(`\n2️⃣ Consultando Tipo de Cambio SUNAT para la fecha ${fechaPrueba}...`);
    const sunatFecha = await getTipoCambioSunatPorFecha(fechaPrueba);
    console.log("   ✅ SUNAT Fecha:", JSON.stringify(sunatFecha, null, 2));

    // 3. Tipo de cambio SBS - Promedio (USD)
    console.log("\n3️⃣ Consultando Tipo de Cambio SBS Promedio (USD)...");
    const sbsPromedio = await getTipoCambioSbsPromedioPorFecha("USD");
    console.log("   ✅ SBS Promedio USD:", JSON.stringify(sbsPromedio, null, 2));

    // 4. Tipo de cambio SBS - Contable (USD)
    console.log("\n4️⃣ Consultando Tipo de Cambio SBS Contable (USD)...");
    const sbsContable = await getTipoCambioSbsContable("USD");
    console.log("   ✅ SBS Contable USD:", JSON.stringify(sbsContable, null, 2));

    console.log("\n==================================================");
    console.log("🎉 ¡Todas las pruebas finalizaron con éxito!");
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
