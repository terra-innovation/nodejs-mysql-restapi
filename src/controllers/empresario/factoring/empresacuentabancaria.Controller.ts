import { Request, Response } from "express";
import { line, log } from "#root/src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { getEmpresacuentabancariasForFactoringService, getEmpresacuentabancariaMasterService, createEmpresacuentabancariaService, GetEmpresacuentabancariasForFactoringDto, CreateEmpresacuentabancariaDto } from "#root/src/services/empresario/empresacuentabancaria.Service.js";

export const getEmpresacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancarias");

  const empresacuentabancariaUpdateSchema = objectInput(
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
    }),
  );

  const empresacuentabancariaValidated = empresacuentabancariaUpdateSchema.parse({ ...req.body }) as GetEmpresacuentabancariasForFactoringDto;
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const empresacuentabancariasFiltered = await getEmpresacuentabancariasForFactoringService(req.session_user.usuario.idusuario, empresacuentabancariaValidated);

  response(res, 201, empresacuentabancariasFiltered);
};

export const getEmpresacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancariaMaster");
  const session_idusuario = req.session_user.usuario.idusuario;

  const cuentasbancariasMasterFiltered = await getEmpresacuentabancariaMasterService(session_idusuario);

  response(res, 201, cuentasbancariasMasterFiltered);
};

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
