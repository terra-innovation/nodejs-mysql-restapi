import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as servicioempresaDao from "#src/daos/servicioempresa.prisma.Dao.js";
import * as servicioinversionistaDao from "#src/daos/servicioinversionista.prisma.Dao.js";
import * as personaDao from "#src/daos/persona.prisma.Dao.js";
import * as usuariorolDao from "#src/daos/usuariorol.prisma.Dao.js";
import * as inversionistaDao from "#src/daos/inversionista.prisma.Dao.js";
import * as servicioempresaestadoDao from "#src/daos/servicioempresaestado.prisma.Dao.js";
import * as servicioinversionistaestadoDao from "#src/daos/servicioinversionistaestado.prisma.Dao.js";
import * as servicioinversionistaverificacionDao from "#src/daos/servicioinversionistaverificacion.prisma.Dao.js";
import * as usuarioservicioDao from "#src/daos/usuarioservicio.prisma.Dao.js";
import * as usuarioservicioestadoDao from "#src/daos/usuarioservicioestado.prisma.Dao.js";
import * as usuarioservicioverificacionDao from "#src/daos/usuarioservicioverificacion.prisma.Dao.js";
import * as usuarioservicioempresaDao from "#src/daos/usuarioservicioempresa.prisma.Dao.js";
import * as usuarioservicioempresaestadoDao from "#src/daos/usuarioservicioempresaestado.prisma.Dao.js";
import * as usuarioservicioempresarolDao from "#src/daos/usuarioservicioempresarol.prisma.Dao.js";
import type { servicio_empresa_verificacion } from "#root/generated/prisma/ft_factoring/client.js";
import type { servicio_empresa } from "#root/generated/prisma/ft_factoring/client.js";
import type { usuario_servicio_empresa } from "#root/generated/prisma/ft_factoring/client.js";
import type { usuario_servicio_verificacion } from "#root/generated/prisma/ft_factoring/client.js";
import type { usuario_servicio } from "#root/generated/prisma/ft_factoring/client.js";

import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import EmailSender from "#src/utils/email/emailSender.js";
import TemplateManager from "#src/utils/email/TemplateManager.js";

export const createFactoringinversionistaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringinversionistaverificacion");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [1, 2];
  const servicioinversionistaverificacionCreateSchema = yup
    .object()
    .shape({
      servicioinversionistaid: yup.string().min(36).max(36).required(),
      servicioinversionistaestadoid: yup.string().min(36).max(36).required(),
      comentariousuario: yup.string().trim().max(1000),
      comentariointerno: yup.string().trim().max(1000).required(),
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

      // Inserta un nuevo registro en la tabla servicioinversionistaverificacion con el nuevo estado
      const servicioinversionistaverificacionToCreate: Prisma.servicio_inversionista_verificacionCreateInput = {
        servicio_inversionista: { connect: { idservicioinversionista: servicioinversionista.idservicioinversionista } },
        servicio_inversionista_estado: { connect: { idservicioinversionistaestado: servicioinversionistaestado.idservicioinversionistaestado } },
        usuario_verifica: { connect: { idusuario: req.session_user.usuario.idusuario } },
        comentariointerno: servicioinversionistaverificacionValidated.comentariointerno,
        comentariousuario: servicioinversionistaverificacionValidated.comentariousuario,
        servicioinversionistaverificacionid: uuidv4(),
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioinversionistaverificacionCreated = await servicioinversionistaverificacionDao.insertServicioinversionistaverificacion(tx, servicioinversionistaverificacionToCreate);
      log.debug(line(), "servicioinversionistaverificacionCreated", servicioinversionistaverificacionCreated);

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
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, {});
};

const rechazarAccesoAlUsuarioServicio = async (req, tx, servicioinversionistaverificacionValidated, servicioinversionista, inversionista, personasuscriptor) => {
  const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByIdusuarioIdservicio(tx, personasuscriptor.idusuario, servicioinversionista.idservicio);
  if (!usuarioservicio) {
    log.warn(line(), "Usuario servicio no existe: [" + personasuscriptor.idusuario + " - " + servicioinversionista.idservicio + "]");
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

const darAccesoAlUsuarioServicio = async (req, tx, servicioinversionistaverificacionValidated, servicioinversionista, inversionista, personasuscriptor) => {
  const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByIdusuarioIdservicio(tx, personasuscriptor.idusuario, servicioinversionista.idservicio);
  if (!usuarioservicio) {
    log.warn(line(), "Usuario servicio no existe: [" + personasuscriptor.idusuario + " - " + servicioinversionista.idservicio + "]");
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

const enviarCorreoSegunCorrespondeNuevoEstadoDeServicioInversionista = async (servicioinversionistaverificacionValidated, servicioinversionista, servicioinversionistaestado, inversionista, personasuscriptor) => {
  // Prepara y envia un correo
  const templateManager = new TemplateManager();
  const emailSender = new EmailSender();

  if (servicioinversionistaestado.isenabledcomentariousuario) {
    if (servicioinversionistaverificacionValidated.comentariousuario) {
      // Email de más información
      const dataEmail = {
        codigo_servicio_inversionista: servicioinversionista.code,
        nombres: personasuscriptor.usuario.usuarionombres,
        fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
        razon_no_aceptada: servicioinversionistaverificacionValidated.comentariousuario,
      };
      const emailTemplate = await templateManager.templateFactoringInversionistaVerificacionMasInformacion(dataEmail);

      const mailOptions = {
        to: personasuscriptor.usuario.email,
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
      nombres: personasuscriptor.usuario.usuarionombres,
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    };
    const emailTemplate = await templateManager.templateFactoringInversionistaVerificacionAprobado(dataEmail);

    const mailOptions = {
      to: personasuscriptor.usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };
    await emailSender.sendContactoFinanzatech(mailOptions);
  } else if (servicioinversionistaestado.idservicioinversionistaestado == 2) {
    // Email de rechazado
    const dataEmail = {
      codigo_servicio_inversionista: servicioinversionista.code,
      nombres: personasuscriptor.usuario.usuarionombres,
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    };
    const emailTemplate = await templateManager.templateFactoringInversionistaVerificacionRechazado(dataEmail);

    const mailOptions = {
      to: personasuscriptor.usuario.email,
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
      var factoringinversionistasJson = jsonUtils.sequelizeToJSON(factoringinversionistas);
      //log.info(line(),factoringinversionistaObfuscated);

      //var factoringinversionistasFiltered = jsonUtils.removeAttributes(factoringinversionistasJson, ["score"]);
      //factoringinversionistasFiltered = jsonUtils.removeAttributesPrivates(factoringinversionistasFiltered);
      return factoringinversionistasJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringinversionistasJson);
};

export const getFactoringinversionistaverificacionMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringinversionistaverificacionMaster");
  const servicioinversionistaverificacionMaster = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user?.usuario?.idusuario;
      const filter_estados = [1];
      const servicioinversionistaestados = await servicioinversionistaestadoDao.getServicioinversionistaestados(tx, filter_estados);

      let servicioinversionistaverificacionMaster: Record<string, any> = {};
      servicioinversionistaverificacionMaster.servicioinversionistaestados = servicioinversionistaestados;

      return servicioinversionistaverificacionMaster;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, servicioinversionistaverificacionMaster);
};
