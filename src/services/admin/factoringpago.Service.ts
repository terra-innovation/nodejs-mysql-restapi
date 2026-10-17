import { randomUUID } from "node:crypto";
import { prismaFT } from "#src/models/prisma/db-factoring.js";
import type { TxClient } from "#src/types/Prisma.types.js";
import * as dao from "#src/daos/factoringpago.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { disponiblePago, importePago, resumenPago } from "#src/domain/factoring/factoringPago.Policy.js";
const required = <T>(value: T | null | undefined): T => {
  if (!value) throw new ClientError("Registro no disponible.", 404);
  return value;
};
const audit = (user: number) => {
  if (!Number.isSafeInteger(user) || user <= 0) throw new ClientError("Sesión inválida.", 401);
  return { idusuariocrea: user, idusuariomod: user };
};
const changed = (user: number) => ({ idusuariomod: audit(user).idusuariomod, fechamod: new Date(), version: { increment: 1 } });
const check = (count: { count: number }) => {
  if (count.count !== 1) throw new ClientError("La información cambió. Actualice antes de continuar.", 409);
};
async function event(tx: TxClient, pk: number, user: number, evento: string, motivo: string | null, before: unknown, after: unknown, detail?: number) {
  await dao.history(tx, { factoringpagohistorialid: randomUUID(), code: randomUUID().slice(0, 20), idfactoringpago: pk, idfactoringpagodetalle: detail, evento, motivo, valores_anteriores: before == null ? null : JSON.stringify(before), valores_posteriores: after == null ? null : JSON.stringify(after), ...audit(user) });
}
export async function asegurarMaestroPago(tx: TxClient, pk: number, user: number) {
  await dao.lockOperation(tx, pk);
  const existing = await dao.currentMaster(tx, pk);
  if (existing) {
    if (existing.estado !== 1) throw new ClientError("El seguimiento de pagos está anulado.", 409);
    return existing;
  }
  const pending = required((await dao.statuses(tx)).find((s) => s.code === "PENDIENTE"));
  const row = await dao.createMaster(tx, { factoringpagoid: randomUUID(), code: randomUUID(), idfactoring: pk, idfactoringpagoestado: pending.idfactoringpagoestado, ...audit(user) });
  await event(tx, row.idfactoringpago, user, "ALTA_INICIO_OPERACION", null, null, { estado: pending.code });
  return row;
}
async function summary(tx: TxClient, uuid: string) {
  const op = required(await dao.operation(tx, uuid));
  const m = await dao.master(tx, op.idfactoring);
  const reference = op.factoring_propuesta_aceptada?.idfactoring === op.idfactoring ? op.factoring_propuesta_aceptada.monto_neto : null;
  const states = await dao.statuses(tx);
  if (!m) return { maestro: null, detalles: [], historial: [], estados: states.map((s) => ({ uuid: s.factoringpagoestadoid, code: s.code, nombre: s.nombre })), ...resumenPago(reference, 0) };
  const ds = await dao.details(tx, m.idfactoringpago),
    banks = await dao.bankRows(
      tx,
      ds.map((d) => d.idfactortransaccionbancaria),
    );
  return {
    maestro: { uuid: m.factoringpagoid, version: m.version, estado: states.find((s) => s.idfactoringpagoestado === m.idfactoringpagoestado)?.code ?? null, activo: m.estado === 1 },
    ...resumenPago(reference, await dao.total(tx, m.idfactoringpago)),
    estados: states.map((s) => ({ uuid: s.factoringpagoestadoid, code: s.code, nombre: s.nombre })),
    detalles: ds.map((d) => {
      const b = required(banks.find((b) => b.idfactortransaccionbancaria === d.idfactortransaccionbancaria));
      return { uuid: d.factoringpagodetalleid, version: d.version, estado: d.estado, monto_aplicado: d.monto_aplicado.toFixed(2), transaccion: { uuid: b.factortransaccionbancariaid, numero_operacion: b.numero_operacion, fecha: b.fecha.toISOString().slice(0, 10), descripcion: b.descripcion, monto: b.monto.toFixed(2) } };
    }),
    historial: await dao.histories(tx, m.idfactoringpago),
  };
}
export const consultarPago = (uuid: string) => prismaFT.client.$transaction((tx) => summary(tx, uuid));
export const buscarTransaccionesPago = (uuid: string, from: string, to: string, q: string, page: number, limit = 20) =>
  prismaFT.client.$transaction(async (tx) => {
    const op = required(await dao.operation(tx, uuid));
    return dao.searchBank(tx, op.idfactor, op.idmoneda, from, to, q, page, limit);
  });
export async function cambiarEstadoPago(uuid: string, state: string, version: number, reason: string, user: number) {
  return prismaFT.client.$transaction(async (tx) => {
    const op = required(await dao.operation(tx, uuid)),
      m = required(await dao.master(tx, op.idfactoring));
    await dao.lockMaster(tx, m.idfactoringpago);
    if (m.estado !== 1 || op.estado !== 1) throw new ClientError("Seguimiento no editable.", 422);
    const s = required((await dao.statuses(tx)).find((s) => s.factoringpagoestadoid === state));
    if (m.idfactoringpagoestado !== s.idfactoringpagoestado && !reason.trim()) throw new ClientError("Indique el motivo del cambio de estado.", 422);
    check(await dao.updateMaster(tx, m.idfactoringpago, version, { idfactoringpagoestado: s.idfactoringpagoestado, ...changed(user) }));
    await event(tx, m.idfactoringpago, user, "CAMBIO_ESTADO", reason, { estado: m.idfactoringpagoestado }, { estado: s.code });
    return summary(tx, uuid);
  });
}
export interface PagoInput {
  accion: "crear" | "editar" | "anular" | "activar";
  detalle?: string;
  transaccion?: string;
  monto?: string;
  version: number;
  detalleVersion?: number;
  motivo: string;
}
export async function guardarDetallePago(uuid: string, input: PagoInput, user: number) {
  return prismaFT.client.$transaction(
    async (tx) => {
      const op = required(await dao.operation(tx, uuid)),
        m = required(await dao.master(tx, op.idfactoring));
      const old = input.accion === "crear" ? null : required(await dao.detail(tx, required(input.detalle)));
      if (old && old.idfactoringpago !== m.idfactoringpago) throw new ClientError("El detalle no pertenece a esta operación.", 404);
      const bankUuid = old ? required((await dao.bankRows(tx, [old.idfactortransaccionbancaria]))[0]).factortransaccionbancariaid : required(input.transaccion);
      let bank = required(await dao.movement(tx, bankUuid));
      await dao.lockMovement(tx, bank.idfactortransaccionbancaria);
      await dao.lockMaster(tx, m.idfactoringpago);
      bank = required(await dao.movement(tx, bankUuid));
      if (m.estado !== 1 || op.estado !== 1 || !op.fecha_operacion) throw new ClientError("La operación no está habilitada para registrar pagos.", 422);
      if (input.accion !== "crear" && !input.motivo.trim()) throw new ClientError("Indique el motivo del cambio.", 422);
      if (old && (input.accion === "activar") !== (old.estado === 2)) throw new ClientError("El detalle cambió de vigencia.", 409);
      const amount = input.accion === "anular" || input.accion === "activar" ? required(old).monto_aplicado : importePago(required(input.monto));
      if (input.accion !== "anular") {
        const a = bank.factor_cuenta_bancaria;
        if (bank.estado !== 1 || bank.signo !== 1 || a.estado !== 1 || a.cuenta_bancaria.estado !== 1 || a.idfactor !== op.idfactor || a.cuenta_bancaria.idmoneda !== op.idmoneda) throw new ClientError("La transacción no es un abono válido para el factor y moneda de esta operación.", 422);
        disponiblePago(bank.monto, await dao.applied(tx, bank.idfactortransaccionbancaria, old?.idfactoringpagodetalle), amount);
      }
      check(await dao.updateMaster(tx, m.idfactoringpago, input.version, changed(user)));
      let id: number;
      if (!old) {
        if ((await dao.details(tx, m.idfactoringpago)).some((d) => d.idfactortransaccionbancaria === bank.idfactortransaccionbancaria)) throw new ClientError("Esta transacción ya está asociada. Edite o reactive su detalle.", 409);
        id = (await dao.createDetail(tx, { factoringpagodetalleid: randomUUID(), code: randomUUID().slice(0, 20), idfactoringpago: m.idfactoringpago, idfactortransaccionbancaria: bank.idfactortransaccionbancaria, monto_aplicado: amount, ...audit(user) })).idfactoringpagodetalle;
      } else {
        check(await dao.updateDetail(tx, old.idfactoringpagodetalle, required(input.detalleVersion), { monto_aplicado: amount, estado: input.accion === "anular" ? 2 : 1, ...changed(user) }));
        id = old.idfactoringpagodetalle;
      }
      await event(tx, m.idfactoringpago, user, input.accion.toUpperCase(), input.motivo || null, old ? { importe: old.monto_aplicado.toFixed(2), estado: old.estado } : null, { importe: amount.toFixed(2), estado: input.accion === "anular" ? 2 : 1, transaccion: bankUuid }, id);
      return summary(tx, uuid);
    },
    { timeout: prismaFT.transactionTimeout, isolationLevel: "ReadCommitted" },
  );
}
