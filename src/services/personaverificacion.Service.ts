import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as archivopersonaverificacionDao from "#root/src/daos/archivopersonaverificacion.Dao.js";
import * as personaDao from "#root/src/daos/persona.Dao.js";
import * as personaverificacionDao from "#root/src/daos/personaverificacion.Dao.js";
import * as personaverificacionestadoDao from "#root/src/daos/personaverificacionestado.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import * as usuarioservicioDao from "#root/src/daos/usuarioservicio.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { line, log } from "#src/utils/logger.pino.js";
import EmailSender from "#src/providers/email/emailSender.js";
import TemplateManager from "#src/providers/email/TemplateManager.js";
import * as df from "#src/utils/dateUtils.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface GetPersonaverificacionsByPersonaidDto {
  personaid: string;
}

export interface ActivatePersonaverificacionDto {
  personaverificacionid: string;
  idusuario: number;
}

export interface DeletePersonaverificacionDto {
  personaverificacionid: string;
  idusuario: number;
}

export interface UpdatePersonaverificacionDto {
  personaverificacionid: string;
  personaverificacionestadoid: string;
  comentariousuario?: string;
  comentariointerno: string;
  archivos?: (string | undefined)[];
  idusuario: number;
}

export interface CreatePersonaverificacionDto {
  personaid: string;
  personaverificacionestadoid: string;
  comentariousuario?: string;
  comentariointerno: string;
  archivos?: (string | undefined)[];
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const getPersonaverificacionsByPersonaidService = async (dto: GetPersonaverificacionsByPersonaidDto) => {
  log.debug(line(), "service::getPersonaverificacionsByPersonaidService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const persona = await personaDao.getPersonaByPersonaid(tx, dto.personaid);
      if (!persona) {
        log.warn(line(), "Persona no existe: [" + dto.personaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const personaverificacions = await personaverificacionDao.getPersonaverificacionsByIdpersona(tx, persona.idpersona, filter_estado);

      return personaverificacions;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const activatePersonaverificacionService = async (dto: ActivatePersonaverificacionDto) => {
  log.debug(line(), "service::activatePersonaverificacionService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const personaverificacionActivated = await personaverificacionDao.activatePersonaverificacion(tx, dto.personaverificacionid, dto.idusuario);
      if (personaverificacionActivated[0] === 0) {
        throw new ClientError("Personaverificacion no existe", 404);
      }
      log.debug(line(), "personaverificacionActivated:", personaverificacionActivated);
      return personaverificacionActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deletePersonaverificacionService = async (dto: DeletePersonaverificacionDto) => {
  log.debug(line(), "service::deletePersonaverificacionService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const personaverificacionDeleted = await personaverificacionDao.deletePersonaverificacion(tx, dto.personaverificacionid, dto.idusuario);
      if (personaverificacionDeleted[0] === 0) {
        throw new ClientError("Personaverificacion no existe", 404);
      }
      log.debug(line(), "personaverificacionDeleted:", personaverificacionDeleted);
      return personaverificacionDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getPersonaverificacionMasterService = async () => {
  log.debug(line(), "service::getPersonaverificacionMasterService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const personaverificacionestados = await personaverificacionestadoDao.getPersonaverificacionestados(tx, filter_estados);

      const personaverificacionMaster: Record<string, any> = {};
      personaverificacionMaster.personaverificacionestados = personaverificacionestados;

      return personaverificacionMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const updatePersonaverificacionService = async (dto: UpdatePersonaverificacionDto) => {
  log.debug(line(), "service::updatePersonaverificacionService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const personaverificacion = await personaverificacionDao.getPersonaverificacionByPersonaverificacionid(tx, dto.personaverificacionid);
      if (!personaverificacion) {
        log.warn(line(), "Persona verificación no existe: [" + dto.personaverificacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByPersonaverificacionestadoid(tx, dto.personaverificacionestadoid);
      if (!personaverificacionestado) {
        log.warn(line(), "Persona verificación estado no existe: [" + dto.personaverificacionestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      let archivos = [];
      if (dto.archivos) {
        for (const archivoid of dto.archivos) {
          if (!archivoid) continue;
          const archivo = await archivoDao.getArchivoByArchivoid(tx, archivoid);
          if (!archivo) {
            log.warn(line(), "Archivo no existe: [" + archivoid + "]");
            throw new ClientError("Datos no válidos", 404);
          }
          archivos.push(archivo);
        }
      }

      const personaverificacionToUpdate: Prisma.persona_verificacionUpdateInput = {
        persona_verificacion_estado: { connect: { idpersonaverificacionestado: personaverificacionestado.idpersonaverificacionestado } },
        comentariousuario: dto.comentariousuario,
        comentariointerno: dto.comentariointerno,
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
      };

      const personaverificacionUpdated = await personaverificacionDao.updatePersonaverificacion(tx, personaverificacion.personaverificacionid, personaverificacionToUpdate);
      log.debug(line(), "personaverificacionUpdated:", personaverificacionUpdated);

      for (const archivo of archivos) {
        const archivopersonaverificacionToCreate: Prisma.archivo_persona_verificacionCreateInput = {
          archivo: { connect: { idarchivo: archivo.idarchivo } },
          persona_verificacion: { connect: { idpersonaverificacion: personaverificacionUpdated.idpersonaverificacion } },
          idusuariocrea: dto.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: dto.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const archivopersonaverificacionCreated = await archivopersonaverificacionDao.insertArchivopersonaverificacion(tx, archivopersonaverificacionToCreate);
        log.debug(line(), "archivopersonaverificacionCreated:", archivopersonaverificacionCreated);
      }

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getPersonaverificacionsService = async () => {
  log.debug(line(), "service::getPersonaverificacionsService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const filter_idarchivotipo = [1, 2, 3];
      const personaverificacionverificacions = await personaDao.getPersonasByVerificacion(tx, filter_estado, filter_idarchivotipo);

      return personaverificacionverificacions;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const createPersonaverificacionService = async (dto: CreatePersonaverificacionDto) => {
  log.debug(line(), "service::createPersonaverificacionService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const persona = await personaDao.getPersonaByPersonaid(tx, dto.personaid);
      if (!persona) {
        log.warn(line(), "Persona no existe: [" + dto.personaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByPersonaverificacionestadoid(tx, dto.personaverificacionestadoid);
      if (!personaverificacionestado) {
        log.warn(line(), "Persona verificación estado no existe: [" + dto.personaverificacionestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      let archivos = [];
      if (dto.archivos) {
        for (const archivoid of dto.archivos) {
          if (!archivoid) continue;
          const archivo = await archivoDao.getArchivoByArchivoid(tx, archivoid);
          if (!archivo) {
            log.warn(line(), "Archivo no existe: [" + archivoid + "]");
            throw new ClientError("Datos no válidos", 404);
          }
          archivos.push(archivo);
        }
      }

      const personaverificacionToCreate: Prisma.persona_verificacionCreateInput = {
        persona: { connect: { idpersona: persona.idpersona } },
        persona_verificacion_estado: { connect: { idpersonaverificacionestado: personaverificacionestado.idpersonaverificacionestado } },
        usuario_verifica: { connect: { idusuario: dto.idusuario } },
        comentariointerno: dto.comentariointerno,
        comentariousuario: dto.comentariousuario,
        personaverificacionid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: dto.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const personaverificacionCreated = await personaverificacionDao.insertPersonaverificacion(tx, personaverificacionToCreate);
      log.debug(line(), "personaverificacionCreated", personaverificacionCreated);

      for (const archivo of archivos) {
        const archivopersonaverificacionToCreate: Prisma.archivo_persona_verificacionCreateInput = {
          archivo: { connect: { idarchivo: archivo.idarchivo } },
          persona_verificacion: { connect: { idpersonaverificacion: personaverificacionCreated.idpersonaverificacion } },
          idusuariocrea: dto.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: dto.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const archivopersonaverificacionCreated = await archivopersonaverificacionDao.insertArchivopersonaverificacion(tx, archivopersonaverificacionToCreate);
        log.debug(line(), "archivopersonaverificacionCreated:", archivopersonaverificacionCreated);
      }

      const personaToUpdate: Prisma.personaUpdateInput = {
        persona_verificacion_estado: { connect: { idpersonaverificacionestado: personaverificacionestado.idpersonaverificacionestado } },
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
      };

      const personaUpdated = await personaDao.updatePersona(tx, persona.personaid, personaToUpdate);
      log.debug(line(), "personaUpdated", personaUpdated);

      // Actualizamos el usuario solo si la validación de la persona es aprobado
      if (personaverificacionestado.ispersonavalidated) {
        const usuarioToUpdate: Prisma.usuarioUpdateInput = {
          ispersonavalidated: personaverificacionestado.ispersonavalidated,
          idusuariomod: dto.idusuario ?? 1,
          fechamod: new Date(),
        };

        const usuarioUpdated = await usuarioDao.updateUsuario(tx, persona.usuario.usuarioid, usuarioToUpdate);
        log.debug(line(), "usuarioUpdated", usuarioUpdated);
      }

      // Si la verificación tiene código 4 (aprobado), se habilitan los servicios para que pueda suscribirse
      if (personaverificacionestado.idpersonaverificacionestado == 4) {
        await usuarioservicioDao.habilitarServiciosParaUsuario(tx, persona.usuario.idusuario, dto.idusuario ?? 1);
      }

      await enviarCorreoSegunCorrespondeNuevoEstadoDePersona(dto, personaverificacionestado, persona);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

// ─── Private helpers ─────────────────────────────────────────────────────────

const enviarCorreoSegunCorrespondeNuevoEstadoDePersona = async (dto: CreatePersonaverificacionDto, personaverificacionestado: any, persona: any) => {
  const templateManager = new TemplateManager();
  const emailSender = new EmailSender();

  if (personaverificacionestado.isenabledcomentariousuario) {
    if (dto.comentariousuario) {
      const dataEmail = {
        codigo_usuario: persona.usuario.code,
        nombres: persona.usuario.usuarionombres,
        razon_no_aceptada: dto.comentariousuario,
        fecha_actual: df.formatDateForEmailLocale(new Date().toISOString()),
      };
      const emailTemplate = await templateManager.templateCuentaUsarioVerificadaMasInformacion(dataEmail);

      const mailOptions = {
        to: persona.usuario.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      };

      await emailSender.sendContactoFinanzatech(mailOptions);
    }
  }

  // Si la verificación tiene código 4 (aprobado), se le envía un correo de éxito
  if (personaverificacionestado.idpersonaverificacionestado == 4) {
    const dataEmail = {
      codigo_usuario: persona.usuario.code,
      nombres: persona.usuario.usuarionombres,
      fecha_actual: df.formatDateForEmailLocale(new Date().toISOString()),
    };
    const emailTemplate = await templateManager.templateCuentaUsarioVerificadaExito(dataEmail);

    const mailOptions = {
      to: persona.usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };
    await emailSender.sendContactoFinanzatech(mailOptions);
  }
};
