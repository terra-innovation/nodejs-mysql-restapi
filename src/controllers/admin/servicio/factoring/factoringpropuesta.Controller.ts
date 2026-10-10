import * as factoringpropuestaService from "#root/src/services/admin/factoringpropuesta.Service.js";
import type { CreateFactoringpropuestaDto, FactoringpropuestaIdDto, GetFactoringpropuestasByFactoringidDto, SimulateFactoringpropuestaDto, UpdateFactoringpropuestaDto } from "#root/src/services/admin/factoringpropuesta.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as fs from "fs";
import { unlink } from "fs/promises";
import { z } from "zod";
import { objectInput, stringInput, numberInput, dateInput } from "#src/utils/validationInputs.js";

export const downloadFactoringpropuestaPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringpropuestaPDF");
  const { id } = req.params;
  const factoringpropuestaUpdateSchema = objectInput(
    z.object({
      factoringpropuestaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.parse({ factoringpropuestaid: id, ...req.body }) as FactoringpropuestaIdDto;
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const { filePath, filenameDownload } = await factoringpropuestaService.generateFactoringpropuestaPDFService(factoringpropuestaValidated.factoringpropuestaid);

  try {
    setDownloadHeaders(res, filenameDownload);
    await sendFileAsync(req, res, filePath);
  } finally {
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    }
  }
};

export const updateFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringpropuesta");
  const { id } = req.params;
  const factoringpropuestaUpdateSchema = objectInput(
    z.object({
      factoringpropuestaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factoringpropuestaestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.parse({ factoringpropuestaid: id, ...req.body }) as UpdateFactoringpropuestaDto;
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  await factoringpropuestaService.updateFactoringpropuestaService(factoringpropuestaValidated, req.session_user.usuario.idusuario);

  response(res, 200, { ...factoringpropuestaValidated });
};

export const createFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringpropuesta");
  const factoringSimulateSchema = objectInput(
    z.object({
      factoringid: stringInput(
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
      riesgocedenteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      riesgoaceptanteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factoringpropuestaestadoid: stringInput(
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
      fecha_pago_estimado: dateInput(z.date()),
      monto_neto: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value)).refine((value) => value >= 1, "Debe ser mayor o igual que 1")),
    }),
  );
  const factoringValidated = factoringSimulateSchema.parse({ ...req.body }) as CreateFactoringpropuestaDto;

  const simulacion = await factoringpropuestaService.createFactoringpropuestaService(factoringValidated, req.session_user.usuario.idusuario);

  response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
};

export const simulateFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::simulateFactoringpropuesta");
  const { id } = req.params;
  const factoringSimulateSchema = objectInput(
    z.object({
      factoringid: stringInput(
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
          .refine((value) => value <= 100, "Debe ser menor o igual que 100"),
      ),
      porcentaje_comision_descuento: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value >= 0, "Debe ser mayor o igual que 0")
          .refine((value) => value <= 1, "Debe ser menor o igual que 1"),
      ),
      fecha_pago_estimado: dateInput(z.date()),
      monto_neto: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value)).refine((value) => value >= 1, "Debe ser mayor o igual que 1")),
    }),
  );
  const factoringValidated = factoringSimulateSchema.parse({ factoringid: id, ...req.body }) as SimulateFactoringpropuestaDto;
  log.debug(line(), "factoringValidated:", factoringValidated);

  const simulacion = await factoringpropuestaService.simulateFactoringpropuestaService(factoringValidated);

  response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
};

export const getFactoringpropuestasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestasByFactoringid");
  const { id } = req.params;
  const factoringpropuestaSearchSchema = objectInput(
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
  const factoringpropuestaValidated = factoringpropuestaSearchSchema.parse({ factoringid: id, ...req.body }) as GetFactoringpropuestasByFactoringidDto;
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const factoringpropuestas = await factoringpropuestaService.getFactoringpropuestasByFactoringidService(factoringpropuestaValidated);

  response(res, 201, factoringpropuestas);
};

export const activateFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringpropuesta");
  const { id } = req.params;
  const factoringpropuestaSchema = objectInput(
    z.object({
      factoringpropuestaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringpropuestaValidated = factoringpropuestaSchema.parse({ factoringpropuestaid: id }) as FactoringpropuestaIdDto;
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const factoringpropuestaActivated = await factoringpropuestaService.activateFactoringpropuestaService(factoringpropuestaValidated, req.session_user.usuario.idusuario);

  response(res, 204, factoringpropuestaActivated);
};

export const deleteFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringpropuesta");
  const { id } = req.params;
  const factoringpropuestaSchema = objectInput(
    z.object({
      factoringpropuestaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringpropuestaValidated = factoringpropuestaSchema.parse({ factoringpropuestaid: id }) as FactoringpropuestaIdDto;
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const factoringpropuestaDeleted = await factoringpropuestaService.deleteFactoringpropuestaService(factoringpropuestaValidated, req.session_user.usuario.idusuario);

  response(res, 204, factoringpropuestaDeleted);
};

export const getFactoringpropuestaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestaMaster");

  const masterData = await factoringpropuestaService.getFactoringpropuestaMasterService();

  response(res, 201, masterData);
};

export const getFactoringpropuestas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestas");

  const factoringpropuestas = await factoringpropuestaService.getFactoringpropuestasService();

  response(res, 201, factoringpropuestas);
};
