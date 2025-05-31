import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as personaverificacionDao from "#src/daos/personaverificacion.prisma.Dao.js";
import * as personaverificacionestadoDao from "#src/daos/personaverificacionestado.prisma.Dao.js";
import * as personaDao from "#src/daos/persona.prisma.Dao.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";
import * as usuarioservicioDao from "#src/daos/usuarioservicio.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import EmailSender from "#src/utils/email/emailSender.js";
import TemplateManager from "#src/utils/email/TemplateManager.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import type { persona_verificacion } from "#src/models/prisma/ft_factoring/client";
import type { persona } from "#src/models/prisma/ft_factoring/client";
import type { usuario } from "#src/models/prisma/ft_factoring/client";

export const activatePersonaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activatePersonaverificacion");
  const { id } = req.params;
  const personaverificacionSchema = yup
    .object()
    .shape({
      personaverificacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const personaverificacionValidated = personaverificacionSchema.validateSync({ personaverificacionid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  const personaverificacionDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAuditoria: Partial<persona_verificacion> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario.idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 1;

      const personaverificacionDeleted = await personaverificacionDao.activatePersonaverificacion(tx, { ...personaverificacionValidated, ...camposAuditoria });
      if (personaverificacionDeleted[0] === 0) {
        throw new ClientError("Personaverificacion no existe", 404);
      }
      log.debug(line(), "personaverificacionActivated:", personaverificacionDeleted);
      return personaverificacionDeleted;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, personaverificacionDeleted);
};

export const deletePersonaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deletePersonaverificacion");
  const { id } = req.params;
  const personaverificacionSchema = yup
    .object()
    .shape({
      personaverificacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const personaverificacionValidated = personaverificacionSchema.validateSync({ personaverificacionid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  const personaverificacionDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAuditoria: Partial<persona_verificacion> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario.idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 2;

      const personaverificacionDeleted = await personaverificacionDao.deletePersonaverificacion(tx, { ...personaverificacionValidated, ...camposAuditoria });
      if (personaverificacionDeleted[0] === 0) {
        throw new ClientError("Personaverificacion no existe", 404);
      }
      log.debug(line(), "personaverificacionDeleted:", personaverificacionDeleted);
      return personaverificacionDeleted;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, personaverificacionDeleted);
};

export const getPersonaverificacionMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonaverificacionMaster");
  const personaverificacionMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user?.usuario?.idusuario;
      const filter_estados = [1];
      const personaverificacionestados = await personaverificacionestadoDao.getPersonaverificacionestados(tx, filter_estados);

      let personaverificacionMaster: Record<string, any> = {};
      personaverificacionMaster.personaverificacionestados = personaverificacionestados;

      let personaverificacionMasterJSON = jsonUtils.sequelizeToJSON(personaverificacionMaster);
      //jsonUtils.prettyPrint(personaverificacionMasterJSON);
      let personaverificacionMasterObfuscated = jsonUtils.ofuscarAtributosDefault(personaverificacionMasterJSON);
      //jsonUtils.prettyPrint(personaverificacionMasterObfuscated);
      let personaverificacionMasterFiltered = jsonUtils.removeAttributesPrivates(personaverificacionMasterObfuscated);
      //jsonUtils.prettyPrint(personaverificacionMaster);
      return personaverificacionMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, personaverificacionMasterFiltered);
};

export const updatePersonaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updatePersonaverificacion");
  const { id } = req.params;
  let NAME_REGX = /^[a-zA-Z ]+$/;
  const personaverificacionUpdateSchema = yup
    .object()
    .shape({
      personaverificacionid: yup.string().trim().required().min(36).max(36),
      personaverificacionnombres: yup.string().trim().required().matches(NAME_REGX, "Debe ser un nombre válido").min(2).max(100),
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
    })
    .required();
  const personaverificacionValidated = personaverificacionUpdateSchema.validateSync({ personaverificacionid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var camposFk = {};

      var camposAdicionales: Partial<persona_verificacion> = {};
      camposAdicionales.personaverificacionid = personaverificacionValidated.personaverificacionid;

      var camposAuditoria: Partial<persona_verificacion> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario.idusuario ?? 1;
      camposAuditoria.fechamod = new Date();

      const result = await personaverificacionDao.updatePersonaverificacion(tx, {
        ...camposFk,
        ...camposAdicionales,
        ...personaverificacionValidated,
        ...camposAuditoria,
      });
      if (result[0] === 0) {
        throw new ClientError("Personaverificacion no existe", 404);
      }
      const personaverificacionUpdated = await personaverificacionDao.getPersonaverificacionByPersonaverificacionid(tx, id);
      if (!personaverificacionUpdated) {
        throw new ClientError("Personaverificacion no existe", 404);
      }
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, {});
};

export const getPersonaverificacions = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonaverificacions");
  const personaverificacionverificacionsJson = await prismaFT.client.$transaction(
    async (tx) => {
      //log.info(line(),req.session_user.usuario.idusuario);

      const filter_estado = [1, 2];
      const filter_idarchivotipo = [1, 2, 3];
      const personaverificacionverificacions = await personaDao.getPersonasByVerificacion(tx, filter_estado, filter_idarchivotipo);
      var personaverificacionverificacionsJson = jsonUtils.sequelizeToJSON(personaverificacionverificacions);
      //log.info(line(),personaverificacionObfuscated);

      //var personaverificacionverificacionsFiltered = jsonUtils.removeAttributes(personaverificacionverificacionsJson, ["score"]);
      //personaverificacionverificacionsFiltered = jsonUtils.removeAttributesPrivates(personaverificacionverificacionsFiltered);
      return personaverificacionverificacionsJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, personaverificacionverificacionsJson);
};

export const createPersonaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createPersonaverificacion");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [1, 2];
  const personaverificacionCreateSchema = yup
    .object()
    .shape({
      personaid: yup.string().min(36).max(36).required(),
      personaverificacionestadoid: yup.string().min(36).max(36).required(),
      comentariousuario: yup.string().trim().max(1000),
      comentariointerno: yup.string().trim().max(1000).required(),
    })
    .required();
  var personaverificacionValidated = personaverificacionCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  //log.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const persona = await personaDao.getPersonaByPersonaid(tx, personaverificacionValidated.personaid);
      if (!persona) {
        log.warn(line(), "Persona no existe: [" + personaverificacionValidated.personaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByPersonaverificacionestadoid(tx, personaverificacionValidated.personaverificacionestadoid);
      if (!personaverificacionestado) {
        log.warn(line(), "Persona verificación estado no existe: [" + personaverificacionValidated.personaverificacionestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const personaverificacionToCreate: Prisma.persona_verificacionCreateInput = {
        persona: {
          connect: {
            idpersona: persona.idpersona,
          },
        },
        persona_verificacion_estado: {
          connect: {
            idpersonaverificacionestado: personaverificacionestado.idpersonaverificacionestado,
          },
        },
        usuario_verifica: {
          connect: {
            idusuario: req.session_user.usuario.idusuario,
          },
        },
        comentariointerno: personaverificacionValidated.comentariointerno,
        comentariousuario: personaverificacionValidated.comentariousuario,
        personaverificacionid: uuidv4(),
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const personaverificacionCreated = await personaverificacionDao.insertPersonaverificacion(tx, personaverificacionToCreate);
      log.debug(line(), "personaverificacionCreated", personaverificacionCreated);

      const personaToUpdate: Partial<persona> = {
        personaid: persona.personaid,
        idpersonaverificacionestado: personaverificacionestado.idpersonaverificacionestado,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const personaUpdated = await personaDao.updatePersona(tx, personaToUpdate);
      log.debug(line(), "personaUpdated", personaUpdated);

      // Actualizamos el usuario solo si la validación de la persona es aprobado
      if (personaverificacionestado.ispersonavalidated) {
        const usuarioToUpdate: Partial<usuario> = {
          usuarioid: persona.usuario.usuarioid,
          ispersonavalidated: personaverificacionestado.ispersonavalidated,
          idusuariomod: req.session_user.usuario.idusuario ?? 1,
          fechamod: new Date(),
        };

        const usuarioUpdated = await usuarioDao.updateUsuario(tx, usuarioToUpdate);
        log.debug(line(), "usuarioUpdated", usuarioUpdated);
      }

      /* Si la verificación tiene código 4 que es aprobado, se habilitan los servicios para que pueda suscribirse */
      const idusuario_session = req.session_user.usuario.idusuario ?? 1;
      if (personaverificacionestado.idpersonaverificacionestado == 4) {
        await usuarioservicioDao.habilitarServiciosParaUsuario(tx, persona.usuario.idusuario, idusuario_session);
      }

      await enviarCorreoSegunCorrespondeNuevoEstadoDePersona(personaverificacionValidated, personaverificacionestado, persona);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, {});
};

const enviarCorreoSegunCorrespondeNuevoEstadoDePersona = async (personaverificacionValidated, personaverificacionestado, persona) => {
  // Prepara y envia un correo
  const templateManager = new TemplateManager();
  const emailSender = new EmailSender();

  if (personaverificacionestado.isenabledcomentariousuario) {
    if (personaverificacionValidated.comentariousuario) {
      const dataEmail = {
        codigo_usuario: persona.usuario.code,
        nombres: persona.usuario.usuarionombres,
        razon_no_aceptada: personaverificacionValidated.comentariousuario,
        fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
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

  /* Si la verificación tiene código 4 que es aprobado, se le envía un correo de éxito */
  if (personaverificacionestado.idpersonaverificacionestado == 4) {
    const dataEmail = {
      codigo_usuario: persona.usuario.code,
      nombres: persona.usuario.usuarionombres,
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
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
