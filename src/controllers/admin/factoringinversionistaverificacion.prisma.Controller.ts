import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as servicioempresaDao from "#src/daos/servicioempresa.prisma.Dao.js";
import * as personaDao from "#src/daos/persona.prisma.Dao.js";
import * as usuariorolDao from "#src/daos/usuariorol.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as servicioempresaestadoDao from "#src/daos/servicioempresaestado.prisma.Dao.js";
import * as servicioempresaverificacionDao from "#src/daos/servicioempresaverificacion.prisma.Dao.js";
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
  const servicioempresaverificacionCreateSchema = yup
    .object()
    .shape({
      servicioempresaid: yup.string().min(36).max(36).required(),
      servicioempresaestadoid: yup.string().min(36).max(36).required(),
      comentariousuario: yup.string().trim().max(1000),
      comentariointerno: yup.string().trim().max(1000).required(),
    })
    .required();
  var servicioempresaverificacionValidated = servicioempresaverificacionCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  //log.debug(line(), "servicioempresaverificacionValidated:", servicioempresaverificacionValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const servicioempresa = await servicioempresaDao.getServicioempresaByServicioempresaid(tx, servicioempresaverificacionValidated.servicioempresaid);
      if (!servicioempresa) {
        log.warn(line(), "Servicio empresa no existe: [" + servicioempresaverificacionValidated.servicioempresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const personasuscriptor = await personaDao.getPersonaByIdusuario(tx, servicioempresa.idusuariosuscriptor);
      if (!personasuscriptor) {
        log.warn(line(), "Usuario suscriptor no existe: [" + servicioempresa.idusuariosuscriptor + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const empresa = await empresaDao.getEmpresaByIdempresa(tx, servicioempresa.idempresa);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + servicioempresa.idempresa + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const servicioempresaestado = await servicioempresaestadoDao.getServicioempresaestadoByServicioempresaestadoid(tx, servicioempresaverificacionValidated.servicioempresaestadoid);
      if (!servicioempresaestado) {
        log.warn(line(), "Servicio empresa estado no existe: [" + servicioempresaverificacionValidated.servicioempresaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      // Inserta un nuevo registro en la tabla servicioempresaverificacion con el nuevo estado
      const servicioempresaverificacionToCreate: Prisma.servicio_empresa_verificacionCreateInput = {
        servicio_empresa: { connect: { idservicioempresa: servicioempresa.idservicioempresa } },
        servicio_empresa_estado: { connect: { idservicioempresaestado: servicioempresaestado.idservicioempresaestado } },
        usuario_verifica: { connect: { idusuario: req.session_user.usuario.idusuario } },
        comentariointerno: servicioempresaverificacionValidated.comentariointerno,
        comentariousuario: servicioempresaverificacionValidated.comentariousuario,
        servicioempresaverificacionid: uuidv4(),
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioempresaverificacionCreated = await servicioempresaverificacionDao.insertServicioempresaverificacion(tx, servicioempresaverificacionToCreate);
      log.debug(line(), "servicioempresaverificacionCreated", servicioempresaverificacionCreated);

      // Actualiza la tabla servicioempresa con el nuevo estado
      const servicioempresaToUpdate: Prisma.servicio_empresaUpdateInput = {
        servicio_empresa_estado: { connect: { idservicioempresaestado: servicioempresaestado.idservicioempresaestado } },
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };
      const servicioempresaUpdated = await servicioempresaDao.updateServicioempresa(tx, servicioempresaverificacionValidated.servicioempresaid, servicioempresaToUpdate);
      log.debug(line(), "servicioempresaUpdated", servicioempresaUpdated);

      // Si el estado es estado 3 (Suscrito)
      if (servicioempresaestado.idservicioempresaestado == 3) {
        await darAccesoAlUsuarioServicioEmpresa(req, tx, servicioempresa, personasuscriptor);
        await darAccesoAlUsuarioServicio(req, tx, servicioempresaverificacionValidated, servicioempresa, empresa, personasuscriptor);
        /* Damos acceso al usuario como Empresario */
        const idrol_empresario = 3;

        const usuariorolToCreate: Prisma.usuario_rolCreateInput = {
          usuario: { connect: { idusuario: servicioempresa.idusuariosuscriptor } },
          rol: { connect: { idrol: idrol_empresario } },
          idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const usuariorolCreated = await usuariorolDao.insertUsuariorol(tx, usuariorolToCreate);
      }

      await enviarCorreoSegunCorrespondeNuevoEstadoDeServicioEmpresa(servicioempresaverificacionValidated, servicioempresa, servicioempresaestado, empresa, personasuscriptor);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, {});
};

const darAccesoAlUsuarioServicioEmpresa = async (req, tx, servicioempresa, personasuscriptor) => {
  const usuarioservicioempresa = await usuarioservicioempresaDao.getUsuarioservicioempresaByIdusuarioIdServicioIdempresa(tx, personasuscriptor.idusuario, servicioempresa.idservicio, servicioempresa.idempresa);
  if (!usuarioservicioempresa) {
    log.warn(line(), "Usuario servicio empresa no existe: [" + personasuscriptor.idusuario + " - " + servicioempresa.idservicio + " - " + servicioempresa.idempresa + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioempresaestado_con_acceso = 2; // Con acceso
  const usuarioservicioempresaestado = await usuarioservicioempresaestadoDao.getUsuarioservicioempresaestadoByIdusuarioservicioempresaestado(tx, usuarioservicioempresaestado_con_acceso);
  if (!usuarioservicioempresaestado) {
    log.warn(line(), "Usuario servicio empresa estado no existe: [" + usuarioservicioempresaestado_con_acceso + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioempresarol_administrador = 1; // Administrador
  const usuarioservicioempresarol = await usuarioservicioempresarolDao.getUsuarioservicioempresarolByIdusuarioservicioempresarol(tx, usuarioservicioempresarol_administrador);
  if (!usuarioservicioempresarol) {
    log.warn(line(), "Usuario servicio empresa rol no existe: [" + usuarioservicioempresarol_administrador + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  // Actualiza la tabla usuarioservicioempresa con el nuevo estado
  const usuarioservicioempresaToUpdate: Prisma.usuario_servicio_empresaUpdateInput = {
    usuario_servicio_empresa_estado: { connect: { idusuarioservicioempresaestado: usuarioservicioempresaestado.idusuarioservicioempresaestado } },
    usuario_servicio_empresa_rol: { connect: { idusuarioservicioempresarol: usuarioservicioempresarol.idusuarioservicioempresarol } },
    idusuariomod: req.session_user.usuario.idusuario ?? 1,
    fechamod: new Date(),
  };

  const usuarioservicioempresaUpdated = await usuarioservicioempresaDao.updateUsuarioservicioempresa(tx, usuarioservicioempresa.usuarioservicioempresaid, usuarioservicioempresaToUpdate);
  log.debug(line(), "usuarioservicioempresaUpdated", usuarioservicioempresaUpdated);
};

const darAccesoAlUsuarioServicio = async (req, tx, servicioempresaverificacionValidated, servicioempresa, empresa, personasuscriptor) => {
  const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByIdusuarioIdservicio(tx, personasuscriptor.idusuario, servicioempresa.idservicio);
  if (!usuarioservicio) {
    log.warn(line(), "Usuario servicio no existe: [" + personasuscriptor.idusuario + " - " + servicioempresa.idservicio + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioestado_suscrito = 2; // Suscrito
  const usuarioservicioestado = await usuarioservicioestadoDao.getUsuarioservicioestadoByIdusuarioservicioestado(tx, usuarioservicioestado_suscrito);
  if (!usuarioservicioestado) {
    log.warn(line(), "Usuario servicio empresa estado no existe: [" + usuarioservicioestado_suscrito + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  // Inserta un nuevo registro en la tabla usuarioservicioverificacion con el nuevo estado
  const usuarioservicioverificacionToCreate: Prisma.usuario_servicio_verificacionCreateInput = {
    usuario_servicio: { connect: { idusuarioservicio: usuarioservicio.idusuarioservicio } },
    usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
    usuario_verifica: { connect: { idusuario: req.session_user.usuario.idusuario } },
    usuarioservicioverificacionid: uuidv4(),
    comentariousuario: servicioempresaverificacionValidated.comentariousuario,
    comentariointerno: servicioempresaverificacionValidated.comentariointerno + " // Proceso automático. Se concedió acceso por la verificación de la empresa: " + empresa.code + " - " + empresa.ruc + " - " + empresa.razon_social,

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

const enviarCorreoSegunCorrespondeNuevoEstadoDeServicioEmpresa = async (servicioempresaverificacionValidated, servicioempresa, servicioempresaestado, empresa, personasuscriptor) => {
  // Prepara y envia un correo
  const templateManager = new TemplateManager();
  const emailSender = new EmailSender();

  if (servicioempresaestado.isenabledcomentariousuario) {
    if (servicioempresaverificacionValidated.comentariousuario) {
      // Email de más información
      const dataEmail = {
        codigo_servicio_empresa: servicioempresa.code,
        nombres: personasuscriptor.usuario.usuarionombres,
        fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
        empresa_razon_social: empresa.razon_social,
        empresa_ruc: empresa.ruc,
        razon_no_aceptada: servicioempresaverificacionValidated.comentariousuario,
      };
      const emailTemplate = await templateManager.templateFactoringEmpresaVerificacionMasInformacion(dataEmail);

      const mailOptions = {
        to: personasuscriptor.usuario.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      };

      await emailSender.sendContactoFinanzatech(mailOptions);
    }
  }

  if (servicioempresaestado.idservicioempresaestado == 3) {
    // Email de aprobado
    const dataEmail = {
      codigo_servicio_empresa: servicioempresa.code,
      nombres: personasuscriptor.usuario.usuarionombres,
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
      empresa_razon_social: empresa.razon_social,
      empresa_ruc: empresa.ruc,
    };
    const emailTemplate = await templateManager.templateFactoringEmpresaVerificacionAprobado(dataEmail);

    const mailOptions = {
      to: personasuscriptor.usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };
    await emailSender.sendContactoFinanzatech(mailOptions);
  } else if (servicioempresaestado.idservicioempresaestado == 2) {
    // Email de rechazado
    const dataEmail = {
      codigo_servicio_empresa: servicioempresa.code,
      nombres: personasuscriptor.usuario.usuarionombres,
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
      empresa_razon_social: empresa.razon_social,
      empresa_ruc: empresa.ruc,
    };
    const emailTemplate = await templateManager.templateFactoringEmpresaVerificacionRechazado(dataEmail);

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

  const factoringempresasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estadologico = [1, 2];
      const filter_idservicio = [1];
      const filter_idarchivotipos = [4, 5, 6, 7];
      const factoringempresas = await servicioempresaDao.getFactoringinversionistasByVerificacion(tx, filter_estadologico, filter_idservicio, filter_idarchivotipos);
      var factoringempresasJson = jsonUtils.sequelizeToJSON(factoringempresas);
      //log.info(line(),factoringempresaObfuscated);

      //var factoringempresasFiltered = jsonUtils.removeAttributes(factoringempresasJson, ["score"]);
      //factoringempresasFiltered = jsonUtils.removeAttributesPrivates(factoringempresasFiltered);
      return factoringempresasJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringempresasJson);
};

export const getFactoringinversionistaverificacionMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringinversionistaverificacionMaster");
  const servicioempresaverificacionMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user?.usuario?.idusuario;
      const filter_estados = [1];
      const servicioempresaestados = await servicioempresaestadoDao.getServicioempresaestados(tx, filter_estados);

      let servicioempresaverificacionMaster: Record<string, any> = {};
      servicioempresaverificacionMaster.servicioempresaestados = servicioempresaestados;

      let servicioempresaverificacionMasterJSON = jsonUtils.sequelizeToJSON(servicioempresaverificacionMaster);
      //jsonUtils.prettyPrint(servicioempresaverificacionMasterJSON);
      let servicioempresaverificacionMasterObfuscated = jsonUtils.ofuscarAtributosDefault(servicioempresaverificacionMasterJSON);
      //jsonUtils.prettyPrint(servicioempresaverificacionMasterObfuscated);
      let servicioempresaverificacionMasterFiltered = jsonUtils.removeAttributesPrivates(servicioempresaverificacionMasterObfuscated);
      //jsonUtils.prettyPrint(servicioempresaverificacionMaster);
      return servicioempresaverificacionMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, servicioempresaverificacionMasterFiltered);
};
