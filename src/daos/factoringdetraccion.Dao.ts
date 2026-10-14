import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import type { TxClient } from "#src/types/Prisma.types.js";
import { DETRACCION_CODES, type ListarDetraccionesDto } from "#src/types/FactoringDetraccion.types.js";
import { ARCHIVO_TIPO } from "#src/daos/archivotipo.Dao.js";

const facturaSelect = {
  facturaid: true,
  serie: true,
  numero_comprobante: true,
  codigo_tipo_moneda: true,
  fecha_emision: true,
  fecha_pago_mayor_estimado: true,
  proveedor_ruc: true,
  proveedor_razon_social: true,
  cliente_ruc: true,
  cliente_razon_social: true,
  importe_bruto: true,
  importe_neto: true,
  detraccion_monto: true,
  retencion_monto: true,
} satisfies Prisma.facturaSelect;
const archivoSelect = {
  archivoid: true,
  codigo: true,
  nombrereal: true,
  tamanio: true,
  mimetype: true,
  extension: true,
  idarchivotipo: true,
  estado: true,
  fechacrea: true,
  archivo_tipo: { select: { nombre: true, code: true } },
} satisfies Prisma.archivoSelect;
const baseSelect = {
  factoringfacturafactorid: true,
  idfactura: true,
  fechamod: true,
  fecha_pago_factura: true,
  fecha_pago_detraccion: true,
  factura_estado: { select: { nombre: true } },
  detraccion_estado: { select: { nombre: true, code: true, detraccionestadoid: true } },
  factoring: { select: { factoringid: true, code: true, empresa_cedente: { select: { ruc: true, razon_social: true } } } },
  factura: { select: facturaSelect },
} satisfies Prisma.factoring_factura_factorSelect;
const disponible: Prisma.factoring_factura_factorWhereInput = {
  estado: 1,
  factura: { estado: 1 },
  factoring: { estado: 1 },
  detraccion_estado: { estado: 1, code: { in: Object.values(DETRACCION_CODES) } },
};

export const getDetraccionEstados = (tx: TxClient) =>
  tx.detraccion_estado.findMany({
    where: { estado: 1, code: { in: Object.values(DETRACCION_CODES) } },
    select: { detraccionestadoid: true, code: true, nombre: true },
    orderBy: { code: "asc" },
  });

export async function listarDetracciones(tx: TxClient, dto: ListarDetraccionesDto) {
  const separador = dto.busqueda.lastIndexOf("-");
  const where: Prisma.factoring_factura_factorWhereInput = {
    ...disponible,
    detraccion_estado: { estado: 1, code: DETRACCION_CODES[dto.estado] },
    ...(dto.busqueda ? { OR: [{ factoring: { code: { contains: dto.busqueda } } }, { factoring: { empresa_cedente: { ruc: { contains: dto.busqueda } } } }, { factoring: { empresa_cedente: { razon_social: { contains: dto.busqueda } } } }, { factura: { serie: { contains: dto.busqueda } } }, { factura: { numero_comprobante: { contains: dto.busqueda } } }, ...(separador > 0 ? [{ AND: [{ factura: { serie: { contains: dto.busqueda.slice(0, separador).trim() } } }, { factura: { numero_comprobante: { contains: dto.busqueda.slice(separador + 1).trim() } } }] }] : [])] } : {}),
  };
  const sort = dto.direccion;
  const orders: Record<ListarDetraccionesDto["ordenarPor"], Prisma.factoring_factura_factorOrderByWithRelationInput> = {
    fechaEmision: { factura: { fecha_emision: { sort, nulls: "last" } } },
    operacion: { factoring: { code: sort } },
    cedente: { factoring: { empresa_cedente: { razon_social: sort } } },
    comprobante: { factura: { serie: sort } },
    importeTotal: { factura: { importe_bruto: sort } },
    detraccionMonto: { factura: { detraccion_monto: { sort, nulls: "last" } } },
    fechaPagoDetraccion: { fecha_pago_detraccion: { sort, nulls: "last" } },
  };
  const orderBy = [orders[dto.ordenarPor], ...(dto.ordenarPor === "comprobante" ? [{ factura: { numero_comprobante: sort } }] : []), { factoringfacturafactorid: "asc" as const }];
  const total = await tx.factoring_factura_factor.count({ where });
  const registros = await tx.factoring_factura_factor.findMany({ where, select: baseSelect, orderBy, skip: (dto.pagina - 1) * dto.tamanio, take: dto.tamanio });
  return { registros, total };
}

export const getDetraccion = (tx: TxClient, id: string) =>
  tx.factoring_factura_factor.findFirst({
    where: { ...disponible, factoringfacturafactorid: id },
    select: {
      ...baseSelect,
      factura: {
        select: {
          ...facturaSelect,
          archivo_facturas: {
            where: { estado: 1, archivo: { estado: 1 } },
            orderBy: [{ fechacrea: "desc" }, { idarchivo: "desc" }],
            select: { archivo: { select: archivoSelect } },
          },
        },
      },
    },
  });

export async function getConstanciaParaVincular(tx: TxClient, archivoid: string) {
  // Serializar asociaciones del mismo archivo; la lectura posterior usa READ COMMITTED.
  await tx.$queryRaw`SELECT _idarchivo FROM archivo WHERE archivoid = ${archivoid} FOR UPDATE`;
  return tx.archivo.findFirst({ where: { archivoid, estado: 1, idarchivotipo: ARCHIVO_TIPO.CONSTANCIA_PAGO_DETRACCION }, select: { idarchivo: true, idusuariocrea: true, tamanio: true, mimetype: true, extension: true, archivo_facturas: { select: { idfactura: true, estado: true } } } });
}

export const vincularConstancia = (tx: TxClient, idarchivo: number, idfactura: number, idusuario: number) =>
  tx.archivo_factura.upsert({
    where: { idarchivo_idfactura: { idarchivo, idfactura } },
    create: { idarchivo, idfactura, idusuariocrea: idusuario, idusuariomod: idusuario },
    update: { estado: 1, idusuariomod: idusuario, fechamod: new Date() },
  });

export const actualizarDetraccion = (tx: TxClient, id: string, version: Date, data: { iddetraccionestado: number; fecha_pago_detraccion: Date | null; idusuariomod: number; fechamod: Date }) =>
  tx.factoring_factura_factor.updateMany({
    where: { ...disponible, factoringfacturafactorid: id, fechamod: version },
    data,
  });

export const getEstadoDetraccionPk = (tx: TxClient, detraccionestadoid: string) =>
  tx.detraccion_estado.findFirst({
    where: { detraccionestadoid, estado: 1, code: { in: Object.values(DETRACCION_CODES) } },
    select: { iddetraccionestado: true, code: true },
  });
