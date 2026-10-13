import * as cuentabancariaestadoService from "#root/src/services/admin/cuentabancariaestado.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";

export const activateCuentabancariaestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateCuentabancariaestado");
  const { id } = req.params;
  const cuentabancariaestadoSchema = objectInput(
    z.object({
      cuentabancariaestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const cuentabancariaestadoValidated = cuentabancariaestadoSchema.parse({ cuentabancariaestadoid: id });
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const cuentabancariaestadoActivated = await cuentabancariaestadoService.activateCuentabancariaestadoService({
    cuentabancariaestadoid: cuentabancariaestadoValidated.cuentabancariaestadoid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, cuentabancariaestadoActivated);
};

export const deleteCuentabancariaestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteCuentabancariaestado");
  const { id } = req.params;
  const cuentabancariaestadoSchema = objectInput(
    z.object({
      cuentabancariaestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const cuentabancariaestadoValidated = cuentabancariaestadoSchema.parse({ cuentabancariaestadoid: id });
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const cuentabancariaestadoDeleted = await cuentabancariaestadoService.deleteCuentabancariaestadoService({
    cuentabancariaestadoid: cuentabancariaestadoValidated.cuentabancariaestadoid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, cuentabancariaestadoDeleted);
};

export const updateCuentabancariaestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateCuentabancariaestado");
  const { id } = req.params;
  const cuentabancariaestadoUpdateSchema = objectInput(
    z.object({
      cuentabancariaestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      nombre: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      alias: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      color: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
    }),
  );
  const cuentabancariaestadoValidated = cuentabancariaestadoUpdateSchema.parse({ cuentabancariaestadoid: id, ...req.body });
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const cuentabancariaestadoFiltered = await cuentabancariaestadoService.updateCuentabancariaestadoService({
    cuentabancariaestadoid: cuentabancariaestadoValidated.cuentabancariaestadoid,
    nombre: cuentabancariaestadoValidated.nombre,
    alias: cuentabancariaestadoValidated.alias,
    color: cuentabancariaestadoValidated.color,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, cuentabancariaestadoFiltered);
};

export const getCuentasbancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getCuentasbancarias");
  const cuentabancariaestados = await cuentabancariaestadoService.getCuentabancariaestadosService();
  response(res, 201, cuentabancariaestados);
};

export const createCuentabancariaestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createCuentabancariaestado");
  const cuentabancariaestadoCreateSchema = objectInput(
    z.object({
      nombre: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      alias: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      color: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
    }),
  );
  const cuentabancariaestadoValidated = cuentabancariaestadoCreateSchema.parse(req.body);
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const cuentabancariaestadoCreated = await cuentabancariaestadoService.createCuentabancariaestadoService({
    nombre: cuentabancariaestadoValidated.nombre,
    alias: cuentabancariaestadoValidated.alias,
    color: cuentabancariaestadoValidated.color,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, cuentabancariaestadoCreated);
};
