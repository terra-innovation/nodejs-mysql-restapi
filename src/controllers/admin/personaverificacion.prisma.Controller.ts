import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
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

import * as df from "#src/utils/dateUtils.js";

import type { persona_verificacion } from "#root/generated/prisma/ft_factoring/client.js";
import type { persona } from "#root/generated/prisma/ft_factoring/client.js";
import type { usuario } from "#root/generated/prisma/ft_factoring/client.js";

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

  const personaverificacionActivated = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAuditoria: Partial<persona_verificacion> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario.idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 1;

      const personaverificacionActivated = await personaverificacionDao.activatePersonaverificacion(tx, personaverificacionValidated.personaverificacionid, req.session_user.usuario.idusuario);
      if (personaverificacionActivated[0] === 0) {
        throw new ClientError("Personaverificacion no existe", 404);
      }
      log.debug(line(), "personaverificacionActivated:", personaverificacionActivated);
      return personaverificacionActivated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, personaverificacionActivated);
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
      const personaverificacionDeleted = await personaverificacionDao.deletePersonaverificacion(tx, personaverificacionValidated.personaverificacionid, req.session_user.usuario.idusuario);
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
      personaverificacionestadoid: yup.string().min(36).max(36).required(),
      comentariousuario: yup.string().trim().max(1000),
      comentariointerno: yup.string().trim().max(1000).required(),
    })
    .required();
  const personaverificacionValidated = personaverificacionUpdateSchema.validateSync({ personaverificacionid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const personaverificacion = await personaverificacionDao.getPersonaverificacionByPersonaverificacionid(tx, personaverificacionValidated.personaverificacionid);
      if (!personaverificacion) {
        log.warn(line(), "Persona verificación no existe: [" + personaverificacionValidated.personaverificacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByPersonaverificacionestadoid(tx, personaverificacionValidated.personaverificacionestadoid);
      if (!personaverificacionestado) {
        log.warn(line(), "Persona verificación estado no existe: [" + personaverificacionValidated.personaverificacionestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const personaverificacionToUpdate: Prisma.persona_verificacionUpdateInput = {
        persona_verificacion_estado: { connect: { idpersonaverificacionestado: personaverificacionestado.idpersonaverificacionestado } },
        comentariousuario: personaverificacionValidated.comentariousuario,
        comentariointerno: personaverificacionValidated.comentariointerno,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const result = await personaverificacionDao.updatePersonaverificacion(tx, personaverificacion.personaverificacionid, personaverificacionToUpdate);
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

      const personaToUpdate: Prisma.personaUpdateInput = {
        persona_verificacion_estado: { connect: { idpersonaverificacionestado: personaverificacionestado.idpersonaverificacionestado } },
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const personaUpdated = await personaDao.updatePersona(tx, persona.personaid, personaToUpdate);
      log.debug(line(), "personaUpdated", personaUpdated);

      // Actualizamos el usuario solo si la validación de la persona es aprobado
      if (personaverificacionestado.ispersonavalidated) {
        const usuarioToUpdate: Prisma.usuarioUpdateInput = {
          ispersonavalidated: personaverificacionestado.ispersonavalidated,
          idusuariomod: req.session_user.usuario.idusuario ?? 1,
          fechamod: new Date(),
        };

        const usuarioUpdated = await usuarioDao.updateUsuario(tx, persona.usuario.usuarioid, usuarioToUpdate);
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

  /* Si la verificación tiene código 4 que es aprobado, se le envía un correo de éxito */
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
