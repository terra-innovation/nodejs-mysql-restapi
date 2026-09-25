import { Request, Response } from "express";
import * as yup from "yup";
import * as funcionarioService from "#root/src/services/admin/funcionario.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getFuncionariosByEmpresaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFuncionariosByEmpresaid");
  const { id } = req.params;

  const funcionarioSearchSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const funcionarioValidated = funcionarioSearchSchema.validateSync(
    { empresaid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "funcionarioValidated:", funcionarioValidated);

  const funcionariosJson = await funcionarioService.getFuncionariosByEmpresaidService(funcionarioValidated.empresaid);

  response(res, 201, funcionariosJson);
};
