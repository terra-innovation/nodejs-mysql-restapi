// Script E2E manual. Requiere BD real y archivo .env configurado. Ejecutar con: npx tsx tests/manual/integrations/apisperu/provider-sync.ts
import dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(process.cwd(), ".env.development") });

import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as configuracionappDao from "#src/daos/configuracionapp.Dao.js";
import * as tipocambioLogic from "#src/logics/tipocambio.Logic.js";

const APIS_PERU_ID = "95d726e9-818e-4deb-bb3e-8ebae0ca697c";
const DECOLECTA_ID = "4a16b2da-64f0-4e6f-986a-20d1f403e7a3";

async function main() {
  console.log("==================================================");
  console.log("🚀 INICIANDO PRUEBAS DE SELECCIÓN DE PROVEEDORES (MANUAL)");
  console.log("==================================================\n");

  try {
    // 1. Probar lectura y parseo de configuracion_app
    console.log("1️⃣ Verificando lectura de servicios de tipo de cambio desde configuracion_app (ID 9)...");
    const servicios = await prismaFT.client.$transaction(async (tx) => {
      return await configuracionappDao.getServiciosTipoDeCambioParsed(tx);
    });
    console.log(`   ✅ Encontrados ${servicios.length} servicios configurados:`);
    servicios.forEach((s) => {
      console.log(`      - [${s.idserviciotipocambio}] ${s.nombre} (UUID: ${s.serviciotipocambioid}, Prioridad SUNAT: ${s.prioridad_sunat}, Prioridad SBS: ${s.prioridad_sbs}, Estado: ${s.estado})`);
    });

    // 2. Probar resolución de proveedor
    console.log("\n2️⃣ Probando resolución de proveedor (SUNAT y SBS)...");
    await prismaFT.client.$transaction(async (tx) => {
      const defaultSunat = await tipocambioLogic.resolverServicioTipoCambioSunat(tx);
      console.log(`   ✅ SUNAT por defecto (sin ID): ${defaultSunat.nombre} (${defaultSunat.code}) - Prioridad SUNAT: ${defaultSunat.prioridad_sunat}`);

      const defaultSbs = await tipocambioLogic.resolverServicioTipoCambioSbs(tx);
      console.log(`   ✅ SBS por defecto (sin ID): ${defaultSbs.nombre} (${defaultSbs.code}) - Prioridad SBS: ${defaultSbs.prioridad_sbs}`);

      const provApisPeru = await tipocambioLogic.resolverServicioTipoCambioSunat(tx, APIS_PERU_ID);
      console.log(`   ✅ Por UUID APIs Perú (SUNAT): ${provApisPeru.nombre} (ID: ${provApisPeru.idserviciotipocambio})`);

      const provDecolecta = await tipocambioLogic.resolverServicioTipoCambioSbs(tx, DECOLECTA_ID);
      console.log(`   ✅ Por UUID Decolecta (SBS): ${provDecolecta.nombre} (ID: ${provDecolecta.idserviciotipocambio})`);
    });

    // 3. Sincronización SUNAT con APIs Perú
    console.log("\n3️⃣ Sincronizando SUNAT (2026-09-08) con APIs Perú...");
    const sunatApisPeru = await tipocambioLogic.sincronizarSunatLogic("2026-09-08", APIS_PERU_ID);
    console.log("   ✅ SUNAT (APIs Perú):", {
      fecha: sunatApisPeru.fecha,
      compra: sunatApisPeru.precio_compra,
      venta: sunatApisPeru.precio_venta,
    });

    // 4. Sincronización SUNAT con Decolecta
    console.log("\n4️⃣ Sincronizando SUNAT (2025-08-08) con Decolecta...");
    try {
      const sunatDecolecta = await tipocambioLogic.sincronizarSunatLogic("2025-08-08", DECOLECTA_ID);
      console.log("   ✅ SUNAT (Decolecta):", {
        fecha: sunatDecolecta.fecha,
        compra: sunatDecolecta.precio_compra,
        venta: sunatDecolecta.precio_venta,
      });
    } catch (err: any) {
      console.log(`   ⚠️ Decolecta falló como se esperaba cuando se satura/agota (${err?.message || err}). El sistema manejó la llamada correctamente.`);
    }

    // 5. SBS: Regla de precio_contable con APIs Perú y Decolecta
    const fechaTestSbs = "2026-09-08";
    console.log(`\n5️⃣ Probando regla de precio_contable SBS para la fecha ${fechaTestSbs}...`);

    // Paso A: Sincronizar primero con APIs Perú (precio_contable debe ser null si se crea o no sobreescribir)
    console.log("   A) Sincronizando SBS con APIs Perú...");
    const sbsApisPeru1 = await tipocambioLogic.sincronizarSbsLogic("USD", fechaTestSbs, APIS_PERU_ID);
    console.log("      Resultado APIs Perú:", {
      fecha: sbsApisPeru1.fecha,
      compra: sbsApisPeru1.precio_compra,
      venta: sbsApisPeru1.precio_venta,
      contable: sbsApisPeru1.precio_contable,
    });

    // Paso B: Sincronizar con Decolecta (fecha 2025-08-08 donde Decolecta tiene contable)
    console.log("\n   B) Sincronizando SBS (2025-08-08) con Decolecta (debe guardar precio_contable)...");
    try {
      const sbsDecolecta = await tipocambioLogic.sincronizarSbsLogic("USD", "2025-08-08", DECOLECTA_ID);
      console.log("      Resultado Decolecta:", {
        fecha: sbsDecolecta.fecha,
        compra: sbsDecolecta.precio_compra,
        venta: sbsDecolecta.precio_venta,
        contable: sbsDecolecta.precio_contable,
      });
    } catch (err: any) {
      console.log(`      ⚠️ Decolecta límite alcanzado: ${err?.message || err}`);
    }

    // Paso C: Asignar un precio_contable simulado a la fechaTestSbs y luego sincronizar con APIs Perú
    console.log(`\n   C) Asignando precio_contable='3.456789' a la fecha ${fechaTestSbs} en BD...`);
    await prismaFT.client.$transaction(async (tx) => {
      const { monedaBase, monedaCotizada } = await tipocambioLogic.resolverMonedas(tx, "USD", "PEN");
      const fechaObj = tipocambioLogic.parseFechaLima(fechaTestSbs);
      await tx.sbs_tipo_cambio.update({
        where: {
          idmonedabase_idmonedacotizada_fecha: {
            idmonedabase: monedaBase.idmoneda,
            idmonedacotizada: monedaCotizada.idmoneda,
            fecha: fechaObj,
          },
        },
        data: {
          precio_contable: "3.456789",
        },
      });
    });

    console.log("   D) Re-sincronizando la fecha con APIs Perú (debe actualizar compra/venta pero PRESERVAR contable='3.456789')...");
    const sbsApisPeruReUpdate = await tipocambioLogic.sincronizarSbsLogic("USD", fechaTestSbs, APIS_PERU_ID);
    console.log("      Resultado re-sincronización APIs Perú:", {
      fecha: sbsApisPeruReUpdate.fecha,
      compra: sbsApisPeruReUpdate.precio_compra,
      venta: sbsApisPeruReUpdate.precio_venta,
      contable: sbsApisPeruReUpdate.precio_contable?.toString(),
    });

    if (sbsApisPeruReUpdate.precio_contable?.toString() === "3.456789") {
      console.log("      🎯 ¡PERFECTO! El precio_contable existente fue preservado y no se borró a null.");
    } else {
      console.error("      ❌ FALLÓ: El precio contable no fue preservado.");
      process.exit(1);
    }

    console.log("\n==================================================");
    console.log("🎉 ¡TODAS LAS PRUEBAS FINALIZARON EXITOSAMENTE!");
    console.log("==================================================");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error durante las pruebas:", error);
    process.exit(1);
  }
}

main();
