import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringestrategiaDao from "#root/src/daos/factoringestrategia.Dao.js";
import * as factoringpropuestaDao from "#root/src/daos/factoringpropuesta.Dao.js";
import * as factoringpropuestaestadoDao from "#root/src/daos/factoringpropuestaestado.Dao.js";
import * as factoringtipoDao from "#root/src/daos/factoringtipo.Dao.js";
import * as riesgoDao from "#root/src/daos/riesgo.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import PDFGenerator from "#src/utils/document/PDFgenerator.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import * as fs from "fs";
import * as luxon from "luxon";
import path from "path";

export const generateFactoringpropuestaPDFService = async (factoringpropuestaid: string) => {
  log.debug(line(), "service::generateFactoringpropuestaPDFService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(
        tx,
        factoringpropuestaid,
      );
      if (!factoringpropuesta) {
        log.warn(line(), "Factoringpropuesta no existe: [" + factoringpropuestaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoring = await factoringDao.getFactoringByIdfactoring(tx, factoringpropuesta.idfactoring);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringpropuesta.idfactoring + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      // Generar el PDF
      const formattedDate = luxon.DateTime.now().toFormat("yyyyMMdd_HHmm");
      const filename =
        formattedDate +
        "_factoring_propuesta_" +
        factoring.empresa_cedente.ruc +
        "_" +
        factoringpropuesta.code +
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

      const pdfGenerator = new PDFGenerator(filePath);
      await pdfGenerator.generateFactoringPropuesta(factoring, factoringpropuesta);

      const filenameDownload =
        "Factoring_Propuesta_" +
        factoring.empresa_cedente.ruc +
        "_" +
        factoringpropuesta.code +
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

export const getFactoringpropuestasByFactoringidService = async (factoringid: string) => {
  log.debug(line(), "service::getFactoringpropuestasByFactoringidService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestas = await factoringpropuestaDao.getFactoringpropuestasByIdfactoring(
        tx,
        factoring.idfactoring,
        filter_estado,
      );

      return factoringpropuestas;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactoringpropuestaMasterService = async () => {
  log.debug(line(), "service::getFactoringpropuestaMasterService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);
      const factoringtipos = await factoringtipoDao.getFactoringtipos(tx, filter_estados);
      const factoringestrategias = await factoringestrategiaDao.getFactoringestrategias(tx, filter_estados);
      const factoringpropuestaestados = await factoringpropuestaestadoDao.getFactoringpropuestaestados(
        tx,
        filter_estados,
      );

      const factoringpropuestasMaster: Record<string, any> = {
        riesgos,
        factoringtipos,
        factoringestrategias,
        factoringpropuestaestados,
      };

      return factoringpropuestasMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactoringpropuestasService = async () => {
  log.debug(line(), "service::getFactoringpropuestasService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const factoringpropuestas = await factoringpropuestaDao.getFactoringpropuestas(tx, filter_estado);
      return factoringpropuestas;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
