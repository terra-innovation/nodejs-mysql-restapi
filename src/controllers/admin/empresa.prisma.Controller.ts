import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as bancoDao from "#src/daos/banco.prisma.Dao.js";
import * as cuentatipoDao from "#src/daos/cuentatipo.prisma.Dao.js";
import * as riesgoDao from "#src/daos/riesgo.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import type { empresa } from "#src/models/prisma/ft_factoring/client";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const activateEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateEmpresa");
  const { id } = req.params;
  const empresaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresaValidated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresaValidated:", empresaValidated);

  const empresaToActivated = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAuditoria: Partial<empresa> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario.idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 1;

      const $Activated = await empresaDao.activateEmpresa(tx, empresaValidated.empresaid, req.session_user.usuario.idusuario);
      if (empresaToActivated[0] === 0) {
        throw new ClientError("Empresa no existe", 404);
      }
      log.debug(line(), "empresaActivated:", empresaToActivated);
      return empresaToActivated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, empresaToActivated);
};

export const deleteEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteEmpresa");
  const { id } = req.params;
  const empresaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresaValidated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresaValidated:", empresaValidated);

  const empresaDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      const empresaDeleted = await empresaDao.deleteEmpresa(tx, empresaValidated.empresaid, req.session_user.usuario.idusuario);
      if (empresaDeleted[0] === 0) {
        throw new ClientError("Empresa no existe", 404);
      }
      log.debug(line(), "empresaDeleted:", empresaDeleted);
      return empresaDeleted;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, empresaDeleted);
};

export const getEmpresaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresaMaster");
  const empresasMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);
      var empresasMaster: Record<string, any> = {};
      empresasMaster.riesgos = riesgos;
      var empresasMasterJSON = jsonUtils.sequelizeToJSON(empresasMaster);
      //jsonUtils.prettyPrint(empresasMasterJSON);
      var empresasMasterObfuscated = empresasMasterJSON;
      //jsonUtils.prettyPrint(empresasMasterObfuscated);
      var empresasMasterFiltered = jsonUtils.removeAttributesPrivates(empresasMasterObfuscated);
      //jsonUtils.prettyPrint(empresasMaster);
      return empresasMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, empresasMasterFiltered);
};

export const updateEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateEmpresa");
  const { id } = req.params;
  const empresaUpdateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      riesgoid: yup.string().trim().required().min(36).max(36),
      razon_social: yup.string().trim().required().min(2).max(200),
      nombre_comercial: yup.string().min(2).max(200),
      domicilio_fiscal: yup.string().required().min(2).max(200),
    })
    .required();
  const empresaValidated = empresaUpdateSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresaValidated:", empresaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var riesgo = await riesgoDao.getRiesgoByRiesgoid(tx, empresaValidated.riesgoid);
      if (!riesgo) {
        log.warn(line(), "Riesgo no existe: [" + empresaValidated.riesgoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var empresa = await empresaDao.getEmpresaByEmpresaid(tx, empresaValidated.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + empresaValidated.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const empresaToUpdate: Prisma.empresaUpdateInput = {
        riesgo: { connect: { idriesgo: riesgo.idriesgo } },
        razon_social: empresaValidated.razon_social,
        nombre_comercial: empresaValidated.nombre_comercial,
        domicilio_fiscal: empresaValidated.domicilio_fiscal,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const empresaUpdated = await empresaDao.updateEmpresa(tx, empresaValidated.empresaid, empresaToUpdate);
      log.debug(line(), "empresaUpdated:", empresaUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, { ...empresaValidated });
};

export const getEmpresas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresas");
  //log.info(line(),req.session_user.usuario.idusuario);

  const empresasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const empresas = await empresaDao.getEmpresas(tx, filter_estado);
      var empresasJson = jsonUtils.sequelizeToJSON(empresas);
      //log.info(line(),empresaObfuscated);

      //var empresasFiltered = jsonUtils.removeAttributes(empresasJson, ["score"]);
      //empresasFiltered = jsonUtils.removeAttributesPrivates(empresasFiltered);
      return empresasJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, empresasJson);
};

export const createEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createEmpresa");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [1, 2];
  const empresaCreateSchema = yup
    .object()
    .shape({
      riesgoid: yup.string().trim().required().min(36).max(36),
      ruc: yup
        .string()
        .trim()
        .matches(/^\d{11}$/, "RUC debe ser un número de exactamente 11 dígitos")
        .required(),
      razon_social: yup.string().trim().required().min(2).max(200),
      nombre_comercial: yup.string().min(2).max(200),
      domicilio_fiscal: yup.string().required().min(2).max(200),
    })
    .required();
  var empresaValidated = empresaCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresaValidated:", empresaValidated);

  const empresaCreated = await prismaFT.client.$transaction(
    async (tx) => {
      var riesgo = await riesgoDao.getRiesgoByRiesgoid(tx, empresaValidated.riesgoid);
      if (!riesgo) {
        log.warn(line(), "Riesgo no existe: [" + empresaValidated.riesgoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var empresas_por_ruc = await empresaDao.getEmpresaByRuc(tx, empresaValidated.ruc);
      if (empresas_por_ruc) {
        log.warn(line(), "La empresa [" + empresaValidated.ruc + "] se encuentra registrada. Ingrese un ruc diferente.");
        throw new ClientError("La empresa [" + empresaValidated.ruc + "] se encuentra registrada. Ingrese un ruc diferente.", 404);
      }

      const empresaCreate = {
        idriesgo: riesgo.idriesgo,
        empresaid: uuidv4(),
        code: uuidv4().split("-")[0],
        ruc: empresaValidated.ruc,
        razon_social: empresaValidated.razon_social,
        nombre_comercial: empresaValidated.nombre_comercial,
        domicilio_fiscal: empresaValidated.domicilio_fiscal,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const empresaCreated = await empresaDao.insertEmpresa(tx, empresaCreate);

      return empresaCreated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, empresaCreated);
};
