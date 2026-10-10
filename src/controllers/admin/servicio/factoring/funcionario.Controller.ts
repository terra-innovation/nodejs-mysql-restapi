import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import * as funcionarioService from "#root/src/services/admin/funcionario.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getFuncionariosByEmpresaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFuncionariosByEmpresaid");
  const { id } = req.params;

  const funcionarioSearchSchema = objectInput(
    z.object({
      empresaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const funcionarioValidated = funcionarioSearchSchema.parse({ empresaid: id, ...req.body });
  log.debug(line(), "funcionarioValidated:", funcionarioValidated);

  const funcionariosJson = await funcionarioService.getFuncionariosByEmpresaidService(funcionarioValidated.empresaid);

  response(res, 201, funcionariosJson);
};
