import type { Request, Response } from "express";
import { z } from "zod";
import * as service from "#src/services/admin/saldocontable.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { CATEGORIAS_INSTRUMENTO } from "#src/types/SaldoContable.types.js";

const uuid = z.string().uuid();
const version = z.number().int().min(1).max(4294967294);
const pagination = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), limit: z.coerce.number().int().min(1).max(100).default(25), search: z.string().trim().max(100).default("") });
const fechas = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const periodo = z.object({ nombre_periodo: z.string().trim().min(1).max(150), fecha_inicio: fechas, fecha_fin: fechas, fecha_corte: fechas, tipo_operacion: z.literal("DESCUENTO") }).strict();
const operaciones = z
  .array(uuid)
  .min(1)
  .max(100)
  .refine((v) => new Set(v).size === v.length, "No repita operaciones en la selección.");
const simple = (accion: "recalcular" | "cerrar" | "eliminar" | "activar") => z.object({ accion: z.literal(accion), version }).strict();
const mutacion = z.discriminatedUnion("accion", [
  z.object({ accion: z.literal("editar"), version, periodo }).strict(),
  z.object({ accion: z.literal("asociar"), version, operaciones }).strict(),
  z.object({ accion: z.literal("retirar"), version, operaciones, motivo: z.string().trim().min(1).max(500) }).strict(),
  z
    .object({
      accion: z.literal("clasificar"),
      version,
      operacion: uuid,
      instrumentos: z
        .array(z.object({ instrumento: z.string().trim().min(1).max(255), categoria: z.enum(CATEGORIAS_INSTRUMENTO), sustento: z.string().trim().min(1).max(1000) }).strict())
        .min(1)
        .max(100),
    })
    .strict(),
  simple("recalcular"),
  simple("cerrar"),
  simple("eliminar"),
  simple("activar"),
]);
export const listar = async (req: Request, res: Response) => {
  const q = pagination.parse(req.query);
  response(res, 200, await service.listarPeriodosService(q.page, q.limit));
};
export const catalogos = async (_req: Request, res: Response) => response(res, 200, await service.getCatalogosService());
export const detalle = async (req: Request, res: Response) => response(res, 200, await service.detallePeriodoService(uuid.parse(req.params.id)));
export const sugerencias = async (req: Request, res: Response) => {
  const q = pagination.parse(req.query);
  response(res, 200, await service.sugerenciasService(uuid.parse(req.params.id), q.page, q.limit, q.search));
};
export const crear = async (req: Request, res: Response) => response(res, 201, await service.crearPeriodoService(periodo.parse(req.body), req.session_user.usuario.idusuario));
export const mutar = async (req: Request, res: Response) => response(res, 200, await service.mutarPeriodoService(uuid.parse(req.params.id), mutacion.parse(req.body), req.session_user.usuario.idusuario));
