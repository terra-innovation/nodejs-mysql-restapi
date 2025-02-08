import * as personaverificacionDao from "../../daos/personaverificacionDao.js";
import * as personaverificacionestadoDao from "../../daos/personaverificacionestadoDao.js";
import * as personaDao from "../../daos/personaDao.js";
import * as usuarioDao from "../../daos/usuarioDao.js";
import * as usuarioservicioDao from "../../daos/usuarioservicioDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import EmailSender from "../../utils/email/emailSender.js";
import TemplateManager from "../../utils/email/TemplateManager.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const activatePersonaverificacion = async (req, res) => {
  const { id } = req.params;
  const personaverificacionSchema = yup
    .object()
    .shape({
      personaverificacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const personaverificacionValidated = personaverificacionSchema.validateSync({ personaverificacionid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const personaverificacionDeleted = await personaverificacionDao.activatePersonaverificacion(req, { ...personaverificacionValidated, ...camposAuditoria });
  if (personaverificacionDeleted[0] === 0) {
    throw new ClientError("Personaverificacion no existe", 404);
  }
  logger.debug(line(), "personaverificacionActivated:", personaverificacionDeleted);
  response(res, 204, personaverificacionDeleted);
};

export const deletePersonaverificacion = async (req, res) => {
  const { id } = req.params;
  const personaverificacionSchema = yup
    .object()
    .shape({
      personaverificacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const personaverificacionValidated = personaverificacionSchema.validateSync({ personaverificacionid: id }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const personaverificacionDeleted = await personaverificacionDao.deletePersonaverificacion(req, { ...personaverificacionValidated, ...camposAuditoria });
  if (personaverificacionDeleted[0] === 0) {
    throw new ClientError("Personaverificacion no existe", 404);
  }
  logger.debug(line(), "personaverificacionDeleted:", personaverificacionDeleted);
  response(res, 204, personaverificacionDeleted);
};

export const getPersonaverificacionMaster = async (req, res) => {
  logger.debug(line(), "funcion::getPersonaverificacionMaster");
  const session_idusuario = req.session_user?.usuario?._idusuario;
  const filter_estados = [1];
  const personaverificacionestados = await personaverificacionestadoDao.getPersonaverificacionestados(req, filter_estados);

  let personaverificacionMaster = {};
  personaverificacionMaster.personaverificacionestados = personaverificacionestados;

  let personaverificacionMasterJSON = jsonUtils.sequelizeToJSON(personaverificacionMaster);
  //jsonUtils.prettyPrint(personaverificacionMasterJSON);
  let personaverificacionMasterObfuscated = jsonUtils.ofuscarAtributosDefault(personaverificacionMasterJSON);
  //jsonUtils.prettyPrint(personaverificacionMasterObfuscated);
  let personaverificacionMasterFiltered = jsonUtils.removeAttributesPrivates(personaverificacionMasterObfuscated);
  //jsonUtils.prettyPrint(personaverificacionMaster);
  response(res, 201, personaverificacionMasterFiltered);
};

export const updatePersonaverificacion = async (req, res) => {
  logger.debug(line(), "funcion::updatePersonaverificacion");
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
  logger.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  var camposFk = {};

  var camposAdicionales = {};
  camposAdicionales.personaverificacionid = personaverificacionValidated.personaverificacionid;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const result = await personaverificacionDao.updatePersonaverificacion(req, {
    ...camposFk,
    ...camposAdicionales,
    ...personaverificacionValidated,
    ...camposAuditoria,
  });
  if (result[0] === 0) {
    throw new ClientError("Personaverificacion no existe", 404);
  }
  const personaverificacionUpdated = await personaverificacionDao.getPersonaverificacionByPersonaverificacionid(req, id);
  if (!personaverificacionUpdated) {
    throw new ClientError("Personaverificacion no existe", 404);
  }
  response(res, 200, {});
};

export const getPersonaverificacions = async (req, res) => {
  logger.debug(line(), "funcion::getPersonaverificacions");
  //logger.info(line(),req.session_user.usuario._idusuario);

  const filter_estado = [1, 2];
  const filter_idarchivotipo = [1, 2, 3];
  const personaverificacionverificacions = await personaDao.getPersonasByVerificacion(req, filter_estado, filter_idarchivotipo);
  var personaverificacionverificacionsJson = jsonUtils.sequelizeToJSON(personaverificacionverificacions);
  //logger.info(line(),personaverificacionObfuscated);

  //var personaverificacionverificacionsFiltered = jsonUtils.removeAttributes(personaverificacionverificacionsJson, ["score"]);
  //personaverificacionverificacionsFiltered = jsonUtils.removeAttributesPrivates(personaverificacionverificacionsFiltered);
  response(res, 201, personaverificacionverificacionsJson);
};

export const createPersonaverificacion = async (req, res) => {
  logger.debug(line(), "funcion::createPersonaverificacion");
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
  //logger.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  const persona = await personaDao.getPersonaByPersonaid(req, personaverificacionValidated.personaid);
  if (!persona) {
    logger.warn(line(), "Persona no existe: [" + personaverificacionValidated.personaid + "]");
    throw new ClientError("Datos no válidos", 404);
  }
  const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByPersonaverificacionestadoid(req, personaverificacionValidated.personaverificacionestadoid);
  if (!personaverificacionestado) {
    logger.warn(line(), "Persona verificación estado no existe: [" + personaverificacionValidated.personaverificacionestadoid + "]");
    throw new ClientError("Datos no válidos", 404);
  }
  var camposFk = {};
  camposFk._idpersona = persona._idpersona;
  camposFk._idpersonaverificacionestado = personaverificacionestado._idpersonaverificacionestado;
  camposFk._idusuarioverifica = req.session_user.usuario._idusuario;

  var camposAdicionales = {};
  camposAdicionales.personaverificacionid = uuidv4();

  var camposAuditoria = {};
  camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const personaverificacionCreated = await personaverificacionDao.insertPersonaVerificacion(req, {
    ...camposFk,
    ...camposAdicionales,
    ...personaverificacionValidated,
    ...camposAuditoria,
  });
  logger.debug(line(), "personaverificacionCreated");

  const personaUpdate = {};
  personaUpdate.personaid = persona.personaid;
  personaUpdate._idpersonaverificacionestado = personaverificacionestado._idpersonaverificacionestado;
  personaUpdate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  personaUpdate.fechamod = Sequelize.fn("now", 3);

  await personaDao.updatePersona(req, personaUpdate);
  logger.debug(line(), "personaUpdate");

  // Actualizamos el usuario solo si la validación de la persona es aprobado
  if (personaverificacionestado.ispersonavalidated) {
    const usuarioUpdate = {};
    usuarioUpdate.usuarioid = persona.usuario_usuario.usuarioid;
    usuarioUpdate.ispersonavalidated = personaverificacionestado.ispersonavalidated;
    usuarioUpdate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    usuarioUpdate.fechamod = Sequelize.fn("now", 3);

    await usuarioDao.updateUsuario(req, usuarioUpdate);
    logger.debug(line(), "usuarioUpdate");
  }

  /* Si la verificación tiene código 4 que es aprobado, se habilitan los servicios para que pueda suscribirse */
  const idusuario_session = req.session_user.usuario._idusuario ?? 1;
  if (personaverificacionestado._idpersonaverificacionestado == 4) {
    await usuarioservicioDao.habilitarServiciosParaUsuario(req, persona.usuario_usuario._idusuario, idusuario_session);
  }

  await enviarCorreoSegunCorrespondeNuevoEstadoDePersona(req, personaverificacionValidated, personaverificacionestado, persona);

  response(res, 201, {});
};

const enviarCorreoSegunCorrespondeNuevoEstadoDePersona = async (req, personaverificacionValidated, personaverificacionestado, persona) => {
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
