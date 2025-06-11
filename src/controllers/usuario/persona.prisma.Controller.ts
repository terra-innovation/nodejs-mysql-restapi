import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as personaDao from "#src/daos/persona.prisma.Dao.js";
import * as documentotipoDao from "#src/daos/documentotipo.prisma.Dao.js";
import * as paisDao from "#src/daos/pais.prisma.Dao.js";
import * as provinciaDao from "#src/daos/provincia.prisma.Dao.js";
import * as distritoDao from "#src/daos/distrito.prisma.Dao.js";
import * as generoDao from "#src/daos/genero.prisma.Dao.js";
import * as personadeclaracionDao from "#src/daos/personadeclaracion.prisma.Dao.js";
import * as personaverificacionDao from "#src/daos/personaverificacion.prisma.Dao.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as archivopersonaDao from "#src/daos/archivopersona.prisma.Dao.js";
import * as personaverificacionestadoDao from "#src/daos/personaverificacionestado.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import * as storageUtils from "#src/utils/storageUtils.js";
import * as validacionesYup from "#src/utils/validacionesYup.js";
import * as fs from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import type { persona } from "#src/models/prisma/ft_factoring/client";
import type { persona_declaracion } from "#src/models/prisma/ft_factoring/client";
import type { persona_verificacion } from "#src/models/prisma/ft_factoring/client";
import type { usuario } from "#src/models/prisma/ft_factoring/client";

export const getPersonaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonaMaster");
  const personaMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user?.usuario?.idusuario;
      const filter_estados = [1];
      const paises = await paisDao.getPaises(tx, filter_estados);
      const distritos = await distritoDao.getDistritos(tx, filter_estados);
      const documentotipos = await documentotipoDao.getDocumentotipos(tx, filter_estados);
      const generos = await generoDao.getGeneros(tx, filter_estados);
      const usuario = await usuarioDao.getUsuarioByIdusuario(tx, session_idusuario);
      let personaverificacionestado = null;
      if (usuario.persona) {
        personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByIdpersonaverificacionestado(tx, usuario.persona.idpersonaverificacionestado);
      }

      let personaMaster: Record<string, any> = {};
      personaMaster.paises = paises;
      personaMaster.distritos = distritos;
      personaMaster.documentotipos = documentotipos;
      personaMaster.generos = generos;
      personaMaster.usuario = jsonUtils.filterFields(jsonUtils.sequelizeToJSON(usuario), ["usuarioid", "email", "celular", "isemailvalidated", "ispersonavalidated"]);

      if (personaverificacionestado) {
        personaMaster.personaverificacionestado = personaverificacionestado;
      }

      let personaMasterJSON = jsonUtils.sequelizeToJSON(personaMaster);
      //jsonUtils.prettyPrint(personaMasterJSON);
      let personaMasterObfuscated = jsonUtils.ofuscarAtributosDefault(personaMasterJSON);
      //jsonUtils.prettyPrint(personaMasterObfuscated);
      let personaMasterFiltered = jsonUtils.removeAttributesPrivates(personaMasterObfuscated);
      //jsonUtils.prettyPrint(personaMaster);
      return personaMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, personaMasterFiltered);
};

export const verifyPersona = async (req: Request, res: Response) => {
  log.debug(line(), "controller::verifyPersona");
  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const idusuario = req.session_user?.usuario?.idusuario;
      let NAME_REGX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
      const personaVerifySchema = yup
        .object()
        .shape({
          idusuario: yup.number().required(),
          identificacion_anverso: yup
            .mixed()
            .concat(validacionesYup.fileRequeridValidation())
            .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
            .concat(validacionesYup.fileTypeValidation(["image/png", "image/jpeg", "image/jpg"])),
          identificacion_reverso: yup
            .mixed()
            .concat(validacionesYup.fileRequeridValidation())
            .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
            .concat(validacionesYup.fileTypeValidation(["image/png", "image/jpeg", "image/jpg"])),
          identificacion_selfi: yup
            .mixed()
            .concat(validacionesYup.fileRequeridValidation())
            .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
            .concat(validacionesYup.fileTypeValidation(["image/png", "image/jpeg", "image/jpg"])),

          documentotipoid: yup.string().min(36).max(36).trim().required(),
          documentonumero: yup
            .string()
            .trim()
            .required()
            .matches(/^[0-9]*$/, "Ingrese solo números")
            .length(8),
          personanombres: yup.string().trim().required().matches(NAME_REGX, "Debe ser un nombre válido").min(2).max(100),
          apellidopaterno: yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
          apellidomaterno: yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
          paisnacionalidadid: yup.string().trim().required().min(36).max(36),
          paisnacimientoid: yup.string().trim().required().min(36).max(36),
          paisresidenciaid: yup.string().trim().required().min(36).max(36),
          distritoresidenciaid: yup.string().trim().required().min(36).max(36),
          generoid: yup.string().trim().required().min(36).max(36),
          fechanacimiento: yup.date().required(),
          direccion: yup.string().trim().required().max(200),
          direccionreferencia: yup.string().trim().required().max(200),
          tienevinculopep: yup.number().required().integer().max(1),
          espep: yup.number().required().integer().max(1),
          isdatacorrect: yup.boolean().required(),
        })
        .required();
      const personaValidated = personaVerifySchema.validateSync({ ...req.files, ...req.body, idusuario }, { abortEarly: false, stripUnknown: true });
      log.debug(line(), "personaValidated:", personaValidated);

      const documentotipo = await documentotipoDao.findDocumentotipoPk(tx, personaValidated.documentotipoid);
      if (!documentotipo) {
        log.warn(line(), "Documento tipo no existe: [" + personaValidated.documentotipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const paisNacionalidad = await paisDao.findPaisPk(tx, personaValidated.paisnacionalidadid);
      if (!paisNacionalidad) {
        log.warn(line(), "Nacionalidad no existe: [" + personaValidated.paisnacionalidadid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const paisNacimiento = await paisDao.findPaisPk(tx, personaValidated.paisnacimientoid);
      if (!paisNacimiento) {
        log.warn(line(), "País de nacimiento no existe: [" + personaValidated.paisnacimientoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const paisResidencia = await paisDao.findPaisPk(tx, personaValidated.paisresidenciaid);
      if (!paisResidencia) {
        log.warn(line(), "País de recidencia no existe: [" + personaValidated.paisresidenciaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const distritoResidencia = await distritoDao.getDistritoByDistritoid(tx, personaValidated.distritoresidenciaid);
      if (!distritoResidencia) {
        log.warn(line(), "Distrito de recidencia no existe: [" + personaValidated.distritoresidenciaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const genero = await generoDao.findGeneroPk(tx, personaValidated.generoid);
      if (!genero) {
        log.warn(line(), "Genero no existe: [" + personaValidated.generoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      if (!personaValidated.isdatacorrect) {
        log.warn(line(), "No aceptó los términos y condiciones");
        throw new ClientError("Datos no válidos", 404);
      }

      const persona = await personaDao.getPersonaByIdusuario(tx, personaValidated.idusuario);
      if (persona) {
        log.warn(line(), "Persona ya existe");
        throw new ClientError("Datos no válidos", 404);
      }

      const personaverificacionestado_en_revision = 3; // 3: En revisión
      const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByIdpersonaverificacionestado(tx, personaverificacionestado_en_revision);
      if (!personaverificacionestado) {
        log.warn(line(), "Persona verificación estado no existe: [" + personaverificacionestado_en_revision + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const usuarioConected = await usuarioDao.getUsuarioByIdusuario(tx, personaValidated.idusuario);
      const provinciaResidencia = await provinciaDao.getProvinciaByIdprovincia(tx, distritoResidencia.idprovincia);

      const personaToCreate: Prisma.personaCreateInput = {
        usuario: { connect: { idusuario: usuarioConected.idusuario } },
        persona_verificacion_estado: { connect: { idpersonaverificacionestado: personaverificacionestado.idpersonaverificacionestado } },
        documento_tipo: { connect: { iddocumentotipo: documentotipo.iddocumentotipo } },
        pais_nacionalidad: { connect: { idpais: paisNacionalidad.idpais } },
        pais_nacimiento: { connect: { idpais: paisNacimiento.idpais } },
        pais_residencia: { connect: { idpais: paisResidencia.idpais } },
        departamento_residencia: { connect: { iddepartamento: provinciaResidencia.iddepartamento } },
        provincia_residencia: { connect: { idprovincia: distritoResidencia.idprovincia } },
        distrito_residencia: { connect: { iddistrito: distritoResidencia.iddistrito } },
        genero: { connect: { idgenero: genero.idgenero } },

        documentonumero: personaValidated.documentonumero,
        personanombres: personaValidated.personanombres,
        apellidopaterno: personaValidated.apellidopaterno,
        apellidomaterno: personaValidated.apellidomaterno,

        fechanacimiento: personaValidated.fechanacimiento,
        direccion: personaValidated.direccion,
        direccionreferencia: personaValidated.direccionreferencia,

        personaid: uuidv4(),
        code: uuidv4().split("-")[0],
        email: usuarioConected.email,
        celular: usuarioConected.celular,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const personaCreated = await personaDao.insertPersona(tx, personaToCreate);

      //let personaCreated = { _idpersona: 4 };

      const identificacionanversoCreated = await crearIdentificacionAnverso(req, tx, personaValidated, personaCreated);
      log.debug(line(), "identificacionanversoCreated:", identificacionanversoCreated);

      const identificacionreversoCreated = await crearIdentificacionReverso(req, tx, personaValidated, personaCreated);
      log.debug(line(), "identificacionreversoCreated:", identificacionreversoCreated);

      const identificacionselfiCreated = await crearIdentificacionSelfi(req, tx, personaValidated, personaCreated);
      log.debug(line(), "identificacionselfiCreated:", identificacionselfiCreated);

      const personadeclaracionToCreate: Prisma.persona_declaracionCreateInput = {
        persona: { connect: { idpersona: personaCreated.idpersona } },
        personadeclaracionid: uuidv4(),
        espep: personaValidated.espep,
        tienevinculopep: personaValidated.tienevinculopep,
        idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      await personadeclaracionDao.insertPersonadeclaracion(tx, personadeclaracionToCreate);

      const personaverificacionToCreate: Prisma.persona_verificacionCreateInput = {
        persona: { connect: { idpersona: personaCreated.idpersona } },
        persona_verificacion_estado: { connect: { idpersonaverificacionestado: personaverificacionestado.idpersonaverificacionestado } },
        usuario_verifica: { connect: { idusuario: req.session_user?.usuario?.idusuario } },
        personaverificacionid: uuidv4(),
        comentariousuario: "",
        comentariointerno: "",
        idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };
      await personaverificacionDao.insertPersonaverificacion(tx, personaverificacionToCreate);

      const usuarioToUpdate: Prisma.usuarioUpdateInput = {
        ispersonavalidated: personaverificacionestado.ispersonavalidated,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      await usuarioDao.updateUsuario(tx, usuarioConected.usuarioid, usuarioToUpdate);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, {});
};

const crearIdentificacionSelfi = async (req, tx, personaValidated, personaCreated) => {
  //Copiamos el archivo
  const { identificacion_selfi } = personaValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = identificacion_selfi[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = identificacion_selfi[0];

  const archivoToCreate: Prisma.archivoCreateInput = {
    archivoid: uuidv4(),
    archivo_tipo: { connect: { idarchivotipo: 3 } },
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
  const archivoCreated = await archivoDao.insertArchivo(tx, archivoToCreate);

  const archivopersonaToCreate: Prisma.archivo_personaCreateInput = {
    archivo: { connect: { idarchivo: archivoCreated.idarchivo } },
    persona: { connect: { idpersona: personaCreated.idpersona } },
    idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };

  await archivopersonaDao.insertArchivoPersona(tx, archivopersonaToCreate);

  fs.unlinkSync(archivoOrigen);
  return archivoCreated;
};

const crearIdentificacionReverso = async (req, tx, personaValidated, personaCreated) => {
  //Copiamos el archivo
  const { identificacion_reverso } = personaValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = identificacion_reverso[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = identificacion_reverso[0];

  const archivoToCreate: Prisma.archivoCreateInput = {
    archivoid: uuidv4(),
    archivo_tipo: { connect: { idarchivotipo: 2 } },
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
  const archivoCreated = await archivoDao.insertArchivo(tx, archivoToCreate);

  const archivopersonaToCreate: Prisma.archivo_personaCreateInput = {
    archivo: { connect: { idarchivo: archivoCreated.idarchivo } },
    persona: { connect: { idpersona: personaCreated.idpersona } },
    idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };

  await archivopersonaDao.insertArchivoPersona(tx, archivopersonaToCreate);

  fs.unlinkSync(archivoOrigen);
  return archivoCreated;
};

const crearIdentificacionAnverso = async (req, tx, personaValidated, personaCreated) => {
  //Copiamos el archivo
  const { identificacion_anverso } = personaValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = identificacion_anverso[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = identificacion_anverso[0];

  const archivoToCreate: Prisma.archivoCreateInput = {
    archivoid: uuidv4(),
    archivo_tipo: { connect: { idarchivotipo: 1 } },
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
  const archivoCreated = await archivoDao.insertArchivo(tx, archivoToCreate);

  const archivopersonaToCreate: Prisma.archivo_personaCreateInput = {
    archivo: { connect: { idarchivo: archivoCreated.idarchivo } },
    persona: { connect: { idpersona: personaCreated.idpersona } },
    idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };

  await archivopersonaDao.insertArchivoPersona(tx, archivopersonaToCreate);

  fs.unlinkSync(archivoOrigen);
  return archivoCreated;
};
