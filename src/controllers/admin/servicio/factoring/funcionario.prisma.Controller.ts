import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as funcionarioDao from "#src/daos/funcionario.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import * as yup from "yup";

export const getFuncionariosByEmpresaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFuncionariosByEmpresaid");
  //log.info(line(),req.session_user.usuario.idusuario);
  const { id } = req.params;
  const funcionarioSearchSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const funcionarioValidated = funcionarioSearchSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "funcionarioValidated:", funcionarioValidated);

  const funcionariosJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      var empresa = await empresaDao.getEmpresaByEmpresaid(tx, funcionarioValidated.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + funcionarioValidated.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const funcionarios = await funcionarioDao.getFuncionariosByIdempresa(tx, empresa.idempresa, filter_estado);
      var funcionariosJson = jsonUtils.sequelizeToJSON(funcionarios);
      //log.info(line(),funcionarioObfuscated);

      //var funcionariosFiltered = jsonUtils.removeAttributes(funcionariosJson, ["score"]);
      //funcionariosFiltered = jsonUtils.removeAttributesPrivates(funcionariosFiltered);
      return funcionariosJson;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, funcionariosJson);
};
