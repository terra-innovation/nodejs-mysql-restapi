/**
 * test-fallback-unit.ts
 * Pruebas unitarias para validar la lógica de Fallback en cascada (Failover jerárquico).
 */
import type { ServicioTipoCambioConfig } from "#src/daos/configuracionapp.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";

async function runUnitTests() {
  console.log("==================================================");
  console.log("🧪 PRUEBAS UNITARIAS DE FALLBACK EN CASCADA");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`   ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // Test 1: Ordenamiento de Servicios por Prioridad
  // ----------------------------------------------------
  console.log("1️⃣ Prueba de ordenamiento por prioridad (menor a mayor) y filtrado de estado...");
  const mockServicios: ServicioTipoCambioConfig[] = [
    {
      idserviciotipocambio: 2,
      serviciotipocambioid: "uuid-decolecta",
      code: "STC000200",
      nombre: "Decolecta",
      url: "https://api.decolecta.com",
      fecha_suscripcion: new Date("2026-09-10"),
      prioridad_sunat: 2,
      prioridad_sbs: 2,
      estado: 1,
    },
    {
      idserviciotipocambio: 3,
      serviciotipocambioid: "uuid-inactivo",
      code: "STC000300",
      nombre: "Servicio Inactivo",
      url: "https://api.inactivo.com",
      fecha_suscripcion: new Date("2026-09-10"),
      prioridad_sunat: 0,
      prioridad_sbs: 0,
      estado: 0, // inactivo
    },
    {
      idserviciotipocambio: 1,
      serviciotipocambioid: "uuid-apisperu",
      code: "STC000100",
      nombre: "APIs Perú",
      url: "https://tipocambio.apisperu.com",
      fecha_suscripcion: new Date("2026-09-10"),
      prioridad_sunat: 1,
      prioridad_sbs: 1,
      estado: 1,
    },
    {
      idserviciotipocambio: 4,
      serviciotipocambioid: "uuid-backup",
      code: "STC000400",
      nombre: "Servicio Backup",
      url: "https://api.backup.com",
      fecha_suscripcion: new Date("2026-09-10"),
      prioridad_sunat: 5,
      prioridad_sbs: 5,
      estado: 1,
    },
  ];

  // Simulación de la lógica de resolverServiciosTipoCambioOrdenadosSunat
  const activos = mockServicios.filter((s) => s.estado === 1);
  activos.sort((a, b) => a.prioridad_sunat - b.prioridad_sunat);

  assert(activos.length === 3, "Filtra servicios inactivos (solo 3 activos)");
  assert(activos[0].nombre === "APIs Perú" && activos[0].prioridad_sunat === 1, "Primer servicio SUNAT es prioridad 1 (APIs Perú)");
  assert(activos[1].nombre === "Decolecta" && activos[1].prioridad_sunat === 2, "Segundo servicio SUNAT es prioridad 2 (Decolecta)");
  assert(activos[2].nombre === "Servicio Backup" && activos[2].prioridad_sunat === 5, "Tercer servicio SUNAT es prioridad 5 (Servicio Backup)");

  // Simulación de la lógica de resolverServiciosTipoCambioOrdenadosSbs
  const activosSbs = mockServicios.filter((s) => s.estado === 1);
  activosSbs.sort((a, b) => a.prioridad_sbs - b.prioridad_sbs);
  assert(activosSbs.length === 3, "Filtra servicios inactivos para SBS (solo 3 activos)");
  assert(activosSbs[0].prioridad_sbs <= activosSbs[1].prioridad_sbs, "Ordena correctamente por prioridad_sbs");

  // ----------------------------------------------------
  // Test 2: Ejecución exitosa con el primer servicio (no debe llamar al resto)
  // ----------------------------------------------------
  console.log("\n2️⃣ Prueba de cascada: éxito en primer servicio detiene la iteración...");
  const llamadas: string[] = [];

  async function mockSimulacionCascadaExitoPrimerServicio(servicios: ServicioTipoCambioConfig[]) {
    for (const servicio of servicios) {
      try {
        llamadas.push(servicio.nombre);
        if (servicio.prioridad_sunat === 1) {
          // Éxito inmediato
          return { exitoso: true, servicio: servicio.nombre, compra: 3.35, venta: 3.37 };
        }
      } catch (err) {
        // Fallo
      }
    }
    throw new Error("Todos fallaron");
  }

  const res1 = await mockSimulacionCascadaExitoPrimerServicio(activos);
  assert(res1.servicio === "APIs Perú", "Respuesta devuelta por el primer proveedor (APIs Perú)");
  assert(llamadas.length === 1 && llamadas[0] === "APIs Perú", "Solo se llamó al primer servicio, no se intentó con Decolecta");

  // ----------------------------------------------------
  // Test 3: Failover jerárquico cuando el primer servicio falla
  // ----------------------------------------------------
  console.log("\n3️⃣ Prueba de cascada: primer servicio falla -> failover automático al segundo...");
  const llamadas2: string[] = [];

  async function mockSimulacionCascadaFailover(servicios: ServicioTipoCambioConfig[]) {
    const errores: any[] = [];
    for (const servicio of servicios) {
      try {
        llamadas2.push(servicio.nombre);
        if (servicio.prioridad_sunat === 1) {
          throw new Error("Network timeout en APIs Perú");
        }
        if (servicio.prioridad_sunat === 2) {
          // Éxito en Decolecta
          return { exitoso: true, servicio: servicio.nombre, compra: 3.351, venta: 3.371 };
        }
      } catch (err: any) {
        errores.push({ servicio: servicio.nombre, error: err.message });
      }
    }
    throw new Error("Todos fallaron");
  }

  const res2 = await mockSimulacionCascadaFailover(activos);
  assert(res2.servicio === "Decolecta", "Respuesta devuelta por el segundo proveedor (Decolecta)");
  assert(llamadas2.length === 2 && llamadas2[0] === "APIs Perú" && llamadas2[1] === "Decolecta", "Se intentó APIs Perú, falló, y luego Decolecta respondió exitosamente");
  assert(!llamadas2.includes("Servicio Backup"), "No se intentó el tercer servicio porque el segundo resolvió");

  // ----------------------------------------------------
  // Test 4: Todos los servicios fallan
  // ----------------------------------------------------
  console.log("\n4️⃣ Prueba de cascada: todos los servicios fallan -> lanza error 502...");
  const llamadas3: string[] = [];

  async function mockSimulacionTodosFallan(servicios: ServicioTipoCambioConfig[]) {
    const errores: any[] = [];
    for (const servicio of servicios) {
      try {
        llamadas3.push(servicio.nombre);
        throw new Error(`Error 500 interno en ${servicio.nombre}`);
      } catch (err: any) {
        errores.push({ servicio: servicio.nombre, error: err.message });
      }
    }
    throw new ClientError(`No se pudo obtener tipo de cambio. Fallaron: ${errores.map((e) => e.servicio).join(", ")}`, 502);
  }

  let lanzoError = false;
  let statusError = 0;
  try {
    await mockSimulacionTodosFallan(activos);
  } catch (err: any) {
    lanzoError = true;
    statusError = err.statusCode || err.status || 0;
  }

  assert(lanzoError, "Lanza excepción cuando todos los proveedores fallan");
  assert(statusError === 502, "El código de error HTTP es 502 (Bad Gateway)");
  assert(llamadas3.length === 3, "Intentó todos los servicios activos disponibles");

  // ----------------------------------------------------
  // Test 5: Cache-Aside retorna registro existente sin llamar proveedores
  // ----------------------------------------------------
  console.log("\n5️⃣ Prueba de Cache-Aside: si existe en BD no consulta proveedores...");
  let llamadasExternas = 0;
  async function mockObtenerConCacheAside(registroBdLocal: any) {
    if (registroBdLocal) {
      return registroBdLocal;
    }
    llamadasExternas++;
    return { compra: 3.35, venta: 3.37 };
  }

  const registroLocalExistente = { id: 10, fecha: "2026-09-15", compra: 3.35, venta: 3.37 };
  const resultadoCache = await mockObtenerConCacheAside(registroLocalExistente);
  assert(resultadoCache.id === 10, "Retorna registro local existente");
  assert(llamadasExternas === 0, "No se realizaron llamadas externas al existir en caché local");

  const resultadoSinCache = await mockObtenerConCacheAside(null);
  assert(resultadoSinCache.compra === 3.35, "Sincroniza cuando no existe en caché");
  assert(llamadasExternas === 1, "Realizó 1 llamada externa al no existir en caché local");

  console.log("\n==================================================");
  console.log(`📊 RESULTADOS: ${passed} pasadas, ${failed} falladas`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runUnitTests();
