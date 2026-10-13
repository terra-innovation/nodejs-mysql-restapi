import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput, numberInput, booleanInput, inputEmailPattern } from "#src/utils/validationInputs.js";

import { activateConfiguracioncorreoService, createConfiguracioncorreoService, deleteConfiguracioncorreoService, getConfiguracioncorreoMasterService, getConfiguracioncorreosService, testConfiguracioncorreoService, updateConfiguracioncorreoService, type ConfiguracionCorreoCreateDto, type ConfiguracionCorreoUpdateDto, type TestConfiguracionCorreoDto } from "#root/src/services/admin/configuracioncorreo.Service.js";

export const getConfiguracioncorreos = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getConfiguracioncorreos");
  const data = await getConfiguracioncorreosService();
  response(res, 201, data);
};

export const createConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createConfiguracioncorreo");
  const schema = objectInput(
    z.object({
      alias: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      smtp_host: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      smtp_port: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value))),
      smtp_secure: booleanInput(z.boolean()),
      smtp_user: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      smtp_pass: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      smtp_name: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      mail_backup: stringInput(
        z
          .string()
          .refine((value) => value === "" || inputEmailPattern.test(value), "Debe ser un correo válido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres")
          .nullable()
          .optional(),
        { trim: true },
      ),
      is_enabled: booleanInput(z.boolean()),
    }),
  );

  const validated = schema.parse({ ...req.body }) as unknown as ConfiguracionCorreoCreateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const created = await createConfiguracioncorreoService(validated, idusuario);
  response(res, 201, created);
};

export const updateConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateConfiguracioncorreo");
  const { id } = req.params;
  const schema = objectInput(
    z.object({
      configuracioncorreoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      alias: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      smtp_host: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      smtp_port: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value))),
      smtp_secure: booleanInput(z.boolean()),
      smtp_user: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      smtp_pass: stringInput(
        z
          .string()
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres")
          .nullable()
          .optional(),
        { trim: true },
      ),
      smtp_name: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      mail_backup: stringInput(
        z
          .string()
          .refine((value) => value === "" || inputEmailPattern.test(value), "Debe ser un correo válido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres")
          .nullable()
          .optional(),
        { trim: true },
      ),
      is_enabled: booleanInput(z.boolean()),
    }),
  );

  const validated = schema.parse({ configuracioncorreoid: id, ...req.body }) as unknown as ConfiguracionCorreoUpdateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  await updateConfiguracioncorreoService(validated, idusuario);
  response(res, 200, {});
};

export const deleteConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteConfiguracioncorreo");
  const { id } = req.params;
  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  await deleteConfiguracioncorreoService(id, idusuario);
  response(res, 204, {});
};

export const activateConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateConfiguracioncorreo");
  const { id } = req.params;
  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  await activateConfiguracioncorreoService(id, idusuario);
  response(res, 204, {});
};

export const getConfiguracioncorreoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getConfiguracioncorreoMaster");
  const data = await getConfiguracioncorreoMasterService();
  response(res, 201, data);
};

export const testConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::testConfiguracioncorreo");
  const { id } = req.params;
  const schema = objectInput(
    z.object({
      configuracioncorreoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      email_destinatario: stringInput(
        z
          .string()
          .refine((value) => value === "" || inputEmailPattern.test(value), "Debe ser un correo válido")
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
      ),
    }),
  );

  const validated = schema.parse({ configuracioncorreoid: id, ...req.body }) as unknown as TestConfiguracionCorreoDto;

  const result = await testConfiguracioncorreoService(validated);
  response(res, 200, result);
};
