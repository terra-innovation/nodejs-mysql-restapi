import * as dao from "#src/daos/factoringdetraccion.Dao.js";
import { ARCHIVO_TIPO } from "#src/daos/archivotipo.Dao.js";
import { prismaFT } from "#src/models/prisma/db-factoring.js";
import { validarPagoDetraccion } from "#src/domain/factoring/detraccion.Rules.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import type { ActualizarDetraccionDto, ListarDetraccionesDto } from "#src/types/FactoringDetraccion.types.js";
import type { TxClient } from "#src/types/Prisma.types.js";

function publico<T extends Awaited<ReturnType<typeof dao.listarDetracciones>>["registros"][number]>(registro: T) {
  return {
    factoringfacturafactorid: registro.factoringfacturafactorid,
    factoring: registro.factoring,
    factura: registro.factura as T["factura"],
    factura_estado: registro.factura_estado,
    detraccion_estado: registro.detraccion_estado,
    fecha_pago_factura: registro.fecha_pago_factura,
    fecha_pago_detraccion: registro.fecha_pago_detraccion,
    version: registro.fechamod.toISOString(),
  };
}
async function catalogo(tx: TxClient) {
  const estados = await dao.getDetraccionEstados(tx);
  if (estados.length !== 2) throw new ClientError("Catálogo de detracciones incompleto", 500);
  return estados;
}
export const getDetraccionMasterService = () => prismaFT.client.$transaction(catalogo);

export const listarDetraccionesService = (dto: ListarDetraccionesDto) =>
  prismaFT.client.$transaction(
    async (tx) => {
      await catalogo(tx);
      const { registros, total } = await dao.listarDetracciones(tx, dto);
      return { registros: registros.map(publico), total, pagina: dto.pagina, tamanio: dto.tamanio };
    },
    { timeout: prismaFT.transactionTimeout, isolationLevel: "RepeatableRead" },
  );

export const getDetraccionService = (id: string) =>
  prismaFT.client.$transaction(
    async (tx) => {
      const registro = await dao.getDetraccion(tx, id);
      if (!registro) throw new ClientError("Comprobante no disponible", 404);
      return publico(registro);
    },
    { timeout: prismaFT.transactionTimeout },
  );

export const actualizarDetraccionService = (dto: ActualizarDetraccionDto) =>
  prismaFT.client.$transaction(
    async (tx) => {
      await catalogo(tx);
      const registro = await dao.getDetraccion(tx, dto.id);
      if (!registro) throw new ClientError("Comprobante no disponible", 404);
      const version = new Date(dto.version);
      if (registro.fechamod.getTime() !== version.getTime()) throw new ClientError("El comprobante cambió. Recargue antes de guardar", 409);
      const estado = await dao.getEstadoDetraccionPk(tx, dto.detraccionestadoid);
      if (!estado) throw new ClientError("Estado de detracción no permitido", 400);
      let archivo: Awaited<ReturnType<typeof dao.getConstanciaParaVincular>> = null;
      if (dto.detraccionarchivoid) {
        archivo = await dao.getConstanciaParaVincular(tx, dto.detraccionarchivoid);
        if (!archivo) throw new ClientError("Constancia no disponible", 404);
        const vinculada = archivo.archivo_facturas.some((v) => v.idfactura === registro.idfactura && v.estado === 1);
        if (archivo.archivo_facturas.some((v) => v.idfactura !== registro.idfactura) || (!vinculada && archivo.idusuariocrea !== dto.idusuario)) throw new ClientError("Constancia no autorizada para este comprobante", 400);
        if (archivo.tamanio > 5 * 1024 * 1024 || !["application/pdf", "image/png", "image/jpeg"].includes(archivo.mimetype) || !["pdf", "png", "jpg", "jpeg"].includes(archivo.extension.toLowerCase().replace(/^\./, ""))) throw new ClientError("Constancia debe ser PDF, PNG o JPG de hasta 5 MB", 400);
      }
      const fecha = dto.fecha_pago_detraccion ? new Date(dto.fecha_pago_detraccion) : null;
      const existente = registro.factura.archivo_facturas.some((v) => v.archivo.idarchivotipo === ARCHIVO_TIPO.CONSTANCIA_PAGO_DETRACCION);
      validarPagoDetraccion({ code: registro.detraccion_estado.code, fecha: registro.fecha_pago_detraccion }, { code: estado.code, fecha, constancia: existente || !!archivo });
      const result = await dao.actualizarDetraccion(tx, dto.id, version, {
        iddetraccionestado: estado.iddetraccionestado,
        fecha_pago_detraccion: fecha,
        idusuariomod: dto.idusuario,
        fechamod: new Date(Math.max(Date.now(), version.getTime() + 1)),
      });
      if (result.count !== 1) throw new ClientError("El comprobante cambió. Recargue antes de guardar", 409);
      if (archivo) await dao.vincularConstancia(tx, archivo.idarchivo, registro.idfactura, dto.idusuario);
      const actualizado = await dao.getDetraccion(tx, dto.id);
      if (!actualizado) throw new ClientError("Comprobante no disponible", 409);
      return publico(actualizado);
    },
    { timeout: prismaFT.transactionTimeout, isolationLevel: "ReadCommitted" },
  );
