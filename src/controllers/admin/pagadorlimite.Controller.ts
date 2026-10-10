import * as pagadorlimiteService from "#root/src/services/admin/pagadorlimite.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput, numberInput } from "#src/utils/validationInputs.js";

export const getPagadorlimites = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPagadorlimites");
  const pagadorlimites = await pagadorlimiteService.getPagadorlimitesService();
  response(res, 201, pagadorlimites);
};

export const createPagadorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createPagadorlimite");
  const pagadorlimiteCreateSchema = objectInput(
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

  const pagadorlimiteValidated = pagadorlimiteCreateSchema.parse(req.body);
  log.debug(line(), "pagadorlimiteValidated:", pagadorlimiteValidated);

  const pagadorlimiteCreated = await pagadorlimiteService.createPagadorlimiteService({
    empresaid: pagadorlimiteValidated.empresaid,
    monedaid: pagadorlimiteValidated.monedaid,
    total: pagadorlimiteValidated.total,
    usado: pagadorlimiteValidated.usado,
    disponible: pagadorlimiteValidated.disponible,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, pagadorlimiteCreated);
};

export const updatePagadorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updatePagadorlimite");
  const { id } = req.params;
  const pagadorlimiteUpdateSchema = objectInput(
    z.object({
      pagadorlimiteid: stringInput(
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

  const pagadorlimiteValidated = pagadorlimiteUpdateSchema.parse({ pagadorlimiteid: id, ...req.body });
  log.debug(line(), "pagadorlimiteValidated:", pagadorlimiteValidated);

  await pagadorlimiteService.updatePagadorlimiteService({
    pagadorlimiteid: pagadorlimiteValidated.pagadorlimiteid,
    total: pagadorlimiteValidated.total,
    usado: pagadorlimiteValidated.usado,
    disponible: pagadorlimiteValidated.disponible,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const deletePagadorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deletePagadorlimite");
  const { id } = req.params;
  const pagadorlimiteSchema = objectInput(
    z.object({
      pagadorlimiteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const pagadorlimiteValidated = pagadorlimiteSchema.parse({ pagadorlimiteid: id });

  const result = await pagadorlimiteService.deletePagadorlimiteService({
    pagadorlimiteid: pagadorlimiteValidated.pagadorlimiteid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const activatePagadorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activatePagadorlimite");
  const { id } = req.params;
  const pagadorlimiteSchema = objectInput(
    z.object({
      pagadorlimiteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const pagadorlimiteValidated = pagadorlimiteSchema.parse({ pagadorlimiteid: id });

  const result = await pagadorlimiteService.activatePagadorlimiteService({
    pagadorlimiteid: pagadorlimiteValidated.pagadorlimiteid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const getPagadorlimiteMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPagadorlimiteMaster");
  const pagadorlimiteMasterFiltered = await pagadorlimiteService.getPagadorlimiteMasterService();
  response(res, 201, pagadorlimiteMasterFiltered);
};
