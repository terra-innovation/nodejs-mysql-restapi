import { Request, Response } from "express";
import { unlink } from "fs/promises";
import { z } from "zod";
import { objectInput, stringInput, numberInput, dateInput } from "#src/utils/validationInputs.js";
import * as factoringsimulacionService from "#root/src/services/admin/factoringsimulacion.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { line, log } from "#src/utils/logger.pino.js";

export const downloadFactoringsimulacionPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringsimulacionPDF");
  const { id } = req.params;

  const factoringsimulacionUpdateSchema = objectInput(
    z.object({
      factoringsimulacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const factoringsimulacionValidated = factoringsimulacionUpdateSchema.parse({ factoringsimulacionid: id, ...req.body });
  log.debug(line(), "factoringsimulacionValidated:", factoringsimulacionValidated);

  const { filePath, filenameDownload } = await factoringsimulacionService.generateFactoringsimulacionPDFService(factoringsimulacionValidated.factoringsimulacionid);

  setDownloadHeaders(res, filenameDownload);
  await sendFileAsync(req, res, filePath);
  await unlink(filePath);
};

export const createFactoringsimulacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringsimulacion");
  const session_idusuario = req.session_user.usuario.idusuario;

  const factoringSimulateSchema = objectInput(
    z.object({
      bancoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      monedaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factoringtipoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      riesgooperacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factoringestrategiaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      tdm: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value >= 0, "Debe ser mayor o igual que 0")
          .refine((value) => value <= 100, "Debe ser menor o igual que 100"),
      ),
      porcentaje_financiado_estimado: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value >= 0, "Debe ser mayor o igual que 0")
          .refine((value) => value <= 1, "Debe ser menor o igual que 1"),
      ),
      porcentaje_comision_descuento: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value >= 0, "Debe ser mayor o igual que 0")
          .refine((value) => value <= 1, "Debe ser menor o igual que 1"),
      ),
      ruc_cedente: stringInput(
        z
          .string()
          .regex(/^\d{11}$/, "RUC debe ser un número de exactamente 11 dígitos")
          .refine((value) => value.length > 0, "Campo requerido"),
        { trim: true },
      ),
      ruc_aceptante: stringInput(
        z
          .string()
          .regex(/^\d{11}$/, "RUC debe ser un número de exactamente 11 dígitos")
          .refine((value) => value.length > 0, "Campo requerido"),
        { trim: true },
      ),
      razon_social_cedente: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      razon_social_aceptante: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      fecha_pago_estimado: dateInput(z.date()),
      fecha_emision: dateInput(z.date()),
      cantidad_facturas: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value >= 1, "Debe ser mayor o igual que 1")
          .refine((value) => value <= 100, "Debe ser menor o igual que 100"),
      ),
      monto_neto: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value)).refine((value) => value >= 1, "Debe ser mayor o igual que 1")),
    }),
  );

  const factoringValidated = factoringSimulateSchema.parse({ ...req.body });

  const simulacion = await factoringsimulacionService.createFactoringsimulacionService(session_idusuario, factoringValidated as factoringsimulacionService.CreateFactoringsimulacionPayload);

  response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
};

export const simulateFactoringsimulacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::simulateFactoringsimulacion");

  const factoringSimulateSchema = objectInput(
    z.object({
      factoringtipoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      riesgooperacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factoringestrategiaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      bancoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      monedaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      tdm: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value >= 0, "Debe ser mayor o igual que 0")
          .refine((value) => value <= 100, "Debe ser menor o igual que 100"),
      ),
      porcentaje_financiado_estimado: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value >= 0, "Debe ser mayor o igual que 0")
          .refine((value) => value <= 1, "Debe ser menor o igual que 1"),
      ),
      fecha_pago_estimado: dateInput(z.date()),
      fecha_emision: dateInput(z.date()),
      cantidad_facturas: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value >= 1, "Debe ser mayor o igual que 1")
          .refine((value) => value <= 100, "Debe ser menor o igual que 100"),
      ),
      monto_neto: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value)).refine((value) => value >= 1, "Debe ser mayor o igual que 1")),
      porcentaje_comision_descuento: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value >= 0, "Debe ser mayor o igual que 0")
          .refine((value) => value <= 1, "Debe ser menor o igual que 1"),
      ),
    }),
  );

  const factoringValidated = factoringSimulateSchema.parse({ ...req.body });
  log.debug(line(), "factoringValidated:", factoringValidated);

  const simulacion = await factoringsimulacionService.simulateFactoringsimulacionService(factoringValidated as factoringsimulacionService.SimulateFactoringsimulacionPayload);

  response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
};

export const activateFactoringsimulacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringsimulacion");
  const { id } = req.params;

  const factoringsimulacionSchema = objectInput(
    z.object({
      factoringsimulacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const factoringsimulacionValidated = factoringsimulacionSchema.parse({ factoringsimulacionid: id });
  log.debug(line(), "factoringsimulacionValidated:", factoringsimulacionValidated);

  const factoringsimulacionActivated = await factoringsimulacionService.activateFactoringsimulacionService(factoringsimulacionValidated.factoringsimulacionid, req.session_user.usuario.idusuario);

  response(res, 204, factoringsimulacionActivated);
};

export const deleteFactoringsimulacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringsimulacion");
  const { id } = req.params;

  const factoringsimulacionSchema = objectInput(
    z.object({
      factoringsimulacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const factoringsimulacionValidated = factoringsimulacionSchema.parse({ factoringsimulacionid: id });
  log.debug(line(), "factoringsimulacionValidated:", factoringsimulacionValidated);

  const factoringsimulacionDeleted = await factoringsimulacionService.deleteFactoringsimulacionService(factoringsimulacionValidated.factoringsimulacionid, req.session_user.usuario.idusuario);

  response(res, 204, factoringsimulacionDeleted);
};

export const getFactoringsimulacionMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsimulacionMaster");

  const factoringsimulacionsMaster = await factoringsimulacionService.getFactoringsimulacionMasterService();

  response(res, 201, factoringsimulacionsMaster);
};

export const getFactoringsimulacions = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsimulacions");

  const factoringsimulacions = await factoringsimulacionService.getFactoringsimulacionsService();

  response(res, 201, factoringsimulacions);
};
