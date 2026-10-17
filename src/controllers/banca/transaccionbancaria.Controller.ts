import type { Request, Response } from "express";
import { z } from "zod";
import * as service from "#src/services/banca/transaccionbancaria.Service.js";
import { movimientoBanco, mapeoBanco, sincronizacionBanco, cambioBanco, paginaBanco, paginaMovimientosBanco, consultaOrigenBanco, uuidBanco, versionBanco } from "#src/types/TransaccionBancaria.schemas.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";

const guarded =
  (handler: (req: Request) => Promise<unknown>, status = 200) =>
  async (req: Request, res: Response) => {
    try {
      response(res, status, await handler(req));
    } catch (error) {
      if (error instanceof ClientError || error instanceof z.ZodError) throw error;
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") throw new ClientError("Ya existe un registro con esa identidad.", 409);
      // No propagar errores del driver que puedan incluir datos bancarios o secretos.
      throw new ClientError("No se pudo completar la operación bancaria. Actualice e inténtelo de nuevo.", 500);
    }
  };
const user = (req: Request) => req.session_user.usuario.idusuario;
const id = (req: Request) => uuidBanco.parse(req.params.id);
export const master = guarded(() => service.masterBanco());
export const origen = guarded((req) => service.consultarOrigen(consultaOrigenBanco.parse(req.query)));
export const mapeos = guarded(() => service.listarMapeos());
export const crearMapeo = guarded((req) => service.crearMapeo(mapeoBanco.parse(req.body), user(req)), 201);
export const estadoMapeo = guarded((req) => {
  const input = z.object({ version: versionBanco, habilitado: z.boolean() }).strict().parse(req.body);
  return service.estadoMapeo(id(req), input.version, input.habilitado, user(req));
});
export const movimientos = guarded((req) => service.listarMovimientos(paginaMovimientosBanco.parse(req.query)));
export const detalleMovimiento = guarded((req) => service.detalleMovimiento(id(req)));
export const crearMovimiento = guarded((req) => service.crearMovimiento(movimientoBanco.parse(req.body), user(req)), 201);
export const mutarMovimiento = guarded((req) => service.mutarMovimiento(id(req), cambioBanco.parse(req.body), user(req)));
export const sincronizar = guarded((req) => service.sincronizar(sincronizacionBanco.parse(req.body), user(req)));
export const logs = (kind: "ejecuciones" | "incidencias" | "historial") =>
  guarded((req) => {
    const q = paginaBanco.parse(req.query);
    return service.listarLogs(kind, q.page, q.limit, q.search, q.sortBy, q.desc);
  });
export const resolverIncidencia = guarded((req) => {
  const input = z
    .object({ version: versionBanco, situacion: z.enum(["RESUELTA", "DESCARTADA"]), motivo: z.string().trim().min(1).max(500) })
    .strict()
    .parse(req.body);
  return service.resolverIncidencia(id(req), input.version, input.situacion, input.motivo, user(req));
});
