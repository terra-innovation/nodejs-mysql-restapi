import * as inversionistacuentabancariaService from "#root/src/services/admin/inversionistacuentabancaria.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";

export const updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstado");
  const { id } = req.params;
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
  const inversionistacuentabancariaValidated = inversionistacuentabancariaUpdateSchema.parse({ inversionistacuentabancariaid: id, ...req.body });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  await inversionistacuentabancariaService.updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstadoService({
    inversionistacuentabancariaid: inversionistacuentabancariaValidated.inversionistacuentabancariaid,
    cuentabancariaestadoid: inversionistacuentabancariaValidated.cuentabancariaestadoid,
    alias: inversionistacuentabancariaValidated.alias,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const getInversionistacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancarias");
  const cuentasbancarias = await inversionistacuentabancariaService.getInversionistacuentabancariasService();
  response(res, 201, cuentasbancarias);
};

export const activateInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateInversionistacuentabancaria");
  const { id } = req.params;
  const inversionistacuentabancariaSchema = objectInput(
    z.object({
      inversionistacuentabancariaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const inversionistacuentabancariaValidated = inversionistacuentabancariaSchema.parse({ inversionistacuentabancariaid: id });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  await inversionistacuentabancariaService.activateInversionistacuentabancariaService({
    inversionistacuentabancariaid: inversionistacuentabancariaValidated.inversionistacuentabancariaid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, {});
};

export const deleteInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteInversionistacuentabancaria");
  const { id } = req.params;
  const inversionistacuentabancariaSchema = objectInput(
    z.object({
      inversionistacuentabancariaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const inversionistacuentabancariaValidated = inversionistacuentabancariaSchema.parse({ inversionistacuentabancariaid: id });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  await inversionistacuentabancariaService.deleteInversionistacuentabancariaService({
    inversionistacuentabancariaid: inversionistacuentabancariaValidated.inversionistacuentabancariaid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, {});
};

export const getInversionistacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancariaMaster");
  const cuentasbancariasMaster = await inversionistacuentabancariaService.getInversionistacuentabancariaMasterService();
  response(res, 201, cuentasbancariasMaster);
};

export const createInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createInversionistacuentabancaria");
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
  const inversionistacuentabancariaValidated = inversionistacuentabancariaCreateSchema.parse(req.body);
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const inversionistacuentabancaria = await inversionistacuentabancariaService.createInversionistacuentabancariaService({
    inversionistaid: inversionistacuentabancariaValidated.inversionistaid,
    bancoid: inversionistacuentabancariaValidated.bancoid,
    cuentatipoid: inversionistacuentabancariaValidated.cuentatipoid,
    monedaid: inversionistacuentabancariaValidated.monedaid,
    numero: inversionistacuentabancariaValidated.numero,
    cci: inversionistacuentabancariaValidated.cci,
    alias: inversionistacuentabancariaValidated.alias,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, { ...inversionistacuentabancaria });
};
