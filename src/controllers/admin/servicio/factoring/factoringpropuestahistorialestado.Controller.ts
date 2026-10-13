import * as factoringpropuestahistorialestadoService from "#root/src/services/admin/factoringpropuestahistorialestado.Service.js";
import type { CreateFactoringpropuestahistorialestadoDto, FactoringpropuestahistorialestadoIdDto, GetFactoringpropuestahistorialestadosByFactoringpropuestaidDto, UpdateFactoringpropuestahistorialestadoDto } from "#root/src/services/admin/factoringpropuestahistorialestado.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";

export const updateFactoringpropuestahistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringpropuestahistorialestado");
  const { id } = req.params;
  const factoringpropuestahistorialestadoUpdateSchema = objectInput(
    z.object({
      factoringpropuestahistorialestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      comentario: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 65535, "Debe tener como máximo 65535 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringpropuestahistorialestadoValidated = factoringpropuestahistorialestadoUpdateSchema.parse({ factoringpropuestahistorialestadoid: id, ...req.body }) as UpdateFactoringpropuestahistorialestadoDto;
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  await factoringpropuestahistorialestadoService.updateFactoringpropuestahistorialestadoService(factoringpropuestahistorialestadoValidated, req.session_user.usuario.idusuario);

  response(res, 200, { ...factoringpropuestahistorialestadoValidated });
};

export const getFactoringpropuestahistorialestadosByFactoringpropuestaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestadosByFactoringpropuestaid");
  const { id } = req.params;
  const factoringpropuestahistorialestadoSchema = objectInput(
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
  const factoringpropuestahistorialestadoValidated = factoringpropuestahistorialestadoSchema.parse({ factoringpropuestaid: id, ...req.body }) as GetFactoringpropuestahistorialestadosByFactoringpropuestaidDto;
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  const factoringpropuestahistorialestados = await factoringpropuestahistorialestadoService.getFactoringpropuestahistorialestadosByFactoringpropuestaidService(factoringpropuestahistorialestadoValidated);

  response(res, 201, factoringpropuestahistorialestados);
};

export const getFactoringpropuestahistorialestadoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestadoMaster");

  const masterData = await factoringpropuestahistorialestadoService.getFactoringpropuestahistorialestadoMasterService();

  response(res, 201, masterData);
};

export const createFactoringpropuestahistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringpropuestahistorialestado");

  const factoringpropuestahistorialestadoSchema = objectInput(
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
      comentario: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 65535, "Debe tener como máximo 65535 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringpropuestahistorialestadoValidated = factoringpropuestahistorialestadoSchema.parse({ ...req.body }) as CreateFactoringpropuestahistorialestadoDto;
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  await factoringpropuestahistorialestadoService.createFactoringpropuestahistorialestadoService(factoringpropuestahistorialestadoValidated, req.session_user.usuario.idusuario);

  response(res, 201, { ...factoringpropuestahistorialestadoValidated });
};

export const activateFactoringpropuestahistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringpropuestahistorialestado");
  const { id } = req.params;
  const factoringpropuestahistorialestadoSchema = objectInput(
    z.object({
      factoringpropuestahistorialestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringpropuestahistorialestadoValidated = factoringpropuestahistorialestadoSchema.parse({ factoringpropuestahistorialestadoid: id }) as FactoringpropuestahistorialestadoIdDto;
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  const factoringpropuestahistorialestadoActivated = await factoringpropuestahistorialestadoService.activateFactoringpropuestahistorialestadoService(factoringpropuestahistorialestadoValidated, req.session_user.usuario.idusuario);

  response(res, 204, factoringpropuestahistorialestadoActivated);
};

export const deleteFactoringpropuestahistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringpropuestahistorialestado");
  const { id } = req.params;
  const factoringpropuestahistorialestadoSchema = objectInput(
    z.object({
      factoringpropuestahistorialestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringpropuestahistorialestadoValidated = factoringpropuestahistorialestadoSchema.parse({ factoringpropuestahistorialestadoid: id }) as FactoringpropuestahistorialestadoIdDto;
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  const factoringpropuestahistorialestadoDeleted = await factoringpropuestahistorialestadoService.deleteFactoringpropuestahistorialestadoService(factoringpropuestahistorialestadoValidated, req.session_user.usuario.idusuario);

  response(res, 204, factoringpropuestahistorialestadoDeleted);
};

export const getFactoringpropuestahistorialestados = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestados");

  const factoringpropuestahistorialestados = await factoringpropuestahistorialestadoService.getFactoringpropuestahistorialestadosService();

  response(res, 201, factoringpropuestahistorialestados);
};
