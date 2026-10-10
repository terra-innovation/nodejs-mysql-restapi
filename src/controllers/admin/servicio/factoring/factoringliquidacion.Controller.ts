import * as factoringliquidacionService from "#root/src/services/admin/factoringliquidacion.Service.js";
import type { CreateFactoringliquidacionDto, FactoringliquidacionIdDto, GetFactoringliquidacionByFactoringidDto, GetFactoringliquidacionMasterByFactoringidDto, SimulateFactoringliquidacionDto, UpdateFactoringliquidacionDto } from "#root/src/services/admin/factoringliquidacion.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { getLiquidacionInputError } from "#src/domain/factoring/liquidacionLimits.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as fs from "fs";
import { unlink } from "fs/promises";
import { z } from "zod";
import { objectInput, stringInput, booleanInput, dateInput } from "#src/utils/validationInputs.js";

// Se preserva el texto decimal enviado por el formulario; Number perdería precisión.
const liquidacionNumberSchema = (label: string, defaultValue: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z
      .custom<number | string>()
      .superRefine((value, ctx) => {
        const error = getLiquidacionInputError(value, label);
        if (error) ctx.addIssue({ code: "custom", message: error });
      })
      .prefault(defaultValue),
  );

export const sendCorreoFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendCorreoFactoringliquidacion");
  const { id } = req.params;
  const factoringliquidacionUpdateSchema = objectInput(
    z.object({
      factoringliquidacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringliquidacionValidated = factoringliquidacionUpdateSchema.parse({ factoringliquidacionid: id, ...req.body }) as FactoringliquidacionIdDto;
  log.debug(line(), "factoringliquidacionValidated:", factoringliquidacionValidated);

  await factoringliquidacionService.sendCorreoFactoringliquidacionService(factoringliquidacionValidated.factoringliquidacionid);

  response(res, 200, {});
};

export const simulateFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::simulateFactoringliquidacion");
  const { factoringid } = req.params;
  const schema = objectInput(
    z.object({
      factoringid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      fecha_liquidacion: dateInput(z.date()),
      fecha_pago_efectivo: dateInput(z.date()),
      exonerar_gasto_interbancario: booleanInput(z.boolean().optional()),
      factoring_liquidacion_financieros: z
        .array(
          objectInput(
            z.object({
              financierotipoid: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
                  .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
                { trim: true },
              ),
              financieroconceptoid: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
                  .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
                { trim: true },
              ),
              cantidad: liquidacionNumberSchema("La cantidad", 1),
              monto_unitario: liquidacionNumberSchema("El monto unitario", 0),
              descripcion: stringInput(z.string().optional()),
            }),
          ),
        )
        .optional(),
    }),
  );

  const validated = schema.parse({ factoringid, ...req.body }) as SimulateFactoringliquidacionDto;

  const result = await factoringliquidacionService.simulateFactoringliquidacionService(validated);

  response(res, 201, result);
};

export const createFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringliquidacion");
  const schema = objectInput(
    z.object({
      factoringid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factoringliquidacionestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      fecha_liquidacion: dateInput(z.date()),
      fecha_pago_efectivo: dateInput(z.date()),
      exonerar_gasto_interbancario: booleanInput(z.boolean().optional()),
      factoring_liquidacion_financieros: z
        .array(
          objectInput(
            z.object({
              financierotipoid: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
                  .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
                { trim: true },
              ),
              financieroconceptoid: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
                  .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
                { trim: true },
              ),
              cantidad: liquidacionNumberSchema("La cantidad", 1),
              monto_unitario: liquidacionNumberSchema("El monto unitario", 0),
              descripcion: stringInput(z.string().optional()),
            }),
          ),
        )
        .optional(),
    }),
  );

  const validated = schema.parse({ ...req.body }) as CreateFactoringliquidacionDto;

  const result = await factoringliquidacionService.createFactoringliquidacionService(validated, req.session_user.usuario.idusuario);

  response(res, 201, result);
};

export const updateFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringliquidacion");
  const { factoringliquidacionid } = req.params;
  const schema = objectInput(
    z.object({
      factoringliquidacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factoringliquidacionestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      fecha_liquidacion: dateInput(z.date()),
    }),
  );

  const validated = schema.parse({ factoringliquidacionid, ...req.body }) as UpdateFactoringliquidacionDto;

  const result = await factoringliquidacionService.updateFactoringliquidacionService(validated, req.session_user.usuario.idusuario);

  response(res, 200, result);
};

export const deleteFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringliquidacion");
  const { factoringliquidacionid } = req.params;
  const schema = objectInput(
    z.object({
      factoringliquidacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validated = schema.parse({ factoringliquidacionid }) as FactoringliquidacionIdDto;

  const result = await factoringliquidacionService.deleteFactoringliquidacionService(validated, req.session_user.usuario.idusuario);

  response(res, 204, result);
};

export const activateFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringliquidacion");
  const { factoringliquidacionid } = req.params;
  const schema = objectInput(
    z.object({
      factoringliquidacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validated = schema.parse({ factoringliquidacionid }) as FactoringliquidacionIdDto;

  const result = await factoringliquidacionService.activateFactoringliquidacionService(validated, req.session_user.usuario.idusuario);

  response(res, 204, result);
};

export const getFactoringliquidacionMasterByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionMasterByFactoringid");

  const { factoringid } = req.params;
  const usuarioservicioSchema = objectInput(
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
  const factoringliquidacionValidated = usuarioservicioSchema.parse({ factoringid }) as GetFactoringliquidacionMasterByFactoringidDto;

  const result = await factoringliquidacionService.getFactoringliquidacionMasterByFactoringidService(factoringliquidacionValidated);

  response(res, 200, result);
};

export const getFactoringliquidacionDetalle = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionDetalle");
  const { factoringliquidacionid } = req.params;
  const schema = objectInput(
    z.object({
      factoringliquidacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validated = schema.parse({ factoringliquidacionid }) as FactoringliquidacionIdDto;

  const result = await factoringliquidacionService.getFactoringliquidacionDetalleService(validated);

  response(res, 200, result);
};

export const getFactoringliquidacionByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionByFactoringid");
  const { factoringid } = req.params;
  const factoringliquidacionSearchSchema = objectInput(
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
  const factoringliquidacionValidated = factoringliquidacionSearchSchema.parse({ factoringid, ...req.body }) as GetFactoringliquidacionByFactoringidDto;
  log.debug(line(), "factoringliquidacionValidated:", factoringliquidacionValidated);

  const factoringliquidaciones = await factoringliquidacionService.getFactoringliquidacionByFactoringidService(factoringliquidacionValidated);

  response(res, 200, factoringliquidaciones);
};

export const downloadFactoringliquidacionPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringliquidacionPDF");
  const { factoringliquidacionid } = req.params;
  const schema = objectInput(
    z.object({
      factoringliquidacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = schema.parse({ factoringliquidacionid }) as FactoringliquidacionIdDto;
  log.debug(line(), "validated:", validated);

  const { filePath, filenameDownload } = await factoringliquidacionService.generateFactoringliquidacionPDFService(validated.factoringliquidacionid);

  try {
    setDownloadHeaders(res, filenameDownload);
    await sendFileAsync(req, res, filePath);
  } finally {
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    }
  }
};
