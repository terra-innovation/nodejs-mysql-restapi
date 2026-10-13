import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { createEmpresacuentabancariaService, getEmpresacuentabancariaMasterService, updateEmpresacuentabancariaOnlyAliasService, getEmpresacuentabancariasService, CreateEmpresacuentabancariaDto, UpdateEmpresacuentabancariaOnlyAliasDto } from "#root/src/services/empresario/empresacuentabancaria.Service.js";

export const createEmpresacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createEmpresacuentabancaria");
  const session_idusuario = req.session_user.usuario.idusuario;

  const empresacuentabancariaCreateSchema = objectInput(
    z.object({
      encabezado_cuenta_bancaria: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      empresaid: stringInput(
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

  const empresacuentabancariaValidated = empresacuentabancariaCreateSchema.parse({ ...req.body }) as CreateEmpresacuentabancariaDto;
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const empresacuentabancariaFiltered = await createEmpresacuentabancariaService(session_idusuario, empresacuentabancariaValidated);

  response(res, 201, { ...empresacuentabancariaFiltered });
};

export const getEmpresacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancariaMaster");
  const session_idusuario = req.session_user.usuario.idusuario;

  const cuentasbancariasMasterFiltered = await getEmpresacuentabancariaMasterService(session_idusuario);

  response(res, 201, cuentasbancariasMasterFiltered);
};

export const updateEmpresacuentabancariaOnlyAlias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateEmpresacuentabancariaOnlyAlias");
  const { id } = req.params;
  const session_idusuario = req.session_user.usuario.idusuario;

  const empresacuentabancariaUpdateSchema = objectInput(
    z.object({
      empresacuentabancariaid: stringInput(
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
        { trim: true },
      ),
    }),
  );

  const empresacuentabancariaValidated = empresacuentabancariaUpdateSchema.parse({ empresacuentabancariaid: id, ...req.body }) as UpdateEmpresacuentabancariaOnlyAliasDto;
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const resultado = await updateEmpresacuentabancariaOnlyAliasService(session_idusuario, empresacuentabancariaValidated);

  response(res, 200, resultado);
};

export const getEmpresacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancarias");
  const session_idusuario = req.session_user.usuario.idusuario;

  const empresacuentabancariasFiltered = await getEmpresacuentabancariasService(session_idusuario);

  response(res, 201, empresacuentabancariasFiltered);
};
