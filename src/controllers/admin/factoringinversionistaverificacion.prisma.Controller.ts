import type { Prisma, servicio_inversionista_verificacion } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as archivoservicioinversionistaverificacionDao from "#src/daos/archivoservicioinversionistaverificacion.prisma.Dao.js";
import * as inversionistaDao from "#src/daos/inversionista.prisma.Dao.js";
import * as personaDao from "#src/daos/persona.prisma.Dao.js";
import * as servicioinversionistaDao from "#src/daos/servicioinversionista.prisma.Dao.js";
import * as servicioinversionistaestadoDao from "#src/daos/servicioinversionistaestado.prisma.Dao.js";
import * as servicioinversionistaverificacionDao from "#src/daos/servicioinversionistaverificacion.prisma.Dao.js";
import * as usuariorolDao from "#src/daos/usuariorol.prisma.Dao.js";
import * as usuarioservicioDao from "#src/daos/usuarioservicio.prisma.Dao.js";
import * as usuarioservicioestadoDao from "#src/daos/usuarioservicioestado.prisma.Dao.js";
import * as usuarioservicioverificacionDao from "#src/daos/usuarioservicioverificacion.prisma.Dao.js";

import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";

import * as df from "#src/utils/dateUtils.js";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import EmailSender from "#src/utils/email/emailSender.js";
import TemplateManager from "#src/utils/email/TemplateManager.js";

export const getServicioinversionistaverificacionsByServicioinversionistaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getServicioinversionistaverificacionsByServicioinversionistaid");
  //log.info(line(),req.session_user.usuario.idusuario);
  const { servicioinversionistaid } = req.params;
  const servicioinversionistaverificacionSchema = yup
    .object()
    .shape({
      servicioinversionistaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var servicioinversionistaverificacionValidated = servicioinversionistaverificacionSchema.validateSync({ servicioinversionistaid, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "servicioinversionistaverificacionValidated:", servicioinversionistaverificacionValidated);

  const servicioinversionistaverificacionsJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      var servicioinversionista = await servicioinversionistaDao.getServicioinversionistaByServicioinversionistaid(tx, servicioinversionistaverificacionValidated.servicioinversionistaid);
      if (!servicioinversionista) {
        log.warn(line(), "Servicioinversionista no existe: [" + servicioinversionistaverificacionValidated.servicioinversionistaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const servicioinversionistaverificacions = await servicioinversionistaverificacionDao.getServicioinversionistaverificacionsByIdservicioinversionista(tx, servicioinversionista.idservicioinversionista, filter_estado);

      return servicioinversionistaverificacions;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, servicioinversionistaverificacionsJson);
};

export const updateFactoringinversionistaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringinversionistaverificacion");
  const { servicioinversionistaverificacionid } = req.params;
  let NAME_REGX = /^[a-zA-Z ]+$/;
  const servicioinversionistaverificacionSchema = yup
    .object()
    .shape({
      servicioinversionistaverificacionid: yup.string().min(36).max(36).required(),
      servicioinversionistaestadoid: yup.string().min(36).max(36).required(),
      comentariousuario: yup.string().trim().max(20000),
      comentariointerno: yup.string().trim().max(20000).required(),
      archivos: yup.array().of(yup.string().min(36).max(36)),
    })
    .required();
  const servicioinversionistaverificacionValidated = servicioinversionistaverificacionSchema.validateSync({ servicioinversionistaverificacionid, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "servicioinversionistaverificacionValidated:", servicioinversionistaverificacionValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const servicioinversionistaverificacion = await servicioinversionistaverificacionDao.getServicioinversionistaverificacionByServicioinversionistaverificacionid(tx, servicioinversionistaverificacionValidated.servicioinversionistaverificacionid);
      if (!servicioinversionistaverificacion) {
        log.warn(line(), "Servicioinversionista verificación no existe: [" + servicioinversionistaverificacionValidated.servicioinversionistaverificacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const servicioinversionistaestado = await servicioinversionistaestadoDao.getServicioinversionistaestadoByServicioinversionistaestadoid(tx, servicioinversionistaverificacionValidated.servicioinversionistaestadoid);
      if (!servicioinversionistaestado) {
        log.warn(line(), "Servicioinversionista verificación estado no existe: [" + servicioinversionistaverificacionValidated.servicioinversionistaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      let archivos = [];
      if (servicioinversionistaverificacionValidated.archivos) {
        for (const archivoid of servicioinversionistaverificacionValidated.archivos) {
          var archivo = await archivoDao.getArchivoByArchivoid(tx, archivoid);
          if (!archivo) {
            log.warn(line(), "Archivo no existe: [" + archivoid + "]");
            throw new ClientError("Datos no válidos", 404);
          }
          archivos.push(archivo);
        }
      }

      const servicioinversionistaverificacionToUpdate: Prisma.servicio_inversionista_verificacionUpdateInput = {
        servicio_inversionista_estado: { connect: { idservicioinversionistaestado: servicioinversionistaestado.idservicioinversionistaestado } },
        comentariousuario: servicioinversionistaverificacionValidated.comentariousuario,
        comentariointerno: servicioinversionistaverificacionValidated.comentariointerno,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const servicioinversionistaverificacionUpdated = await servicioinversionistaverificacionDao.updateServicioinversionistaverificacion(tx, servicioinversionistaverificacion.servicioinversionistaverificacionid, servicioinversionistaverificacionToUpdate);
      log.debug(line(), "servicioinversionistaverificacionUpdated:", servicioinversionistaverificacionUpdated);

      for (const archivo of archivos) {
        const archivofactoringhistorialestadoToCreate: Prisma.archivo_servicio_inversionista_verificacionCreateInput = {
          archivo: { connect: { idarchivo: archivo.idarchivo } },
          servicio_inversionista_verificacion: { connect: { idservicioinversionistaverificacion: servicioinversionistaverificacionUpdated.idservicioinversionistaverificacion } },
          idusuariocrea: req.session_user.usuario.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario.idusuario ?? 1,
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
  response(res, 200, {});
};

export const createFactoringinversionistaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringinversionistaverificacion");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
  const servicioinversionistaverificacionCreateSchema = yup
    .object()
    .shape({
      servicioinversionistaid: yup.string().min(36).max(36).required(),
      servicioinversionistaestadoid: yup.string().min(36).max(36).required(),
      comentariousuario: yup.string().trim().max(20000),
      comentariointerno: yup.string().trim().max(20000).required(),
      archivos: yup.array().of(yup.string().min(36).max(36)),
    })
    .required();
  var servicioinversionistaverificacionValidated = servicioinversionistaverificacionCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  //log.debug(line(), "servicioinversionistaverificacionValidated:", servicioinversionistaverificacionValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const servicioinversionista = await servicioinversionistaDao.getServicioinversionistaByServicioinversionistaid(tx, servicioinversionistaverificacionValidated.servicioinversionistaid);
      if (!servicioinversionista) {
        log.warn(line(), "Servicio inversionista no existe: [" + servicioinversionistaverificacionValidated.servicioinversionistaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const personasuscriptor = await personaDao.getPersonaByIdusuario(tx, servicioinversionista.idusuariosuscriptor);
      if (!personasuscriptor) {
        log.warn(line(), "Usuario suscriptor no existe: [" + servicioinversionista.idusuariosuscriptor + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const inversionista = await inversionistaDao.getInversionistaByIdinversionista(tx, servicioinversionista.idinversionista);
      if (!inversionista) {
        log.warn(line(), "Inversionista no existe: [" + servicioinversionista.idinversionista + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const servicioinversionistaestado = await servicioinversionistaestadoDao.getServicioinversionistaestadoByServicioinversionistaestadoid(tx, servicioinversionistaverificacionValidated.servicioinversionistaestadoid);
      if (!servicioinversionistaestado) {
        log.warn(line(), "Servicio inversionista estado no existe: [" + servicioinversionistaverificacionValidated.servicioinversionistaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      let archivos = [];
      if (servicioinversionistaverificacionValidated.archivos) {
        for (const archivoid of servicioinversionistaverificacionValidated.archivos) {
          var archivo = await archivoDao.getArchivoByArchivoid(tx, archivoid);
          if (!archivo) {
            log.warn(line(), "Archivo no existe: [" + archivoid + "]");
            throw new ClientError("Datos no válidos", 404);
          }
          archivos.push(archivo);
        }
      }

      // Inserta un nuevo registro en la tabla servicioinversionistaverificacion con el nuevo estado
      const servicioinversionistaverificacionToCreate: Prisma.servicio_inversionista_verificacionCreateInput = {
        servicio_inversionista: { connect: { idservicioinversionista: servicioinversionista.idservicioinversionista } },
        servicio_inversionista_estado: { connect: { idservicioinversionistaestado: servicioinversionistaestado.idservicioinversionistaestado } },
        usuario_verifica: { connect: { idusuario: req.session_user.usuario.idusuario } },
        comentariointerno: servicioinversionistaverificacionValidated.comentariointerno,
        comentariousuario: servicioinversionistaverificacionValidated.comentariousuario,
        servicioinversionistaverificacionid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioinversionistaverificacionCreated = await servicioinversionistaverificacionDao.insertServicioinversionistaverificacion(tx, servicioinversionistaverificacionToCreate);
      log.debug(line(), "servicioinversionistaverificacionCreated", servicioinversionistaverificacionCreated);

      for (const archivo of archivos) {
        const archivoservicioinversionistaverificacionToCreate: Prisma.archivo_servicio_inversionista_verificacionCreateInput = {
          archivo: { connect: { idarchivo: archivo.idarchivo } },
          servicio_inversionista_verificacion: { connect: { idservicioinversionistaverificacion: servicioinversionistaverificacionCreated.idservicioinversionistaverificacion } },
          idusuariocrea: req.session_user.usuario.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const archivoservicioinversionistaverificacionCreated = await archivoservicioinversionistaverificacionDao.insertArchivoservicioinversionistaverificacion(tx, archivoservicioinversionistaverificacionToCreate);

        log.debug(line(), "archivoservicioinversionistaverificacionCreated:", archivoservicioinversionistaverificacionCreated);
      }

      // Actualiza la tabla servicioinversionista con el nuevo estado
      const servicioinversionistaToUpdate: Prisma.servicio_inversionistaUpdateInput = {
        servicio_inversionista_estado: { connect: { idservicioinversionistaestado: servicioinversionistaestado.idservicioinversionistaestado } },
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };
      const servicioinversionistaUpdated = await servicioinversionistaDao.updateServicioinversionista(tx, servicioinversionistaverificacionValidated.servicioinversionistaid, servicioinversionistaToUpdate);
      log.debug(line(), "servicioinversionistaUpdated", servicioinversionistaUpdated);

      // Si el estado es estado 3 (Suscrito)
      if (servicioinversionistaestado.idservicioinversionistaestado == 3) {
        await darAccesoAlUsuarioServicio(req, tx, servicioinversionistaverificacionValidated, servicioinversionista, inversionista, personasuscriptor);
        /* Damos acceso al usuario como Inversionista */
        const idrol_inversionista = 4;

        const usuariorolToCreate: Prisma.usuario_rolCreateInput = {
          usuario: { connect: { idusuario: servicioinversionista.idusuariosuscriptor } },
          rol: { connect: { idrol: idrol_inversionista } },
          idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const usuariorolCreated = await usuariorolDao.insertUsuariorol(tx, usuariorolToCreate);
      } else if (servicioinversionistaestado.idservicioinversionistaestado == 2) {
        await rechazarAccesoAlUsuarioServicio(req, tx, servicioinversionistaverificacionValidated, servicioinversionista, inversionista, personasuscriptor);
      }

      await enviarCorreoSegunCorrespondeNuevoEstadoDeServicioInversionista(servicioinversionistaverificacionValidated, servicioinversionista, servicioinversionistaestado, inversionista, personasuscriptor);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, {});
};

const rechazarAccesoAlUsuarioServicio = async (req, tx, servicioinversionistaverificacionValidated, servicioinversionista, inversionista, servicioinversionistasuscriptor) => {
  const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByIdusuarioIdservicio(tx, servicioinversionistasuscriptor.idusuario, servicioinversionista.idservicio);
  if (!usuarioservicio) {
    log.warn(line(), "Usuario servicio no existe: [" + servicioinversionistasuscriptor.idusuario + " - " + servicioinversionista.idservicio + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioestado_suscrito = 4; // Rechazado
  const usuarioservicioestado = await usuarioservicioestadoDao.getUsuarioservicioestadoByIdusuarioservicioestado(tx, usuarioservicioestado_suscrito);
  if (!usuarioservicioestado) {
    log.warn(line(), "Usuario servicio estado no existe: [" + usuarioservicioestado_suscrito + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  // Inserta un nuevo registro en la tabla usuarioservicioverificacion con el nuevo estado
  const usuarioservicioverificacionToCreate: Prisma.usuario_servicio_verificacionCreateInput = {
    usuario_servicio: { connect: { idusuarioservicio: usuarioservicio.idusuarioservicio } },
    usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
    usuario_verifica: { connect: { idusuario: req.session_user.usuario.idusuario } },
    usuarioservicioverificacionid: uuidv4(),
    comentariousuario: servicioinversionistaverificacionValidated.comentariousuario,
    comentariointerno: servicioinversionistaverificacionValidated.comentariointerno + " // Proceso automático. Se rechazó acceso por la verificación del inversionista: " + inversionista.code,

    idusuariocrea: req.session_user.usuario.idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user.usuario.idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };

  const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(tx, usuarioservicioverificacionToCreate);
  log.debug(line(), "usuarioservicioverificacionCreated", usuarioservicioverificacionCreated);

  // Actualiza la tabla usuarioservicio con el nuevo estado
  const usuarioservicioToUpdate: Prisma.usuario_servicioUpdateInput = {
    usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
    idusuariomod: req.session_user.usuario.idusuario ?? 1,
    fechamod: new Date(),
  };
  const usuarioservicioUpdated = await usuarioservicioDao.updateUsuarioservicio(tx, usuarioservicio.usuarioservicioid, usuarioservicioToUpdate);
  log.debug(line(), "usuarioservicioUpdated", usuarioservicioUpdated);
};

const darAccesoAlUsuarioServicio = async (req, tx, servicioinversionistaverificacionValidated, servicioinversionista, inversionista, servicioinversionistasuscriptor) => {
  const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByIdusuarioIdservicio(tx, servicioinversionistasuscriptor.idusuario, servicioinversionista.idservicio);
  if (!usuarioservicio) {
    log.warn(line(), "Usuario servicio no existe: [" + servicioinversionistasuscriptor.idusuario + " - " + servicioinversionista.idservicio + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioestado_suscrito = 2; // Suscrito
  const usuarioservicioestado = await usuarioservicioestadoDao.getUsuarioservicioestadoByIdusuarioservicioestado(tx, usuarioservicioestado_suscrito);
  if (!usuarioservicioestado) {
    log.warn(line(), "Usuario servicio estado no existe: [" + usuarioservicioestado_suscrito + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  // Inserta un nuevo registro en la tabla usuarioservicioverificacion con el nuevo estado
  const usuarioservicioverificacionToCreate: Prisma.usuario_servicio_verificacionCreateInput = {
    usuario_servicio: { connect: { idusuarioservicio: usuarioservicio.idusuarioservicio } },
    usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
    usuario_verifica: { connect: { idusuario: req.session_user.usuario.idusuario } },
    usuarioservicioverificacionid: uuidv4(),
    comentariousuario: servicioinversionistaverificacionValidated.comentariousuario,
    comentariointerno: servicioinversionistaverificacionValidated.comentariointerno + " // Proceso automático. Se concedió acceso por la verificación del inversionista: " + inversionista.code,

    idusuariocrea: req.session_user.usuario.idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user.usuario.idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };

  const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(tx, usuarioservicioverificacionToCreate);
  log.debug(line(), "usuarioservicioverificacionCreated", usuarioservicioverificacionCreated);

  // Actualiza la tabla usuarioservicio con el nuevo estado
  const usuarioservicioToUpdate: Prisma.usuario_servicioUpdateInput = {
    usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
    idusuariomod: req.session_user.usuario.idusuario ?? 1,
    fechamod: new Date(),
  };
  const usuarioservicioUpdated = await usuarioservicioDao.updateUsuarioservicio(tx, usuarioservicio.usuarioservicioid, usuarioservicioToUpdate);
  log.debug(line(), "usuarioservicioUpdated", usuarioservicioUpdated);
};

const enviarCorreoSegunCorrespondeNuevoEstadoDeServicioInversionista = async (servicioinversionistaverificacionValidated, servicioinversionista, servicioinversionistaestado, inversionista, servicioinversionistasuscriptor) => {
  // Prepara y envia un correo
  const templateManager = new TemplateManager();
  const emailSender = new EmailSender();

  if (servicioinversionistaestado.isenabledcomentariousuario) {
    if (servicioinversionistaverificacionValidated.comentariousuario) {
      // Email de más información
      const dataEmail = {
        codigo_servicio_inversionista: servicioinversionista.code,
        nombres: servicioinversionistasuscriptor.usuario.usuarionombres,
        fecha_actual: df.formatDateForEmailLocale(new Date().toISOString()),
        razon_no_aceptada: servicioinversionistaverificacionValidated.comentariousuario,
      };
      const emailTemplate = await templateManager.templateFactoringInversionistaVerificacionMasInformacion(dataEmail);

      const mailOptions = {
        to: servicioinversionistasuscriptor.usuario.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      };

      await emailSender.sendContactoFinanzatech(mailOptions);
    }
  }

  if (servicioinversionistaestado.idservicioinversionistaestado == 3) {
    // Email de aprobado
    const dataEmail = {
      codigo_servicio_inversionista: servicioinversionista.code,
      nombres: servicioinversionistasuscriptor.usuario.usuarionombres,
      fecha_actual: df.formatDateForEmailLocale(new Date().toISOString()),
    };
    const emailTemplate = await templateManager.templateFactoringInversionistaVerificacionAprobado(dataEmail);

    const mailOptions = {
      to: servicioinversionistasuscriptor.usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };
    await emailSender.sendContactoFinanzatech(mailOptions);
  } else if (servicioinversionistaestado.idservicioinversionistaestado == 2) {
    // Email de rechazado
    const dataEmail = {
      codigo_servicio_inversionista: servicioinversionista.code,
      nombres: servicioinversionistasuscriptor.usuario.usuarionombres,
      fecha_actual: df.formatDateForEmailLocale(new Date().toISOString()),
    };
    const emailTemplate = await templateManager.templateFactoringInversionistaVerificacionRechazado(dataEmail);

    const mailOptions = {
      to: servicioinversionistasuscriptor.usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };
    await emailSender.sendContactoFinanzatech(mailOptions);
  }
};

export const getFactoringinversionistasByVerificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringinversionistasByVerificacion");
  //log.info(line(),req.session_user.usuario.idusuario);

  const factoringinversionistasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estadologico = [1, 2];
      const filter_idservicio = [2];
      const filter_idarchivotipos = [1, 2, 3];
      const factoringinversionistas = await servicioinversionistaDao.getFactoringinversionistasByVerificacion(tx, filter_estadologico, filter_idservicio, filter_idarchivotipos);

      return factoringinversionistas;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringinversionistasJson);
};

export const getFactoringinversionistaverificacionMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringinversionistaverificacionMaster");
  const servicioinversionistaverificacionMaster = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user?.usuario?.idusuario;
      const filter_estados = [ESTADO.ACTIVO];
      const servicioinversionistaestados = await servicioinversionistaestadoDao.getServicioinversionistaestados(tx, filter_estados);

      let servicioinversionistaverificacionMaster: Record<string, any> = {};
      servicioinversionistaverificacionMaster.servicioinversionistaestados = servicioinversionistaestados;

      return servicioinversionistaverificacionMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, servicioinversionistaverificacionMaster);
};

export const activateFactoringinversionistaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateServicioinversionistaverificacion");
  const { servicioinversionistaverificacionid } = req.params;
  const servicioinversionistaverificacionSchema = yup
    .object()
    .shape({
      servicioinversionistaverificacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const servicioinversionistaverificacionValidated = servicioinversionistaverificacionSchema.validateSync({ servicioinversionistaverificacionid: servicioinversionistaverificacionid }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "servicioinversionistaverificacionValidated:", servicioinversionistaverificacionValidated);

  const servicioinversionistaverificacionActivated = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAuditoria: Partial<servicio_inversionista_verificacion> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario.idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 1;

      const servicioinversionistaverificacionActivated = await servicioinversionistaverificacionDao.activateServicioinversionistaverificacion(tx, servicioinversionistaverificacionValidated.servicioinversionistaverificacionid, req.session_user.usuario.idusuario);
      if (servicioinversionistaverificacionActivated[0] === 0) {
        throw new ClientError("Servicioinversionistaverificacion no existe", 404);
      }
      log.debug(line(), "servicioinversionistaverificacionActivated:", servicioinversionistaverificacionActivated);
      return servicioinversionistaverificacionActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, servicioinversionistaverificacionActivated);
};

export const deleteFactoringinversionistaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteServicioinversionistaverificacion");
  const { servicioinversionistaverificacionid } = req.params;
  const servicioinversionistaverificacionSchema = yup
    .object()
    .shape({
      servicioinversionistaverificacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const servicioinversionistaverificacionValidated = servicioinversionistaverificacionSchema.validateSync({ servicioinversionistaverificacionid: servicioinversionistaverificacionid }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "servicioinversionistaverificacionValidated:", servicioinversionistaverificacionValidated);

  const servicioinversionistaverificacionDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      const servicioinversionistaverificacionDeleted = await servicioinversionistaverificacionDao.deleteServicioinversionistaverificacion(tx, servicioinversionistaverificacionValidated.servicioinversionistaverificacionid, req.session_user.usuario.idusuario);
      if (servicioinversionistaverificacionDeleted[0] === 0) {
        throw new ClientError("Servicioinversionistaverificacion no existe", 404);
      }
      log.debug(line(), "servicioinversionistaverificacionDeleted:", servicioinversionistaverificacionDeleted);
      return servicioinversionistaverificacionDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, servicioinversionistaverificacionDeleted);
};
