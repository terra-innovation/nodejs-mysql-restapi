import { Request, Response } from "express";
import * as yup from "yup";
import * as zlaboratorioService from "#root/src/services/admin/zlaboratorio.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const validateTransaction = async (req: Request, res: Response) => {
  log.debug(line(), "controller::validateTransaction");
  const session_idusuario = req.session_user.usuario.idusuario;

  const usuariopedidoCreateSchema = yup
    .object()
    .shape({
      nombre: yup.string().trim().required().min(2).max(200),
      pedido: yup.string().trim().required().min(2).max(200),
    })
    .required();

  const usuariopedidoValidated = usuariopedidoCreateSchema.validateSync(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  log.debug(line(), "usuariopedidoValidated:", usuariopedidoValidated);

  const resultado = await zlaboratorioService.validateTransactionService(
    session_idusuario,
    usuariopedidoValidated as zlaboratorioService.ValidateTransactionPayload,
  );

  response(res, 201, { ...resultado });
};
