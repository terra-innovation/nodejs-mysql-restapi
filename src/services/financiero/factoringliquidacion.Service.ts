import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as factorcuentabancariaDao from "#root/src/daos/factorcuentabancaria.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringliquidacionDao from "#root/src/daos/factoringliquidacion.Dao.js";
import * as factoringliquidacionestadoDao from "#root/src/daos/factoringliquidacionestado.Dao.js";
import * as financieroconceptoDao from "#root/src/daos/financieroconcepto.Dao.js";
import * as financierotipoDao from "#root/src/daos/financierotipo.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import * as emailService from "#root/src/providers/email/email.Provider.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import PDFGenerator from "#src/utils/document/PDFgenerator.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import * as fs from "fs";
import { unlink } from "fs/promises";
import * as luxon from "luxon";
import path from "path";

export const sendCorreoFactoringliquidacionService = async (factoringliquidacionid: string) => {
  log.debug(line(), "service::sendCorreoFactoringliquidacionService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringliquidacionExisted =
        await factoringliquidacionDao.getFactoringliquidacionByFactoringliquidacionid(tx, factoringliquidacionid);
      if (!factoringliquidacionExisted) {
        log.warn(line(), "Factoringliquidacion no existe: [" + factoringliquidacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoring_for_email = await factoringDao.getFactoringByIdfactoring(tx, factoringliquidacionExisted.idfactoring);
      if (!factoring_for_email) {
        log.warn(line(), "Factoring no existe: [" + factoringliquidacionExisted.idfactoring + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringliquidacion_for_email =
        await factoringliquidacionDao.getFactoringliquidacionByIdfactoringliquidacion(
          tx,
          factoringliquidacionExisted.idfactoringliquidacion,
        );
      const usuario_for_email = await usuarioDao.getUsuarioByEmail(tx, factoring_for_email.contacto_cedente.email);

      const factoringliquidacionObfuscated_for_email = jsonUtils.ofuscarAtributos(
        factoringliquidacion_for_email,
        ["numero", "cci"],
        jsonUtils.PATRON_OFUSCAR_CUENTA,
      );

      const paramsEmail = {
        factoring: factoring_for_email,
        factoringliquidacion: factoringliquidacionObfuscated_for_email,
        usuario: usuario_for_email,
      };

      // Generar el PDF
      const formattedDate = luxon.DateTime.now().toFormat("yyyyMMdd_HHmm");
      const filename =
        formattedDate +
        "_factoring_liquidacion_" +
        factoring_for_email.empresa_cedente.ruc +
        "_" +
        factoring_for_email.code +
        "_" +
        factoringliquidacionExisted.code +
        "_email" +
        ".pdf";
      const dirPath = path.join(
        storageUtils.pathApp(),
        storageUtils.STORAGE_PATH_PROCESAR,
        storageUtils.pathDate(new Date()),
      );
      const filePath = path.join(dirPath, filename);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const IDFACFOR = 1;
      const factorcuentasbancarias_for_pdf =
        await factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmoneda(
          tx,
          IDFACFOR,
          factoring_for_email.idmoneda,
          [ESTADO.ACTIVO],
        );

      let pdfGenerated = false;
      try {
        const pdfGenerator = new PDFGenerator(filePath);
        await pdfGenerator.generateFactoringliquidacion(
          factoring_for_email,
          factoringliquidacionExisted,
          factorcuentasbancarias_for_pdf,
        );
        pdfGenerated = true;

        const attachmentName =
          "Factoring_Liquidacion_" +
          factoring_for_email.empresa_cedente.ruc +
          "_" +
          factoring_for_email.code +
          "_" +
          factoringliquidacionExisted.code +
          ".pdf";
        const attachments = [
          {
            filename: attachmentName,
            path: filePath,
          },
        ];

        await emailService.sendFactoringEmpresaServicioFactoringCedenteNotificacionLiquidacion(
          usuario_for_email.email,
          paramsEmail,
          attachments,
        );
      } finally {
        if (pdfGenerated || fs.existsSync(filePath)) {
          await unlink(filePath);
        }
      }

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactoringliquidacionMasterByFactoringidService = async (factoringid: string) => {
  log.debug(line(), "service::getFactoringliquidacionMasterByFactoringidService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${factoringid}]`);
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
};

export const getFactoringliquidacionDetalleService = async (factoringliquidacionid: string) => {
  log.debug(line(), "service::getFactoringliquidacionDetalleService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const liquidacion = await factoringliquidacionDao.getFactoringliquidacionByFactoringliquidacionid(
        tx,
        factoringliquidacionid,
      );
      if (!liquidacion) {
        throw new ClientError("La liquidación no existe", 404);
      }

      return liquidacion;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactoringliquidacionByFactoringidService = async (factoringid: string) => {
  log.debug(line(), "service::getFactoringliquidacionByFactoringidService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringliquidaciones = await factoringliquidacionDao.getFactoringliquidacionsByIdfactoring(
        tx,
        factoring.idfactoring,
        filter_estado,
      );

      return factoringliquidaciones;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const generateFactoringliquidacionPDFService = async (factoringliquidacionid: string) => {
  log.debug(line(), "service::generateFactoringliquidacionPDFService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringliquidacion = await factoringliquidacionDao.getFactoringliquidacionByFactoringliquidacionid(
        tx,
        factoringliquidacionid,
      );
      if (!factoringliquidacion) {
        log.warn(line(), "Factoringliquidacion no existe: [" + factoringliquidacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoring = await factoringDao.getFactoringByIdfactoring(tx, factoringliquidacion.idfactoring);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringliquidacion.idfactoring + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const formattedDate = luxon.DateTime.now().toFormat("yyyyMMdd_HHmm");
      const filename =
        formattedDate +
        "_factoring_liquidacion_" +
        factoring.empresa_cedente.ruc +
        "_" +
        factoringliquidacion.code +
        ".pdf";
      const dirPath = path.join(
        storageUtils.pathApp(),
        storageUtils.STORAGE_PATH_PROCESAR,
        storageUtils.pathDate(new Date()),
      );
      const filePath = path.join(dirPath, filename);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const IDFACFOR = 1;
      const factorcuentasbancarias_for_pdf =
        await factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmoneda(
          tx,
          IDFACFOR,
          factoring.idmoneda,
          [ESTADO.ACTIVO],
        );

      const pdfGenerator = new PDFGenerator(filePath);
      await pdfGenerator.generateFactoringliquidacion(factoring, factoringliquidacion, factorcuentasbancarias_for_pdf);

      const filenameDownload =
        "Factoring_Liquidacion_" +
        factoring.empresa_cedente.ruc +
        "_" +
        factoringliquidacion.code +
        "_" +
        formattedDate +
        ".pdf";

      return {
        filePath,
        filenameDownload,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
