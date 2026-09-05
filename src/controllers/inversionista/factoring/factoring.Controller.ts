import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { Request, Response } from "express";

import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getFactorings = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorings");
  const factorings = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const _idusuario_session = req.session_user.usuario.idusuario;
      const _idfactoringestados = [5];
      const factorings = await factoringDao.getFactoringsOportunidades(tx, _idfactoringestados, filter_estados);
      return factorings;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factorings);
};

export const getFactoringMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsMaster");
  const filter_estados = [ESTADO.ACTIVO];

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, {});
};
