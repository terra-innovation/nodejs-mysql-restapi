import type { Request, Response } from "express";
import { z } from "zod";
import * as service from "#src/services/admin/factoringpago.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { fechaCivil } from "#src/domain/banca/transaccionBancaria.Policy.js";
const id = (req: Request) => z.uuid().parse(req.params.factoringid);
const actor = (req: Request) => {
  const user = req.session_user?.usuario?.idusuario;
  if (!user) throw new ClientError("Sesión inválida.", 401);
  return user;
};
const version = z.number().int().positive();
export const consulta = async (req: Request, res: Response) => response(res, 200, await service.consultarPago(id(req)));
export const buscar = async (req: Request, res: Response) => {
  const q = z.object({ desde: z.string().transform(fechaCivil), hasta: z.string().transform(fechaCivil), q: z.string().max(100).default(""), pagina: z.coerce.number().int().min(1).max(100000).default(1), limite: z.coerce.number().int().min(1).max(100).default(20) }).parse(req.query);
  if (q.desde > q.hasta) throw new ClientError("El rango de fechas no es válido.", 422);
  response(res, 200, await service.buscarTransaccionesPago(id(req), q.desde, q.hasta, q.q, q.pagina, q.limite));
};
export const estado = async (req: Request, res: Response) => {
  const b = z
    .object({ estado: z.uuid(), version, motivo: z.string().trim().min(1).max(500) })
    .strict()
    .parse(req.body);
  response(res, 200, await service.cambiarEstadoPago(id(req), b.estado, b.version, b.motivo, actor(req)));
};
export const detalle = async (req: Request, res: Response) => {
  const b = z.discriminatedUnion("accion", [z.object({ accion: z.literal("crear"), transaccion: z.uuid(), monto: z.string().max(22), version, motivo: z.string().trim().max(500).default("") }).strict(), z.object({ accion: z.literal("editar"), detalle: z.uuid(), monto: z.string().max(22), version, detalleVersion: version, motivo: z.string().trim().min(1).max(500) }).strict(), z.object({ accion: z.enum(["anular", "activar"]), detalle: z.uuid(), version, detalleVersion: version, motivo: z.string().trim().min(1).max(500) }).strict()]).parse(req.body);
  response(res, 200, await service.guardarDetallePago(id(req), b, actor(req)));
};
