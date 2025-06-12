import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as facturaDao from "#src/daos/factura.prisma.Dao.js";
import * as bancoDao from "#src/daos/banco.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as riesgoDao from "#src/daos/riesgo.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import type { factura } from "#src/models/prisma/ft_factoring/client";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const getFacturasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturasByFactoringid");
  //log.info(line(),req.session_user.usuario.idusuario);
  const { id } = req.params;
  const facturaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "facturaValidated:", facturaValidated);

  const facturasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, facturaValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + facturaValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const facturas = await facturaDao.getFacturasByIdfactoring(tx, factoring.idfactoring, filter_estado);
      var facturasJson = jsonUtils.sequelizeToJSON(facturas);
      //log.info(line(),facturaObfuscated);

      //var facturasFiltered = jsonUtils.removeAttributes(facturasJson, ["score"]);
      //facturasFiltered = jsonUtils.removeAttributesPrivates(facturasFiltered);
      return facturasJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, facturasJson);
};

export const activateFactura = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactura");
  const { id } = req.params;
  const facturaSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSchema.validateSync({ facturaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "facturaValidated:", facturaValidated);

  const facturaActivated = await prismaFT.client.$transaction(
    async (tx) => {
      const facturaActivated = await facturaDao.activateFactura(tx, facturaValidated.facturaid, req.session_user.usuario.idusuario);
      if (facturaActivated[0] === 0) {
        throw new ClientError("Factura no existe", 404);
      }
      log.debug(line(), "facturaActivated:", facturaActivated);
      return facturaActivated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, facturaActivated);
};

export const deleteFactura = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactura");
  const { id } = req.params;
  const facturaSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSchema.validateSync({ facturaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "facturaValidated:", facturaValidated);

  const facturaDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAuditoria: Partial<factura> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario.idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 2;

      const facturaDeleted = await facturaDao.deleteFactura(tx, facturaValidated.facturaid, req.session_user.usuario.idusuario);
      if (facturaDeleted[0] === 0) {
        throw new ClientError("Factura no existe", 404);
      }
      log.debug(line(), "facturaDeleted:", facturaDeleted);
      return facturaDeleted;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, facturaDeleted);
};

export const getFacturaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturaMaster");
  const facturasMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);
      var facturasMaster: Record<string, any> = {};
      facturasMaster.riesgos = riesgos;
      var facturasMasterJSON = jsonUtils.sequelizeToJSON(facturasMaster);
      //jsonUtils.prettyPrint(facturasMasterJSON);
      var facturasMasterObfuscated = facturasMasterJSON;
      //jsonUtils.prettyPrint(facturasMasterObfuscated);
      var facturasMasterFiltered = jsonUtils.removeAttributesPrivates(facturasMasterObfuscated);
      //jsonUtils.prettyPrint(facturasMaster);
      return facturasMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, facturasMasterFiltered);
};

export const getFacturas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturas");
  //log.info(line(),req.session_user.usuario.idusuario);

  const facturasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const facturas = await facturaDao.getFacturas(tx, filter_estado);
      var facturasJson = jsonUtils.sequelizeToJSON(facturas);
      //log.info(line(),facturaObfuscated);

      //var facturasFiltered = jsonUtils.removeAttributes(facturasJson, ["score"]);
      //facturasFiltered = jsonUtils.removeAttributesPrivates(facturasFiltered);
      return facturasJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, facturasJson);
};
