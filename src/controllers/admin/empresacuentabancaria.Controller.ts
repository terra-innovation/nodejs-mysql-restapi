import * as empresacuentabancariaService from "#root/src/services/admin/empresacuentabancaria.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";

export const activateEmpresacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateEmpresacuentabancaria");
  const { id } = req.params;
  const empresacuentabancariaSchema = objectInput(
    z.object({
      empresacuentabancariaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const empresacuentabancariaValidated = empresacuentabancariaSchema.parse({ empresacuentabancariaid: id });
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  await empresacuentabancariaService.activateEmpresacuentabancariaService({
    empresacuentabancariaid: empresacuentabancariaValidated.empresacuentabancariaid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, {});
};

export const deleteEmpresacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteEmpresacuentabancaria");
  const { id } = req.params;
  const empresacuentabancariaSchema = objectInput(
    z.object({
      empresacuentabancariaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const empresacuentabancariaValidated = empresacuentabancariaSchema.parse({ empresacuentabancariaid: id });
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  await empresacuentabancariaService.deleteEmpresacuentabancariaService({
    empresacuentabancariaid: empresacuentabancariaValidated.empresacuentabancariaid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, {});
};

export const getEmpresacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancariaMaster");
  const cuentasbancariasMaster = await empresacuentabancariaService.getEmpresacuentabancariaMasterService();
  response(res, 201, cuentasbancariasMaster);
};

export const updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstado");
  const { id } = req.params;
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
      cuentabancariaestadoid: stringInput(
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
  const empresacuentabancariaValidated = empresacuentabancariaUpdateSchema.parse({ empresacuentabancariaid: id, ...req.body });
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  await empresacuentabancariaService.updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstadoService({
    empresacuentabancariaid: empresacuentabancariaValidated.empresacuentabancariaid,
    cuentabancariaestadoid: empresacuentabancariaValidated.cuentabancariaestadoid,
    alias: empresacuentabancariaValidated.alias,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const getEmpresacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancarias");
  const cuentasbancarias = await empresacuentabancariaService.getEmpresacuentabancariasService();
  response(res, 201, cuentasbancarias);
};

export const createEmpresacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createEmpresacuentabancaria");
  const empresacuentabancariaCreateSchema = objectInput(
    z.object({
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
  const empresacuentabancariaValidated = empresacuentabancariaCreateSchema.parse(req.body);
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const empresacuentabancaria = await empresacuentabancariaService.createEmpresacuentabancariaService({
    empresaid: empresacuentabancariaValidated.empresaid,
    bancoid: empresacuentabancariaValidated.bancoid,
    cuentatipoid: empresacuentabancariaValidated.cuentatipoid,
    monedaid: empresacuentabancariaValidated.monedaid,
    numero: empresacuentabancariaValidated.numero,
    cci: empresacuentabancariaValidated.cci,
    alias: empresacuentabancariaValidated.alias,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, { ...empresacuentabancaria });
};
