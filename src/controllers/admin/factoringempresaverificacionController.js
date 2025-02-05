import * as servicioempresaDao from "../../daos/servicioempresaDao.js";
import * as servicioempresaestadoDao from "../../daos/servicioempresaestadoDao.js";
import * as servicioempresaverificacionDao from "../../daos/servicioempresaverificacionDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";
import EmailSender from "../../utils/email/emailSender.js";
import TemplateManager from "../../utils/email/TemplateManager.js";

export const createFactoringempresaverificacion = async (req, res) => {
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

  const servicioempresa = await servicioempresaDao.getServicioempresaByServicioempresaid(req, servicioempresaverificacionValidated.servicioempresaid);
  if (!servicioempresa) {
    logger.warn(line(), "Servicio empresa no existe: [" + servicioempresaverificacionValidated.servicioempresaid + "]");
    throw new ClientError("Datos no válidos", 404);
  }
  const servicioempresaestado = await servicioempresaestadoDao.getServicioempresaestadoByServicioempresaestadoid(req, servicioempresaverificacionValidated.servicioempresaestadoid);
  if (!servicioempresaestado) {
    logger.warn(line(), "Servicio empresa estado no existe: [" + servicioempresaverificacionValidated.servicioempresaestadoid + "]");
    throw new ClientError("Datos no válidos", 404);
  }
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

  const servicioempresaverificacionCreated = await servicioempresaverificacionDao.insertServicioempresaverificacion(req, {
    ...camposFk,
    ...camposAdicionales,
    ...servicioempresaverificacionValidated,
    ...camposAuditoria,
  });
  logger.debug(line(), "servicioempresaverificacionCreated", servicioempresaverificacionCreated);

  const servicioempresaUpdate = {};
  servicioempresaUpdate.servicioempresaid = servicioempresaverificacionValidated.servicioempresaid;
  servicioempresaUpdate._idservicioempresaestado = servicioempresaestado._idservicioempresaestado;
  servicioempresaUpdate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  servicioempresaUpdate.fechamod = Sequelize.fn("now", 3);

  await servicioempresaDao.updateServicioempresa(req, servicioempresaUpdate);
  logger.debug(line(), "servicioempresaUpdate", servicioempresaUpdate);

  /* Prepara y envia un correo */
  const templateManager = new TemplateManager();
  const emailSender = new EmailSender();

  /*
  if (servicioempresaverificacionValidated.comentariousuario) {
    const dataEmail = {
      codigo_usuario: persona.usuario_usuario.code,
      nombres: persona.usuario_usuario.usuarionombres,
      razon_no_aceptada: servicioempresaverificacionValidated.comentariousuario,
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

  -- Si la verificación tiene código 4 que es aprobado, se le envía un correo de éxito 
  if (servicioempresaestado._idservicioempresaestado == 4) {
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
*/
  response(res, 201, {});
};

export const getFactoringempresasByVerificacion = async (req, res) => {
  //logger.info(line(),req.session_user.usuario._idusuario);

  const filter_estadologico = [1, 2];
  const filter_idservicio = [1];
  const filter_idarchivotipos = [4, 5, 6, 7];
  const factoringempresas = await servicioempresaDao.getFactoringempresasByVerificacion(req, filter_estadologico, filter_idservicio, filter_idarchivotipos);
  var factoringempresasJson = jsonUtils.sequelizeToJSON(factoringempresas);
  //logger.info(line(),factoringempresaObfuscated);

  //var factoringempresasFiltered = jsonUtils.removeAttributes(factoringempresasJson, ["score"]);
  //factoringempresasFiltered = jsonUtils.removeAttributesPrivates(factoringempresasFiltered);
  response(res, 201, factoringempresasJson);
};

export const getFactoringempresaverificacionMaster = async (req, res) => {
  const session_idusuario = req.session_user?.usuario?._idusuario;
  const filter_estados = [1];
  const servicioempresaestados = await servicioempresaestadoDao.getServicioempresaestados(req, filter_estados);

  let servicioempresaverificacionMaster = {};
  servicioempresaverificacionMaster.servicioempresaestados = servicioempresaestados;

  let servicioempresaverificacionMasterJSON = jsonUtils.sequelizeToJSON(servicioempresaverificacionMaster);
  //jsonUtils.prettyPrint(servicioempresaverificacionMasterJSON);
  let servicioempresaverificacionMasterObfuscated = jsonUtils.ofuscarAtributosDefault(servicioempresaverificacionMasterJSON);
  //jsonUtils.prettyPrint(servicioempresaverificacionMasterObfuscated);
  let servicioempresaverificacionMasterFiltered = jsonUtils.removeAttributesPrivates(servicioempresaverificacionMasterObfuscated);
  //jsonUtils.prettyPrint(servicioempresaverificacionMaster);
  response(res, 201, servicioempresaverificacionMasterFiltered);
};
