import type { Request, Response } from "express";
import { z } from "zod";
import * as service from "#src/services/admin/configuracionbbdd.Service.js";
import { configuracionBbdd } from "#src/types/ConfiguracionBbdd.schemas.js";
const uuidBbdd = z.string().uuid();
const versionBbdd = z.number().int().min(1).max(4294967294);
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
      throw new ClientError("No se pudo completar la configuración de BBDD. Actualice e inténtelo de nuevo.", 500);
    }
  };
const user = (req: Request) => req.session_user.usuario.idusuario;
const id = (req: Request) => uuidBbdd.parse(req.params.id);
export const conexiones = guarded(() => service.listarConexiones());
export const crearConexion = guarded((req) => service.guardarConexion(null, configuracionBbdd.parse(req.body), user(req)), 201);
export const editarConexion = guarded((req) => {
  const input = z.object({ version: versionBbdd, conexion: configuracionBbdd }).strict().parse(req.body);
  return service.guardarConexion(id(req), input.conexion, user(req), input.version);
});
export const estadoConexion = guarded((req) => {
  const input = z
    .object({ version: versionBbdd, estado: z.union([z.literal(1), z.literal(2)]) })
    .strict()
    .parse(req.body);
  return service.estadoConexion(id(req), input.version, input.estado, user(req));
});
export const validarConexion = guarded((req) => service.validarConexion(id(req), req.body?.conexion));
export const probarBorrador = guarded((req) => service.validarConexion(req.body?.configuracionbbddid ? uuidBbdd.parse(req.body.configuracionbbddid) : null, req.body?.conexion));
