import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import type { TxClient } from "#src/types/Prisma.types.js";

const cabeceraInclude = { sbs_saldo_contable_periodo_estado: true, sbs_saldo_contable_operacion_tipo: true } as const;
const ordenCobros: Prisma.factoring_liquidacionOrderByWithRelationInput[] = [{ fecha_pago_efectivo: "asc" }, { idfactoringliquidacion: "asc" }];
const fuenteInclude = {
  moneda: { select: { idmoneda: true, codigo: true } },
  factoring_propuesta_aceptada: { select: { idfactoringpropuesta: true, factoringpropuestaid: true, idfactoring: true, monto_neto: true, estado: true } },
  factoring_liquidaciones: { where: { estado: 1 }, orderBy: ordenCobros, select: { idfactoringliquidacion: true, fecha_pago_efectivo: true } },
  factoring_facturas: { where: { estado: 1 }, select: { factura: { select: { facturaid: true, code: true } } } },
} as const;
export type FuenteSaldoRow = Prisma.factoringGetPayload<{ include: typeof fuenteInclude }>;
export type PeriodoRow = Prisma.sbs_saldo_contable_periodoGetPayload<{ include: typeof cabeceraInclude }>;

export const listarPeriodos = (tx: TxClient, page: number, limit: number) => Promise.all([tx.sbs_saldo_contable_periodo.findMany({ include: cabeceraInclude, orderBy: [{ fecha_corte: "desc" }, { idsbssaldocontableperiodo: "desc" }], skip: (page - 1) * limit, take: limit }), tx.sbs_saldo_contable_periodo.count()]);
export const getPeriodo = (tx: TxClient, uuid: string) => tx.sbs_saldo_contable_periodo.findUnique({ where: { sbssaldocontableperiodoid: uuid }, include: cabeceraInclude });
export const lockPeriodo = (tx: TxClient, uuid: string) => tx.$queryRaw`SELECT _idsbssaldocontableperiodo FROM sbs_saldo_contable_periodo WHERE sbssaldocontableperiodoid=${uuid} FOR UPDATE`;
export const getCatalogos = (tx: TxClient) => Promise.all([tx.sbs_saldo_contable_periodo_estado.findMany({ where: { estado: 1 }, orderBy: { orden: "asc" } }), tx.sbs_saldo_contable_operacion_tipo.findMany({ where: { estado: 1 }, orderBy: { orden: "asc" } })]);
export const crearPeriodo = (tx: TxClient, data: Prisma.sbs_saldo_contable_periodoUncheckedCreateInput) => tx.sbs_saldo_contable_periodo.create({ data, include: cabeceraInclude });
export const actualizarPeriodo = (tx: TxClient, id: number, data: Prisma.sbs_saldo_contable_periodoUncheckedUpdateInput) => tx.sbs_saldo_contable_periodo.update({ where: { idsbssaldocontableperiodo: id }, data, include: cabeceraInclude });
export const getDetalles = (tx: TxClient, id: number) => tx.sbs_saldo_contable_detalle.findMany({ where: { idsbssaldocontableperiodo: id, estado: 1 }, orderBy: { codigo_operacion: "asc" }, include: { factoring: { select: { factoringid: true } }, factoring_propuesta: { select: { factoringpropuestaid: true } } } });
export const upsertDetalle = (tx: TxClient, periodo: number, factoring: number, create: Prisma.sbs_saldo_contable_detalleUncheckedCreateInput, update: Prisma.sbs_saldo_contable_detalleUncheckedUpdateInput) => tx.sbs_saldo_contable_detalle.upsert({ where: { idsbssaldocontableperiodo_idfactoring: { idsbssaldocontableperiodo: periodo, idfactoring: factoring } }, create, update });
export const actualizarDetalle = (tx: TxClient, id: number, data: Prisma.sbs_saldo_contable_detalleUncheckedUpdateInput) => tx.sbs_saldo_contable_detalle.update({ where: { idsbssaldocontabledetalle: id }, data });
export const getFuentesPorUuid = (tx: TxClient, uuids: string[]) => tx.factoring.findMany({ where: { factoringid: { in: uuids } }, include: fuenteInclude, orderBy: { idfactoring: "asc" } });
export const listarFuentes = (tx: TxClient, page: number, limit: number, search: string, limiteCorteExclusivo: Date) => {
  // Filtrar antes de paginar y contar; no excluir cartera iniciada en períodos anteriores.
  const where: Prisma.factoringWhereInput = { estado: 1, fecha_operacion: { not: null, lt: limiteCorteExclusivo }, factoring_liquidaciones: { none: { estado: 1, fecha_pago_efectivo: { lt: limiteCorteExclusivo } } }, ...(search ? { code: { contains: search } } : {}) };
  return Promise.all([tx.factoring.findMany({ where, include: fuenteInclude, orderBy: { idfactoring: "desc" }, skip: (page - 1) * limit, take: limit }), tx.factoring.count({ where })]);
};
export const getMonedas = (tx: TxClient) => tx.moneda.findMany({ where: { estado: 1, codigo: { in: ["USD", "PEN"] } }, select: { idmoneda: true, codigo: true } });
