import * as personaverificacionDao from "#src/daos/personaverificacionDao.js";
import * as personaverificacionestadoDao from "#src/daos/personaverificacionestadoDao.js";
import * as personaDao from "#src/daos/personaDao.js";
import * as usuarioDao from "#src/daos/usuarioDao.js";
import * as usuarioservicioDao from "#src/daos/usuarioservicioDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import EmailSender from "#src/utils/email/emailSender.js";
import TemplateManager from "#src/utils/email/TemplateManager.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize, Op } from "sequelize";
import { PersonaVerificacionAttributes } from "#root/src/models/ft_factoring/PersonaVerificacion";
import { PersonaAttributes } from "#root/src/models/ft_factoring/Persona";
import { UsuarioAttributes } from "#root/src/models/ft_factoring/Usuario";

export const activatePersonaverificacion = async (req, res) => {
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

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria: Partial<PersonaVerificacionAttributes> = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const personaverificacionDeleted = await personaverificacionDao.activatePersonaverificacion(transaction, { ...personaverificacionValidated, ...camposAuditoria });
    if (personaverificacionDeleted[0] === 0) {
      throw new ClientError("Personaverificacion no existe", 404);
    }
    log.debug(line(), "personaverificacionActivated:", personaverificacionDeleted);
    await transaction.commit();
    response(res, 204, personaverificacionDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const deletePersonaverificacion = async (req, res) => {
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

  const transaction = await sequelizeFT.transaction();
  try {
    var camposAuditoria: Partial<PersonaVerificacionAttributes> = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 2;

    const personaverificacionDeleted = await personaverificacionDao.deletePersonaverificacion(transaction, { ...personaverificacionValidated, ...camposAuditoria });
    if (personaverificacionDeleted[0] === 0) {
      throw new ClientError("Personaverificacion no existe", 404);
    }
    log.debug(line(), "personaverificacionDeleted:", personaverificacionDeleted);
    await transaction.commit();
    response(res, 204, personaverificacionDeleted);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getPersonaverificacionMaster = async (req, res) => {
  log.debug(line(), "controller::getPersonaverificacionMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user?.usuario?._idusuario;
    const filter_estados = [1];
    const personaverificacionestados = await personaverificacionestadoDao.getPersonaverificacionestados(transaction, filter_estados);

    let personaverificacionMaster: Record<string, any> = {};
    personaverificacionMaster.personaverificacionestados = personaverificacionestados;

    let personaverificacionMasterJSON = jsonUtils.sequelizeToJSON(personaverificacionMaster);
    //jsonUtils.prettyPrint(personaverificacionMasterJSON);
    let personaverificacionMasterObfuscated = jsonUtils.ofuscarAtributosDefault(personaverificacionMasterJSON);
    //jsonUtils.prettyPrint(personaverificacionMasterObfuscated);
    let personaverificacionMasterFiltered = jsonUtils.removeAttributesPrivates(personaverificacionMasterObfuscated);
    //jsonUtils.prettyPrint(personaverificacionMaster);
    await transaction.commit();
    response(res, 201, personaverificacionMasterFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const updatePersonaverificacion = async (req, res) => {
  log.debug(line(), "controller::updatePersonaverificacion");
  const { id } = req.params;
  let NAME_REGX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
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

  const transaction = await sequelizeFT.transaction();
  try {
    var camposFk = {};

    var camposAdicionales: Partial<PersonaVerificacionAttributes> = {};
    camposAdicionales.personaverificacionid = personaverificacionValidated.personaverificacionid;

    var camposAuditoria: Partial<PersonaVerificacionAttributes> = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const result = await personaverificacionDao.updatePersonaverificacion(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...personaverificacionValidated,
      ...camposAuditoria,
    });
    if (result[0] === 0) {
      throw new ClientError("Personaverificacion no existe", 404);
    }
    const personaverificacionUpdated = await personaverificacionDao.getPersonaverificacionByPersonaverificacionid(transaction, id);
    if (!personaverificacionUpdated) {
      throw new ClientError("Personaverificacion no existe", 404);
    }
    await transaction.commit();
    response(res, 200, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getPersonaverificacions = async (req, res) => {
  log.debug(line(), "controller::getPersonaverificacions");
  const transaction = await sequelizeFT.transaction();
  try {
    //log.info(line(),req.session_user.usuario._idusuario);

    const filter_estado = [1, 2];
    const filter_idarchivotipo = [1, 2, 3];
    const personaverificacionverificacions = await personaDao.getPersonasByVerificacion(transaction, filter_estado, filter_idarchivotipo);
    var personaverificacionverificacionsJson = jsonUtils.sequelizeToJSON(personaverificacionverificacions);
    //log.info(line(),personaverificacionObfuscated);

    //var personaverificacionverificacionsFiltered = jsonUtils.removeAttributes(personaverificacionverificacionsJson, ["score"]);
    //personaverificacionverificacionsFiltered = jsonUtils.removeAttributesPrivates(personaverificacionverificacionsFiltered);
    await transaction.commit();
    response(res, 201, personaverificacionverificacionsJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createPersonaverificacion = async (req, res) => {
  log.debug(line(), "controller::createPersonaverificacion");
  const session_idusuario = req.session_user.usuario._idusuario;
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

  const transaction = await sequelizeFT.transaction();
  try {
    const persona = await personaDao.getPersonaByPersonaid(transaction, personaverificacionValidated.personaid);
    if (!persona) {
      log.warn(line(), "Persona no existe: [" + personaverificacionValidated.personaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByPersonaverificacionestadoid(transaction, personaverificacionValidated.personaverificacionestadoid);
    if (!personaverificacionestado) {
      log.warn(line(), "Persona verificación estado no existe: [" + personaverificacionValidated.personaverificacionestadoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    var camposFk: Partial<PersonaVerificacionAttributes> = {};
    camposFk._idpersona = persona._idpersona;
    camposFk._idpersonaverificacionestado = personaverificacionestado._idpersonaverificacionestado;
    camposFk._idusuarioverifica = req.session_user.usuario._idusuario;

    var camposAdicionales: Partial<PersonaVerificacionAttributes> = {};
    camposAdicionales.personaverificacionid = uuidv4();

    var camposAuditoria: Partial<PersonaVerificacionAttributes> = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const personaverificacionCreated = await personaverificacionDao.insertPersonaverificacion(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...personaverificacionValidated,
      ...camposAuditoria,
    });
    log.debug(line(), "personaverificacionCreated");

    const personaUpdate: Partial<PersonaAttributes> = {};
    personaUpdate.personaid = persona.personaid;
    personaUpdate._idpersonaverificacionestado = personaverificacionestado._idpersonaverificacionestado;
    personaUpdate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    personaUpdate.fechamod = Sequelize.fn("now", 3);

    await personaDao.updatePersona(transaction, personaUpdate);
    log.debug(line(), "personaUpdate");

    // Actualizamos el usuario solo si la validación de la persona es aprobado
    if (personaverificacionestado.ispersonavalidated) {
      const usuarioUpdate: Partial<UsuarioAttributes> = {};
      usuarioUpdate.usuarioid = persona.usuario_usuario.usuarioid;
      usuarioUpdate.ispersonavalidated = personaverificacionestado.ispersonavalidated;
      usuarioUpdate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      usuarioUpdate.fechamod = Sequelize.fn("now", 3);

      await usuarioDao.updateUsuario(transaction, usuarioUpdate);
      log.debug(line(), "usuarioUpdate");
    }

    /* Si la verificación tiene código 4 que es aprobado, se habilitan los servicios para que pueda suscribirse */
    const idusuario_session = req.session_user.usuario._idusuario ?? 1;
    if (personaverificacionestado._idpersonaverificacionestado == 4) {
      await usuarioservicioDao.habilitarServiciosParaUsuario(transaction, persona.usuario_usuario._idusuario, idusuario_session);
    }

    await enviarCorreoSegunCorrespondeNuevoEstadoDePersona(personaverificacionValidated, personaverificacionestado, persona);

    await transaction.commit();
    response(res, 201, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

const enviarCorreoSegunCorrespondeNuevoEstadoDePersona = async (personaverificacionValidated, personaverificacionestado, persona) => {
  // Prepara y envia un correo
  const templateManager = new TemplateManager();
  const emailSender = new EmailSender();

  if (personaverificacionestado.isenabledcomentariousuario) {
    if (personaverificacionValidated.comentariousuario) {
      const dataEmail = {
        codigo_usuario: persona.usuario_usuario.code,
        nombres: persona.usuario_usuario.usuarionombres,
        razon_no_aceptada: personaverificacionValidated.comentariousuario,
        fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
      };
      const emailTemplate = await templateManager.templateCuentaUsarioVerificadaMasInformacion(dataEmail);

      const mailOptions = {
        to: persona.usuario_usuario.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      };

      await emailSender.sendContactoFinanzatech(mailOptions);
    }
  }

  /* Si la verificación tiene código 4 que es aprobado, se le envía un correo de éxito */
  if (personaverificacionestado._idpersonaverificacionestado == 4) {
    const dataEmail = {
      codigo_usuario: persona.usuario_usuario.code,
      nombres: persona.usuario_usuario.usuarionombres,
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    };
    const emailTemplate = await templateManager.templateCuentaUsarioVerificadaExito(dataEmail);

    const mailOptions = {
      to: persona.usuario_usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };
    await emailSender.sendContactoFinanzatech(mailOptions);
  }
};
