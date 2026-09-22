import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringestrategiaDao from "#root/src/daos/factoringestrategia.Dao.js";
import * as factoringpropuestaDao from "#root/src/daos/factoringpropuesta.Dao.js";
import * as factoringpropuestaestadoDao from "#root/src/daos/factoringpropuestaestado.Dao.js";
import * as factoringtipoDao from "#root/src/daos/factoringtipo.Dao.js";
import * as riesgoDao from "#root/src/daos/riesgo.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";

import * as luxon from "luxon";
import * as yup from "yup";

import PDFGenerator from "#src/utils/document/PDFgenerator.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import * as fs from "fs";
import { unlink } from "fs/promises";
import path from "path"; // Para eliminar el archivo después de enviarlo

export const downloadFactoringpropuestaPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringpropuestaPDF");
  const { id } = req.params;
  const factoringpropuestaUpdateSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.validateSync({ factoringpropuestaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(tx, factoringpropuestaValidated.factoringpropuestaid);
      if (!factoringpropuesta) {
        log.warn(line(), "Factoringpropuesta no existe: [" + factoringpropuestaValidated.factoringpropuestaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoring = await factoringDao.getFactoringByIdfactoring(tx, factoringpropuesta.idfactoring);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringpropuesta.idfactoring + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      // Generar el PDF
      const formattedDate = luxon.DateTime.now().toFormat("yyyyMMdd_HHmm");
      const filename = formattedDate + "_factoring_propuesta_" + factoring.empresa_cedente.ruc + "_" + factoringpropuesta.code + ".pdf";
      const dirPath = path.join(storageUtils.pathApp(), storageUtils.STORAGE_PATH_PROCESAR, storageUtils.pathDate(new Date()));
      const filePath = path.join(dirPath, filename);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const pdfGenerator = new PDFGenerator(filePath);
      await pdfGenerator.generateFactoringPropuesta(factoring, factoringpropuesta);

      let filenameDownload = "Factoring_Propuesta_" + factoring.empresa_cedente.ruc + "_" + factoringpropuesta.code + "_" + formattedDate + ".pdf";

      // res.setHeader("Content-Disposition", 'attachment; filename="' + filenameDownload + '"');

      setDownloadHeaders(res, filenameDownload);
      await sendFileAsync(req, res, filePath);
      await unlink(filePath);
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactoringpropuestasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestasByFactoringid");
  //log.info(line(),req.session_user.usuario.idusuario);
  const { id } = req.params;
  const factoringpropuestaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const factoringpropuestasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringpropuestaValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringpropuestaValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuestas = await factoringpropuestaDao.getFactoringpropuestasByIdfactoring(tx, factoring.idfactoring, filter_estado);

      return factoringpropuestas;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringpropuestasJson);
};

export const getFactoringpropuestaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestaMaster");
  const factoringpropuestasMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);
      const factoringtipos = await factoringtipoDao.getFactoringtipos(tx, filter_estados);
      const factoringestrategias = await factoringestrategiaDao.getFactoringestrategias(tx, filter_estados);
      const factoringpropuestaestados = await factoringpropuestaestadoDao.getFactoringpropuestaestados(tx, filter_estados);

      var factoringpropuestasMaster: Record<string, any> = {};
      factoringpropuestasMaster.riesgos = riesgos;
      factoringpropuestasMaster.factoringtipos = factoringtipos;
      factoringpropuestasMaster.factoringestrategias = factoringestrategias;
      factoringpropuestasMaster.factoringpropuestaestados = factoringpropuestaestados;

      return factoringpropuestasMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringpropuestasMasterFiltered);
};

export const getFactoringpropuestas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestas");
  //log.info(line(),req.session_user.usuario.idusuario);

  const factoringpropuestasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const factoringpropuestas = await factoringpropuestaDao.getFactoringpropuestas(tx, filter_estado);

      return factoringpropuestas;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringpropuestasJson);
};
