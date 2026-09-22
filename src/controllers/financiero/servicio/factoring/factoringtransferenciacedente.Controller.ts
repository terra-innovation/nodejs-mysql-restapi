import * as empresacuentabancariaDao from "#root/src/daos/empresacuentabancaria.Dao.js";
import * as factorcuentabancariaDao from "#root/src/daos/factorcuentabancaria.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringtransferenciacedenteDao from "#root/src/daos/factoringtransferenciacedente.Dao.js";
import * as factoringtransferenciaestadoDao from "#root/src/daos/factoringtransferenciaestado.Dao.js";
import * as factoringtransferenciatipoDao from "#root/src/daos/factoringtransferenciatipo.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as emailService from "#root/src/services/email.Service.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";

import * as yup from "yup";

export const sendCorreoFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendCorreoFactoringtransferenciacedente");
  const session_idusuario = req.session_user.usuario.idusuario;
  const { id } = req.params;
  const factoringtransferenciacedenteUpdateSchema = yup
    .object()
    .shape({
      factoringtransferenciacedenteid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteUpdateSchema.validateSync({ factoringtransferenciacedenteid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedenteSent = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringtransferenciacedenteExisted = await factoringtransferenciacedenteDao.getFactoringtransferenciacedenteByFactoringtransferenciacedenteid(tx, factoringtransferenciacedenteValidated.factoringtransferenciacedenteid);
      if (!factoringtransferenciacedenteExisted) {
        log.warn(line(), "Factoringtransferenciacedente no existe: [" + factoringtransferenciacedenteValidated.factoringtransferenciacedenteid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      // Enviamos correo electrónico
      const factoring_for_email = await factoringDao.getFactoringByIdfactoring(tx, factoringtransferenciacedenteExisted.idfactoring);
      const factoringtransferenciacedente_for_email = await factoringtransferenciacedenteDao.getFactoringtransferenciacedenteByIdfactoringtransferenciacedente(tx, factoringtransferenciacedenteExisted.idfactoringtransferenciacedente);
      const usuario_for_email = await usuarioDao.getUsuarioByEmail(tx, factoring_for_email.contacto_cedente.email);

      const factoringtransferenciacedenteObfuscated_for_email = jsonUtils.ofuscarAtributos(factoringtransferenciacedente_for_email, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);

      var paramsEmail = {
        factoring: factoring_for_email,
        factoringtransferenciacedente: factoringtransferenciacedenteObfuscated_for_email,
        usuario: usuario_for_email,
      };
      await emailService.sendFactoringEmpresaServicioFactoringCedenteConfirmacionTransferencia(usuario_for_email.email, paramsEmail);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );

  response(res, 200, {});
};

export const getFactoringtransferenciacedentesByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringtransferenciacedentesByFactoringid");
  //log.info(line(),req.session_user.usuario.idusuario);
  const { id } = req.params;
  const factoringtransferenciacedenteSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedentesJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringtransferenciacedenteValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringtransferenciacedenteValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciacedentes = await factoringtransferenciacedenteDao.getFactoringtransferenciacedentesByIdfactoring(tx, factoring.idfactoring, filter_estado);

      return factoringtransferenciacedentes;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringtransferenciacedentesJson);
};

export const getFactoringtransferenciacedenteMasterByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringtransferenciacedenteMaster");
  const { factoringid } = req.params;
  const factoringtransferenciacedenteSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSchema.validateSync({ factoringid: factoringid }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedentesMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringtransferenciacedenteValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringtransferenciacedenteValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciatipos = await factoringtransferenciatipoDao.getFactoringtransferenciatipos(tx, filter_estados);
      const factoringtransferenciaestados = await factoringtransferenciaestadoDao.getFactoringtransferenciaestados(tx, filter_estados);

      const factorcuentasbancarias = await factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmoneda(tx, factoring.idfactor, factoring.idmoneda, filter_estados);
      const cedentecuentasbancarias = await empresacuentabancariaDao.getEmpresacuentabancariasByIdempresaIdmoneda(tx, factoring.idcedente, factoring.idmoneda, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);

      var factoringtransferenciacedentesMaster: Record<string, any> = {};

      factoringtransferenciacedentesMaster.factoringtransferenciatipos = factoringtransferenciatipos;
      factoringtransferenciacedentesMaster.factoringtransferenciaestados = factoringtransferenciaestados;
      factoringtransferenciacedentesMaster.factorcuentasbancarias = factorcuentasbancarias;
      factoringtransferenciacedentesMaster.cedentecuentasbancarias = cedentecuentasbancarias;
      factoringtransferenciacedentesMaster.monedas = monedas;

      return factoringtransferenciacedentesMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringtransferenciacedentesMasterFiltered);
};
