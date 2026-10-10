import * as cedentelimiteService from "#root/src/services/admin/cedentelimite.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput, numberInput } from "#src/utils/validationInputs.js";

export const getCedentelimites = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getCedentelimites");
  const cedentelimites = await cedentelimiteService.getCedentelimitesService();
  response(res, 201, cedentelimites);
};

export const createCedentelimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createCedentelimite");
  const cedentelimiteCreateSchema = objectInput(
    z.object({
      empresaid: stringInput(
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
      total: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value)).refine((value) => value > 0, "Debe ser un número positivo")),
      usado: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value >= 0, "Debe ser mayor o igual que 0")
          .optional()
          .prefault(0),
      ),
      disponible: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value >= 0, "Debe ser mayor o igual que 0")
          .optional(),
      ),
    }),
  );

  const cedentelimiteValidated = cedentelimiteCreateSchema.parse(req.body);
  log.debug(line(), "cedentelimiteValidated:", cedentelimiteValidated);

  const cedentelimiteCreated = await cedentelimiteService.createCedentelimiteService({
    empresaid: cedentelimiteValidated.empresaid,
    monedaid: cedentelimiteValidated.monedaid,
    total: cedentelimiteValidated.total,
    usado: cedentelimiteValidated.usado,
    disponible: cedentelimiteValidated.disponible,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, cedentelimiteCreated);
};

export const updateCedentelimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateCedentelimite");
  const { id } = req.params;
  const cedentelimiteUpdateSchema = objectInput(
    z.object({
      cedentelimiteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      total: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value)).refine((value) => value > 0, "Debe ser un número positivo")),
      usado: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value >= 0, "Debe ser mayor o igual que 0")
          .optional()
          .prefault(0),
      ),
      disponible: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value >= 0, "Debe ser mayor o igual que 0")
          .optional(),
      ),
    }),
  );

  const cedentelimiteValidated = cedentelimiteUpdateSchema.parse({ cedentelimiteid: id, ...req.body });
  log.debug(line(), "cedentelimiteValidated:", cedentelimiteValidated);

  await cedentelimiteService.updateCedentelimiteService({
    cedentelimiteid: cedentelimiteValidated.cedentelimiteid,
    total: cedentelimiteValidated.total,
    usado: cedentelimiteValidated.usado,
    disponible: cedentelimiteValidated.disponible,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const deleteCedentelimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteCedentelimite");
  const { id } = req.params;
  const cedentelimiteSchema = objectInput(
    z.object({
      cedentelimiteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const cedentelimiteValidated = cedentelimiteSchema.parse({ cedentelimiteid: id });

  const result = await cedentelimiteService.deleteCedentelimiteService({
    cedentelimiteid: cedentelimiteValidated.cedentelimiteid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const activateCedentelimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateCedentelimite");
  const { id } = req.params;
  const cedentelimiteSchema = objectInput(
    z.object({
      cedentelimiteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const cedentelimiteValidated = cedentelimiteSchema.parse({ cedentelimiteid: id });

  const result = await cedentelimiteService.activateCedentelimiteService({
    cedentelimiteid: cedentelimiteValidated.cedentelimiteid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const getCedentelimiteMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getCedentelimiteMaster");
  const cedentelimiteMasterFiltered = await cedentelimiteService.getCedentelimiteMasterService();
  response(res, 201, cedentelimiteMasterFiltered);
};
