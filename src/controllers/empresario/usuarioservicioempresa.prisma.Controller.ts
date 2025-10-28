import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as usuarioservicioempresaDao from "#src/daos/usuarioservicioempresa.prisma.Dao.js";

import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import type { empresa } from "#root/generated/prisma/ft_factoring/client.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const getUsuarioservicioempresas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioservicioempresas");
  //log.info(line(),req.session_user.usuario.idusuario);

  const empresas = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const idservicio = 1;
      const _idusuario_session = req.session_user.usuario.idusuario;

      const usuarioservicioempresas = await usuarioservicioempresaDao.getUsuarioservicioempresaByIdusuarioIdServicio(tx, _idusuario_session, idservicio, filter_estados);
      var empresasFiltered = jsonUtils.removeAttributesPrivates(usuarioservicioempresas);
      return empresasFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, empresas);
};

export const getUsuarioservicioempresaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioservicioempresaMaster");
  const empresasMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, empresasMasterFiltered);
};
