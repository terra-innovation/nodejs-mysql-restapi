import type { Prisma, servicio_inversionista_verificacion } from "#root/generated/prisma/ft_factoring/client.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as df from "#src/utils/dateUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as archivoservicioinversionistaverificacionDao from "#root/src/daos/archivoservicioinversionistaverificacion.Dao.js";
import * as inversionistaDao from "#root/src/daos/inversionista.Dao.js";
import * as personaDao from "#root/src/daos/persona.Dao.js";
import * as servicioinversionistaDao from "#root/src/daos/servicioinversionista.Dao.js";
import * as servicioinversionistaestadoDao from "#root/src/daos/servicioinversionistaestado.Dao.js";
import * as servicioinversionistaverificacionDao from "#root/src/daos/servicioinversionistaverificacion.Dao.js";
import * as usuariorolDao from "#root/src/daos/usuariorol.Dao.js";
import * as usuarioservicioDao from "#root/src/daos/usuarioservicio.Dao.js";
import * as usuarioservicioestadoDao from "#root/src/daos/usuarioservicioestado.Dao.js";
import * as usuarioservicioverificacionDao from "#root/src/daos/usuarioservicioverificacion.Dao.js";

import EmailSender from "#src/providers/email/emailSender.js";
import TemplateManager from "#src/providers/email/TemplateManager.js";

const templateManager = new TemplateManager();
const emailSender = new EmailSender();

export interface ServicioInversionistaVerificacionCreateDto {
  servicioinversionistaid: string;
  servicioinversionistaestadoid: string;
  comentariousuario?: string;
  comentariointerno: string;
  archivos?: string[];
}

export interface ServicioInversionistaVerificacionUpdateDto {
  servicioinversionistaverificacionid: string;
  servicioinversionistaestadoid: string;
  comentariousuario?: string;
  comentariointerno: string;
  archivos?: string[];
}

/**
 * Consulta las verificaciones asociadas a un servicio inversionista.
 */
export const getServicioinversionistaverificacionsByServicioinversionistaidService = async (servicioinversionistaid: string) => {
  log.debug(line(), "service::getServicioinversionistaverificacionsByServicioinversionistaidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const servicioinversionista = await servicioinversionistaDao.getServicioinversionistaByServicioinversionistaid(tx, servicioinversionistaid);
      if (!servicioinversionista) {
        log.warn(line(), `Servicioinversionista no existe: [${servicioinversionistaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      return await servicioinversionistaverificacionDao.getServicioinversionistaverificacionsByIdservicioinversionista(tx, servicioinversionista.idservicioinversionista, filter_estado);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Actualiza una verificación de servicio inversionista.
 */
export const updateFactoringinversionistaverificacionService = async (dto: ServicioInversionistaVerificacionUpdateDto, idusuario: number) => {
  log.debug(line(), "service::updateFactoringinversionistaverificacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const servicioinversionistaverificacion = await servicioinversionistaverificacionDao.getServicioinversionistaverificacionByServicioinversionistaverificacionid(tx, dto.servicioinversionistaverificacionid);
      if (!servicioinversionistaverificacion) {
        log.warn(line(), `Servicioinversionista verificación no existe: [${dto.servicioinversionistaverificacionid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const servicioinversionistaestado = await servicioinversionistaestadoDao.getServicioinversionistaestadoByServicioinversionistaestadoid(tx, dto.servicioinversionistaestadoid);
      if (!servicioinversionistaestado) {
        log.warn(line(), `Servicioinversionista verificación estado no existe: [${dto.servicioinversionistaestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      let archivos = [];
      if (dto.archivos) {
        for (const archivoid of dto.archivos) {
          const archivo = await archivoDao.getArchivoByArchivoid(tx, archivoid);
          if (!archivo) {
            log.warn(line(), `Archivo no existe: [${archivoid}]`);
            throw new ClientError("Datos no válidos", 404);
          }
          archivos.push(archivo);
        }
      }

      const servicioinversionistaverificacionToUpdate: Prisma.servicio_inversionista_verificacionUpdateInput = {
        servicio_inversionista_estado: { connect: { idservicioinversionistaestado: servicioinversionistaestado.idservicioinversionistaestado } },
        comentariousuario: dto.comentariousuario,
        comentariointerno: dto.comentariointerno,
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };

      const servicioinversionistaverificacionUpdated = await servicioinversionistaverificacionDao.updateServicioinversionistaverificacion(tx, servicioinversionistaverificacion.servicioinversionistaverificacionid, servicioinversionistaverificacionToUpdate);
      log.debug(line(), "servicioinversionistaverificacionUpdated:", servicioinversionistaverificacionUpdated);

      for (const archivo of archivos) {
        const archivofactoringhistorialestadoToCreate: Prisma.archivo_servicio_inversionista_verificacionCreateInput = {
          archivo: { connect: { idarchivo: archivo.idarchivo } },
          servicio_inversionista_verificacion: { connect: { idservicioinversionistaverificacion: servicioinversionistaverificacionUpdated.idservicioinversionistaverificacion } },
          idusuariocrea: idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const archivoservicioinversionistaverificacionCreated = await archivoservicioinversionistaverificacionDao.insertArchivoservicioinversionistaverificacion(tx, archivofactoringhistorialestadoToCreate);
        log.debug(line(), "archivoservicioinversionistaverificacionCreated:", archivoservicioinversionistaverificacionCreated);
      }
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Concede acceso al usuario en su relación con el servicio de inversión.
 */
const darAccesoAlUsuarioServicio = async (tx: any, dto: ServicioInversionistaVerificacionCreateDto, servicioinversionista: any, inversionista: any, servicioinversionistasuscriptor: any, idusuario: number) => {
  const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByIdusuarioIdservicio(tx, servicioinversionistasuscriptor.idusuario, servicioinversionista.idservicio);
  if (!usuarioservicio) {
    log.warn(line(), `Usuario servicio no existe: [${servicioinversionistasuscriptor.idusuario} - ${servicioinversionista.idservicio}]`);
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioestado_suscrito = 2; // Suscrito
  const usuarioservicioestado = await usuarioservicioestadoDao.getUsuarioservicioestadoByIdusuarioservicioestado(tx, usuarioservicioestado_suscrito);
  if (!usuarioservicioestado) {
    log.warn(line(), `Usuario servicio estado no existe: [${usuarioservicioestado_suscrito}]`);
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioverificacionToCreate: Prisma.usuario_servicio_verificacionCreateInput = {
    usuario_servicio: { connect: { idusuarioservicio: usuarioservicio.idusuarioservicio } },
    usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
    usuario_verifica: { connect: { idusuario: idusuario } },
    usuarioservicioverificacionid: uuidv4(),
    comentariousuario: dto.comentariousuario,
    comentariointerno: dto.comentariointerno + " // Proceso automático. Se concedió acceso por la verificación del inversionista: " + inversionista.code,
    idusuariocrea: idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };

  const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(tx, usuarioservicioverificacionToCreate);
  log.debug(line(), "usuarioservicioverificacionCreated", usuarioservicioverificacionCreated);

  const usuarioservicioToUpdate: Prisma.usuario_servicioUpdateInput = {
    usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
    idusuariomod: idusuario ?? 1,
    fechamod: new Date(),
  };
  const usuarioservicioUpdated = await usuarioservicioDao.updateUsuarioservicio(tx, usuarioservicio.usuarioservicioid, usuarioservicioToUpdate);
  log.debug(line(), "usuarioservicioUpdated", usuarioservicioUpdated);
};

/**
 * Rechaza el acceso al usuario en su relación con el servicio de inversión.
 */
const rechazarAccesoAlUsuarioServicio = async (tx: any, dto: ServicioInversionistaVerificacionCreateDto, servicioinversionista: any, inversionista: any, servicioinversionistasuscriptor: any, idusuario: number) => {
  const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByIdusuarioIdservicio(tx, servicioinversionistasuscriptor.idusuario, servicioinversionista.idservicio);
  if (!usuarioservicio) {
    log.warn(line(), `Usuario servicio no existe: [${servicioinversionistasuscriptor.idusuario} - ${servicioinversionista.idservicio}]`);
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioestado_rechazado = 4; // Rechazado
  const usuarioservicioestado = await usuarioservicioestadoDao.getUsuarioservicioestadoByIdusuarioservicioestado(tx, usuarioservicioestado_rechazado);
  if (!usuarioservicioestado) {
    log.warn(line(), `Usuario servicio estado no existe: [${usuarioservicioestado_rechazado}]`);
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioverificacionToCreate: Prisma.usuario_servicio_verificacionCreateInput = {
    usuario_servicio: { connect: { idusuarioservicio: usuarioservicio.idusuarioservicio } },
    usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
    usuario_verifica: { connect: { idusuario: idusuario } },
    usuarioservicioverificacionid: uuidv4(),
    comentariousuario: dto.comentariousuario,
    comentariointerno: dto.comentariointerno + " // Proceso automático. Se rechazó acceso por la verificación del inversionista: " + inversionista.code,
    idusuariocrea: idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };

  const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(tx, usuarioservicioverificacionToCreate);
  log.debug(line(), "usuarioservicioverificacionCreated", usuarioservicioverificacionCreated);

  const usuarioservicioToUpdate: Prisma.usuario_servicioUpdateInput = {
    usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
    idusuariomod: idusuario ?? 1,
    fechamod: new Date(),
  };
  const usuarioservicioUpdated = await usuarioservicioDao.updateUsuarioservicio(tx, usuarioservicio.usuarioservicioid, usuarioservicioToUpdate);
  log.debug(line(), "usuarioservicioUpdated", usuarioservicioUpdated);
};

/**
 * Prepara y envía las notificaciones por correo de acuerdo al estado resultante.
 */
const enviarCorreoSegunCorrespondeNuevoEstadoDeServicioInversionista = async (dto: ServicioInversionistaVerificacionCreateDto, servicioinversionista: any, servicioinversionistaestado: any, inversionista: any, servicioinversionistasuscriptor: any) => {
  if (servicioinversionistaestado.isenabledcomentariousuario && dto.comentariousuario) {
    const dataEmail = {
      codigo_servicio_inversionista: servicioinversionista.code,
      nombres: servicioinversionistasuscriptor.usuario.usuarionombres,
      fecha_actual: df.formatDateForEmailLocale(new Date().toISOString()),
      razon_no_aceptada: dto.comentariousuario,
    };
    const emailTemplate = await templateManager.templateFactoringInversionistaVerificacionMasInformacion(dataEmail);

    await emailSender.sendContactoFinanzatech({
      to: servicioinversionistasuscriptor.usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  }

  if (servicioinversionistaestado.idservicioinversionistaestado == 3) {
    const dataEmail = {
      codigo_servicio_inversionista: servicioinversionista.code,
      nombres: servicioinversionistasuscriptor.usuario.usuarionombres,
      fecha_actual: df.formatDateForEmailLocale(new Date().toISOString()),
    };
    const emailTemplate = await templateManager.templateFactoringInversionistaVerificacionAprobado(dataEmail);

    await emailSender.sendContactoFinanzatech({
      to: servicioinversionistasuscriptor.usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  } else if (servicioinversionistaestado.idservicioinversionistaestado == 2) {
    const dataEmail = {
      codigo_servicio_inversionista: servicioinversionista.code,
      nombres: servicioinversionistasuscriptor.usuario.usuarionombres,
      fecha_actual: df.formatDateForEmailLocale(new Date().toISOString()),
    };
    const emailTemplate = await templateManager.templateFactoringInversionistaVerificacionRechazado(dataEmail);

    await emailSender.sendContactoFinanzatech({
      to: servicioinversionistasuscriptor.usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  }
};

/**
 * Registra una nueva verificación de servicio inversionista y orquesta accesos y notificaciones.
 */
export const createFactoringinversionistaverificacionService = async (dto: ServicioInversionistaVerificacionCreateDto, idusuario: number) => {
  log.debug(line(), "service::createFactoringinversionistaverificacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const servicioinversionista = await servicioinversionistaDao.getServicioinversionistaByServicioinversionistaid(tx, dto.servicioinversionistaid);
      if (!servicioinversionista) {
        log.warn(line(), `Servicio inversionista no existe: [${dto.servicioinversionistaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const personasuscriptor = await personaDao.getPersonaByIdusuario(tx, servicioinversionista.idusuariosuscriptor);
      if (!personasuscriptor) {
        log.warn(line(), `Usuario suscriptor no existe: [${servicioinversionista.idusuariosuscriptor}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const inversionista = await inversionistaDao.getInversionistaByIdinversionista(tx, servicioinversionista.idinversionista);
      if (!inversionista) {
        log.warn(line(), `Inversionista no existe: [${servicioinversionista.idinversionista}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const servicioinversionistaestado = await servicioinversionistaestadoDao.getServicioinversionistaestadoByServicioinversionistaestadoid(tx, dto.servicioinversionistaestadoid);
      if (!servicioinversionistaestado) {
        log.warn(line(), `Servicio inversionista estado no existe: [${dto.servicioinversionistaestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      let archivos = [];
      if (dto.archivos) {
        for (const archivoid of dto.archivos) {
          const archivo = await archivoDao.getArchivoByArchivoid(tx, archivoid);
          if (!archivo) {
            log.warn(line(), `Archivo no existe: [${archivoid}]`);
            throw new ClientError("Datos no válidos", 404);
          }
          archivos.push(archivo);
        }
      }

      const servicioinversionistaverificacionToCreate: Prisma.servicio_inversionista_verificacionCreateInput = {
        servicio_inversionista: { connect: { idservicioinversionista: servicioinversionista.idservicioinversionista } },
        servicio_inversionista_estado: { connect: { idservicioinversionistaestado: servicioinversionistaestado.idservicioinversionistaestado } },
        usuario_verifica: { connect: { idusuario: idusuario } },
        comentariointerno: dto.comentariointerno,
        comentariousuario: dto.comentariousuario,
        servicioinversionistaverificacionid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioinversionistaverificacionCreated = await servicioinversionistaverificacionDao.insertServicioinversionistaverificacion(tx, servicioinversionistaverificacionToCreate);
      log.debug(line(), "servicioinversionistaverificacionCreated", servicioinversionistaverificacionCreated);

      for (const archivo of archivos) {
        const archivoservicioinversionistaverificacionToCreate: Prisma.archivo_servicio_inversionista_verificacionCreateInput = {
          archivo: { connect: { idarchivo: archivo.idarchivo } },
          servicio_inversionista_verificacion: { connect: { idservicioinversionistaverificacion: servicioinversionistaverificacionCreated.idservicioinversionistaverificacion } },
          idusuariocrea: idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const archivoservicioinversionistaverificacionCreated = await archivoservicioinversionistaverificacionDao.insertArchivoservicioinversionistaverificacion(tx, archivoservicioinversionistaverificacionToCreate);
        log.debug(line(), "archivoservicioinversionistaverificacionCreated:", archivoservicioinversionistaverificacionCreated);
      }

      const servicioinversionistaToUpdate: Prisma.servicio_inversionistaUpdateInput = {
        servicio_inversionista_estado: { connect: { idservicioinversionistaestado: servicioinversionistaestado.idservicioinversionistaestado } },
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };
      const servicioinversionistaUpdated = await servicioinversionistaDao.updateServicioinversionista(tx, dto.servicioinversionistaid, servicioinversionistaToUpdate);
      log.debug(line(), "servicioinversionistaUpdated", servicioinversionistaUpdated);

      // Si el estado es 3 (Suscrito)
      if (servicioinversionistaestado.idservicioinversionistaestado == 3) {
        await darAccesoAlUsuarioServicio(tx, dto, servicioinversionista, inversionista, personasuscriptor, idusuario);

        const idrol_inversionista = 4;
        const usuariorolToCreate: Prisma.usuario_rolCreateInput = {
          usuario: { connect: { idusuario: servicioinversionista.idusuariosuscriptor } },
          rol: { connect: { idrol: idrol_inversionista } },
          idusuariocrea: idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };
        await usuariorolDao.insertUsuariorol(tx, usuariorolToCreate);
      } else if (servicioinversionistaestado.idservicioinversionistaestado == 2) {
        await rechazarAccesoAlUsuarioServicio(tx, dto, servicioinversionista, inversionista, personasuscriptor, idusuario);
      }

      await enviarCorreoSegunCorrespondeNuevoEstadoDeServicioInversionista(dto, servicioinversionista, servicioinversionistaestado, inversionista, personasuscriptor);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta inversionistas de factoring para verificación.
 */
export const getFactoringinversionistasByVerificacionService = async () => {
  log.debug(line(), "service::getFactoringinversionistasByVerificacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estadologico = [1, 2];
      const filter_idservicio = [2];
      const filter_idarchivotipos = [1, 2, 3];
      return await servicioinversionistaDao.getFactoringinversionistasByVerificacion(tx, filter_estadologico, filter_idservicio, filter_idarchivotipos);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Obtiene los estados maestros de verificación de inversionista.
 */
export const getFactoringinversionistaverificacionMasterService = async () => {
  log.debug(line(), "service::getFactoringinversionistaverificacionMasterService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const servicioinversionistaestados = await servicioinversionistaestadoDao.getServicioinversionistaestados(tx, filter_estados);

      return {
        servicioinversionistaestados,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Activa una verificación de servicio inversionista.
 */
export const activateFactoringinversionistaverificacionService = async (servicioinversionistaverificacionid: string, idusuario: number) => {
  log.debug(line(), "service::activateFactoringinversionistaverificacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const resultado = await servicioinversionistaverificacionDao.activateServicioinversionistaverificacion(tx, servicioinversionistaverificacionid, idusuario);
      if (resultado[0] === 0) {
        throw new ClientError("Servicioinversionistaverificacion no existe", 404);
      }
      return resultado;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina lógicamente una verificación de servicio inversionista.
 */
export const deleteFactoringinversionistaverificacionService = async (servicioinversionistaverificacionid: string, idusuario: number) => {
  log.debug(line(), "service::deleteFactoringinversionistaverificacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const resultado = await servicioinversionistaverificacionDao.deleteServicioinversionistaverificacion(tx, servicioinversionistaverificacionid, idusuario);
      if (resultado[0] === 0) {
        throw new ClientError("Servicioinversionistaverificacion no existe", 404);
      }
      return resultado;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
