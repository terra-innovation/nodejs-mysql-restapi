import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";

import { activateFacturaService, deleteFacturaService, getFacturaMasterService, getFacturasByFactoringidService, getFacturasService, subirFacturaFactorService, type SubirFacturaFactorDto } from "#root/src/services/admin/factura.Service.js";

export const subirFacturaFactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::subirFacturaFactor");

  const session_idusuario = req.session_user?.usuario?.idusuario ?? 1;

  const facturaVerifySchema = objectInput(
    z.object({
      factura_xml: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factura_pdf: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = facturaVerifySchema.parse({ ...req.files, ...req.body }) as unknown as SubirFacturaFactorDto;

  const data = await subirFacturaFactorService(validated, session_idusuario);
  response(res, 200, data);
};

export const getFacturasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturasByFactoringid");
  const { id } = req.params;
  const facturaSearchSchema = objectInput(
    z.object({
      factoringid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = facturaSearchSchema.parse({ factoringid: id, ...req.body });

  const data = await getFacturasByFactoringidService(validated.factoringid);
  response(res, 201, data);
};

export const activateFactura = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactura");
  const { id } = req.params;
  const facturaSchema = objectInput(
    z.object({
      facturaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = facturaSchema.parse({ facturaid: id });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await activateFacturaService(validated.facturaid, idusuario);
  response(res, 204, data);
};

export const deleteFactura = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactura");
  const { id } = req.params;
  const facturaSchema = objectInput(
    z.object({
      facturaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = facturaSchema.parse({ facturaid: id });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await deleteFacturaService(validated.facturaid, idusuario);
  response(res, 204, data);
};

export const getFacturaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturaMaster");
  const data = await getFacturaMasterService();
  response(res, 201, data);
};

export const getFacturas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturas");
  const data = await getFacturasService();
  response(res, 201, data);
};
