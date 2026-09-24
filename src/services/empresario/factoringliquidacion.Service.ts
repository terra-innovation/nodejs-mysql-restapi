import * as factorcuentabancariaDao from "#root/src/daos/factorcuentabancaria.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringliquidacionDao from "#root/src/daos/factoringliquidacion.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import PDFGenerator from "#src/utils/document/PDFgenerator.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import * as fs from "fs";
import * as luxon from "luxon";
import path from "path";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface DownloadFactoringliquidacionPDFDto {
  factoringliquidacionid: string;
}

export interface GetFactoringliquidacionsByFactoringidDto {
  factoringid: string;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const generateFactoringliquidacionPDFService = async (dto: DownloadFactoringliquidacionPDFDto) => {
  log.debug(line(), "service::empresario::generateFactoringliquidacionPDFService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const factoringliquidacion = await factoringliquidacionDao.getFactoringliquidacionByFactoringliquidacionid(
        tx,
        dto.factoringliquidacionid,
      );
      if (!factoringliquidacion) {
        log.warn(line(), "Factoringliquidacion no existe: [" + dto.factoringliquidacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoring = await factoringDao.getFactoringByIdfactoring(tx, factoringliquidacion.idfactoring);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringliquidacion.idfactoring + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      // Generar el PDF
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

      const factura_codigo =
        factoring?.factoring_facturas[0]?.factura?.serie +
        "-" +
        factoring?.factoring_facturas[0]?.factura?.numero_comprobante;

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
        factura_codigo +
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

export const getFactoringliquidacionsByFactoringidService = async (
  dto: GetFactoringliquidacionsByFactoringidDto,
) => {
  log.debug(line(), "service::empresario::getFactoringliquidacionsByFactoringidService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + dto.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringliquidacions =
        await factoringliquidacionDao.getFactoringliquidacionsByIdfactoringAndVisisbleCendente(
          tx,
          factoring.idfactoring,
          filter_estado,
        );

      const factoringliquidacionsFiltered = jsonUtils.removeAttributesPrivates(factoringliquidacions);
      return factoringliquidacionsFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
