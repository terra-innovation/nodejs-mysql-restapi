import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";

import * as cuentabancariaDao from "#src/daos/cuentabancaria.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as personaDao from "#src/daos/persona.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as factoringfacturaDao from "#src/daos/factoringfactura.prisma.Dao.js";
import * as factoringhistorialestadoDao from "#src/daos/factoringhistorialestado.prisma.Dao.js";
import * as facturaDao from "#src/daos/factura.prisma.Dao.js";
import * as contactoDao from "#src/daos/contacto.prisma.Dao.js";
import * as colaboradorDao from "#src/daos/colaborador.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { log, line } from "#src/utils/logger.pino.js";

import * as luxon from "luxon";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const getFactorings = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorings");
  const factorings = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const _idusuario_session = req.session_user.usuario._idusuario;
      const _idfactoringestados = [5];
      const factorings = await factoringDao.getFactoringsOportunidades(tx, _idfactoringestados, filter_estados);
      return factorings;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factorings);
};

export const getFactoringMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsMaster");
  const filter_estados = [1];

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, {});
};
