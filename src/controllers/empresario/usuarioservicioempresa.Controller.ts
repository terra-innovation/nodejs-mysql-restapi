import * as usuarioservicioempresaDao from "#root/src/daos/usuarioservicioempresa.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { Request, Response } from "express";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getUsuarioservicioempresas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioservicioempresas");
  //log.info(line(),req.session_user.usuario.idusuario);

  const empresas = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const idservicio = 1;
      const _idusuario_session = req.session_user.usuario.idusuario;

      const usuarioservicioempresas = await usuarioservicioempresaDao.getUsuarioservicioempresaByIdusuarioIdServicio(tx, _idusuario_session, idservicio, filter_estados);
      var empresasFiltered = jsonUtils.removeAttributesPrivates(usuarioservicioempresas);
      return empresasFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, empresas);
};

export const getUsuarioservicioempresaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioservicioempresaMaster");
  const empresasMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, empresasMasterFiltered);
};
