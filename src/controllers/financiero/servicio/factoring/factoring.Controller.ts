import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { Request, Response } from "express";

import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringestadoDao from "#root/src/daos/factoringestado.Dao.js";
import * as factoringtipoDao from "#root/src/daos/factoringtipo.Dao.js";
import * as riesgoDao from "#root/src/daos/riesgo.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getFactoringMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsMaster");
  const filter_estados = [ESTADO.ACTIVO];

  const factoringsMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringtipos = await factoringtipoDao.getFactoringtipos(tx, filter_estados);
      const factoringestados = await factoringestadoDao.getFactoringestados(tx, filter_estados);
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);

      var factoringsMaster: Record<string, any> = {};
      factoringsMaster.factoringtipos = factoringtipos;
      factoringsMaster.factoringestados = factoringestados;
      factoringsMaster.riesgos = riesgos;

      return factoringsMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringsMasterFiltered);
};

export const getFactorings = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorings");
  const factorings = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1, 2];
      const factorings = await factoringDao.getFactoringsByEstados(tx, filter_estados);
      return factorings;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factorings);
};
