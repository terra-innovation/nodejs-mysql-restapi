import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as archivopersonaDao from "#root/src/daos/archivopersona.Dao.js";
import { ARCHIVO_TIPO } from "#root/src/daos/archivotipo.Dao.js";
import * as distritoDao from "#root/src/daos/distrito.Dao.js";
import * as documentotipoDao from "#root/src/daos/documentotipo.Dao.js";
import * as generoDao from "#root/src/daos/genero.Dao.js";
import * as paisDao from "#root/src/daos/pais.Dao.js";
import * as personaDao from "#root/src/daos/persona.Dao.js";
import * as personadeclaracionDao from "#root/src/daos/personadeclaracion.Dao.js";
import * as personaverificacionDao from "#root/src/daos/personaverificacion.Dao.js";
import * as personaverificacionestadoDao from "#root/src/daos/personaverificacionestado.Dao.js";
import * as provinciaDao from "#root/src/daos/provincia.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { isProduction } from "#src/config.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as telegramService from "#src/providers/telegram/telegram.Provider.js";
import { newPersonaVerificationMessage } from "#src/templates/telegram/persona.Template.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

export interface VerifyPersonaPayload {
  idusuario: number;
  identificacion_anverso: string;
  identificacion_reverso: string;
  identificacion_selfi: string;
  documentotipoid: string;
  documentonumero: string;
  personanombres: string;
  apellidopaterno: string;
  apellidomaterno: string;
  paisnacionalidadid: string;
  paisnacimientoid: string;
  paisresidenciaid: string;
  distritoresidenciaid: string;
  generoid: string;
  fechanacimiento: Date;
  direccion: string;
  direccionreferencia: string;
  tienevinculopep: number;
  espep: number;
  isdatacorrect: boolean;
}

export const verifyPersonaService = async (session_idusuario: number, personaValidated: VerifyPersonaPayload) => {
  log.debug(line(), "service::verifyPersonaService");
  return await prismaFT.client.$transaction(
    async (tx) => {
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

      const filter_estado_archivo = isProduction ? [ESTADO.ACTIVO] : [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const identificacionanverso = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(tx, personaValidated.identificacion_anverso, ARCHIVO_TIPO.DNI_ANVERSO_FRONTAL, filter_estado_archivo);
      if (!identificacionanverso) {
        log.warn(line(), "Identificación anverso no existe o tipo no coincide: [" + personaValidated.identificacion_anverso + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const identificacionreverso = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(tx, personaValidated.identificacion_reverso, ARCHIVO_TIPO.DNI_REVERSO_DETRAS, filter_estado_archivo);
      if (!identificacionreverso) {
        log.warn(line(), "Identificación reverso no existe o tipo no coincide: [" + personaValidated.identificacion_reverso + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const identificacionselfi = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(tx, personaValidated.identificacion_selfi, ARCHIVO_TIPO.FOTO_JUNTO_A_DNI, filter_estado_archivo);
      if (!identificacionselfi) {
        log.warn(line(), "Identificación selfi no existe o tipo no coincide: [" + personaValidated.identificacion_selfi + "]");
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
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const personaCreated = await personaDao.insertPersona(tx, personaToCreate);

      const identificacionanversoCreated = await vincularIdentificacionAnverso(session_idusuario, tx, identificacionanverso, personaCreated);
      log.debug(line(), "identificacionanversoCreated:", identificacionanversoCreated);

      const identificacionreversoCreated = await vincularIdentificacionReverso(session_idusuario, tx, identificacionreverso, personaCreated);
      log.debug(line(), "identificacionreversoCreated:", identificacionreversoCreated);

      const identificacionselfiCreated = await vincularIdentificacionSelfi(session_idusuario, tx, identificacionselfi, personaCreated);
      log.debug(line(), "identificacionselfiCreated:", identificacionselfiCreated);

      const personadeclaracionToCreate: Prisma.persona_declaracionCreateInput = {
        persona: { connect: { idpersona: personaCreated.idpersona } },
        personadeclaracionid: uuidv4(),
        espep: personaValidated.espep,
        tienevinculopep: personaValidated.tienevinculopep,
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      await personadeclaracionDao.insertPersonadeclaracion(tx, personadeclaracionToCreate);

      const personaverificacionToCreate: Prisma.persona_verificacionCreateInput = {
        persona: { connect: { idpersona: personaCreated.idpersona } },
        persona_verificacion_estado: { connect: { idpersonaverificacionestado: personaverificacionestado.idpersonaverificacionestado } },
        usuario_verifica: { connect: { idusuario: session_idusuario } },
        personaverificacionid: uuidv4(),
        code: uuidv4().split("-")[0],
        comentariousuario: "",
        comentariointerno: "",
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };
      await personaverificacionDao.insertPersonaverificacion(tx, personaverificacionToCreate);

      const usuarioToUpdate: Prisma.usuarioUpdateInput = {
        ispersonavalidated: personaverificacionestado.ispersonavalidated,
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      await usuarioDao.updateUsuario(tx, usuarioConected.usuarioid, usuarioToUpdate);

      const msnTelegram = newPersonaVerificationMessage(personaToCreate);
      telegramService.sendMessageImportant(msnTelegram);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getPersonaMasterService = async (session_idusuario: number) => {
  log.debug(line(), "service::getPersonaMasterService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const paises = await paisDao.getPaises(tx, filter_estados);
      const paisesperu = await paisDao.getPaisesPeru(tx);
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
      personaMaster.paisesperu = paisesperu;
      personaMaster.distritos = distritos;
      personaMaster.documentotipos = documentotipos;
      personaMaster.generos = generos;
      personaMaster.usuario = jsonUtils.filterFields(usuario, ["usuarioid", "email", "celular", "isemailvalidated", "ispersonavalidated"]);

      if (personaverificacionestado) {
        personaMaster.personaverificacionestado = personaverificacionestado;
      }

      const personaMasterFiltered = jsonUtils.removeAttributesPrivates(personaMaster);
      return personaMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

const vincularIdentificacionSelfi = async (idusuario: number, tx: any, archivo: any, personaCreated: any) => {
  const archivopersonaToCreate: Prisma.archivo_personaCreateInput = {
    archivo: { connect: { idarchivo: archivo.idarchivo } },
    persona: { connect: { idpersona: personaCreated.idpersona } },
    idusuariocrea: idusuario,
    fechacrea: new Date(),
    idusuariomod: idusuario,
    fechamod: new Date(),
    estado: 1,
  };

  await archivopersonaDao.insertArchivoPersona(tx, archivopersonaToCreate);
  return archivo;
};

const vincularIdentificacionReverso = async (idusuario: number, tx: any, archivo: any, personaCreated: any) => {
  const archivopersonaToCreate: Prisma.archivo_personaCreateInput = {
    archivo: { connect: { idarchivo: archivo.idarchivo } },
    persona: { connect: { idpersona: personaCreated.idpersona } },
    idusuariocrea: idusuario,
    fechacrea: new Date(),
    idusuariomod: idusuario,
    fechamod: new Date(),
    estado: 1,
  };

  await archivopersonaDao.insertArchivoPersona(tx, archivopersonaToCreate);
  return archivo;
};

const vincularIdentificacionAnverso = async (idusuario: number, tx: any, archivo: any, personaCreated: any) => {
  const archivopersonaToCreate: Prisma.archivo_personaCreateInput = {
    archivo: { connect: { idarchivo: archivo.idarchivo } },
    persona: { connect: { idpersona: personaCreated.idpersona } },
    idusuariocrea: idusuario,
    fechacrea: new Date(),
    idusuariomod: idusuario,
    fechamod: new Date(),
    estado: 1,
  };

  await archivopersonaDao.insertArchivoPersona(tx, archivopersonaToCreate);
  return archivo;
};
