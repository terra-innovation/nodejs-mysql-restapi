import * as factorcuentabancariaDao from "#root/src/daos/factorcuentabancaria.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringliquidacionDao from "#root/src/daos/factoringliquidacion.Dao.js";
import * as factoringliquidacionestadoDao from "#root/src/daos/factoringliquidacionestado.Dao.js";
import * as financieroconceptoDao from "#root/src/daos/financieroconcepto.Dao.js";
import * as financierotipoDao from "#root/src/daos/financierotipo.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import PDFGenerator from "#src/utils/document/PDFgenerator.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import { Request, Response } from "express";
import * as fs from "fs";
import { unlink } from "fs/promises";
import * as luxon from "luxon";
import path from "path";
import * as yup from "yup";

import * as emailService from "#root/src/services/email.Service.js";

export const sendCorreoFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendCorreoFactoringliquidacion");
  const session_idusuario = req.session_user.usuario.idusuario;
  const { id } = req.params;
  const factoringliquidacionUpdateSchema = yup
    .object()
    .shape({
      factoringliquidacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringliquidacionValidated = factoringliquidacionUpdateSchema.validateSync({ factoringliquidacionid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringliquidacionValidated:", factoringliquidacionValidated);

  const factoringliquidacionSent = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringliquidacionExisted = await factoringliquidacionDao.getFactoringliquidacionByFactoringliquidacionid(tx, factoringliquidacionValidated.factoringliquidacionid);
      if (!factoringliquidacionExisted) {
        log.warn(line(), "Factoringliquidacion no existe: [" + factoringliquidacionValidated.factoringliquidacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      // Enviamos correo electrónico
      const factoring_for_email = await factoringDao.getFactoringByIdfactoring(tx, factoringliquidacionExisted.idfactoring);
      if (!factoring_for_email) {
        log.warn(line(), "Factoring no existe: [" + factoringliquidacionExisted.idfactoring + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringliquidacion_for_email = await factoringliquidacionDao.getFactoringliquidacionByIdfactoringliquidacion(tx, factoringliquidacionExisted.idfactoringliquidacion);
      const usuario_for_email = await usuarioDao.getUsuarioByEmail(tx, factoring_for_email.contacto_cedente.email);

      const factoringliquidacionObfuscated_for_email = jsonUtils.ofuscarAtributos(factoringliquidacion_for_email, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);

      var paramsEmail = {
        factoring: factoring_for_email,
        factoringliquidacion: factoringliquidacionObfuscated_for_email,
        usuario: usuario_for_email,
      };

      // Generar el PDF
      const formattedDate = luxon.DateTime.now().toFormat("yyyyMMdd_HHmm");
      const filename = formattedDate + "_factoring_liquidacion_" + factoring_for_email.empresa_cedente.ruc + "_" + factoring_for_email.code + "_" + factoringliquidacionExisted.code + "_email" + ".pdf";
      const dirPath = path.join(storageUtils.pathApp(), storageUtils.STORAGE_PATH_PROCESAR, storageUtils.pathDate(new Date()));
      const filePath = path.join(dirPath, filename);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const IDFACFOR = 1;
      const factorcuentasbancarias_for_pdf = await factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmoneda(tx, IDFACFOR, factoring_for_email.idmoneda, [ESTADO.ACTIVO]);

      let pdfGenerated = false;
      try {
        const pdfGenerator = new PDFGenerator(filePath);
        await pdfGenerator.generateFactoringliquidacion(factoring_for_email, factoringliquidacionExisted, factorcuentasbancarias_for_pdf);
        pdfGenerated = true;

        const attachmentName = "Factoring_Liquidacion_" + factoring_for_email.empresa_cedente.ruc + "_" + factoring_for_email.code + "_" + factoringliquidacionExisted.code + ".pdf";
        const attachments = [
          {
            filename: attachmentName,
            path: filePath,
          },
        ];

        await emailService.sendFactoringEmpresaServicioFactoringCedenteNotificacionLiquidacion(usuario_for_email.email, paramsEmail, attachments);
      } finally {
        if (pdfGenerated || fs.existsSync(filePath)) {
          await unlink(filePath);
        }
      }

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );

  response(res, 200, {});
};

export const getFactoringliquidacionMasterByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionMasterByFactoringid");

  const { factoringid } = req.params;
  const usuarioservicioSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringliquidacionValidated = usuarioservicioSchema.validateSync({ factoringid }, { abortEarly: false, stripUnknown: true });

  const result = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, factoringliquidacionValidated.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${factoringliquidacionValidated.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const idbanco_factor = 1;
      const idbanco_cedente = factoring.cuenta_bancaria.idbanco;

      const estados = await factoringliquidacionestadoDao.getFactoringliquidacionestados(tx, filter_estados);
      const tipos = await financierotipoDao.getFinancierotipos(tx, filter_estados);
      const conceptos = await financieroconceptoDao.getFinancieroconceptosForLiquidacion(tx, filter_estados);

      const master = {
        factoringliquidacionestados: estados,
        financierotipos: tipos,
        financieroconceptos: conceptos,
        mismo_banco: idbanco_factor == idbanco_cedente,
      };

      return master;
    },
    { timeout: prismaFT.transactionTimeout },
  );

  response(res, 200, result);
};

export const getFactoringliquidacionDetalle = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionDetalle");
  const { factoringliquidacionid } = req.params;
  const schema = yup
    .object()
    .shape({
      factoringliquidacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = schema.validateSync({ factoringliquidacionid }, { abortEarly: false, stripUnknown: true });

  const result = await prismaFT.client.$transaction(
    async (tx) => {
      const liquidacion = await factoringliquidacionDao.getFactoringliquidacionByFactoringliquidacionid(tx, validated.factoringliquidacionid);
      if (!liquidacion) {
        throw new ClientError("La liquidación no existe", 404);
      }

      return liquidacion;
    },
    { timeout: prismaFT.transactionTimeout },
  );

  response(res, 200, result);
};

export const getFactoringliquidacionByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionByFactoringid");
  const { factoringid } = req.params;
  const factoringliquidacionSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringliquidacionValidated = factoringliquidacionSearchSchema.validateSync({ factoringid: factoringid, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringliquidacionValidated:", factoringliquidacionValidated);

  const factoringliquidacionesJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringliquidacionValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringliquidacionValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringliquidaciones = await factoringliquidacionDao.getFactoringliquidacionsByIdfactoring(tx, factoring.idfactoring, filter_estado);

      return factoringliquidaciones;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 200, factoringliquidacionesJson);
};

export const downloadFactoringliquidacionPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringliquidacionPDF");
  const { factoringliquidacionid } = req.params;
  const schema = yup
    .object()
    .shape({
      factoringliquidacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = schema.validateSync({ factoringliquidacionid }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "validated:", validated);

  await prismaFT.client.$transaction(
    async (tx) => {
      var factoringliquidacion = await factoringliquidacionDao.getFactoringliquidacionByFactoringliquidacionid(tx, validated.factoringliquidacionid);
      if (!factoringliquidacion) {
        log.warn(line(), "Factoringliquidacion no existe: [" + validated.factoringliquidacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoring = await factoringDao.getFactoringByIdfactoring(tx, factoringliquidacion.idfactoring);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringliquidacion.idfactoring + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      // Generar el PDF
      const formattedDate = luxon.DateTime.now().toFormat("yyyyMMdd_HHmm");
      const filename = formattedDate + "_factoring_liquidacion_" + factoring.empresa_cedente.ruc + "_" + factoringliquidacion.code + ".pdf";
      const dirPath = path.join(storageUtils.pathApp(), storageUtils.STORAGE_PATH_PROCESAR, storageUtils.pathDate(new Date()));
      const filePath = path.join(dirPath, filename);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const IDFACFOR = 1;
      const factorcuentasbancarias_for_pdf = await factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmoneda(tx, IDFACFOR, factoring.idmoneda, [ESTADO.ACTIVO]);

      const pdfGenerator = new PDFGenerator(filePath);
      await pdfGenerator.generateFactoringliquidacion(factoring, factoringliquidacion, factorcuentasbancarias_for_pdf);

      let filenameDownload = "Factoring_Liquidacion_" + factoring.empresa_cedente.ruc + "_" + factoringliquidacion.code + "_" + formattedDate + ".pdf";

      setDownloadHeaders(res, filenameDownload);
      await sendFileAsync(req, res, filePath);
      await unlink(filePath);
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
