import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as factoringfacturafactorDao from "#src/daos/factoringfacturafactor.prisma.Dao.js";
import * as facturaDao from "#src/daos/factura.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";

import * as yup from "yup";

import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import path from "path";

export const getFactoringfacturafactoresByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringfacturafactoresByFactoringid");
  const { factoringid } = req.params;
  const factoringfacturafactorSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = factoringfacturafactorSearchSchema.validateSync({ factoringid: factoringid, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "validated:", validated);

  const list = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, validated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + validated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringfacturafactores = await factoringfacturafactorDao.getFactoringfacturafactorsByIdfactoringAndVisibleCedente(tx, factoring.idfactoring, filter_estado);

      const factoringfacturafactoresFiltered = jsonUtils.removeAttributesPrivates(factoringfacturafactores);
      return factoringfacturafactoresFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, list);
};

export const downloadArchivoByArchivoid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadArchivoByArchivoid");
  const { archivoid } = req.params;
  const schema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = schema.validateSync({ archivoid }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "validated:", validated);

  const { rutaAbsoluta, nombreoriginal } = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO];
      const archivo = await archivoDao.getArchivoByArchivoid(tx, validated.archivoid);
      if (!archivo) {
        log.warn(line(), "Archivo no existe: [" + validated.archivoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factura = await facturaDao.getFacturaByIdarchivo(tx, archivo.idarchivo, filter_estado);
      if (!factura) {
        log.warn(line(), "Factura no existe: [" + archivo.idarchivo + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const archivoPath = path.join(storageUtils.STORAGE_PATH_SUCCESS, storageUtils.normalizarRuta(archivo.ruta), archivo.nombrealmacenamiento);
      log.debug(line(), "archivoPath:", archivoPath);

      const proyectoRutaAbsoluta = storageUtils.pathApp();
      log.debug(line(), "proyectoRutaAbsoluta:", proyectoRutaAbsoluta);

      const rutaAbsoluta = path.resolve(proyectoRutaAbsoluta, archivoPath);

      const tipoNombre = archivo.archivo_tipo?.nombre ? storageUtils.sanitizarNombreArchivo(archivo.archivo_tipo.nombre) : null;
      const serie = factura?.serie ? storageUtils.sanitizarNombreArchivo(factura.serie) : null;
      const numeroComprobante = factura?.numero_comprobante ? storageUtils.sanitizarNombreArchivo(factura.numero_comprobante) : null;

      const partes = [tipoNombre, serie, numeroComprobante].filter(Boolean);
      const nombreBase = partes.length > 0 ? partes.join("_") : storageUtils.sanitizarNombreArchivo(archivo.nombrereal);

      return {
        rutaAbsoluta,
        nombreoriginal: nombreBase + "." + archivo.extension,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );

  setDownloadHeaders(res, nombreoriginal);
  await sendFileAsync(req, res, rutaAbsoluta);
};
