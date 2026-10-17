import { randomUUID, createHash } from "node:crypto";
import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#src/models/prisma/db-factoring.js";
import * as dao from "#src/daos/transaccionbancaria.Dao.js";
import { readSource, browseSource } from "#src/integrations/banca/mysqlSource.js";
import type { SourcePageQuery } from "#src/integrations/banca/mysqlSource.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { identidad, limpiar, importe, normalizarOrigen, datosComparables, legado, referencias, jsonSeguro } from "#src/domain/banca/transaccionBancaria.Policy.js";
import type { RemoteRow } from "#src/domain/banca/transaccionBancaria.Policy.js";
import { explicarIncidencia } from "#src/domain/banca/transaccionBancaria.Incidencia.js";
import type { MovimientoBancoInput, SincronizacionBancoInput, cambioBanco } from "#src/types/TransaccionBancaria.schemas.js";
import type { z } from "zod";
import type { TxClient } from "#src/types/Prisma.types.js";

const db = prismaFT.client;
const tx = <T>(work: (value: TxClient) => Promise<T>) => db.$transaction(work, { timeout: prismaFT.transactionTimeout || 10000 });
const ids = (prefix: string) => ({ code: prefix + randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase() });
const audit = (user: number) => ({ idusuariocrea: user, idusuariomod: user });
const changed = (user: number) => ({ idusuariomod: user, fechamod: new Date(), version: { increment: 1 } });
const required = <T>(value: T | null): T => {
  if (!value) throw new ClientError("Registro no encontrado.", 404);
  return value;
};
const checkVersion = (result: { count: number }) => {
  if (result.count !== 1) throw new ClientError("El registro cambió; actualice la pantalla antes de continuar.", 409);
};
export function publicRow(row: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key.startsWith("id") || key.startsWith("password_") || key === "clave_version" || key === "cifrado_version" || key.startsWith("factor_cuenta_")) continue;
    output[key] = Prisma.Decimal.isDecimal(value) ? value.toFixed(2) : value;
  }
  return output;
}
function accountDto(account: Awaited<ReturnType<typeof dao.accounts>>[number]) {
  return { uuid: account.factorcuentabancariaid, label: `${account.cuenta_bancaria.alias} · ${account.cuenta_bancaria.numero} · ${account.cuenta_bancaria.moneda.codigo}`, moneda: account.cuenta_bancaria.moneda.codigo };
}
function movementDto(row: Awaited<ReturnType<typeof dao.movement>>) {
  if (!row) return null;
  return { ...publicRow(row), factortransaccionbancariaid: row.factortransaccionbancariaid, code: row.code, version: row.version, estado: row.estado, numero_operacion: row.numero_operacion, descripcion: row.descripcion, signo: row.signo, monto: row.monto.toFixed(2), fecha: row.fecha.toISOString().slice(0, 10), detalle_fecha: row.detalle_fecha?.toISOString().slice(0, 10) ?? null, detalle_hora: row.detalle_hora?.toISOString().slice(11, 19) ?? null, cuenta: row.factor_cuenta_bancaria.factorcuentabancariaid, cuenta_label: accountDto(row.factor_cuenta_bancaria).label, moneda: row.factor_cuenta_bancaria.cuenta_bancaria.moneda.codigo };
}
function mappingDto(row: Awaited<ReturnType<typeof dao.mappings>>[number]) {
  return { ...publicRow(row), configuracion_bbdd: undefined, conexion: row.configuracion_bbdd.configuracionbbddid, conexion_alias: row.configuracion_bbdd.alias, tabla_origen: row.configuracion_bbdd.factor_transaccion_bancaria_fuente?.tabla_origen, cuenta: row.factor_cuenta_bancaria.factorcuentabancariaid, cuenta_label: accountDto(row.factor_cuenta_bancaria).label };
}
async function history(t: TxClient, entity: { idfactortransaccionbancaria?: number; idconexion?: number; idorigencuenta?: number; idincidencia?: number }, event: string, reason: string, user: number, before?: unknown, after?: unknown) {
  await dao.historyCreate(t, { ...ids("BH"), ...audit(user), ...entity, evento: event, motivo: reason, datos_antes: before == null ? null : JSON.stringify(before), datos_despues: after == null ? null : JSON.stringify(after) });
}
async function validAccount(t: TxClient, uuid: string) {
  const a = required(await dao.account(t, uuid));
  if (a.estado !== 1 || a.cuenta_bancaria.estado !== 1) throw new ClientError("La cuenta bancaria no está activa.", 422);
  return a;
}
export async function masterBanco() {
  const [conns, accts] = await Promise.all([dao.connections(db), dao.accounts(db)]);
  return { conexiones: conns.filter((c) => c.estado === 1).map((c) => ({ uuid: c.configuracionbbddid, label: c.alias, habilitado: c.habilitado })), cuentas: accts.filter((a) => a.cuenta_bancaria.estado === 1).map(accountDto) };
}
export const listarMapeos = async () => (await dao.mappings(db)).map(mappingDto);
export async function consultarOrigen(input: SourcePageQuery & { conexion: string }) {
  const connection = required(await dao.connection(db, input.conexion));
  if (connection.estado !== 1 || connection.habilitado !== 1) throw new ClientError("La conexión debe estar activa y habilitada.", 422);
  const source = await dao.bankSource(db, connection.idconfiguracionbbdd);
  if (!source) throw new ClientError("Esta conexión no tiene una tabla bancaria de origen. Configure Cuentas de origen antes de consultar.", 422);
  return browseSource({ ...connection, tabla_origen: source.tabla_origen }, input);
}
export async function crearMapeo(input: { conexion: string; cuenta: string; cuenta_origen: string; tabla_origen?: string }, user: number) {
  return dao.withConnectionLock(input.conexion, () =>
    tx(async (t) => {
      const connection = required(await dao.connection(t, input.conexion)),
        account = await validAccount(t, input.cuenta);
      if (connection.estado !== 1) throw new ClientError("Conexión inactiva.", 422);
      const source = await dao.bankSource(t, connection.idconfiguracionbbdd);
      const table = input.tabla_origen || "bcp_transaccion_ahorro";
      if (source && input.tabla_origen && source.tabla_origen !== table) throw new ClientError("Esta conexión ya tiene otra tabla bancaria de origen. Use la misma tabla o una configuración independiente.", 422);
      if (!source) await dao.bankSourceCreate(t, connection.idconfiguracionbbdd, table);
      const origin = limpiar(input.cuenta_origen);
      if (!origin) throw new ClientError("Cuenta de origen requerida.", 422);
      const row = await dao.mappingCreate(t, { ...ids("BM"), ...audit(user), idconexion: connection.idconfiguracionbbdd, idfactorcuentabancaria: account.idfactorcuentabancaria, cuenta_origen: origin });
      await history(t, { idorigencuenta: row.idfactortransaccionbancariaorigencuenta }, "ALTA", "Mapeo explícito de cuenta", user, null, mappingDto(row));
      return mappingDto(row);
    }),
  );
}
export async function estadoMapeo(uuid: string, version: number, enabled: boolean, user: number) {
  const old = required(await dao.mapping(db, uuid));
  return dao.withConnectionLock(old.configuracion_bbdd.configuracionbbddid, () =>
    tx(async (t) => {
      checkVersion(await dao.mappingUpdate(t, old.idfactortransaccionbancariaorigencuenta, version, { habilitado: Number(enabled), ...changed(user) }));
      await history(t, { idorigencuenta: old.idfactortransaccionbancariaorigencuenta }, enabled ? "HABILITACION" : "SUSPENSION", "Cambio de disponibilidad del mapeo", user);
      return { correcto: true };
    }),
  );
}
function enrichment(input: Partial<MovimientoBancoInput> | Record<string, string | null>): Prisma.factor_transaccion_bancariaUncheckedUpdateInput {
  const result: Record<string, unknown> = {};
  for (const key of referencias) result[key] = input[key] || null;
  for (const key of ["origen_comision", "destino_comision", "monto_neto"] as const) result[key] = input[key] ? importe(input[key], false, true) : null;
  result.detalle_fecha = input.detalle_fecha ? new Date(`${input.detalle_fecha}T00:00:00.000Z`) : null;
  result.detalle_hora = input.detalle_hora ? new Date(`1970-01-01T${input.detalle_hora.length === 5 ? input.detalle_hora + ":00" : input.detalle_hora}.000Z`) : null;
  return result as Prisma.factor_transaccion_bancariaUncheckedUpdateInput;
}
export async function crearMovimiento(input: MovimientoBancoInput, user: number) {
  return tx(async (t) => {
    const a = await validAccount(t, input.cuenta),
      hash = identidad(a.idfactorcuentabancaria, input.fecha, input.numero_operacion, input.signo, input.monto);
    if ((await dao.byIdentity(t, hash.identidad_sha256)) || (await dao.byCurrentIdentity(t, a.idfactorcuentabancaria, input.fecha, limpiar(input.numero_operacion), input.signo, importe(input.monto)))) throw new ClientError("Ya existe un movimiento con esa identidad, incluso si está anulado.", 409);
    const data = { ...ids("BT"), ...audit(user), ...enrichment(input), ...hash, idfactorcuentabancaria: a.idfactorcuentabancaria, numero_operacion: limpiar(input.numero_operacion), fecha: new Date(`${input.fecha}T00:00:00.000Z`), descripcion: input.descripcion, signo: input.signo, monto: importe(input.monto), origen_alta: "MANUAL" } as Prisma.factor_transaccion_bancariaUncheckedCreateInput;
    const row = await dao.movementCreate(t, data);
    await history(t, { idfactortransaccionbancaria: row.idfactortransaccionbancaria }, "ALTA", "Alta manual de movimiento", user, null, movementDto(row));
    return movementDto(row);
  });
}
export async function mutarMovimiento(uuid: string, input: z.infer<typeof cambioBanco>, user: number) {
  return db.$transaction(
    async (t) => {
      let row = required(await dao.movement(t, uuid));
      await dao.lockMovement(t, row.idfactortransaccionbancaria);
      row = required(await dao.movement(t, uuid));
      const changesEvidence = input.accion === "anular" || (input.accion === "editar" && input.movimiento && (input.movimiento.fecha !== row.fecha.toISOString().slice(0, 10) || input.movimiento.numero_operacion !== row.numero_operacion || input.movimiento.signo !== row.signo || !row.monto.eq(input.movimiento.monto)));
      if (changesEvidence && (await dao.activePaymentApplications(t, row.idfactortransaccionbancaria))) throw new ClientError("La transacción tiene pagos aplicados. Resuelva sus aplicaciones antes de modificar los datos bancarios o anularla.", 409);
      let data: Prisma.factor_transaccion_bancariaUncheckedUpdateManyInput;
      if (input.accion === "editar") {
        if (row.estado !== 1 || !input.movimiento) throw new ClientError("Movimiento no editable.", 422);
        const m = input.movimiento;
        if (row.factor_cuenta_bancaria.factorcuentabancariaid !== m.cuenta) throw new ClientError("La cuenta del movimiento no se reasigna; anule el registro erróneo.", 422);
        const collision = (await dao.byIdentity(t, identidad(row.idfactorcuentabancaria, m.fecha, m.numero_operacion, m.signo, m.monto).identidad_sha256)) || (await dao.byCurrentIdentity(t, row.idfactorcuentabancaria, m.fecha, limpiar(m.numero_operacion), m.signo, importe(m.monto)));
        if (collision && collision.idfactortransaccionbancaria !== row.idfactortransaccionbancaria) throw new ClientError("La corrección coincide con otro movimiento.", 409);
        data = { ...enrichment(m), numero_operacion: limpiar(m.numero_operacion), fecha: new Date(`${m.fecha}T00:00:00.000Z`), descripcion: m.descripcion, signo: m.signo, monto: importe(m.monto) } as Prisma.factor_transaccion_bancariaUncheckedUpdateManyInput;
      } else data = { estado: input.accion === "anular" ? 2 : 1, motivo_anulacion: input.accion === "anular" ? input.motivo : null };
      checkVersion(await dao.movementUpdate(t, row.idfactortransaccionbancaria, input.version, { ...data, ...changed(user) }));
      const updated = required(await dao.movement(t, uuid));
      await history(t, { idfactortransaccionbancaria: row.idfactortransaccionbancaria }, input.accion.toUpperCase(), input.motivo, user, movementDto(row), movementDto(updated));
      return movementDto(updated);
    },
    { timeout: prismaFT.transactionTimeout || 10000, isolationLevel: "ReadCommitted" },
  );
}
export async function listarMovimientos(query: { page: number; limit: number; search: string; cuenta?: string; cuentas?: string[]; desde?: string; hasta?: string; sortBy?: string; desc?: boolean }) {
  const accounts = query.cuentas ? query.cuentas.filter((uuid) => !query.cuenta || query.cuenta === uuid) : query.cuenta ? [query.cuenta] : null;
  const where: Prisma.factor_transaccion_bancariaWhereInput = { ...(accounts ? { factor_cuenta_bancaria: { factorcuentabancariaid: { in: accounts } } } : {}), ...(query.search ? { OR: [{ numero_operacion: { contains: query.search } }, { descripcion: { contains: query.search } }, { referencia_descripcion: { contains: query.search } }] } : {}), ...(query.desde || query.hasta ? { fecha: { ...(query.desde ? { gte: new Date(`${query.desde}T00:00:00.000Z`) } : {}), ...(query.hasta ? { lte: new Date(`${query.hasta}T00:00:00.000Z`) } : {}) } } : {}) };
  const result = await dao.movements(db, where, query.page, query.limit, query.sortBy, query.desc);
  return { ...result, items: result.items.map(movementDto) };
}
export const detalleMovimiento = async (uuid: string) => movementDto(required(await dao.movement(db, uuid)));
export async function listarLogs(kind: "ejecuciones" | "incidencias" | "historial", page: number, limit: number, search = "", sortBy?: string, desc?: boolean) {
  const result = await dao.logs(db, kind, page, limit, search, sortBy, desc);
  const authors = await dao.logAuthors(db, [...new Set(result.items.map((row) => row.idusuariocrea))]);
  return {
    ...result,
    items: result.items.map((row) => {
      const author = authors.find((a) => a.idusuario === row.idusuariocrea);
      const diagnosis = kind === "incidencias" && "tipo" in row && "datos_revision" in row ? explicarIncidencia(row.tipo, row.datos_revision) : {};
      return { ...publicRow(row), ...diagnosis, autor: author ? [author.usuarionombres, author.apellidopaterno, author.apellidomaterno].filter(Boolean).join(" ") : "Usuario no disponible" };
    }),
  };
}
export async function resolverIncidencia(uuid: string, version: number, situation: "RESUELTA" | "DESCARTADA", reason: string, user: number) {
  return tx(async (t) => {
    const row = required(await dao.incident(t, uuid));
    if (row.situacion !== "PENDIENTE") throw new ClientError("La incidencia ya fue revisada; actualice la pantalla.", 409);
    checkVersion(await dao.incidentUpdate(t, row.idfactortransaccionbancariaincidencia, version, { situacion: situation, resolucion_motivo: reason, idusuarioresuelve: user, resolucion_fecha: new Date(), ...changed(user) }));
    await history(t, { idincidencia: row.idfactortransaccionbancariaincidencia }, "RESOLUCION", reason, user, { situacion: row.situacion }, { situacion: situation });
    return { correcto: true };
  });
}
export async function sincronizar(input: SincronizacionBancoInput, user: number, scheduled = false) {
  if (scheduled && (await dao.scheduledActor(db, user)) !== 1) throw new ClientError("La cuenta técnica debe estar activa y tener el rol financiero vigente.", 403);
  return dao.withConnectionLock(input.conexion, async () => {
    const config = required(await dao.connection(db, input.conexion));
    if (config.estado !== 1 || config.habilitado !== 1) throw new ClientError("La conexión está suspendida.", 422);
    const source = await dao.bankSource(db, config.idconfiguracionbbdd);
    if (!source) throw new ClientError("Configure la tabla de origen desde el mapeo bancario antes de sincronizar.", 422);
    const maps = (await dao.mappings(db)).filter((m) => m.idconexion === config.idconfiguracionbbdd && m.estado === 1 && m.habilitado === 1 && (!input.cuentas || input.cuentas.includes(m.factortransaccionbancariaorigencuentaid)));
    if (!maps.length || (input.cuentas && maps.length !== input.cuentas.length)) throw new ClientError("Seleccione mapeos habilitados de esta conexión.", 422);
    if (maps.some((m) => m.factor_cuenta_bancaria.estado !== 1 || m.factor_cuenta_bancaria.cuenta_bancaria.estado !== 1)) throw new ClientError("Existe una cuenta local inactiva en el alcance.", 422);
    await dao.interruptRuns(db, config.idconfiguracionbbdd, user);
    const run = await dao.runCreate(db, { ...ids("BS"), ...audit(user), idconexion: config.idconfiguracionbbdd, disparador: input.historico ? "CARGA_LEGADO" : scheduled ? "PROGRAMADA" : "MANUAL", fecha_desde: input.desde ? new Date(`${input.desde}T00:00:00.000Z`) : null, fecha_hasta: input.hasta ? new Date(`${input.hasta}T00:00:00.000Z`) : null, cuentas_alcance: JSON.stringify(maps.map((m) => m.factortransaccionbancariaorigencuentaid)) });
    let read = 0,
      inserted = 0,
      existing = 0,
      conflicts = 0,
      complete = false;
    const expires = Date.now() + 120000;
    const progress = () => ({ filas_leidas: read, filas_insertadas: inserted, filas_existentes: existing, filas_incidencia: conflicts, idusuariomod: user, fechamod: new Date() });
    const incident = async (row: RemoteRow, kind: string, movementPk?: number, fields?: string[]) =>
      tx(async (t) => {
        const data = jsonSeguro(row),
          hash = createHash("sha256")
            .update(JSON.stringify([config.configuracionbbddid, kind, data]))
            .digest("hex");
        const previous = await dao.incidentByHash(t, hash);
        const priorResolution = previous && previous.situacion !== "PENDIENTE" ? { situacion: previous.situacion, resolucion_motivo: previous.resolucion_motivo, resolucion_fecha: previous.resolucion_fecha } : null;
        const evidence = fields ? jsonSeguro({ ...row, _version_validacion: 2, _campos_observados: fields }) : data;
        const result = await dao.incidentUpsert(t, hash, { ...ids("BI"), ...audit(user), idconexion: config.idconfiguracionbbdd, idsincronizacion_inicial: run.idfactortransaccionbancariasincronizacion, idsincronizacion_ultima: run.idfactortransaccionbancariasincronizacion, idfactortransaccionbancaria: movementPk ?? null, tipo: kind, huella: hash, datos_revision: evidence }, { idsincronizacion_ultima: run.idfactortransaccionbancariasincronizacion, veces_observada: { increment: 1 }, ultima_observacion: new Date(), situacion: "PENDIENTE", resolucion_motivo: null, resolucion_fecha: null, idusuarioresuelve: null, ...changed(user) });
        await history(t, { idincidencia: result.idfactortransaccionbancariaincidencia }, priorResolution ? "REAPERTURA" : "OBSERVACION", kind, user, priorResolution, { situacion: "PENDIENTE" });
      });
    try {
      const rows = await readSource(
        { ...config, tabla_origen: source.tabla_origen },
        maps.map((m) => m.cuenta_origen),
        input.desde,
        input.hasta,
        input.historico,
      );
      read = rows.length;
      complete = true;
      const prepared = rows.map((row) => {
        const map = maps.find((m) => m.cuenta_origen === limpiar(row.cuenta));
        try {
          if (!map) throw new ClientError("CUENTA_SIN_MAPEO", 422);
          return { row, map, normalized: normalizarOrigen(row, map.idfactorcuentabancaria, map.factor_cuenta_bancaria.cuenta_bancaria.moneda.codigo), error: null };
        } catch (error) {
          return { row, map, normalized: null, error: error instanceof ClientError && /^[A-Z_]+$/.test(error.message) ? error.message : "DATOS_ORIGEN_INVALIDOS" };
        }
      });
      const counts = new Map<string, number>();
      for (const entry of prepared) if (entry.normalized) counts.set(entry.normalized.identidad_sha256, (counts.get(entry.normalized.identidad_sha256) || 0) + 1);
      for (const entry of prepared) {
        if (Date.now() > expires) throw new ClientError("Se alcanzó el límite de duración; reintente el mismo alcance.", 503);
        const { row, map, normalized: n } = entry;
        if (!n || counts.get(n.identidad_sha256) > 1) {
          conflicts++;
          await incident(row, entry.error || "IDENTIDAD_AMBIGUA");
          continue;
        }
        const outcome = await tx(async (t) => {
          const previous = await dao.byIdentity(t, n.identidad_sha256);
          if (previous) {
            if (previous.identidad_datos !== n.identidad_datos) return { conflicto: "IDENTIDAD_AMBIGUA", pk: previous.idfactortransaccionbancaria };
            const prior = previous.datos_origen_iniciales ? normalizarOrigen(JSON.parse(previous.datos_origen_iniciales), map.idfactorcuentabancaria, map.factor_cuenta_bancaria.cuenta_bancaria.moneda.codigo) : { ...n, numero_operacion: previous.numero_operacion, descripcion: previous.descripcion, fecha: previous.fecha.toISOString().slice(0, 10), signo: previous.signo, monto: previous.monto.toFixed(2) };
            if (datosComparables(prior) !== datosComparables(n) || datosComparables({ ...n, numero_operacion: previous.numero_operacion, descripcion: previous.descripcion, fecha: previous.fecha.toISOString().slice(0, 10), signo: previous.signo, monto: previous.monto.toFixed(2) }) !== datosComparables(n)) return { conflicto: "DATOS_ORIGEN_DISTINTOS", pk: previous.idfactortransaccionbancaria };
            checkVersion(await dao.movementUpdate(t, previous.idfactortransaccionbancaria, previous.version, { idorigencuenta: previous.idorigencuenta ?? map.idfactortransaccionbancariaorigencuenta, datos_origen_iniciales: previous.datos_origen_iniciales ?? jsonSeguro(row), idsincronizacion_inicial: previous.idsincronizacion_inicial ?? run.idfactortransaccionbancariasincronizacion, idsincronizacion_ultima: run.idfactortransaccionbancariasincronizacion, ultima_observacion: new Date(), ...changed(user) }));
            if (!previous.idorigencuenta) await history(t, { idfactortransaccionbancaria: previous.idfactortransaccionbancaria }, "VINCULO_ORIGEN", "Alta manual reconocida en origen", user);
            return { existente: true };
          }
          const correctedMatch = await dao.byCurrentIdentity(t, map.idfactorcuentabancaria, n.fecha, n.numero_operacion, n.signo, n.monto);
          if (correctedMatch) return { conflicto: "IDENTIDAD_CORREGIDA", pk: correctedMatch.idfactortransaccionbancaria };
          const historical = input.historico ? legado(row, n.signo) : null;
          const created = await dao.movementCreate(t, { ...ids("BT"), ...audit(user), ...(historical ? enrichment(historical.values) : {}), identidad_datos: n.identidad_datos, identidad_sha256: n.identidad_sha256, identidad_version: 1, idfactorcuentabancaria: map.idfactorcuentabancaria, numero_operacion: n.numero_operacion, fecha: new Date(`${n.fecha}T00:00:00.000Z`), descripcion: n.descripcion, signo: n.signo, monto: n.monto, origen_alta: input.historico ? "LEGADO" : "SINCRONIZACION", idorigencuenta: map.idfactortransaccionbancariaorigencuenta, datos_origen_iniciales: jsonSeguro(row), idsincronizacion_inicial: run.idfactortransaccionbancariasincronizacion, idsincronizacion_ultima: run.idfactortransaccionbancariasincronizacion, ultima_observacion: new Date() } as Prisma.factor_transaccion_bancariaUncheckedCreateInput);
          await history(t, { idfactortransaccionbancaria: created.idfactortransaccionbancaria }, "ALTA", input.historico ? "Carga histórica" : "Importación bancaria", user, null, movementDto(created));
          return { insertado: true, problemas: historical?.problemas, pk: created.idfactortransaccionbancaria };
        });
        if (outcome.conflicto) {
          conflicts++;
          await incident(row, outcome.conflicto, outcome.pk);
        } else if (outcome.existente) existing++;
        else {
          inserted++;
          if (outcome.problemas?.length) {
            conflicts++;
            await incident(row, "ENRIQUECIMIENTO_INVALIDO", outcome.pk, outcome.problemas);
          }
        }
        if ((inserted + existing + conflicts) % 50 === 0) await dao.runUpdate(db, run.idfactortransaccionbancariasincronizacion, progress());
      }
      return publicRow(await dao.runUpdate(db, run.idfactortransaccionbancariasincronizacion, { ...progress(), resultado: conflicts ? "PARCIAL" : "EXITOSA", lectura_completa: 1, fin: new Date() }));
    } catch (error) {
      return publicRow(await dao.runUpdate(db, run.idfactortransaccionbancariasincronizacion, { ...progress(), resultado: inserted || existing ? "PARCIAL" : "FALLIDA", lectura_completa: Number(complete), fin: new Date(), error_codigo: "SINCRONIZACION_INCOMPLETA", error_resumen: error instanceof ClientError ? error.message : "No se pudo completar la sincronización. Los lotes confirmados se conservan; reintente el mismo alcance." }));
    }
  });
}
