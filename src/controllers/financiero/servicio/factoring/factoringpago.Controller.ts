import type { Request, Response } from "express";
import { z } from "zod";
import { consultarPago } from "#src/services/admin/factoringpago.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";

// Consulta compartida con administración; este rol no expone acciones de escritura.
export const consulta = async (req: Request, res: Response) => {
  const factoringid = z.uuid().parse(req.params.factoringid);
  response(res, 200, await consultarPago(factoringid));
};
