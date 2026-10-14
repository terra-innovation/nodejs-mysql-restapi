import type { Request, Response } from "express";
import { z } from "zod";
import * as service from "#src/services/financiero/factoringdetraccion.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";

const uuid = z.uuid();
const fecha = z.iso
  .datetime({ precision: 0 })
  .or(z.iso.datetime({ precision: 3 }))
  .refine((value) => {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 19) === value.slice(0, 19);
  }, "Fecha inválida");
export const listarSchema = z.strictObject({
  estado: z.enum(["PENDIENTE", "PAGADA"]).default("PENDIENTE"),
  pagina: z.coerce.number().int().min(1).max(1000000).default(1),
  tamanio: z.coerce.number().int().min(1).max(100).default(10),
  busqueda: z.string().trim().max(200).default(""),
  ordenarPor: z.enum(["fechaEmision", "operacion", "cedente", "comprobante", "importeTotal", "detraccionMonto", "fechaPagoDetraccion"]).default("fechaEmision"),
  direccion: z.enum(["asc", "desc"]).default("asc"),
});
export const actualizarSchema = z.strictObject({ detraccionestadoid: uuid, fecha_pago_detraccion: fecha.nullable(), detraccionarchivoid: uuid.optional(), version: z.iso.datetime({ precision: 3 }) });
export const listarDetracciones = async (req: Request, res: Response) => response(res, 200, await service.listarDetraccionesService(listarSchema.parse(req.query)));
export const getDetraccion = async (req: Request, res: Response) => response(res, 200, await service.getDetraccionService(uuid.parse(req.params.id)));
export const getMaster = async (_req: Request, res: Response) => response(res, 200, await service.getDetraccionMasterService());
export const actualizarDetraccion = async (req: Request, res: Response) => {
  const idusuario = req.session_user?.usuario?.idusuario;
  if (!idusuario || !Number.isInteger(idusuario)) throw new ClientError("Sesión no válida", 401);
  const body = actualizarSchema.parse(req.body);
  response(res, 200, await service.actualizarDetraccionService({ ...body, fecha_pago_detraccion: body.fecha_pago_detraccion ?? null, id: uuid.parse(req.params.id), idusuario }));
};
