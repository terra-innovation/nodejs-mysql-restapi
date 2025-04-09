import * as servicioempresaDao from "../../daos/servicioempresaDao.js";
import * as personaDao from "../../daos/personaDao.js";
import * as empresaDao from "../../daos/empresaDao.js";
import * as servicioempresaestadoDao from "../../daos/servicioempresaestadoDao.js";
import * as servicioempresaverificacionDao from "../../daos/servicioempresaverificacionDao.js";
import * as usuarioservicioDao from "../../daos/usuarioservicioDao.js";
import * as usuarioservicioestadoDao from "../../daos/usuarioservicioestadoDao.js";
import * as usuarioservicioverificacionDao from "../../daos/usuarioservicioverificacionDao.js";
import * as usuarioservicioempresaDao from "../../daos/usuarioservicioempresaDao.js";
import * as usuarioservicioempresaestadoDao from "../../daos/usuarioservicioempresaestadoDao.js";
import * as usuarioservicioempresarolDao from "../../daos/usuarioservicioempresarolDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import { safeRollback } from "../../utils/transactionUtils.js";
import { sequelizeFT } from "../../config/bd/sequelize_db_factoring.js";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";
import EmailSender from "../../utils/email/emailSender.js";
import TemplateManager from "../../utils/email/TemplateManager.js";

export const createFactoringempresaverificacion = async (req, res) => {
  logger.debug(line(), "controller::createFactoringempresaverificacion");
  const session_idusuario = req.session_user.usuario._idusuario;
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
  //logger.debug(line(), "servicioempresaverificacionValidated:", servicioempresaverificacionValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const servicioempresa = await servicioempresaDao.getServicioempresaByServicioempresaid(transaction, servicioempresaverificacionValidated.servicioempresaid);
    if (!servicioempresa) {
      logger.warn(line(), "Servicio empresa no existe: [" + servicioempresaverificacionValidated.servicioempresaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const personasuscriptor = await personaDao.getPersonaByIdusuario(transaction, servicioempresa._idusuariosuscriptor);
    if (!personasuscriptor) {
      logger.warn(line(), "Usuario suscriptor no existe: [" + servicioempresa._idusuariosuscriptor + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const empresa = await empresaDao.getEmpresaByIdempresa(transaction, servicioempresa._idempresa);
    if (!empresa) {
      logger.warn(line(), "Empresa no existe: [" + servicioempresa._idempresa + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const servicioempresaestado = await servicioempresaestadoDao.getServicioempresaestadoByServicioempresaestadoid(transaction, servicioempresaverificacionValidated.servicioempresaestadoid);
    if (!servicioempresaestado) {
      logger.warn(line(), "Servicio empresa estado no existe: [" + servicioempresaverificacionValidated.servicioempresaestadoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    // Inserta un nuevo registro en la tabla servicioempresaverificacion con el nuevo estado
    var camposFk = {};
    camposFk._idservicioempresa = servicioempresa._idservicioempresa;
    camposFk._idservicioempresaestado = servicioempresaestado._idservicioempresaestado;
    camposFk._idusuarioverifica = req.session_user.usuario._idusuario;

    var camposAdicionales = {};
    camposAdicionales.servicioempresaverificacionid = uuidv4();

    var camposAuditoria = {};
    camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);
    camposAuditoria.estado = 1;

    const servicioempresaverificacionCreated = await servicioempresaverificacionDao.insertServicioempresaverificacion(transaction, {
      ...camposFk,
      ...camposAdicionales,
      ...servicioempresaverificacionValidated,
      ...camposAuditoria,
    });
    logger.debug(line(), "servicioempresaverificacionCreated", servicioempresaverificacionCreated);

    // Actualiza la tabla servicioempresa con el nuevo estado
    const servicioempresaUpdate = {};
    servicioempresaUpdate.servicioempresaid = servicioempresaverificacionValidated.servicioempresaid;
    servicioempresaUpdate._idservicioempresaestado = servicioempresaestado._idservicioempresaestado;
    servicioempresaUpdate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    servicioempresaUpdate.fechamod = Sequelize.fn("now", 3);

    await servicioempresaDao.updateServicioempresa(transaction, servicioempresaUpdate);
    logger.debug(line(), "servicioempresaUpdate", servicioempresaUpdate);

    // Si el estado es estado 3 (Suscrito)
    if (servicioempresaestado._idservicioempresaestado == 3) {
      await darAccesoAlUsuarioServicioEmpresa(req, transaction, servicioempresa, personasuscriptor);
      await darAccesoAlUsuarioServicio(req, transaction, servicioempresaverificacionValidated, servicioempresa, empresa, personasuscriptor);
    }

    await enviarCorreoSegunCorrespondeNuevoEstadoDeServicioEmpresa(servicioempresaverificacionValidated, servicioempresa, servicioempresaestado, empresa, personasuscriptor);

    await transaction.commit();
    response(res, 201, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

const darAccesoAlUsuarioServicioEmpresa = async (req, transaction, servicioempresa, personasuscriptor) => {
  const usuarioservicioempresa = await usuarioservicioempresaDao.getUsuarioservicioempresaByIdusuarioIdServicioIdempresa(transaction, personasuscriptor._idusuario, servicioempresa._idservicio, servicioempresa._idempresa);
  if (!usuarioservicioempresa) {
    logger.warn(line(), "Usuario servicio empresa no existe: [" + personasuscriptor._idusuario + " - " + servicioempresa._idservicio + " - " + servicioempresa._idempresa + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioempresaestado_con_acceso = 2; // Con acceso
  const usuarioservicioempresaestado = await usuarioservicioempresaestadoDao.getUsuarioservicioempresaestadoByIdusuarioservicioempresaestado(transaction, usuarioservicioempresaestado_con_acceso);
  if (!usuarioservicioempresaestado) {
    logger.warn(line(), "Usuario servicio empresa estado no existe: [" + usuarioservicioempresaestado_con_acceso + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioempresarol_administrador = 1; // Administrador
  const usuarioservicioempresarol = await usuarioservicioempresarolDao.getUsuarioservicioempresarolByIdusuarioservicioempresarol(transaction, usuarioservicioempresarol_administrador);
  if (!usuarioservicioempresarol) {
    logger.warn(line(), "Usuario servicio empresa rol no existe: [" + usuarioservicioempresarol_administrador + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  // Actualiza la tabla usuarioservicioempresa con el nuevo estado
  const usuarioservicioempresaUpdate = {};
  usuarioservicioempresaUpdate.usuarioservicioempresaid = usuarioservicioempresa.usuarioservicioempresaid;
  usuarioservicioempresaUpdate._idusuarioservicioempresaestado = usuarioservicioempresaestado._idusuarioservicioempresaestado;
  usuarioservicioempresaUpdate._idusuarioservicioempresarol = usuarioservicioempresarol._idusuarioservicioempresarol;
  usuarioservicioempresaUpdate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  usuarioservicioempresaUpdate.fechamod = Sequelize.fn("now", 3);

  const usuarioservicioempresaUpdated = await usuarioservicioempresaDao.updateUsuarioservicioempresa(transaction, usuarioservicioempresaUpdate);
  logger.debug(line(), "usuarioservicioempresaUpdated", usuarioservicioempresaUpdated);
};

const darAccesoAlUsuarioServicio = async (req, transaction, servicioempresaverificacionValidated, servicioempresa, empresa, personasuscriptor) => {
  const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByIdusuarioIdservicio(transaction, personasuscriptor._idusuario, servicioempresa._idservicio);
  if (!usuarioservicio) {
    logger.warn(line(), "Usuario servicio no existe: [" + personasuscriptor._idusuario + " - " + servicioempresa._idservicio + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioestado_suscrito = 2; // Suscrito
  const usuarioservicioestado = await usuarioservicioestadoDao.getUsuarioservicioestadoByIdusuarioservicioestado(transaction, usuarioservicioestado_suscrito);
  if (!usuarioservicioestado) {
    logger.warn(line(), "Usuario servicio empresa estado no existe: [" + usuarioservicioestado_suscrito + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  // Inserta un nuevo registro en la tabla usuarioservicioverificacion con el nuevo estado
  var camposUsuarioservicioverificacionFk = {};
  camposUsuarioservicioverificacionFk._idusuarioservicio = usuarioservicio._idusuarioservicio;
  camposUsuarioservicioverificacionFk._idusuarioservicioestado = usuarioservicioestado._idusuarioservicioestado;
  camposUsuarioservicioverificacionFk._idusuarioverifica = req.session_user.usuario._idusuario;

  var camposUsuarioservicioverificacionAdicionales = {};
  camposUsuarioservicioverificacionAdicionales.usuarioservicioverificacionid = uuidv4();
  camposUsuarioservicioverificacionAdicionales.comentariousuario = servicioempresaverificacionValidated.comentariousuario;
  camposUsuarioservicioverificacionAdicionales.comentariointerno = servicioempresaverificacionValidated.comentariointerno + " // Proceso automático. Se concedió acceso por la verificación de la empresa: " + empresa.code + " - " + empresa.ruc + " - " + empresa.razon_social;

  var camposUsuarioservicioverificacionAuditoria = {};
  camposUsuarioservicioverificacionAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
  camposUsuarioservicioverificacionAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposUsuarioservicioverificacionAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposUsuarioservicioverificacionAuditoria.fechamod = Sequelize.fn("now", 3);
  camposUsuarioservicioverificacionAuditoria.estado = 1;

  const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(transaction, {
    ...camposUsuarioservicioverificacionFk,
    ...camposUsuarioservicioverificacionAdicionales,
    ...camposUsuarioservicioverificacionAuditoria,
  });
  logger.debug(line(), "usuarioservicioverificacionCreated", usuarioservicioverificacionCreated);

  // Actualiza la tabla usuarioservicio con el nuevo estado
  const usuarioservicioUpdate = {};
  usuarioservicioUpdate.usuarioservicioid = usuarioservicio.usuarioservicioid;
  usuarioservicioUpdate._idusuarioservicioestado = usuarioservicioestado._idusuarioservicioestado;
  usuarioservicioUpdate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  usuarioservicioUpdate.fechamod = Sequelize.fn("now", 3);

  const usuarioservicioUpdated = await usuarioservicioDao.updateUsuarioservicio(transaction, usuarioservicioUpdate);
  logger.debug(line(), "usuarioservicioUpdated", usuarioservicioUpdated);
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
        nombres: personasuscriptor.usuario_usuario.usuarionombres,
        fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
        empresa_razon_social: empresa.razon_social,
        empresa_ruc: empresa.ruc,
        razon_no_aceptada: servicioempresaverificacionValidated.comentariousuario,
      };
      const emailTemplate = await templateManager.templateFactoringEmpresaVerificacionMasInformacion(dataEmail);

      const mailOptions = {
        to: personasuscriptor.usuario_usuario.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      };

      await emailSender.sendContactoFinanzatech(mailOptions);
    }
  }

  if (servicioempresaestado._idservicioempresaestado == 3) {
    // Email de aprobado
    const dataEmail = {
      codigo_servicio_empresa: servicioempresa.code,
      nombres: personasuscriptor.usuario_usuario.usuarionombres,
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
      empresa_razon_social: empresa.razon_social,
      empresa_ruc: empresa.ruc,
    };
    const emailTemplate = await templateManager.templateFactoringEmpresaVerificacionAprobado(dataEmail);

    const mailOptions = {
      to: personasuscriptor.usuario_usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };
    await emailSender.sendContactoFinanzatech(mailOptions);
  } else if (servicioempresaestado._idservicioempresaestado == 2) {
    // Email de rechazado
    const dataEmail = {
      codigo_servicio_empresa: servicioempresa.code,
      nombres: personasuscriptor.usuario_usuario.usuarionombres,
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
      empresa_razon_social: empresa.razon_social,
      empresa_ruc: empresa.ruc,
    };
    const emailTemplate = await templateManager.templateFactoringEmpresaVerificacionRechazado(dataEmail);

    const mailOptions = {
      to: personasuscriptor.usuario_usuario.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };
    await emailSender.sendContactoFinanzatech(mailOptions);
  }
};

export const getFactoringempresasByVerificacion = async (req, res) => {
  logger.debug(line(), "controller::getFactoringempresasByVerificacion");
  //logger.info(line(),req.session_user.usuario._idusuario);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estadologico = [1, 2];
    const filter_idservicio = [1];
    const filter_idarchivotipos = [4, 5, 6, 7];
    const factoringempresas = await servicioempresaDao.getFactoringempresasByVerificacion(transaction, filter_estadologico, filter_idservicio, filter_idarchivotipos);
    var factoringempresasJson = jsonUtils.sequelizeToJSON(factoringempresas);
    //logger.info(line(),factoringempresaObfuscated);

    //var factoringempresasFiltered = jsonUtils.removeAttributes(factoringempresasJson, ["score"]);
    //factoringempresasFiltered = jsonUtils.removeAttributesPrivates(factoringempresasFiltered);
    await transaction.commit();
    response(res, 201, factoringempresasJson);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getFactoringempresaverificacionMaster = async (req, res) => {
  logger.debug(line(), "controller::getFactoringempresaverificacionMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user?.usuario?._idusuario;
    const filter_estados = [1];
    const servicioempresaestados = await servicioempresaestadoDao.getServicioempresaestados(transaction, filter_estados);

    let servicioempresaverificacionMaster = {};
    servicioempresaverificacionMaster.servicioempresaestados = servicioempresaestados;

    let servicioempresaverificacionMasterJSON = jsonUtils.sequelizeToJSON(servicioempresaverificacionMaster);
    //jsonUtils.prettyPrint(servicioempresaverificacionMasterJSON);
    let servicioempresaverificacionMasterObfuscated = jsonUtils.ofuscarAtributosDefault(servicioempresaverificacionMasterJSON);
    //jsonUtils.prettyPrint(servicioempresaverificacionMasterObfuscated);
    let servicioempresaverificacionMasterFiltered = jsonUtils.removeAttributesPrivates(servicioempresaverificacionMasterObfuscated);
    //jsonUtils.prettyPrint(servicioempresaverificacionMaster);
    await transaction.commit();
    response(res, 201, servicioempresaverificacionMasterFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
