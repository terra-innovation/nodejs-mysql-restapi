import type { Prisma, servicio_empresa_verificacion } from "#root/generated/prisma/ft_factoring/client.js";
import { ARCHIVO_TIPO } from "#root/src/daos/archivotipo.Dao.js";
import { SERVICIO } from "#root/src/daos/servicio.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as df from "#src/utils/dateUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as archivoservicioempresaverificacionDao from "#root/src/daos/archivoservicioempresaverificacion.Dao.js";
import * as empresaDao from "#root/src/daos/empresa.Dao.js";
import * as personaDao from "#root/src/daos/persona.Dao.js";
import * as servicioempresaDao from "#root/src/daos/servicioempresa.Dao.js";
import * as servicioempresaestadoDao from "#root/src/daos/servicioempresaestado.Dao.js";
import * as servicioempresaverificacionDao from "#root/src/daos/servicioempresaverificacion.Dao.js";
import * as usuariorolDao from "#root/src/daos/usuariorol.Dao.js";
import * as usuarioservicioDao from "#root/src/daos/usuarioservicio.Dao.js";
import * as usuarioservicioempresaDao from "#root/src/daos/usuarioservicioempresa.Dao.js";
import * as usuarioservicioempresaestadoDao from "#root/src/daos/usuarioservicioempresaestado.Dao.js";
import * as usuarioservicioempresarolDao from "#root/src/daos/usuarioservicioempresarol.Dao.js";
import * as usuarioservicioestadoDao from "#root/src/daos/usuarioservicioestado.Dao.js";
import * as usuarioservicioverificacionDao from "#root/src/daos/usuarioservicioverificacion.Dao.js";

import EmailSender from "#src/providers/email/emailSender.js";
import TemplateManager from "#src/providers/email/TemplateManager.js";

// Instancias de infraestructura de correo
const templateManager = new TemplateManager();
const emailSender = new EmailSender();

export interface ServicioEmpresaVerificacionCreateDto {
  servicioempresaid: string;
  servicioempresaestadoid: string;
  comentariousuario?: string;
  comentariointerno: string;
  archivos?: string[];
}

export interface ServicioEmpresaVerificacionUpdateDto {
  servicioempresaverificacionid: string;
  servicioempresaestadoid: string;
  comentariousuario?: string;
  comentariointerno: string;
  archivos?: string[];
}

/**
 * Consulta las verificaciones asociadas a un servicio empresa.
 */
export const getServicioempresaverificacionsByServicioempresaidService = async (servicioempresaid: string) => {
  log.debug(line(), "service::getServicioempresaverificacionsByServicioempresaidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const servicioempresa = await servicioempresaDao.getServicioempresaByServicioempresaid(tx, servicioempresaid);
      if (!servicioempresa) {
        log.warn(line(), `Servicioempresa no existe: [${servicioempresaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      return await servicioempresaverificacionDao.getServicioempresaverificacionsByIdservicioempresa(tx, servicioempresa.idservicioempresa, filter_estado);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Actualiza una verificación existente de servicio empresa.
 */
export const updateFactoringempresaverificacionService = async (dto: ServicioEmpresaVerificacionUpdateDto, idusuario: number) => {
  log.debug(line(), "service::updateFactoringempresaverificacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const servicioempresaverificacion = await servicioempresaverificacionDao.getServicioempresaverificacionByServicioempresaverificacionid(tx, dto.servicioempresaverificacionid);
      if (!servicioempresaverificacion) {
        log.warn(line(), `Servicioempresa verificación no existe: [${dto.servicioempresaverificacionid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const servicioempresaestado = await servicioempresaestadoDao.getServicioempresaestadoByServicioempresaestadoid(tx, dto.servicioempresaestadoid);
      if (!servicioempresaestado) {
        log.warn(line(), `Servicioempresa verificación estado no existe: [${dto.servicioempresaestadoid}]`);
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

      const servicioempresaverificacionToUpdate: Prisma.servicio_empresa_verificacionUpdateInput = {
        servicio_empresa_estado: { connect: { idservicioempresaestado: servicioempresaestado.idservicioempresaestado } },
        comentariousuario: dto.comentariousuario,
        comentariointerno: dto.comentariointerno,
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };

      const servicioempresaverificacionUpdated = await servicioempresaverificacionDao.updateServicioempresaverificacion(tx, servicioempresaverificacion.servicioempresaverificacionid, servicioempresaverificacionToUpdate);
      log.debug(line(), "servicioempresaverificacionUpdated:", servicioempresaverificacionUpdated);

      for (const archivo of archivos) {
        const archivofactoringhistorialestadoToCreate: Prisma.archivo_servicio_empresa_verificacionCreateInput = {
          archivo: { connect: { idarchivo: archivo.idarchivo } },
          servicio_empresa_verificacion: { connect: { idservicioempresaverificacion: servicioempresaverificacionUpdated.idservicioempresaverificacion } },
          idusuariocrea: idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const archivoservicioempresaverificacionCreated = await archivoservicioempresaverificacionDao.insertArchivoservicioempresaverificacion(tx, archivofactoringhistorialestadoToCreate);
        log.debug(line(), "archivoservicioempresaverificacionCreated:", archivoservicioempresaverificacionCreated);
      }
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Concede acceso al usuario en su relación servicio-empresa.
 */
const darAccesoAlUsuarioServicioEmpresa = async (tx: any, servicioempresa: any, personasuscriptor: any, idusuario: number) => {
  const usuarioservicioempresa = await usuarioservicioempresaDao.getUsuarioservicioempresaByIdusuarioIdServicioIdempresa(tx, personasuscriptor.idusuario, servicioempresa.idservicio, servicioempresa.idempresa);
  if (!usuarioservicioempresa) {
    log.warn(line(), `Usuario servicio empresa no existe: [${personasuscriptor.idusuario} - ${servicioempresa.idservicio} - ${servicioempresa.idempresa}]`);
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioempresaestado_con_acceso = 2; // Con acceso
  const usuarioservicioempresaestado = await usuarioservicioempresaestadoDao.getUsuarioservicioempresaestadoByIdusuarioservicioempresaestado(tx, usuarioservicioempresaestado_con_acceso);
  if (!usuarioservicioempresaestado) {
    log.warn(line(), `Usuario servicio empresa estado no existe: [${usuarioservicioempresaestado_con_acceso}]`);
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioempresarol_administrador = 1; // Administrador
  const usuarioservicioempresarol = await usuarioservicioempresarolDao.getUsuarioservicioempresarolByIdusuarioservicioempresarol(tx, usuarioservicioempresarol_administrador);
  if (!usuarioservicioempresarol) {
    log.warn(line(), `Usuario servicio empresa rol no existe: [${usuarioservicioempresarol_administrador}]`);
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioempresaToUpdate: Prisma.usuario_servicio_empresaUpdateInput = {
    usuario_servicio_empresa_estado: { connect: { idusuarioservicioempresaestado: usuarioservicioempresaestado.idusuarioservicioempresaestado } },
    usuario_servicio_empresa_rol: { connect: { idusuarioservicioempresarol: usuarioservicioempresarol.idusuarioservicioempresarol } },
    idusuariomod: idusuario ?? 1,
    fechamod: new Date(),
  };

  const usuarioservicioempresaUpdated = await usuarioservicioempresaDao.updateUsuarioservicioempresa(tx, usuarioservicioempresa.usuarioservicioempresaid, usuarioservicioempresaToUpdate);
  log.debug(line(), "usuarioservicioempresaUpdated", usuarioservicioempresaUpdated);
};

/**
 * Concede acceso al usuario en su relación con el servicio general si está en revisión.
 */
const darAccesoAlUsuarioServicio = async (tx: any, dto: ServicioEmpresaVerificacionCreateDto, servicioempresa: any, empresa: any, personasuscriptor: any, idusuario: number) => {
  const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByIdusuarioIdservicio(tx, personasuscriptor.idusuario, servicioempresa.idservicio);
  if (!usuarioservicio) {
    log.warn(line(), `Usuario servicio no existe: [${personasuscriptor.idusuario} - ${servicioempresa.idservicio}]`);
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioestado_suscrito = 2; // Suscrito
  const usuarioservicioestado = await usuarioservicioestadoDao.getUsuarioservicioestadoByIdusuarioservicioestado(tx, usuarioservicioestado_suscrito);
  if (!usuarioservicioestado) {
    log.warn(line(), `Usuario servicio empresa estado no existe: [${usuarioservicioestado_suscrito}]`);
    throw new ClientError("Datos no válidos", 404);
  }

  // Solo si está en estado En revisión (3)
  if (usuarioservicio.idusuarioservicioestado == 3) {
    const usuarioservicioverificacionToCreate: Prisma.usuario_servicio_verificacionCreateInput = {
      usuario_servicio: { connect: { idusuarioservicio: usuarioservicio.idusuarioservicio } },
      usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
      usuario_verifica: { connect: { idusuario: idusuario } },
      usuarioservicioverificacionid: uuidv4(),
      comentariousuario: dto.comentariousuario,
      comentariointerno: dto.comentariointerno + " // Proceso automático. Se concedió acceso por la verificación de la empresa: " + empresa.code + " - " + empresa.ruc + " - " + empresa.razon_social,
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
  }
};

/**
 * Prepara y envía las notificaciones por correo de acuerdo al estado resultante.
 */
const enviarCorreoSegunCorrespondeNuevoEstadoDeServicioEmpresa = async (dto: ServicioEmpresaVerificacionCreateDto, servicioempresa: any, servicioempresaestado: any, empresa: any, personasuscriptor: any) => {
  if (servicioempresaestado.isenabledcomentariousuario && dto.comentariousuario) {
    const dataEmail = {
      codigo_servicio_empresa: servicioempresa.code,
      nombres: personasuscriptor.usuario.usuarionombres,
      fecha_actual: df.formatDateForEmailLocale(new Date().toISOString()),
      empresa_razon_social: empresa.razon_social,
      empresa_ruc: empresa.ruc,
      razon_no_aceptada: dto.comentariousuario,
    };
    const emailTemplate = await templateManager.templateFactoringEmpresaVerificacionMasInformacion(dataEmail);

    await emailSender.sendContactoFinanzatech({
      to: personasuscriptor.usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  }

  if (servicioempresaestado.idservicioempresaestado == 3) {
    // Email de aprobado
    const dataEmail = {
      codigo_servicio_empresa: servicioempresa.code,
      nombres: personasuscriptor.usuario.usuarionombres,
      fecha_actual: df.formatDateForEmailLocale(new Date().toISOString()),
      empresa_razon_social: empresa.razon_social,
      empresa_ruc: empresa.ruc,
    };
    const emailTemplate = await templateManager.templateFactoringEmpresaVerificacionAprobado(dataEmail);

    await emailSender.sendContactoFinanzatech({
      to: personasuscriptor.usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  } else if (servicioempresaestado.idservicioempresaestado == 2) {
    // Email de rechazado
    const dataEmail = {
      codigo_servicio_empresa: servicioempresa.code,
      nombres: personasuscriptor.usuario.usuarionombres,
      fecha_actual: df.formatDateForEmailLocale(new Date().toISOString()),
      empresa_razon_social: empresa.razon_social,
      empresa_ruc: empresa.ruc,
    };
    const emailTemplate = await templateManager.templateFactoringEmpresaVerificacionRechazado(dataEmail);

    await emailSender.sendContactoFinanzatech({
      to: personasuscriptor.usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  }
};

/**
 * Registra una nueva verificación de servicio empresa y orquesta accesos y notificaciones.
 */
export const createFactoringempresaverificacionService = async (dto: ServicioEmpresaVerificacionCreateDto, idusuario: number) => {
  log.debug(line(), "service::createFactoringempresaverificacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const servicioempresa = await servicioempresaDao.getServicioempresaByServicioempresaid(tx, dto.servicioempresaid);
      if (!servicioempresa) {
        log.warn(line(), `Servicio empresa no existe: [${dto.servicioempresaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const personasuscriptor = await personaDao.getPersonaByIdusuario(tx, servicioempresa.idusuariosuscriptor);
      if (!personasuscriptor) {
        log.warn(line(), `Usuario suscriptor no existe: [${servicioempresa.idusuariosuscriptor}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const empresa = await empresaDao.getEmpresaByIdempresa(tx, servicioempresa.idempresa);
      if (!empresa) {
        log.warn(line(), `Empresa no existe: [${servicioempresa.idempresa}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const servicioempresaestado = await servicioempresaestadoDao.getServicioempresaestadoByServicioempresaestadoid(tx, dto.servicioempresaestadoid);
      if (!servicioempresaestado) {
        log.warn(line(), `Servicio empresa estado no existe: [${dto.servicioempresaestadoid}]`);
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

      const servicioempresaverificacionToCreate: Prisma.servicio_empresa_verificacionCreateInput = {
        servicio_empresa: { connect: { idservicioempresa: servicioempresa.idservicioempresa } },
        servicio_empresa_estado: { connect: { idservicioempresaestado: servicioempresaestado.idservicioempresaestado } },
        usuario_verifica: { connect: { idusuario: idusuario } },
        comentariointerno: dto.comentariointerno,
        comentariousuario: dto.comentariousuario,
        servicioempresaverificacionid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioempresaverificacionCreated = await servicioempresaverificacionDao.insertServicioempresaverificacion(tx, servicioempresaverificacionToCreate);
      log.debug(line(), "servicioempresaverificacionCreated", servicioempresaverificacionCreated);

      for (const archivo of archivos) {
        const archivoservicioempresaverificacionToCreate: Prisma.archivo_servicio_empresa_verificacionCreateInput = {
          archivo: { connect: { idarchivo: archivo.idarchivo } },
          servicio_empresa_verificacion: { connect: { idservicioempresaverificacion: servicioempresaverificacionCreated.idservicioempresaverificacion } },
          idusuariocrea: idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const archivoservicioempresaverificacionCreated = await archivoservicioempresaverificacionDao.insertArchivoservicioempresaverificacion(tx, archivoservicioempresaverificacionToCreate);
        log.debug(line(), "archivoservicioempresaverificacionCreated:", archivoservicioempresaverificacionCreated);
      }

      const servicioempresaToUpdate: Prisma.servicio_empresaUpdateInput = {
        servicio_empresa_estado: { connect: { idservicioempresaestado: servicioempresaestado.idservicioempresaestado } },
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };
      const servicioempresaUpdated = await servicioempresaDao.updateServicioempresa(tx, dto.servicioempresaid, servicioempresaToUpdate);
      log.debug(line(), "servicioempresaUpdated", servicioempresaUpdated);

      // Si el estado es 3 (Suscrito)
      if (servicioempresaestado.idservicioempresaestado == 3) {
        await darAccesoAlUsuarioServicioEmpresa(tx, servicioempresa, personasuscriptor, idusuario);
        await darAccesoAlUsuarioServicio(tx, dto, servicioempresa, empresa, personasuscriptor, idusuario);

        const idrol_empresario = 3;
        const rolExistente = await usuariorolDao.getUsuariorolByIdusuarioIdrol(tx, servicioempresa.idusuariosuscriptor, idrol_empresario);

        if (!rolExistente) {
          const usuariorolToCreate: Prisma.usuario_rolCreateInput = {
            usuario: { connect: { idusuario: servicioempresa.idusuariosuscriptor } },
            rol: { connect: { idrol: idrol_empresario } },
            idusuariocrea: idusuario ?? 1,
            fechacrea: new Date(),
            idusuariomod: idusuario ?? 1,
            fechamod: new Date(),
            estado: 1,
          };
          await usuariorolDao.insertUsuariorol(tx, usuariorolToCreate);
        } else if (rolExistente.estado !== 1) {
          await usuariorolDao.activateUsuariorol(tx, servicioempresa.idusuariosuscriptor, idrol_empresario, idusuario ?? 1);
        }
      }

      await enviarCorreoSegunCorrespondeNuevoEstadoDeServicioEmpresa(dto, servicioempresa, servicioempresaestado, empresa, personasuscriptor);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Obtiene las empresas factoring para verificación.
 */
export const getFactoringempresasByVerificacionService = async () => {
  log.debug(line(), "service::getFactoringempresasByVerificacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estadologico = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const filter_idservicio = [SERVICIO.FACTORING_EMPRESAS];
      const filter_idarchivotipos = [
        ARCHIVO_TIPO.FICHA_RUC,
        ARCHIVO_TIPO.REPORTE_TRIBUTARIO_PARA_TERCEROS,
        ARCHIVO_TIPO.VIGENCIA_DE_PODER_REPRESENTANTE_LEGAL,
        ARCHIVO_TIPO.ENCABEZADO_DEL_EECC_DE_LA_CUENTA_BANCARIA,
      ];
      return await servicioempresaDao.getFactoringempresasByVerificacion(tx, filter_estadologico, filter_idservicio, filter_idarchivotipos);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Obtiene los estados maestros para la verificación.
 */
export const getFactoringempresaverificacionMasterService = async () => {
  log.debug(line(), "service::getFactoringempresaverificacionMasterService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const servicioempresaestados = await servicioempresaestadoDao.getServicioempresaestados(tx, filter_estados);

      return {
        servicioempresaestados,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Activa una verificación de servicio empresa.
 */
export const activateFactoringempresaverificacionService = async (servicioempresaverificacionid: string, idusuario: number) => {
  log.debug(line(), "service::activateFactoringempresaverificacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const resultado = await servicioempresaverificacionDao.activateServicioempresaverificacion(tx, servicioempresaverificacionid, idusuario);
      if (resultado[0] === 0) {
        throw new ClientError("Servicioempresaverificacion no existe", 404);
      }
      return resultado;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina (lógicamente) una verificación de servicio empresa.
 */
export const deleteFactoringempresaverificacionService = async (servicioempresaverificacionid: string, idusuario: number) => {
  log.debug(line(), "service::deleteFactoringempresaverificacionService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const resultado = await servicioempresaverificacionDao.deleteServicioempresaverificacion(tx, servicioempresaverificacionid, idusuario);
      if (resultado[0] === 0) {
        throw new ClientError("Servicioempresaverificacion no existe", 404);
      }
      return resultado;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
