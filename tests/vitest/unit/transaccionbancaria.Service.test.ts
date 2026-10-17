import { beforeEach, expect, it, vi } from "vitest";
import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
const state = vi.hoisted(() => ({ movements: [] as Record<string, unknown>[], runs: [] as Record<string, unknown>[], incidents: [] as Record<string, unknown>[], history: [] as Record<string, unknown>[], rows: [] as Record<string, unknown>[], read: vi.fn(), options: vi.fn(), testSource: vi.fn(), browse: vi.fn(), listing: vi.fn(), disabled: false, sourceMissing: false, busy: false }));
vi.mock("#src/config.js", () => ({ env: {}, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: { $transaction: (work: (value: object) => unknown) => work({}) }, transactionTimeout: 10000 } }));
vi.mock("#src/integrations/banca/mysqlSource.js", () => ({ readSource: state.read, browseSource: state.browse, sourceOptions: state.options, testSource: state.testSource }));
const account = { idfactorcuentabancaria: 1, factorcuentabancariaid: "00000000-0000-4000-8000-000000000001", estado: 1, cuenta_bancaria: { estado: 1, alias: "Sintética", numero: "00001", moneda: { codigo: "PEN" } } };
const connection = { idconfiguracionbbdd: 1, configuracionbbddid: "00000000-0000-4000-8000-000000000002", alias: "Fuente sintética", estado: 1, habilitado: 1 };
vi.mock("#src/daos/transaccionbancaria.Dao.js", async () => {
  const { Prisma } = await import("#root/generated/prisma/ft_factoring/client.js");
  const a = { idfactorcuentabancaria: 1, factorcuentabancariaid: "00000000-0000-4000-8000-000000000001", estado: 1, cuenta_bancaria: { estado: 1, alias: "Sintética", numero: "00001", moneda: { codigo: "PEN" } } };
  const c = { idconfiguracionbbdd: 1, configuracionbbddid: "00000000-0000-4000-8000-000000000002", alias: "Fuente sintética", estado: 1, habilitado: 1 };
  const mapping = { idfactortransaccionbancariaorigencuenta: 1, factortransaccionbancariaorigencuentaid: "00000000-0000-4000-8000-000000000003", idconexion: 1, idfactorcuentabancaria: 1, cuenta_origen: "PEN-A", estado: 1, habilitado: 1, factor_cuenta_bancaria: a, configuracion_bbdd: c };
  function apply(row: Record<string, unknown>, data: Record<string, unknown>) {
    for (const [k, v] of Object.entries(data)) row[k] = v && typeof v === "object" && "increment" in v ? Number(row[k] || 0) + Number(v.increment) : ["monto", "origen_comision", "destino_comision", "monto_neto"].includes(k) && v != null ? new Prisma.Decimal(String(v)) : v;
    return row;
  }
  return {
    withConnectionLock: async (_uuid: string, work: () => unknown) => {
      if (state.busy) throw Object.assign(new Error("En curso"), { statusCode: 409 });
      state.busy = true;
      try {
        return await work();
      } finally {
        state.busy = false;
      }
    },
    bankSource: async () => (state.sourceMissing ? null : { tabla_origen: "bcp_transaccion_ahorro" }),
    scheduledActor: async () => 1,
    connections: async () => [c],
    connection: async () => ({ ...c, habilitado: state.disabled ? 0 : 1, version: 1, host: "anterior.example.test", puerto: 3306, base_datos: "anterior", tabla_origen: "bcp_transaccion_ahorro", usuario: "lector", tls_ca_referencia: null, password_cifrado: Uint8Array.from([1]), password_nonce: new Uint8Array(12), password_tag: new Uint8Array(16), clave_version: "v1", cifrado_version: 1 }),
    connectionUpdate: async () => ({ count: 1 }),
    movements: state.listing,
    accounts: async () => [a],
    account: async () => a,
    mappings: async () => [mapping],
    interruptRuns: async () => {},
    byIdentity: async (_t: unknown, hash: string) => state.movements.find((row) => row.identidad_sha256 === hash) || null,
    byCurrentIdentity: async (_t: unknown, pk: number, date: string, operation: string, sign: number, amount: string) => state.movements.find((row) => row.idfactorcuentabancaria === pk && row.fecha instanceof Date && row.fecha.toISOString().slice(0, 10) === date && row.numero_operacion === operation && row.signo === sign && String(row.monto) === String(new Prisma.Decimal(amount))) || null,
    lockMovement: async () => {},
    activePaymentApplications: async () => 0,
    movement: async (_t: unknown, uuid: string) => state.movements.find((row) => row.factortransaccionbancariaid === uuid) || null,
    movementCreate: async (_t: unknown, data: Record<string, unknown>) => {
      const row = apply({ idfactortransaccionbancaria: state.movements.length + 1, factortransaccionbancariaid: `movement-${state.movements.length + 1}`, version: 1, estado: 1, factor_cuenta_bancaria: a }, data);
      state.movements.push(row);
      return row;
    },
    movementUpdate: async (_t: unknown, pk: number, version: number, data: Record<string, unknown>) => {
      const row = state.movements.find((row) => row.idfactortransaccionbancaria === pk && row.version === version);
      if (!row) return { count: 0 };
      apply(row, data);
      return { count: 1 };
    },
    runCreate: async (_t: unknown, data: Record<string, unknown>) => {
      const row = { ...data, idfactortransaccionbancariasincronizacion: state.runs.length + 1, factortransaccionbancariasincronizacionid: `run-${state.runs.length + 1}` };
      state.runs.push(row);
      return row;
    },
    runUpdate: async (_t: unknown, pk: number, data: Record<string, unknown>) =>
      apply(
        state.runs.find((row) => row.idfactortransaccionbancariasincronizacion === pk)!,
        data,
      ),
    incidentByHash: async (_t: unknown, hash: string) => state.incidents.find((row) => row.huella === hash) || null,
    incidentUpsert: async (_t: unknown, hash: string, create: Record<string, unknown>, update: Record<string, unknown>) => {
      const old = state.incidents.find((row) => row.huella === hash);
      if (old) return apply(old, update);
      const row = { ...create, veces_observada: 1, version: 1, situacion: "PENDIENTE", idfactortransaccionbancariaincidencia: state.incidents.length + 1 };
      state.incidents.push(row);
      return row;
    },
    historyCreate: async (_t: unknown, data: Record<string, unknown>) => {
      state.history.push(data);
      return data;
    },
  };
});
import * as service from "#src/services/banca/transaccionbancaria.Service.js";
const sourceRow = { cuenta: "PEN-A", numerooperacion: "00001", fecha: "2026-10-15", descripcion: "Transferencia sintética", sumaoresta: "Resta", moneda: "PEN", monto: "-100.25" };
const request = { conexion: connection.configuracionbbddid, desde: null, hasta: null, historico: false };
const manual = { cuenta: account.factorcuentabancariaid, numero_operacion: "00001", fecha: "2026-10-15", descripcion: sourceRow.descripcion, signo: -1 as const, monto: "100.25" };
beforeEach(() => {
  state.movements.length = state.runs.length = state.incidents.length = state.history.length = 0;
  state.rows = [sourceRow];
  state.busy = false;
  state.disabled = false;
  state.sourceMissing = false;
  state.listing.mockReset().mockResolvedValue({ items: [], total: 0 });
  state.browse.mockReset().mockResolvedValue({ items: [], total: 0 });
  state.read.mockReset().mockImplementation(async () => state.rows);
  state.options.mockReset().mockResolvedValue({});
  state.testSource.mockReset().mockResolvedValue({ correcto: true });
});
it("importa monto positivo y es idempotente tras relectura y anulación", async () => {
  expect((await service.sincronizar(request, 42)).resultado).toBe("EXITOSA");
  expect(state.movements).toHaveLength(1);
  const first = state.movements[0];
  expect(first.signo).toBe(-1);
  expect(String(first.monto)).toBe("100.25");
  expect((await service.sincronizar(request, 42)).filas_existentes).toBe(1);
  expect(state.movements).toHaveLength(1);
  await service.mutarMovimiento(String(first.factortransaccionbancariaid), { accion: "anular", version: Number(first.version), motivo: "Duplicado verificado" }, 42);
  await service.sincronizar(request, 42);
  expect(state.movements).toHaveLength(1);
  expect(state.movements[0].estado).toBe(2);
});
it("reconoce alta manual sin sobrescribir enriquecimiento ni autoría", async () => {
  await service.crearMovimiento({ ...manual, referencia_descripcion: "Clasificación local" }, 17);
  const id = state.movements[0].factortransaccionbancariaid;
  state.rows = [{ ...sourceRow, referencia_descripcion: "Texto remoto" }];
  await service.sincronizar({ ...request, historico: true }, 42);
  expect(state.movements).toHaveLength(1);
  expect(state.movements[0]).toMatchObject({ factortransaccionbancariaid: id, idusuariocrea: 17, origen_alta: "MANUAL", referencia_descripcion: "Clasificación local", idorigencuenta: 1 });
});
it("diferencias remotas generan incidencia sin modificar el original", async () => {
  await service.sincronizar(request, 42);
  state.rows = [{ ...sourceRow, descripcion: "Modificada" }];
  const result = await service.sincronizar(request, 42);
  expect(result.resultado).toBe("PARCIAL");
  expect(state.movements[0].descripcion).toBe(sourceRow.descripcion);
  expect(state.incidents[0].tipo).toBe("DATOS_ORIGEN_DISTINTOS");
  await service.sincronizar(request, 42);
  expect(state.incidents).toHaveLength(1);
  expect(state.incidents[0].veces_observada).toBe(2);
});
it("detecta grupos ambiguos antes de elegir una fila", async () => {
  state.rows = [sourceRow, { ...sourceRow, descripcion: "Segunda fila distinta" }];
  const result = await service.sincronizar(request, 42);
  expect(result.resultado).toBe("PARCIAL");
  expect(state.movements).toHaveLength(0);
  expect(state.incidents).toHaveLength(2);
});
it("reabrir una discrepancia conserva el sustento anterior en historial", async () => {
  state.rows = [{ ...sourceRow, moneda: "USD" }];
  await service.sincronizar(request, 42);
  Object.assign(state.incidents[0], { situacion: "RESUELTA", resolucion_motivo: "Revisión previa", resolucion_fecha: new Date("2026-10-15T12:00:00Z") });
  await service.sincronizar(request, 42);
  expect(state.incidents[0].situacion).toBe("PENDIENTE");
  const event = state.history.find((row) => row.evento === "REAPERTURA");
  expect(JSON.parse(String(event?.datos_antes))).toMatchObject({ situacion: "RESUELTA", resolucion_motivo: "Revisión previa" });
});
it("histórico conserva auxiliares válidos y registra los contradictorios", async () => {
  state.rows = [{ ...sourceRow, tipooperacion: "Cargo", monto_neto: "95.00", origen_comision: "0.00" }];
  const result = await service.sincronizar({ ...request, historico: true }, 42);
  expect(result.resultado).toBe("PARCIAL");
  expect(state.movements[0].tipo_operacion).toBe("Cargo");
  expect(state.movements[0].monto_neto).toBeNull();
  expect(state.movements[0].origen_comision).toEqual(new Prisma.Decimal(0));
  expect(JSON.parse(String(state.incidents[0].datos_revision))).toMatchObject({ _version_validacion: 2, _campos_observados: ["monto_neto"] });
});
it("importa AM/PM y comisiones negativas normalizadas sin sobrescribir auxiliares en la relectura", async () => {
  state.rows = [{ ...sourceRow, detalle_hora: "1:05 PM", origen_comision: "-1.25", destino_comision: "-0.50" }];
  expect((await service.sincronizar({ ...request, historico: true }, 42)).resultado).toBe("EXITOSA");
  expect((state.movements[0].detalle_hora as Date).toISOString()).toContain("13:05:00");
  expect(state.movements[0].origen_comision).toEqual(new Prisma.Decimal("1.25"));
  state.rows = [{ ...sourceRow, detalle_hora: "2:00 PM", origen_comision: "-2.00" }];
  await service.sincronizar({ ...request, historico: true }, 42);
  expect((state.movements[0].detalle_hora as Date).toISOString()).toContain("13:05:00");
  expect(state.movements[0].origen_comision).toEqual(new Prisma.Decimal("1.25"));
  expect(state.movements).toHaveLength(1);
});
it("rechaza moneda incompatible y marca fallos de red sin datos sensibles", async () => {
  state.rows = [{ ...sourceRow, moneda: "USD" }];
  expect((await service.sincronizar(request, 42)).filas_incidencia).toBe(1);
  expect(state.movements).toHaveLength(0);
  state.read.mockRejectedValue(new Error("password=secreto"));
  const result = await service.sincronizar(request, 42);
  expect(result.resultado).toBe("FALLIDA");
  expect(JSON.stringify(result)).not.toContain("secreto");
});
it("protege concurrencia por conexión y versiones de edición", async () => {
  state.busy = true;
  await expect(service.sincronizar(request, 42)).rejects.toMatchObject({ statusCode: 409 });
  state.busy = false;
  await service.crearMovimiento(manual, 42);
  const first = state.movements[0];
  await expect(service.mutarMovimiento(String(first.factortransaccionbancariaid), { accion: "editar", version: 99, motivo: "Corrección", movimiento: manual }, 42)).rejects.toMatchObject({ statusCode: 409 });
  expect(state.movements[0].version).toBe(1);
});

it("consulta origen usa solo su tabla bancaria configurada y no crea movimientos ni ejecuciones", async () => {
  const input = { conexion: connection.configuracionbbddid, desde: "2026-01-01", hasta: "2026-01-31", page: 1, limit: 25, search: "" };
  expect(await service.consultarOrigen(input)).toEqual({ items: [], total: 0 });
  expect(state.browse).toHaveBeenCalledWith(expect.objectContaining({ tabla_origen: "bcp_transaccion_ahorro", configuracionbbddid: connection.configuracionbbddid }), input);
  expect(state.movements).toHaveLength(0);
  expect(state.runs).toHaveLength(0);
  state.disabled = true;
  await expect(service.consultarOrigen(input)).rejects.toThrow("activa y habilitada");
  state.disabled = false;
  state.sourceMissing = true;
  await expect(service.consultarOrigen(input)).rejects.toThrow("Cuentas de origen");
  expect(state.browse).toHaveBeenCalledOnce();
});

it("consulta movimientos aplica rango inclusivo y selección múltiple también al conteo", async () => {
  const cuentas = [account.factorcuentabancariaid, "00000000-0000-4000-8000-000000000004"];
  await service.listarMovimientos({ page: 2, limit: 10, search: "transferencia", cuentas, desde: "2026-08-18", hasta: "2026-10-16" });
  expect(state.listing).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ factor_cuenta_bancaria: { factorcuentabancariaid: { in: cuentas } }, fecha: { gte: new Date("2026-08-18T00:00:00Z"), lte: new Date("2026-10-16T00:00:00Z") } }), 2, 10, undefined, undefined);
  await service.listarMovimientos({ page: 1, limit: 25, search: "" });
  expect(state.listing.mock.calls.at(-1)?.[1]).not.toHaveProperty("factor_cuenta_bancaria");
  await service.listarMovimientos({ page: 1, limit: 25, search: "", cuenta: cuentas[0] });
  expect(state.listing.mock.calls.at(-1)?.[1]).toMatchObject({ factor_cuenta_bancaria: { factorcuentabancariaid: { in: [cuentas[0]] } } });
});
