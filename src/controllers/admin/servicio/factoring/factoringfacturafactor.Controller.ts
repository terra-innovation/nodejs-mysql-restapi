import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { activateFactoringfacturafactorService, createFactoringfacturafactorService, deleteFactoringfacturafactorService, getFactoringfacturafactorMasterByFactoringidService, getFactoringfacturafactoresByFactoringidService, updateFactoringfacturafactorService } from "#src/services/admin/factoringfacturafactor.Service.js";

export const activateFactoringfacturafactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringfacturafactor");
  const { id } = req.params;
  const factoringfacturafactorSchema = objectInput(
    z.object({
      factoringfacturafactorid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validated = factoringfacturafactorSchema.parse({ factoringfacturafactorid: id });
  log.debug(line(), "validated:", validated);

  const data = await activateFactoringfacturafactorService({
    factoringfacturafactorid: validated.factoringfacturafactorid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, data);
};

export const deleteFactoringfacturafactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringfacturafactor");
  const { id } = req.params;
  const factoringfacturafactorSchema = objectInput(
    z.object({
      factoringfacturafactorid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validated = factoringfacturafactorSchema.parse({ factoringfacturafactorid: id });
  log.debug(line(), "validated:", validated);

  const data = await deleteFactoringfacturafactorService({
    factoringfacturafactorid: validated.factoringfacturafactorid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, data);
};

export const updateFactoringfacturafactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringfacturafactor");
  const { id } = req.params;
  const factoringfacturafactorUpdateSchema = objectInput(
    z.object({
      factoringfacturafactorid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      facturaestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      detraccionestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      detraccionarchivoid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .optional(),
        { trim: true },
      ),
      fecha_pago_factura: stringInput(
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
          .refine((value) => {
            if (!value) return true;
            const date = new Date(value);
            return !isNaN(date.getTime());
          }, "Fecha inválida")
          .nullable()
          .optional(),
      ),
      fecha_pago_detraccion: stringInput(
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
          .refine((value) => {
            if (!value) return true;
            const date = new Date(value);
            return !isNaN(date.getTime());
          }, "Fecha inválida")
          .nullable()
          .optional(),
      ),
    }),
  );

  const validated = factoringfacturafactorUpdateSchema.parse({ factoringfacturafactorid: id, ...req.body });
  log.debug(line(), "validated:", validated);

  const updated = await updateFactoringfacturafactorService({
    factoringfacturafactorid: validated.factoringfacturafactorid,
    facturaestadoid: validated.facturaestadoid,
    detraccionestadoid: validated.detraccionestadoid,
    detraccionarchivoid: validated.detraccionarchivoid,
    fecha_pago_factura: validated.fecha_pago_factura,
    fecha_pago_detraccion: validated.fecha_pago_detraccion,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, updated);
};

export const createFactoringfacturafactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringfacturafactor");
  const factoringfacturafactorSchema = objectInput(
    z.object({
      factoringid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      facturaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      facturaestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      detraccionestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      detraccionarchivoid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .optional(),
        { trim: true },
      ),
      fecha_pago_factura: stringInput(
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
          .refine((value) => {
            if (!value) return true;
            const date = new Date(value);
            return !isNaN(date.getTime());
          }, "Fecha inválida")
          .nullable()
          .optional(),
      ),
      fecha_pago_detraccion: stringInput(
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
          .refine((value) => {
            if (!value) return true;
            const date = new Date(value);
            return !isNaN(date.getTime());
          }, "Fecha inválida")
          .nullable()
          .optional(),
      ),
    }),
  );

  const validated = factoringfacturafactorSchema.parse({ ...req.body });

  const created = await createFactoringfacturafactorService({
    factoringid: validated.factoringid,
    facturaid: validated.facturaid,
    facturaestadoid: validated.facturaestadoid,
    detraccionestadoid: validated.detraccionestadoid,
    detraccionarchivoid: validated.detraccionarchivoid,
    fecha_pago_factura: validated.fecha_pago_factura,
    fecha_pago_detraccion: validated.fecha_pago_detraccion,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, created);
};

export const getFactoringfacturafactoresByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringfacturafactoresByFactoringid");
  const { id } = req.params;
  const factoringfacturafactorSearchSchema = objectInput(
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

  const validated = factoringfacturafactorSearchSchema.parse({ factoringid: id, ...req.body });
  log.debug(line(), "validated:", validated);

  const list = await getFactoringfacturafactoresByFactoringidService({
    factoringid: validated.factoringid,
  });

  response(res, 201, list);
};

export const getFactoringfacturafactorMasterByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringfacturafactorMasterByFactoringid");
  const { factoringid } = req.params;
  const factoringfacturafactorSchema = objectInput(
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

  const validated = factoringfacturafactorSchema.parse({ factoringid });
  log.debug(line(), "validated:", validated);

  const master = await getFactoringfacturafactorMasterByFactoringidService({
    factoringid: validated.factoringid,
  });

  response(res, 201, master);
};
