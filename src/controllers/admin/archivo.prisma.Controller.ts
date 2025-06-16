import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import type { archivo } from "#root/generated/prisma/ft_factoring/client.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as archivotipoDao from "#src/daos/archivotipo.prisma.Dao.js";
import * as archivoestadoDao from "#src/daos/archivoestado.prisma.Dao.js";
import * as distritoDao from "#src/daos/distrito.prisma.Dao.js";
import * as documentotipoDao from "#src/daos/documentotipo.prisma.Dao.js";
import * as generoDao from "#src/daos/genero.prisma.Dao.js";
import * as paisDao from "#src/daos/pais.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import * as storageUtils from "#src/utils/storageUtils.js";

import * as validacionesYup from "#src/utils/validacionesYup.js";

import * as fs from "fs";
import { unlink } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const cargarArchivo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::cargarArchivo");
  const archivoCreated = await prismaFT.client.$transaction(
    async (tx) => {
      const idusuario = req.session_user?.usuario?.idusuario;
      const archivoUploadSchema = yup
        .object()
        .shape({
          idusuario: yup.number().required(),
          archivo: yup
            .mixed()
            .concat(validacionesYup.fileRequeridValidation())
            .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024)),
          archivotipo_code: yup.string().trim().min(8).max(8),
        })
        .required();
      const archivoValidated = archivoUploadSchema.validateSync({ ...req.files, ...req.body, idusuario }, { abortEarly: false, stripUnknown: true });
      log.debug(line(), "archivoValidated:", archivoValidated);

      let idarchivotipo = 10; // Sin tipo
      if (archivoValidated.archivotipo_code) {
        const archivotipo = await archivotipoDao.getArchivotipoByCode(tx, archivoValidated.archivotipo_code);
        if (!archivotipo) {
          log.warn(line(), "Archivo tipo no existe: [" + archivoValidated.archivotipo_code + "]");
          throw new ClientError("Datos no válidos", 404);
        }
        idarchivotipo = archivotipo.idarchivotipo;
      }

      const { archivo } = archivoValidated;
      const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = archivo[0];
      const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
      const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
      fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
      fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

      const { codigo_archivo, originalname, size, mimetype, encoding, extension } = archivo[0];

      let archivoNuevo: Prisma.archivoCreateInput = {
        archivoid: uuidv4(),
        archivo_tipo: { connect: { idarchivotipo: idarchivotipo } },
        archivo_estado: { connect: { idarchivoestado: 1 } },
        codigo: codigo_archivo,
        nombrereal: originalname,
        nombrealmacenamiento: filename,
        ruta: carpetaDestino,
        tamanio: size,
        mimetype: mimetype,
        encoding: encoding,
        extension: extension,
        observacion: "",
        fechavencimiento: null,
        idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };
      const archivoCreated = await archivoDao.insertArchivo(tx, archivoNuevo);
      log.debug(line(), "archivoCreated:", archivoCreated);

      await unlink(archivoOrigen); // Eliminamos el archivo temporal

      return archivoCreated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, { archivoid: archivoCreated.archivoid });
};

export const descargarArchivo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::descargarArchivo");
  const { id } = req.params;
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync({ archivoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "archivoValidated:", archivoValidated);

  const rutaAbsoluta = await prismaFT.client.$transaction(
    async (tx) => {
      const archivo = await archivoDao.getArchivoByArchivoid(tx, archivoValidated.archivoid);
      if (archivo[0] === 0) {
        throw new ClientError("Archivo no existe", 404);
      }
      log.debug(line(), "archivo:", archivo);

      const archivoPath = path.join(storageUtils.STORAGE_PATH_SUCCESS, archivo.ruta, archivo.nombrealmacenamiento);
      // Obtener el directorio actual del archivo (como si fuera __dirname en CommonJS)
      const __filename = fileURLToPath(import.meta.url); // Convierte la URL a ruta de archivo
      const __dirname = path.dirname(__filename); // Obtiene el directorio del archivo
      log.debug(line(), "archivoPath:", archivoPath);
      log.debug(line(), "__dirname:", __dirname);
      log.debug(line(), "__filename:", __filename);

      const proyectoRutaAbsoluta = path.resolve(__dirname, "../../../");
      log.debug(line(), "proyectoRutaAbsoluta:", proyectoRutaAbsoluta);

      // Convierte la ruta relativa a una ruta absoluta
      const rutaAbsoluta = path.resolve(proyectoRutaAbsoluta, archivoPath);

      return rutaAbsoluta;
    },
    { timeout: prismaFT.transactionTimeout }
  );

  res.sendFile(rutaAbsoluta, (err) => {
    if (err) {
      log.error(line(), "Error al descargar el archivo:", err);
      res.status(500).send("Error");
    }
  });
};

export const activateArchivo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateArchivo");
  const { id } = req.params;
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync({ archivoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "archivoValidated:", archivoValidated);

  const archivoActivated = await prismaFT.client.$transaction(
    async (tx) => {
      const archivoActivated = await archivoDao.activateArchivo(tx, archivoValidated.archivoid, req.session_user.usuario.idusuario);
      if (archivoActivated[0] === 0) {
        throw new ClientError("Archivo no existe", 404);
      }
      log.debug(line(), "archivoActivated:", archivoActivated);
      return archivoActivated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, {});
};

export const deleteArchivo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteArchivo");
  const { id } = req.params;
  const archivoSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoSchema.validateSync({ archivoid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "archivoValidated:", archivoValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const archivo = await archivoDao.getArchivoByArchivoid(tx, archivoValidated.archivoid);
      if (!archivo) {
        log.warn(line(), "Archivo no existe: [" + archivoValidated.archivoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const archivoDeleted = await archivoDao.deleteArchivo(tx, archivoValidated.archivoid, req.session_user.usuario.idusuario);
      log.debug(line(), "archivoDeleted:", archivoDeleted);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, {});
};

export const getArchivoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getArchivoMaster");
  const archivoMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user?.usuario?.idusuario;
      const filter_estados = [1];
      const paises = await paisDao.getPaises(tx, filter_estados);
      const distritos = await distritoDao.getDistritos(tx, filter_estados);
      const documentotipos = await documentotipoDao.getDocumentotipos(tx, filter_estados);
      const generos = await generoDao.getGeneros(tx, filter_estados);

      let archivoMaster: Record<string, any> = {};
      archivoMaster.paises = paises;
      archivoMaster.distritos = distritos;
      archivoMaster.documentotipos = documentotipos;
      archivoMaster.generos = generos;

      let archivoMasterJSON = jsonUtils.sequelizeToJSON(archivoMaster);
      //jsonUtils.prettyPrint(archivoMasterJSON);
      let archivoMasterObfuscated = jsonUtils.ofuscarAtributosDefault(archivoMasterJSON);
      //jsonUtils.prettyPrint(archivoMasterObfuscated);
      let archivoMasterFiltered = jsonUtils.removeAttributesPrivates(archivoMasterObfuscated);
      //jsonUtils.prettyPrint(archivoMaster);
      return archivoMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, archivoMasterFiltered);
};

export const updateArchivo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateArchivo");
  const { id } = req.params;
  let NAME_REGX = /^[a-zA-Z ]+$/;
  const archivoUpdateSchema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
      archivotipoid: yup.string().trim().required().min(36).max(36),
      archivoestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivoValidated = archivoUpdateSchema.validateSync({ archivoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "archivoValidated:", archivoValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const archivo = await archivoDao.getArchivoByArchivoid(tx, archivoValidated.archivoid);
      if (!archivo) {
        log.warn(line(), "Archivo no existe: [" + archivoValidated.archivoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const archivotipo = await archivotipoDao.getArchivotipoByArchivotipoid(tx, archivoValidated.archivotipoid);
      if (!archivo) {
        log.warn(line(), "Archivotipo no existe: [" + archivoValidated.archivotipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const archivoestado = await archivoestadoDao.getArchivoestadoByArchivoestadoid(tx, archivoValidated.archivoestadoid);
      if (!archivo) {
        log.warn(line(), "Archivoestado no existe: [" + archivoValidated.archivoestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const archivoToUpdate: Prisma.archivoUpdateInput = {
        archivo_tipo: { connect: { idarchivotipo: archivotipo.idarchivotipo } },
        archivo_estado: { connect: { idarchivoestado: archivoestado.idarchivoestado } },
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const result = await archivoDao.updateArchivo(tx, archivoValidated.archivoid, archivoToUpdate);
      if (result[0] === 0) {
        throw new ClientError("Archivo no existe", 404);
      }
      const archivoUpdated = await archivoDao.getArchivoByArchivoid(tx, id);
      if (!archivoUpdated) {
        throw new ClientError("Archivo no existe", 404);
      }
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, {});
};

export const getArchivos = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getArchivos");
  const archivosJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const archivos = await archivoDao.getArchivos(tx, filter_estado);
      var archivosJson = jsonUtils.sequelizeToJSON(archivos);
      //log.info(line(),archivoObfuscated);

      //var archivosFiltered = jsonUtils.removeAttributes(archivosJson, ["score"]);
      //archivosFiltered = jsonUtils.removeAttributesPrivates(archivosFiltered);
      return archivosJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, archivosJson);
};
