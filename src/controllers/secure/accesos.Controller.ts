import type { Request, Response } from "express";
import { actualizarAccesosService } from "#src/services/secure/accesos.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";

export const actualizarAccesos = async (req: Request, res: Response) => {
  const accesos = await actualizarAccesosService(req.session_user);
  res.setHeader("Cache-Control", "no-store");
  response(res, 200, accesos);
};
