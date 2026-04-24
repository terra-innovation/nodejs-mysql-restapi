import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as archivotipoDao from "#src/daos/archivotipo.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import { Request, Response } from "express";

import * as fs from "fs";
import { unlink } from "fs/promises";
import path from "path";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { fileTypeFromFile } from "file-type";

export const cargarArchivo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::cargarArchivo");

  // 1. Extraer archivo del request (Multer lo pone en req.files)
  let archivoRaw: any;
  if (req.files && !Array.isArray(req.files) && "archivo" in req.files) {
    archivoRaw = req.files.archivo?.[0];
  }

  if (!archivoRaw) {
    throw new ClientError("Archivo es requerido", 400);
  }

  const archivoOrigen = archivoRaw.path;

  try {
    const archivoCreated = await prismaFT.client.$transaction(
      async (tx) => {
        const idusuario = req.session_user?.usuario?.idusuario;
        const archivoUploadSchema = yup
          .object()
          .shape({
            idusuario: yup.number().required(),
            archivotipo_code: yup.string().trim().min(8).max(8),
          })
          .required();

        // Validamos solo el body y idusuario aquí, el archivo lo validamos dinámicamente luego
        const bodyValidated = archivoUploadSchema.validateSync({ ...req.body, idusuario }, { abortEarly: false, stripUnknown: true });
        log.debug(line(), "bodyValidated:", bodyValidated);

        // 2. Obtener configuración del tipo de archivo desde la BBDD
        let archivotipo: any;
        if (bodyValidated.archivotipo_code) {
          archivotipo = await archivotipoDao.getArchivotipoByCode(tx, bodyValidated.archivotipo_code);
          if (!archivotipo) {
            log.warn(line(), "Archivo tipo no existe: [" + bodyValidated.archivotipo_code + "]");
            throw new ClientError("Tipo de archivo no válido", 404);
          }
        } else {
          // Fallback al ID 10 (Sin tipo) si no se especifica código
          archivotipo = await archivotipoDao.getArchivotipoByIdarchivotipo(tx, 10);
          if (!archivotipo) {
            log.error(line(), "Configuración por defecto (ID 10) no encontrada");
            throw new ClientError("Error de configuración del sistema", 500);
          }
        }

        // 3. Validaciones Dinámicas (BBDD + Seguridad)
        const { size, originalname, mimetype: mimeMulter } = archivoRaw;
        const extension = path.extname(originalname).toLowerCase();

        // A. Validar Tamaño Máximo
        if (archivotipo.tamanio_maximo && size > Number(archivotipo.tamanio_maximo)) {
          log.warn(line(), `Archivo excede tamaño: ${size} > ${archivotipo.tamanio_maximo}`);
          throw new ClientError(`El archivo excede el límite de ${Number(archivotipo.tamanio_maximo) / 1024 / 1024}MB`, 400);
        }

        // B. Validar Extensión Permitida
        if (archivotipo.extensiones_permitidas) {
          const permitidas = archivotipo.extensiones_permitidas
            .toLowerCase()
            .split(",")
            .map((e) => e.trim());
          if (!permitidas.includes(extension)) {
            log.warn(line(), `Extensión no permitida: ${extension} para ${archivotipo.nombre}`);
            throw new ClientError(`La extensión ${extension} no está permitida`, 400);
          }
        }

        // C. Validar Mimetype Real (Magic Numbers)
        const tipoDetectado = await fileTypeFromFile(archivoOrigen);
        const mimeReal = tipoDetectado ? tipoDetectado.mime : mimeMulter;

        if (archivotipo.mimetypes_permitidos) {
          const mimesValidos = archivotipo.mimetypes_permitidos.split(",").map((m) => m.trim());
          if (!mimesValidos.includes(mimeReal)) {
            log.error(line(), `Falsificación detectada: Contenido real [${mimeReal}] no coincide con permitido para ${archivotipo.nombre}`);
            throw new ClientError("El contenido del archivo no está permitido", 400);
          }
        }

        // 4. Almacenamiento Final
        const { anio_upload, mes_upload, dia_upload, filename, encoding, codigo_archivo } = archivoRaw;
        const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
        const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename);

        fs.mkdirSync(path.dirname(rutaDestino), { recursive: true });
        fs.copyFileSync(archivoOrigen, rutaDestino);

        // 5. Registro en Base de Datos
        let archivoNuevo: Prisma.archivoCreateInput = {
          archivoid: uuidv4(),
          archivo_tipo: { connect: { idarchivotipo: archivotipo.idarchivotipo } },
          archivo_estado: { connect: { idarchivoestado: 1 } },
          codigo: codigo_archivo,
          nombrereal: originalname,
          nombrealmacenamiento: filename,
          ruta: carpetaDestino,
          tamanio: size,
          mimetype: mimeReal,
          encoding: encoding,
          extension: extension.replace(".", ""),
          observacion: "",
          fechavencimiento: null,
          idusuariocrea: idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const archivoCreated = await archivoDao.insertArchivo(tx, archivoNuevo);
        log.debug(line(), "archivoCreated:", archivoCreated);

        await unlink(archivoOrigen); // Eliminamos el archivo temporal tras el éxito
        return archivoCreated;
      },
      { timeout: prismaFT.transactionTimeout },
    );

    response(res, 200, { archivoid: archivoCreated.archivoid });
  } catch (error) {
    // Limpieza de emergencia: si algo falla, nos aseguramos de borrar el temporal
    if (fs.existsSync(archivoOrigen)) {
      await unlink(archivoOrigen).catch((e) => log.error(line(), "Error al borrar temporal:", e));
    }
    throw error;
  }
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

      const archivoPath = path.join(storageUtils.STORAGE_PATH_SUCCESS, storageUtils.normalizarRuta(archivo.ruta), archivo.nombrealmacenamiento);
      log.debug(line(), "archivoPath:", archivoPath);

      const proyectoRutaAbsoluta = storageUtils.pathApp(); // raíz del proyecto
      log.debug(line(), "proyectoRutaAbsoluta:", proyectoRutaAbsoluta);

      // Convierte la ruta relativa a una ruta absoluta
      const rutaAbsoluta = path.resolve(proyectoRutaAbsoluta, archivoPath);

      return rutaAbsoluta;
    },
    { timeout: prismaFT.transactionTimeout },
  );

  res.sendFile(rutaAbsoluta, (err) => {
    if (err) {
      log.error(line(), "Error al descargar el archivo:", err);
      res.status(500).send("Error");
    }
  });
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
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, {});
};
