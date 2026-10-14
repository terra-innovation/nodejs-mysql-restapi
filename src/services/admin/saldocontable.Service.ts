import { randomUUID } from "node:crypto";
import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#src/models/prisma/db-factoring.js";
import * as dao from "#src/daos/saldocontable.Dao.js";
import { getSbsTipoCambioByFecha } from "#src/daos/sbstipocambio.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import type { TxClient } from "#src/types/Prisma.types.js";
import { accionesPeriodo, AYUDA_MONTO_NETO, evaluarSaldo, limiteCorte, totalSaldo, validarFechas } from "#src/domain/factoring/saldocontable/saldocontable.Policy.js";
import type { FechasPeriodo, Instrumento } from "#src/domain/factoring/saldocontable/saldocontable.Policy.js";

export interface PeriodoInput extends FechasPeriodo {
  nombre_periodo: string;
  tipo_operacion: "DESCUENTO";
}
export type MutacionPeriodo = { accion: "editar"; version: number; periodo: PeriodoInput } | { accion: "asociar"; version: number; operaciones: string[] } | { accion: "retirar"; version: number; operaciones: string[]; motivo: string } | { accion: "clasificar"; version: number; operacion: string; instrumentos: Instrumento[] } | { accion: "recalcular" | "cerrar" | "eliminar" | "activar"; version: number };
const codigo = (prefix: string) => prefix + randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase();
const civil = (value: Date) => value.toISOString().slice(0, 10);
const fechas = (p: dao.PeriodoRow): FechasPeriodo => ({ fecha_inicio: civil(p.fecha_inicio), fecha_fin: civil(p.fecha_fin), fecha_corte: civil(p.fecha_corte) });
const cerrado = (p: dao.PeriodoRow) => p.sbs_saldo_contable_periodo_estado.code === "SCPE00002";
const acciones = (p: dao.PeriodoRow) => accionesPeriodo(fechas(p), p.estado === 1, cerrado(p));
const fechaData = (input: FechasPeriodo) => Object.fromEntries(Object.entries(input).map(([k, v]) => [k, new Date(`${v}T00:00:00.000Z`)])) as { fecha_inicio: Date; fecha_fin: Date; fecha_corte: Date };
function validarPeriodo(input: PeriodoInput) {
  const error = validarFechas(input);
  if (error) throw new ClientError(error, 422);
  if (input.tipo_operacion !== "DESCUENTO") throw new ClientError("V1 solo permite Descuento.", 422);
}
function dtoPeriodo(p: dao.PeriodoRow) {
  return { sbssaldocontableperiodoid: p.sbssaldocontableperiodoid, code: p.code, nombre_periodo: p.nombre_periodo, ...fechas(p), estado: p.estado, estado_periodo: p.sbs_saldo_contable_periodo_estado.alias, cerrado: cerrado(p), tipo_operacion: p.sbs_saldo_contable_operacion_tipo.nombre, monto_saldo_contable: p.monto_saldo_contable.toFixed(8), version: p.version, fecha_cierre: p.fecha_cierre, acciones: acciones(p), ayuda_monto_neto: AYUDA_MONTO_NETO };
}
function dtoDetalle(d: Awaited<ReturnType<typeof dao.getDetalles>>[number]) {
  return { sbssaldocontabledetalleid: d.sbssaldocontabledetalleid, factoringid: d.factoring.factoringid, factoringpropuestaid: d.factoring_propuesta.factoringpropuestaid, codigo_operacion: d.codigo_operacion, moneda_codigo: d.moneda_codigo, fecha_operacion: d.fecha_operacion, fecha_pago_efectivo: d.fecha_pago_efectivo, monto_neto: d.monto_neto.toFixed(2), tipo_cambio: d.tipo_cambio.toFixed(6), monto_saldo_contable: d.monto_saldo_contable.toFixed(8), instrumentos: d.clasificacion_instrumentos ? (JSON.parse(d.clasificacion_instrumentos) as Instrumento[]) : [] };
}
async function requerido(tx: TxClient, uuid: string) {
  const p = await dao.getPeriodo(tx, uuid);
  if (!p) throw new ClientError("No se encontró el período de saldo contable.", 404);
  return p;
}
async function tipoCambio(tx: TxClient, corte: string) {
  const monedas = await dao.getMonedas(tx);
  const usd = monedas.filter((m) => m.codigo === "USD"),
    pen = monedas.filter((m) => m.codigo === "PEN");
  if (usd.length !== 1 || pen.length !== 1) return null;
  return getSbsTipoCambioByFecha(tx, new Date(`${corte}T00:00:00.000Z`), usd[0].idmoneda, pen[0].idmoneda);
}
function evaluar(f: dao.FuenteSaldoRow, corte: string, tc: Awaited<ReturnType<typeof tipoCambio>>) {
  return evaluarSaldo(
    {
      estado: f.estado,
      fecha_operacion: f.fecha_operacion,
      propuesta: f.factoring_propuesta_aceptada
        ? {
            pertenece: f.factoring_propuesta_aceptada.idfactoring === f.idfactoring,
            estado: f.factoring_propuesta_aceptada.estado,
            monto_neto: f.factoring_propuesta_aceptada.monto_neto,
          }
        : null,
      moneda: f.moneda.codigo,
      liquidaciones: f.factoring_liquidaciones,
    },
    corte,
    tc?.precio_contable ?? null,
  );
}
const tcDto = (tc: Awaited<ReturnType<typeof tipoCambio>>, corte: string) => ({ fecha: corte, precio_contable: tc?.precio_contable?.gt(0) ? tc.precio_contable.toFixed(6) : null, mensaje: tc?.precio_contable?.gt(0) ? null : "Actualice el tipo de cambio contable SBS USD/PEN de la fecha exacta de corte. Las operaciones PEN usan 1." });

/** Lecturas en una instantánea consistente; nunca sincronizan ni escriben tipo de cambio. */
function lectura<T>(work: (tx: TxClient) => Promise<T>) {
  return prismaFT.client.$transaction(work, { timeout: prismaFT.transactionTimeout, isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
}
export const getCatalogosService = () =>
  lectura(async (tx) => {
    const [estados, tipos] = await dao.getCatalogos(tx);
    return { estados: estados.map((s) => ({ code: s.code, nombre: s.alias })), tipos: tipos.map((t) => ({ code: t.code, nombre: t.nombre, habilitado: t.habilitado === 1 })) };
  });
export const listarPeriodosService = (page: number, limit: number) =>
  lectura(async (tx) => {
    const [items, total] = await dao.listarPeriodos(tx, page, limit);
    return { items: items.map(dtoPeriodo), total, page, limit };
  });
export const detallePeriodoService = (uuid: string) =>
  lectura(async (tx) => {
    const p = await requerido(tx, uuid);
    const detalles = await dao.getDetalles(tx, p.idsbssaldocontableperiodo);
    // Un cerrado no depende del tipo de cambio actual ni de importes operativos actuales.
    return { periodo: dtoPeriodo(p), detalles: detalles.map(dtoDetalle), tipo_cambio: cerrado(p) ? null : tcDto(await tipoCambio(tx, civil(p.fecha_corte)), civil(p.fecha_corte)) };
  });
export const sugerenciasService = (uuid: string, page: number, limit: number, search: string) =>
  lectura(async (tx) => {
    const p = await requerido(tx, uuid);
    if (cerrado(p)) throw new ClientError("El período está cerrado; consulte el reporte conservado.", 409);
    if (p.estado !== 1) throw new ClientError("Active el período para consultar sugerencias.", 409);
    const [[fuentes, total], detalles, tc] = await Promise.all([dao.listarFuentes(tx, page, limit, search, limiteCorte(civil(p.fecha_corte))), dao.getDetalles(tx, p.idsbssaldocontableperiodo), tipoCambio(tx, civil(p.fecha_corte))]);
    const asociados = new Set(detalles.map((d) => d.factoring.factoringid));
    return { items: fuentes.map((f) => ({ factoringid: f.factoringid, codigo_operacion: f.code, moneda_codigo: f.moneda.codigo, fecha_operacion: f.fecha_operacion, fecha_pago_efectivo: f.factoring_liquidaciones.length === 1 ? f.factoring_liquidaciones[0].fecha_pago_efectivo : null, instrumentos_fuente: f.factoring_facturas.map((i) => ({ instrumento: i.factura.code, referencia: i.factura.facturaid })), asociado: asociados.has(f.factoringid), ...evaluar(f, civil(p.fecha_corte), tc) })), total, page, limit, tipo_cambio: tcDto(tc, civil(p.fecha_corte)), acciones: acciones(p) };
  });

async function escritura<T>(work: (tx: TxClient) => Promise<T>) {
  try {
    return await prismaFT.client.$transaction(work, { timeout: prismaFT.transactionTimeout, isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2034"].includes(error.code)) throw new ClientError("Conflicto: el período ya existe o cambió durante la operación. Actualice la pantalla y revise antes de reintentar.", 409);
    throw error;
  }
}
export const crearPeriodoService = (input: PeriodoInput, usuario: number) =>
  escritura(async (tx) => {
    validarPeriodo(input);
    const [estados, tipos] = await dao.getCatalogos(tx);
    const estado = estados.find((s) => s.code === "SCPE00001"),
      tipo = tipos.find((t) => t.code === "SCOT00001" && t.habilitado === 1);
    if (!estado || !tipo) throw new ClientError("No están disponibles los catálogos de elaboración y Descuento.", 409);
    const p = await dao.crearPeriodo(tx, { code: codigo("SCP"), nombre_periodo: input.nombre_periodo, ...fechaData({ fecha_inicio: input.fecha_inicio, fecha_fin: input.fecha_fin, fecha_corte: input.fecha_corte }), idsbssaldocontableperiodoestado: estado.idsbssaldocontableperiodoestado, idsbssaldocontableoperaciontipo: tipo.idsbssaldocontableoperaciontipo, idusuariocrea: usuario, idusuariomod: usuario });
    return dtoPeriodo(p);
  });

export const mutarPeriodoService = (uuid: string, input: MutacionPeriodo, usuario: number) =>
  escritura(async (tx) => {
    // Bloquear antes de la primera lectura: todas las mutaciones de una cabecera se serializan.
    await dao.lockPeriodo(tx, uuid);
    const p = await requerido(tx, uuid),
      a = acciones(p);
    if (input.version !== p.version) throw new ClientError("El período cambió. Actualice la pantalla para no sobrescribir otra edición.", 409);
    const action = input.accion === "recalcular" || input.accion === "clasificar" ? "asociar" : input.accion;
    if (!a[action]) throw new ClientError(a.motivo ?? "Esta acción no está permitida.", 409);
    if (p.sbs_saldo_contable_operacion_tipo.code !== "SCOT00001") throw new ClientError("Solo Descuento tiene reglas implementadas.", 409);
    const detalles = await dao.getDetalles(tx, p.idsbssaldocontableperiodo);
    const audit = { idusuariomod: usuario, fechamod: new Date() };
    const changes: Prisma.sbs_saldo_contable_periodoUncheckedUpdateInput = { ...audit, version: { increment: 1 } };
    if (input.accion === "editar") {
      validarPeriodo(input.periodo);
      if (detalles.length && Object.entries(fechas(p)).some(([key, value]) => input.periodo[key as keyof FechasPeriodo] !== value)) throw new ClientError("Retire las asociaciones antes de cambiar las fechas del período.", 409);
      Object.assign(changes, fechaData({ fecha_inicio: input.periodo.fecha_inicio, fecha_fin: input.periodo.fecha_fin, fecha_corte: input.periodo.fecha_corte }), { nombre_periodo: input.periodo.nombre_periodo });
    } else if (input.accion === "eliminar" || input.accion === "activar") changes.estado = input.accion === "eliminar" ? 2 : 1;
    else if (input.accion === "retirar") {
      const requested = new Set(input.operaciones);
      const rows = detalles.filter((d) => requested.has(d.factoring.factoringid));
      if (rows.length !== requested.size) throw new ClientError("Alguna operación ya no está asociada al período.", 409);
      for (const d of rows) await dao.actualizarDetalle(tx, d.idsbssaldocontabledetalle, { ...audit, estado: 2, motivo_retiro: input.motivo });
    } else if (input.accion === "clasificar") {
      const d = detalles.find((d) => d.factoring.factoringid === input.operacion);
      if (!d) throw new ClientError("La operación no está asociada al período.", 404);
      await dao.actualizarDetalle(tx, d.idsbssaldocontabledetalle, { ...audit, clasificacion_instrumentos: JSON.stringify(input.instrumentos) });
    } else {
      const uuids = input.accion === "asociar" ? input.operaciones : detalles.map((d) => d.factoring.factoringid);
      if (input.accion === "cerrar" && !detalles.length) throw new ClientError("Asocie al menos una operación antes de cerrar.", 409);
      const fuentes = await dao.getFuentesPorUuid(tx, uuids);
      if (fuentes.length !== new Set(uuids).size) throw new ClientError("Alguna operación no existe.", 404);
      const tc = await tipoCambio(tx, civil(p.fecha_corte));
      for (const f of fuentes) {
        const e = evaluar(f, civil(p.fecha_corte), tc);
        if (!e.calculable) throw new ClientError(`${f.code}: ${e.motivos.map((m) => m.mensaje).join(" ")}`, 409);
        const current = detalles.find((d) => d.idfactoring === f.idfactoring);
        const snapshot = { idfactoringpropuesta: f.factoring_propuesta_aceptada!.idfactoringpropuesta, idfactoringliquidacion: f.factoring_liquidaciones[0]?.idfactoringliquidacion ?? null, idmoneda: f.idmoneda, idsbstipocambio: f.moneda.codigo === "USD" ? tc!.idsbstipocambio : null, codigo_operacion: f.code, moneda_codigo: f.moneda.codigo, fecha_operacion: f.fecha_operacion!, fecha_pago_efectivo: f.factoring_liquidaciones[0]?.fecha_pago_efectivo ?? null, monto_neto: e.monto_neto!, tipo_cambio: e.tipo_cambio!, monto_saldo_contable: e.monto_saldo_contable! };
        if (input.accion === "cerrar") {
          // Cerrar no altera silenciosamente una revisión: cambios de fuente exigen recalcular.
          if (!current || current.idfactoringpropuesta !== snapshot.idfactoringpropuesta || current.idfactoringliquidacion !== snapshot.idfactoringliquidacion || current.idmoneda !== snapshot.idmoneda || current.idsbstipocambio !== snapshot.idsbstipocambio || current.codigo_operacion !== snapshot.codigo_operacion || current.moneda_codigo !== snapshot.moneda_codigo || +current.fecha_operacion !== +snapshot.fecha_operacion || +(current.fecha_pago_efectivo ?? 0) !== +(snapshot.fecha_pago_efectivo ?? 0) || !current.monto_neto.eq(snapshot.monto_neto) || !current.tipo_cambio.eq(snapshot.tipo_cambio) || !current.monto_saldo_contable.eq(snapshot.monto_saldo_contable)) throw new ClientError(`${f.code}: las fuentes cambiaron. Recalcule y revise antes de cerrar.`, 409);
        } else {
          if (input.accion === "asociar" && current) throw new ClientError(`${f.code}: ya está asociada al período.`, 409);
          await dao.upsertDetalle(tx, p.idsbssaldocontableperiodo, f.idfactoring, { ...snapshot, code: codigo("SCD"), idsbssaldocontableperiodo: p.idsbssaldocontableperiodo, idfactoring: f.idfactoring, idusuariocrea: usuario, idusuariomod: usuario }, { ...snapshot, ...audit, estado: 1, motivo_retiro: null });
        }
      }
      if (input.accion === "cerrar") {
        const [estados] = await dao.getCatalogos(tx);
        const estado = estados.find((s) => s.code === "SCPE00002");
        if (!estado) throw new ClientError("No está disponible el estado Cerrado.", 409);
        Object.assign(changes, { idsbssaldocontableperiodoestado: estado.idsbssaldocontableperiodoestado, fecha_cierre: new Date(), idusuariocierra: usuario });
      }
    }
    const finalDetalles = await dao.getDetalles(tx, p.idsbssaldocontableperiodo);
    changes.monto_saldo_contable = totalSaldo(finalDetalles.map((d) => d.monto_saldo_contable.toFixed(8)));
    if (new Prisma.Decimal(changes.monto_saldo_contable).gte("10000000000000000")) throw new ClientError("El total excede la capacidad contable del período; no se guardaron cambios.", 422);
    return dtoPeriodo(await dao.actualizarPeriodo(tx, p.idsbssaldocontableperiodo, changes));
  });
