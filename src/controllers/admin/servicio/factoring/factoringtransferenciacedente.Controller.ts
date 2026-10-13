import * as factoringtransferenciacedenteService from "#root/src/services/admin/factoringtransferenciacedente.Service.js";
import type { CreateFactoringtransferenciacedenteDto, FactoringtransferenciacedenteIdDto, GetFactoringtransferenciacedenteMasterByFactoringidDto, GetFactoringtransferenciacedentesByFactoringidDto, UpdateFactoringtransferenciacedenteDto } from "#root/src/services/admin/factoringtransferenciacedente.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput, numberInput } from "#src/utils/validationInputs.js";

export const sendCorreoFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendCorreoFactoringtransferenciacedente");
  const { id } = req.params;
  const factoringtransferenciacedenteUpdateSchema = objectInput(
    z.object({
      factoringtransferenciacedenteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteUpdateSchema.parse({ factoringtransferenciacedenteid: id, ...req.body }) as FactoringtransferenciacedenteIdDto;
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  await factoringtransferenciacedenteService.sendCorreoFactoringtransferenciacedenteService(factoringtransferenciacedenteValidated.factoringtransferenciacedenteid);

  response(res, 200, {});
};

export const activateFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringtransferenciacedente");
  const { id } = req.params;
  const factoringtransferenciacedenteSchema = objectInput(
    z.object({
      factoringtransferenciacedenteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSchema.parse({ factoringtransferenciacedenteid: id }) as FactoringtransferenciacedenteIdDto;
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedenteActivated = await factoringtransferenciacedenteService.activateFactoringtransferenciacedenteService(factoringtransferenciacedenteValidated, req.session_user.usuario.idusuario);

  response(res, 204, factoringtransferenciacedenteActivated);
};

export const deleteFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringtransferenciacedente");
  const { id } = req.params;
  const factoringtransferenciacedenteSchema = objectInput(
    z.object({
      factoringtransferenciacedenteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSchema.parse({ factoringtransferenciacedenteid: id }) as FactoringtransferenciacedenteIdDto;
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedenteDeleted = await factoringtransferenciacedenteService.deleteFactoringtransferenciacedenteService(factoringtransferenciacedenteValidated, req.session_user.usuario.idusuario);

  response(res, 204, factoringtransferenciacedenteDeleted);
};

export const updateFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringtransferenciacedente");
  const { id } = req.params;
  const factoringtransferenciacedenteUpdateSchema = objectInput(
    z.object({
      factoringtransferenciacedenteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factoringtransferenciaestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteUpdateSchema.parse({ factoringtransferenciacedenteid: id, ...req.body }) as UpdateFactoringtransferenciacedenteDto;
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  await factoringtransferenciacedenteService.updateFactoringtransferenciacedenteService(factoringtransferenciacedenteValidated, req.session_user.usuario.idusuario);

  response(res, 200, { ...factoringtransferenciacedenteValidated });
};

export const createFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringtransferenciacedente");
  const factoringtransferenciacedenteSchema = objectInput(
    z.object({
      factoringid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factoringtransferenciatipoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factoringtransferenciaestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factorcuentabancariaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      empresacuentabancariaid: stringInput(
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
      numero_operacion: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      monto: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value)).refine((value) => value >= 0, "Debe ser mayor o igual que 0")),
      fecha: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
          .refine((value) => {
            const date = new Date(value);
            return !isNaN(date.getTime());
          }, "Fecha inválida"),
      ),
      archivo_constancia_transferencia: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSchema.parse({ ...req.body }) as CreateFactoringtransferenciacedenteDto;

  const factoringtransferenciacedenteCreated = await factoringtransferenciacedenteService.createFactoringtransferenciacedenteService(factoringtransferenciacedenteValidated, req.session_user.usuario.idusuario);

  response(res, 201, factoringtransferenciacedenteCreated);
};

export const getFactoringtransferenciacedentesByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringtransferenciacedentesByFactoringid");
  const { id } = req.params;
  const factoringtransferenciacedenteSearchSchema = objectInput(
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
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSearchSchema.parse({ factoringid: id, ...req.body }) as GetFactoringtransferenciacedentesByFactoringidDto;
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedentes = await factoringtransferenciacedenteService.getFactoringtransferenciacedentesByFactoringidService(factoringtransferenciacedenteValidated);

  response(res, 201, factoringtransferenciacedentes);
};

export const getFactoringtransferenciacedenteMasterByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringtransferenciacedenteMaster");
  const { factoringid } = req.params;
  const factoringtransferenciacedenteSchema = objectInput(
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
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSchema.parse({ factoringid: factoringid }) as GetFactoringtransferenciacedenteMasterByFactoringidDto;
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const masterData = await factoringtransferenciacedenteService.getFactoringtransferenciacedenteMasterByFactoringidService(factoringtransferenciacedenteValidated);

  response(res, 201, masterData);
};
