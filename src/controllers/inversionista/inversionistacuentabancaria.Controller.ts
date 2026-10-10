import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { createInversionistacuentabancariaService, updateInversionistacuentabancariaOnlyAliasService, getInversionistacuentabancariasService, getInversionistacuentabancariaMasterService, CreateInversionistacuentabancariaDto, UpdateInversionistacuentabancariaOnlyAliasDto } from "#root/src/services/inversionista/inversionistacuentabancaria.Service.js";

export const createInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createInversionistacuentabancaria");
  const session_idusuario = req.session_user.usuario.idusuario;

  const inversionistacuentabancariaCreateSchema = objectInput(
    z.object({
      inversionistaid: stringInput(
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
      cuentatipoid: stringInput(
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
      numero: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
      ),
      cci: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
      ),
      alias: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
      ),
    }),
  );

  const inversionistacuentabancariaValidated = inversionistacuentabancariaCreateSchema.parse({ ...req.body }) as CreateInversionistacuentabancariaDto;
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const inversionistacuentabancariaFiltered = await createInversionistacuentabancariaService(session_idusuario, inversionistacuentabancariaValidated);

  response(res, 201, { ...inversionistacuentabancariaFiltered });
};

export const updateInversionistacuentabancariaOnlyAlias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateInversionistacuentabancariaOnlyAlias");
  const { id } = req.params;
  const session_idusuario = req.session_user.usuario.idusuario;

  const inversionistacuentabancariaUpdateSchema = objectInput(
    z.object({
      inversionistacuentabancariaid: stringInput(
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
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
      ),
    }),
  );

  const inversionistacuentabancariaValidated = inversionistacuentabancariaUpdateSchema.parse({ inversionistacuentabancariaid: id, ...req.body }) as UpdateInversionistacuentabancariaOnlyAliasDto;
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const resultado = await updateInversionistacuentabancariaOnlyAliasService(session_idusuario, inversionistacuentabancariaValidated);

  response(res, 200, resultado);
};

export const getInversionistacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancarias");
  const session_idusuario = req.session_user.usuario.idusuario;

  const inversionistacuentabancariasFiltered = await getInversionistacuentabancariasService(session_idusuario);
  response(res, 201, inversionistacuentabancariasFiltered);
};

export const getInversionistacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancariaMaster");
  const session_idusuario = req.session_user.usuario.idusuario;

  const cuentasbancariasMasterFiltered = await getInversionistacuentabancariaMasterService(session_idusuario);
  response(res, 201, cuentasbancariasMasterFiltered);
};
