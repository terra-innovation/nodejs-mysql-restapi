import * as factorlimiteService from "#root/src/services/admin/factorlimite.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput, numberInput } from "#src/utils/validationInputs.js";

export const getFactorlimites = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorlimites");
  const factorlimites = await factorlimiteService.getFactorlimitesService();
  response(res, 201, factorlimites);
};

export const createFactorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactorlimite");
  const factorlimiteCreateSchema = objectInput(
    z.object({
      factorid: stringInput(
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

  const factorlimiteValidated = factorlimiteCreateSchema.parse(req.body);
  log.debug(line(), "factorlimiteValidated:", factorlimiteValidated);

  const factorlimiteCreated = await factorlimiteService.createFactorlimiteService({
    factorid: factorlimiteValidated.factorid,
    monedaid: factorlimiteValidated.monedaid,
    total: factorlimiteValidated.total,
    usado: factorlimiteValidated.usado,
    disponible: factorlimiteValidated.disponible,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, factorlimiteCreated);
};

export const updateFactorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactorlimite");
  const { id } = req.params;
  const factorlimiteUpdateSchema = objectInput(
    z.object({
      factorlimiteid: stringInput(
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

  const factorlimiteValidated = factorlimiteUpdateSchema.parse({ factorlimiteid: id, ...req.body });
  log.debug(line(), "factorlimiteValidated:", factorlimiteValidated);

  await factorlimiteService.updateFactorlimiteService({
    factorlimiteid: factorlimiteValidated.factorlimiteid,
    total: factorlimiteValidated.total,
    usado: factorlimiteValidated.usado,
    disponible: factorlimiteValidated.disponible,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const deleteFactorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactorlimite");
  const { id } = req.params;
  const factorlimiteSchema = objectInput(
    z.object({
      factorlimiteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const factorlimiteValidated = factorlimiteSchema.parse({ factorlimiteid: id });

  const result = await factorlimiteService.deleteFactorlimiteService({
    factorlimiteid: factorlimiteValidated.factorlimiteid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const activateFactorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactorlimite");
  const { id } = req.params;
  const factorlimiteSchema = objectInput(
    z.object({
      factorlimiteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const factorlimiteValidated = factorlimiteSchema.parse({ factorlimiteid: id });

  const result = await factorlimiteService.activateFactorlimiteService({
    factorlimiteid: factorlimiteValidated.factorlimiteid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const getFactorlimiteMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorlimiteMaster");
  const factorlimiteMasterFiltered = await factorlimiteService.getFactorlimiteMasterService();
  response(res, 201, factorlimiteMasterFiltered);
};
