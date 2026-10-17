import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import type { TxClient } from "#src/types/Prisma.types.js";

export const operation = (tx: TxClient, uuid: string) => tx.factoring.findUnique({ where: { factoringid: uuid }, select: { idfactoring: true, factoringid: true, idfactor: true, idmoneda: true, estado: true, fecha_operacion: true, factoring_propuesta_aceptada: { select: { monto_neto: true, idfactoring: true } } } });
export const master = (tx: TxClient, pk: number) => tx.factoring_pago.findUnique({ where: { idfactoring: pk } });
export const currentMaster = async (tx: TxClient, pk: number) => (await tx.$queryRaw<Prisma.factoring_pagoGetPayload<Record<string, never>>[]>`SELECT _idfactoringpago idfactoringpago,factoringpagoid,code,_idfactoring idfactoring,_idfactoringpagoestado idfactoringpagoestado,version,estado,idusuariocrea,idusuariomod,fechacrea,fechamod FROM factoring_pago WHERE _idfactoring=${pk} FOR UPDATE`)[0] ?? null;
export const statuses = (tx: TxClient) => tx.factoring_pago_estado.findMany({ where: { estado: 1 }, orderBy: { idfactoringpagoestado: "asc" } });
export const details = (tx: TxClient, pk: number) => tx.factoring_pago_detalle.findMany({ where: { idfactoringpago: pk }, orderBy: [{ fechacrea: "desc" }, { idfactoringpagodetalle: "desc" }] });
export const detail = (tx: TxClient, uuid: string) => tx.factoring_pago_detalle.findUnique({ where: { factoringpagodetalleid: uuid } });
export const movement = (tx: TxClient, uuid: string) => tx.factor_transaccion_bancaria.findUnique({ where: { factortransaccionbancariaid: uuid }, include: { factor_cuenta_bancaria: { include: { cuenta_bancaria: true } } } });
export const bankRows = (tx: TxClient, ids: number[]) => tx.factor_transaccion_bancaria.findMany({ where: { idfactortransaccionbancaria: { in: ids } }, select: { idfactortransaccionbancaria: true, factortransaccionbancariaid: true, fecha: true, numero_operacion: true, descripcion: true, monto: true } });
export async function lockMaster(tx: TxClient, pk: number) {
  await tx.$queryRaw`SELECT _idfactoringpago FROM factoring_pago WHERE _idfactoringpago=${pk} FOR UPDATE`;
}
export async function lockOperation(tx: TxClient, pk: number) {
  await tx.$queryRaw`SELECT _idfactoring FROM factoring WHERE _idfactoring=${pk} FOR UPDATE`;
}
export async function lockMovement(tx: TxClient, pk: number) {
  await tx.$queryRaw`SELECT _idfactortransaccionbancaria FROM factor_transaccion_bancaria WHERE _idfactortransaccionbancaria=${pk} FOR UPDATE`;
}
export const total = async (tx: TxClient, masterPk: number) => (await tx.factoring_pago_detalle.aggregate({ where: { idfactoringpago: masterPk, estado: 1 }, _sum: { monto_aplicado: true } }))._sum.monto_aplicado ?? new Prisma.Decimal(0);
export const applied = async (tx: TxClient, bankPk: number, exclude = 0) => {
  // El servicio usa READ COMMITTED y mantiene bloqueado el movimiento durante esta suma.
  // SUM en MariaDB conserva la precisión del conjunto, sin acumular en coma flotante.
  return (await tx.factoring_pago_detalle.aggregate({ where: { idfactortransaccionbancaria: bankPk, estado: 1, idfactoringpagodetalle: { not: exclude } }, _sum: { monto_aplicado: true } }))._sum.monto_aplicado ?? new Prisma.Decimal(0);
};
export const createMaster = (tx: TxClient, data: Prisma.factoring_pagoUncheckedCreateInput) => tx.factoring_pago.create({ data });
export const createDetail = (tx: TxClient, data: Prisma.factoring_pago_detalleUncheckedCreateInput) => tx.factoring_pago_detalle.create({ data });
export const updateDetail = (tx: TxClient, pk: number, version: number, data: Prisma.factoring_pago_detalleUncheckedUpdateManyInput) => tx.factoring_pago_detalle.updateMany({ where: { idfactoringpagodetalle: pk, version }, data });
export const updateMaster = (tx: TxClient, pk: number, version: number, data: Prisma.factoring_pagoUncheckedUpdateManyInput) => tx.factoring_pago.updateMany({ where: { idfactoringpago: pk, version }, data });
export const history = (tx: TxClient, data: Prisma.factoring_pago_historialUncheckedCreateInput) => tx.factoring_pago_historial.create({ data });
export const histories = (tx: TxClient, pk: number) => tx.factoring_pago_historial.findMany({ where: { idfactoringpago: pk }, orderBy: [{ fechacrea: "desc" }, { idfactoringpagohistorial: "desc" }], take: 100, select: { factoringpagohistorialid: true, evento: true, motivo: true, valores_anteriores: true, valores_posteriores: true, idusuariocrea: true, fechacrea: true } });

export async function searchBank(tx: TxClient, factor: number, currency: number, from: string, to: string, q: string, page: number, limit = 20) {
  const filter = Prisma.sql`b.estado=1 AND b.signo=1 AND a.estado=1 AND c.estado=1 AND a._idfactor=${factor} AND c._idmoneda=${currency} AND b.fecha BETWEEN ${from} AND ${to} AND (b.numero_operacion LIKE ${"%" + q + "%"} OR b.descripcion LIKE ${"%" + q + "%"})`;
  const fromSql = Prisma.sql`FROM factor_transaccion_bancaria b JOIN factor_cuenta_bancaria a ON a._idfactorcuentabancaria=b._idfactorcuentabancaria JOIN cuenta_bancaria c ON c._idcuentabancaria=a._idcuentabancaria WHERE ${filter}`;
  const [count] = await tx.$queryRaw<{ n: bigint }[]>(Prisma.sql`SELECT COUNT(*) n ${fromSql}`);
  const items = await tx.$queryRaw<{ uuid: string; fecha: Date; numero_operacion: string; descripcion: string; monto: Prisma.Decimal; disponible: Prisma.Decimal; cuenta: string }[]>(Prisma.sql`SELECT b.factortransaccionbancariaid uuid,b.fecha,b.numero_operacion,b.descripcion,b.monto,c.alias cuenta,b.monto-COALESCE((SELECT SUM(d.monto_aplicado) FROM factoring_pago_detalle d WHERE d._idfactortransaccionbancaria=b._idfactortransaccionbancaria AND d.estado=1),0) disponible ${fromSql} ORDER BY b.fecha DESC,b._idfactortransaccionbancaria DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`);
  return { total: Number(count.n), items: items.map((i) => ({ ...i, fecha: i.fecha.toISOString().slice(0, 10), monto: String(i.monto), disponible: String(i.disponible) })) };
}
