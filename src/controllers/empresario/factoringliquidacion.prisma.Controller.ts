import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as factoringliquidacionDao from "#src/daos/factoringliquidacion.prisma.Dao.js";
import * as factorcuentabancariaDao from "#src/daos/factorcuentabancaria.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";

import * as yup from "yup";

import PDFGenerator from "#src/utils/document/PDFgenerator.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import * as fs from "fs";
import { unlink } from "fs/promises";
import * as luxon from "luxon";
import path from "path";

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

      var factura_codigo = factoring?.factoring_facturas[0].factura.serie + "-" + factoring?.factoring_facturas[0].factura.numero_comprobante;

      const IDFACFOR = 1;
      const factorcuentasbancarias_for_pdf = await factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmoneda(tx, IDFACFOR, factoring.idmoneda, [ESTADO.ACTIVO]);

      const pdfGenerator = new PDFGenerator(filePath);
      await pdfGenerator.generateFactoringliquidacion(factoring, factoringliquidacion, factorcuentasbancarias_for_pdf);

      let filenameDownload = "Factoring_Liquidacion_" + factoring.empresa_cedente.ruc + "_" + factura_codigo + "_" + formattedDate + ".pdf";

      setDownloadHeaders(res, filenameDownload);
      await sendFileAsync(req, res, filePath);
      await unlink(filePath);
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactoringliquidacionsByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionsByFactoringid");
  //log.info(line(),req.session_user.usuario.idusuario);
  const { factoringid } = req.params;
  const factoringliquidacionSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringliquidacionValidated = factoringliquidacionSearchSchema.validateSync({ factoringid: factoringid, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringliquidacionValidated:", factoringliquidacionValidated);

  const factoringliquidacionsJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringliquidacionValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringliquidacionValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringliquidacions = await factoringliquidacionDao.getFactoringliquidacionsByIdfactoringAndVisisbleCendente(tx, factoring.idfactoring, filter_estado);

      var factoringliquidacionsFiltered = jsonUtils.removeAttributesPrivates(factoringliquidacions);
      return factoringliquidacionsFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringliquidacionsJson);
};
