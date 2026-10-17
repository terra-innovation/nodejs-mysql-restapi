import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import type { TxClient } from "#src/types/Prisma.types.js";
import { ClientError } from "#src/utils/CustomErrors.js";
function orderField(field: string | undefined, allowed: string[], fallback: string) {
  if (field && !allowed.includes(field)) throw new ClientError("Columna de orden no permitida.", 422);
  return field || fallback;
}
export { connection, connections, connectionCreate, connectionUpdate, withConnectionLock } from "#src/daos/configuracionbbdd.Dao.js";
export const bankSource = (tx: TxClient, pk: number) => tx.factor_transaccion_bancaria_fuente.findUnique({ where: { idconfiguracionbbdd: pk } });
export const bankSourceCreate = (tx: TxClient, pk: number, table: string) => tx.factor_transaccion_bancaria_fuente.create({ data: { idconfiguracionbbdd: pk, tabla_origen: table } });
export const accountInclude = { cuenta_bancaria: { include: { moneda: true } } } satisfies Prisma.factor_cuenta_bancariaInclude;
export const accounts = (tx: TxClient) => tx.factor_cuenta_bancaria.findMany({ where: { estado: 1 }, include: accountInclude });
export const account = (tx: TxClient, uuid: string) => tx.factor_cuenta_bancaria.findUnique({ where: { factorcuentabancariaid: uuid }, include: accountInclude });
export const mappingInclude = { factor_cuenta_bancaria: { include: accountInclude }, configuracion_bbdd: { select: { configuracionbbddid: true, alias: true, factor_transaccion_bancaria_fuente: { select: { tabla_origen: true } } } } } satisfies Prisma.factor_transaccion_bancaria_origen_cuentaInclude;
export const mappings = (tx: TxClient) => tx.factor_transaccion_bancaria_origen_cuenta.findMany({ include: mappingInclude, orderBy: { fechacrea: "desc" } });
export const mapping = (tx: TxClient, uuid: string) => tx.factor_transaccion_bancaria_origen_cuenta.findUnique({ where: { factortransaccionbancariaorigencuentaid: uuid }, include: mappingInclude });
export const mappingCreate = (tx: TxClient, data: Prisma.factor_transaccion_bancaria_origen_cuentaUncheckedCreateInput) => tx.factor_transaccion_bancaria_origen_cuenta.create({ data, include: mappingInclude });
export const mappingUpdate = (tx: TxClient, pk: number, version: number, data: Prisma.factor_transaccion_bancaria_origen_cuentaUncheckedUpdateManyInput) => tx.factor_transaccion_bancaria_origen_cuenta.updateMany({ where: { idfactortransaccionbancariaorigencuenta: pk, version }, data });
export const movementInclude = { factor_cuenta_bancaria: { include: accountInclude } } satisfies Prisma.factor_transaccion_bancariaInclude;
export const movement = (tx: TxClient, uuid: string) => tx.factor_transaccion_bancaria.findUnique({ where: { factortransaccionbancariaid: uuid }, include: movementInclude });
export async function lockMovement(tx: TxClient, pk: number) {
  await tx.$queryRaw`SELECT _idfactortransaccionbancaria FROM factor_transaccion_bancaria WHERE _idfactortransaccionbancaria=${pk} FOR UPDATE`;
}
export const activePaymentApplications = (tx: TxClient, pk: number) => tx.factoring_pago_detalle.count({ where: { idfactortransaccionbancaria: pk, estado: 1 } });
export const byIdentity = (tx: TxClient, hash: string) => tx.factor_transaccion_bancaria.findUnique({ where: { identidad_sha256: hash }, include: movementInclude });
export const byCurrentIdentity = (tx: TxClient, accountPk: number, date: string, operation: string, sign: number, amount: string) => tx.factor_transaccion_bancaria.findFirst({ where: { idfactorcuentabancaria: accountPk, fecha: new Date(`${date}T00:00:00.000Z`), numero_operacion: operation, signo: sign, monto: amount }, include: movementInclude });
export const movementCreate = (tx: TxClient, data: Prisma.factor_transaccion_bancariaUncheckedCreateInput) => tx.factor_transaccion_bancaria.create({ data, include: movementInclude });
export const movementUpdate = (tx: TxClient, pk: number, version: number, data: Prisma.factor_transaccion_bancariaUncheckedUpdateManyInput) => tx.factor_transaccion_bancaria.updateMany({ where: { idfactortransaccionbancaria: pk, version }, data });
export const movements = async (tx: TxClient, where: Prisma.factor_transaccion_bancariaWhereInput, page: number, limit: number, sortBy?: string, desc = true) => {
  const field = orderField(sortBy, ["code", "fecha", "numero_operacion", "descripcion", "signo", "monto", "estado", "origen_alta", "fechacrea", "fechamod"], "fecha");
  return { total: await tx.factor_transaccion_bancaria.count({ where }), items: await tx.factor_transaccion_bancaria.findMany({ where, include: movementInclude, orderBy: [{ [field]: desc ? "desc" : "asc" }, { idfactortransaccionbancaria: "desc" }], skip: (page - 1) * limit, take: limit }) };
};
export const runCreate = (tx: TxClient, data: Prisma.factor_transaccion_bancaria_sincronizacionUncheckedCreateInput) => tx.factor_transaccion_bancaria_sincronizacion.create({ data });
export const runUpdate = (tx: TxClient, id: number, data: Prisma.factor_transaccion_bancaria_sincronizacionUncheckedUpdateInput) => tx.factor_transaccion_bancaria_sincronizacion.update({ where: { idfactortransaccionbancariasincronizacion: id }, data });
export const interruptRuns = (tx: TxClient, connectionPk: number, user: number) => tx.factor_transaccion_bancaria_sincronizacion.updateMany({ where: { idconexion: connectionPk, resultado: "EN_CURSO" }, data: { resultado: "INTERRUMPIDA", fin: new Date(), error_codigo: "TRABAJADOR_INTERRUMPIDO", error_resumen: "El proceso anterior perdió el bloqueo. Reintente el mismo alcance para completar la lectura.", idusuariomod: user, fechamod: new Date() } });
export const scheduledActor = (tx: TxClient, user: number) => tx.usuario.count({ where: { idusuario: user, estado: 1, usuario_roles: { some: { idrol: 6, estado: 1, rol: { estado: 1 } } } } });
export const incident = (tx: TxClient, uuid: string) => tx.factor_transaccion_bancaria_incidencia.findUnique({ where: { factortransaccionbancariaincidenciaid: uuid } });
export const incidentByHash = (tx: TxClient, hash: string) => tx.factor_transaccion_bancaria_incidencia.findUnique({ where: { huella: hash } });
export const incidentUpsert = (tx: TxClient, hash: string, create: Prisma.factor_transaccion_bancaria_incidenciaUncheckedCreateInput, update: Prisma.factor_transaccion_bancaria_incidenciaUncheckedUpdateInput) => tx.factor_transaccion_bancaria_incidencia.upsert({ where: { huella: hash }, create, update });
export const incidentUpdate = (tx: TxClient, pk: number, version: number, data: Prisma.factor_transaccion_bancaria_incidenciaUncheckedUpdateManyInput) => tx.factor_transaccion_bancaria_incidencia.updateMany({ where: { idfactortransaccionbancariaincidencia: pk, version }, data });
export const historyCreate = (tx: TxClient, data: Prisma.factor_transaccion_bancaria_historialUncheckedCreateInput) => tx.factor_transaccion_bancaria_historial.create({ data });
export const logAuthors = (tx: TxClient, users: number[]) => tx.usuario.findMany({ where: { idusuario: { in: users } }, select: { idusuario: true, usuarionombres: true, apellidopaterno: true, apellidomaterno: true } });
export async function logs(tx: TxClient, kind: "ejecuciones" | "incidencias" | "historial", page: number, limit: number, search = "", sortBy?: string, desc = true) {
  const allowed = kind === "ejecuciones" ? ["code", "disparador", "inicio", "fin", "resultado", "filas_leidas", "filas_insertadas", "filas_existentes", "filas_incidencia", "fechacrea", "fechamod"] : kind === "incidencias" ? ["code", "tipo", "situacion", "veces_observada", "ultima_observacion", "fechacrea", "fechamod"] : ["code", "evento", "motivo", "fechacrea", "fechamod"];
  const field = orderField(sortBy, allowed, "fechacrea");
  const query = { orderBy: [{ [field]: desc ? ("desc" as const) : ("asc" as const) }, { code: "asc" as const }], skip: (page - 1) * limit, take: limit };
  if (kind === "ejecuciones") {
    const where: Prisma.factor_transaccion_bancaria_sincronizacionWhereInput = search ? { OR: ["code", "resultado", "disparador", "error_resumen"].map((key) => ({ [key]: { contains: search } })) } : {};
    return { total: await tx.factor_transaccion_bancaria_sincronizacion.count({ where }), items: await tx.factor_transaccion_bancaria_sincronizacion.findMany({ ...query, where }) };
  }
  if (kind === "incidencias") {
    const where: Prisma.factor_transaccion_bancaria_incidenciaWhereInput = search ? { OR: ["code", "tipo", "situacion", "datos_revision", "resolucion_motivo"].map((key) => ({ [key]: { contains: search } })) } : {};
    return { total: await tx.factor_transaccion_bancaria_incidencia.count({ where }), items: await tx.factor_transaccion_bancaria_incidencia.findMany({ ...query, where }) };
  }
  // Los cambios de configuración son exclusivos del administrador; financiero solo ve gestión operativa.
  const where: Prisma.factor_transaccion_bancaria_historialWhereInput = { idconexion: null, ...(search ? { OR: ["code", "evento", "motivo"].map((key) => ({ [key]: { contains: search } })) } : {}) };
  return { total: await tx.factor_transaccion_bancaria_historial.count({ where }), items: await tx.factor_transaccion_bancaria_historial.findMany({ ...query, where }) };
}
