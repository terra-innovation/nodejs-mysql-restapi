import { Decimal } from "@prisma/client/runtime/client";
import { DateTime } from "luxon";
import type { InstrumentoSaldo } from "#src/types/SaldoContable.types.js";

// Precisión local: DECIMAL(10,2) × DECIMAL(12,6) puede superar los 20 dígitos
// predeterminados. No modificar la configuración global de fórmulas existentes.
const PreciseDecimal = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export const AYUDA_MONTO_NETO = "Monto neto pendiente de pago confirmado por el pagador, tomado de la propuesta aceptada de la operación.";
export type Instrumento = InstrumentoSaldo;
export interface FechasPeriodo {
  fecha_inicio: string;
  fecha_fin: string;
  fecha_corte: string;
}
export interface FuenteSaldo {
  estado: number;
  fecha_operacion: Date | null;
  propuesta: { pertenece: boolean; estado: number; monto_neto: Decimal } | null;
  moneda: string;
  liquidaciones: { fecha_pago_efectivo: Date }[];
}
export interface EvaluacionSaldo {
  elegible: boolean;
  calculable: boolean;
  motivos: { codigo: string; mensaje: string }[];
  monto_neto: string | null;
  tipo_cambio: string | null;
  monto_saldo_contable: string | null;
}

/** DATE civil se valida sin convertirlo a un instante UTC por accidente. */
export function fechaCivil(value: string) {
  const date = DateTime.fromISO(value, { zone: "America/Lima" });
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && date.isValid && date.toISODate() === value;
}
export function validarFechas(f: FechasPeriodo): string | null {
  if (![f.fecha_inicio, f.fecha_fin, f.fecha_corte].every(fechaCivil)) return "Las fechas deben ser fechas válidas con formato AAAA-MM-DD.";
  if (f.fecha_inicio > f.fecha_fin) return "El inicio no puede ser posterior al fin del período.";
  if (f.fecha_corte < f.fecha_inicio) return "El corte no puede ser anterior al inicio del período.";
  return null;
}
export function limiteCorte(fecha: string) {
  return DateTime.fromISO(fecha, { zone: "America/Lima" }).plus({ days: 1 }).startOf("day").toJSDate();
}
export function temporalidad(f: FechasPeriodo, now = new Date()) {
  const hoy = DateTime.fromJSDate(now, { zone: "America/Lima" }).toISODate()!;
  if (f.fecha_inicio > hoy) return "FUTURO" as const;
  if (f.fecha_fin >= hoy || f.fecha_corte >= hoy) return "EN_CURSO" as const;
  return "ANTERIOR" as const;
}
export function accionesPeriodo(f: FechasPeriodo, activo: boolean, cerrado: boolean, now = new Date()) {
  const tiempo = temporalidad(f, now);
  const motivo = cerrado ? "El período está cerrado; el reporte es inmutable." : !activo ? "El período está eliminado; actívelo para trabajar." : tiempo === "FUTURO" ? "El período es futuro; no puede asociar operaciones." : tiempo === "EN_CURSO" ? "El período está en curso; podrá asociar operaciones cuando terminen el período y su corte." : null;
  return { temporalidad: tiempo, editar: activo && !cerrado, eliminar: activo && !cerrado, activar: !activo && !cerrado, asociar: motivo === null, retirar: motivo === null, cerrar: motivo === null, motivo };
}

/** Un cobro posterior no cancela el saldo del corte histórico. No excluye cartera antigua. */
export function evaluarSaldo(fuente: FuenteSaldo, corte: string, contable: Decimal | null): EvaluacionSaldo {
  const motivos: EvaluacionSaldo["motivos"] = [];
  const add = (codigo: string, mensaje: string) => motivos.push({ codigo, mensaje });
  const limite = limiteCorte(corte);
  if (fuente.estado !== 1) add("OPERACION_INACTIVA", "La operación no está activa; requiere revisión de su evidencia histórica.");
  if (!fuente.fecha_operacion) add("SIN_FECHA_OPERACION", "La operación aún no tiene fecha de inicio acreditada.");
  else if (fuente.fecha_operacion >= limite) add("INICIO_POSTERIOR_CORTE", "La operación inició después del corte.");
  if (!fuente.propuesta || !fuente.propuesta.pertenece || fuente.propuesta.estado !== 1) add("SIN_PROPUESTA_ACEPTADA", "Falta una propuesta aceptada activa que pertenezca a esta operación.");
  else if (!fuente.propuesta.monto_neto.isFinite() || fuente.propuesta.monto_neto.lte(0)) add("NETO_INVALIDO", "El monto neto de la propuesta aceptada debe ser positivo.");
  if (fuente.liquidaciones.length > 1) add("VARIAS_LIQUIDACIONES_VIGENTES", "Hay varias liquidaciones vigentes; regularice la fuente de cobro antes de asociar.");
  const pago = fuente.liquidaciones.length === 1 ? fuente.liquidaciones[0].fecha_pago_efectivo : null;
  if (pago && fuente.fecha_operacion && pago < fuente.fecha_operacion) add("COBRO_ANTERIOR_INICIO", "La fecha real de cobro es anterior al inicio; requiere revisión.");
  if (pago && pago < limite) add("PAGADA_AL_CORTE", "La operación fue cobrada totalmente hasta la fecha de corte.");
  const elegible = motivos.length === 0;
  let multiplicador: Decimal | null = null;
  if (fuente.moneda === "PEN") multiplicador = new Decimal(1);
  else if (fuente.moneda !== "USD") add("MONEDA_NO_SOPORTADA", "Solo se admiten operaciones PEN o USD.");
  else if (!contable || !contable.isFinite() || contable.lte(0)) add("SIN_TIPO_CAMBIO_CONTABLE", "Actualice el tipo de cambio contable SBS USD/PEN de la fecha exacta de corte.");
  else multiplicador = contable;
  const calculable = elegible && motivos.length === 0;
  return { elegible: elegible && fuente.moneda !== "" && ["PEN", "USD"].includes(fuente.moneda), calculable, motivos, monto_neto: fuente.propuesta?.monto_neto.toFixed(2) ?? null, tipo_cambio: multiplicador?.toFixed(6) ?? null, monto_saldo_contable: calculable ? new PreciseDecimal(fuente.propuesta!.monto_neto.toString()).mul(multiplicador!.toString()).toFixed(8) : null };
}

export function totalSaldo(importes: string[]) {
  return importes.reduce((sum, value) => sum.plus(value), new PreciseDecimal(0)).toFixed(8);
}
