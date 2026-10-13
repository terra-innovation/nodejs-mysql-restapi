import * as factoringhistorialestadoService from "#root/src/services/admin/factoringhistorialestado.Service.js";
import type { CreateFactoringhistorialestadoDto, FactoringhistorialestadoIdDto, GetFactoringhistorialestadosByFactoringidDto, UpdateFactoringhistorialestadoDto } from "#root/src/services/admin/factoringhistorialestado.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";

export const updateFactoringhistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringhistorialestado");
  const { id } = req.params;
  const factoringhistorialestadoUpdateSchema = objectInput(
    z.object({
      factoringhistorialestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factoringestadoid: stringInput(
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
      archivos: z
        .array(
          stringInput(
            z
              .string()
              .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
              .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
              .optional(),
          ),
        )
        .optional(),
    }),
  );
  const factoringhistorialestadoValidated = factoringhistorialestadoUpdateSchema.parse({ factoringhistorialestadoid: id, ...req.body }) as UpdateFactoringhistorialestadoDto;
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  await factoringhistorialestadoService.updateFactoringhistorialestadoService(factoringhistorialestadoValidated, req.session_user.usuario.idusuario);

  response(res, 200, { ...factoringhistorialestadoValidated });
};

export const getFactoringhistorialestadosByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestadosByFactoringid");
  const { id } = req.params;
  const factoringhistorialestadoSchema = objectInput(
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
  const factoringhistorialestadoValidated = factoringhistorialestadoSchema.parse({ factoringid: id, ...req.body }) as GetFactoringhistorialestadosByFactoringidDto;
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const factoringhistorialestados = await factoringhistorialestadoService.getFactoringhistorialestadosByFactoringidService(factoringhistorialestadoValidated);

  response(res, 201, factoringhistorialestados);
};

export const getFactoringhistorialestadoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestadoMaster");

  const masterData = await factoringhistorialestadoService.getFactoringhistorialestadoMasterService();

  response(res, 201, masterData);
};

export const createFactoringhistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringhistorialestado");

  const factoringhistorialestadoSchema = objectInput(
    z.object({
      factoringid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factoringestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      archivos: z
        .array(
          stringInput(
            z
              .string()
              .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
              .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
              .optional(),
          ),
        )
        .optional(),
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
  const factoringhistorialestadoValidated = factoringhistorialestadoSchema.parse({ ...req.body }) as CreateFactoringhistorialestadoDto;
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  await factoringhistorialestadoService.createFactoringhistorialestadoService(factoringhistorialestadoValidated, req.session_user.usuario.idusuario);

  response(res, 201, { ...factoringhistorialestadoValidated });
};

export const activateFactoringhistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringhistorialestado");
  const { id } = req.params;
  const factoringhistorialestadoSchema = objectInput(
    z.object({
      factoringhistorialestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringhistorialestadoValidated = factoringhistorialestadoSchema.parse({ factoringhistorialestadoid: id }) as FactoringhistorialestadoIdDto;
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const factoringhistorialestadoActivated = await factoringhistorialestadoService.activateFactoringhistorialestadoService(factoringhistorialestadoValidated, req.session_user.usuario.idusuario);

  response(res, 204, factoringhistorialestadoActivated);
};

export const deleteFactoringhistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringhistorialestado");
  const { id } = req.params;
  const factoringhistorialestadoSchema = objectInput(
    z.object({
      factoringhistorialestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringhistorialestadoValidated = factoringhistorialestadoSchema.parse({ factoringhistorialestadoid: id }) as FactoringhistorialestadoIdDto;
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const factoringhistorialestadoDeleted = await factoringhistorialestadoService.deleteFactoringhistorialestadoService(factoringhistorialestadoValidated, req.session_user.usuario.idusuario);

  response(res, 204, factoringhistorialestadoDeleted);
};

export const getFactoringhistorialestados = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestados");

  const factoringhistorialestados = await factoringhistorialestadoService.getFactoringhistorialestadosService();

  response(res, 201, factoringhistorialestados);
};
