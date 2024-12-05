import * as usuarioDao from "../../daos/usuarioDao.js";
import * as documentotipoDao from "../../daos/documentotipoDao.js";
import * as validacionDao from "../../daos/validacionDao.js";
import * as personaverificacionestadoDao from "../../daos/personaverificacionestadoDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import * as cryptoUtils from "../../utils/cryptoUtils.js";
import * as config from "../../config.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { Sequelize } from "sequelize";

export const resetPassword = async (req, res) => {
  //logger.info(line(),req);
  const filter_estado = [1];
  const validateChangePasswordSchema = Yup.object({
    hash: Yup.string().trim().required().max(50),
    codigo: Yup.string().trim().required().max(100),
    token: Yup.string().trim().required().max(255),
    password: Yup.string().min(8).max(50).required(),
    confirmPassword: Yup.string()
      .required()
      .min(8)
      .max(50)
      .test("confirmPassword", "¡Ambas contraseñas deben coincidir!", (confirmPassword, yup) => yup.parent.password === confirmPassword),
  }).required();
  const validacionValidated = validateChangePasswordSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  const usuario = await usuarioDao.getUsuarioByHash(req, validacionValidated.hash);
  if (!usuario) {
    logger.warn(line(), "Usuario no existe: ", validacionValidated);
    throw new ClientError("El código de verificación no es válido o ha expidado", 404);
  }

  const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(req, usuario._idusuario, validacionValidated.codigo, filter_estado);
  if (!validacion) {
    logger.warn(line(), "Validación no existe: ", validacionValidated);
    throw new ClientError("El código de verificación no es válido o ha expidado", 404);
  }
  //jsonUtils.prettyPrint(validacion);

  //Desencriptamos token para hallar el otp
  let otp_desencriptado = cryptoUtils.decryptText(validacionValidated.token, config.TOKEN_KEY_OTP);
  logger.info(line(), "OTP Desencriptado", otp_desencriptado);

  if (otp_desencriptado === validacion.otp) {
    if (validacion.verificado === 0) {
      // Sumar 10 minutos y 10 segundos a la fecha de la base de datos
      const fechaConAjustes = new Date(validacion.tiempo_marca);
      fechaConAjustes.setMinutes(fechaConAjustes.getMinutes() + validacion.tiempo_expiracion);
      fechaConAjustes.setSeconds(fechaConAjustes.getSeconds() + 10);
      // Obtener la fecha actual
      const fechaActual = new Date();
      if (fechaActual <= fechaConAjustes) {
        // Validación conforme
        const encryptedPassword = await bcrypt.hash(validacionValidated.password, 10);

        let usuarioUpdate = {};
        usuarioUpdate.usuarioid = usuario.usuarioid;
        usuarioUpdate.password = encryptedPassword;
        usuarioUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
        usuarioUpdate.fechamod = Sequelize.fn("now", 3);

        const usuarioUpdated = await usuarioDao.updateUsuario(req, usuarioUpdate);
        if (usuarioUpdated[0] == 0) {
          logger.warn(line(), "No fue posible actualizar el usuario: ", usuarioUpdated);
          throw new ClientError("El código de verificación no es válido o ha expidado", 404);
        }

        // Actualizamos el validate
        var validacionUpdate = {};
        validacionUpdate.validacionid = validacion.validacionid;
        validacionUpdate.verificado = 1;
        validacionUpdate.fecha_verificado = Sequelize.fn("now", 3);
        validacionUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
        validacionUpdate.fechamod = Sequelize.fn("now", 3);
        const validacionUpdated = await validacionDao.updateValidacion(req, validacionUpdate);
      } else {
        logger.warn(line(), "El código de verificación ha expirado: ", validacionValidated);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }
    } else {
      logger.warn(line(), "El código de verificación ha sido validado anteriormente: ", validacionValidated);
      throw new ClientError("El código de verificación no es válido o ha expidado", 404);
    }
  } else {
    logger.warn(line(), "El código de verificación no es válido: ", validacionValidated);
    throw new ClientError("El código de verificación no es válido o ha expidado", 404);
  }
  var validacionReturned = {};
  validacionReturned.hash = validacionValidated.hash;
  response(res, 201, { ...validacionReturned });
};

export const validateRestorePassword = async (req, res) => {
  //logger.info(line(),req);
  const filter_estado = [1];
  const validateRestorePasswordSchema = Yup.object({
    hash: Yup.string().trim().required().max(50),
    codigo: Yup.string().trim().required().max(100),
    token: Yup.string().trim().required().max(255),
  }).required();
  const validacionValidated = validateRestorePasswordSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  const usuario = await usuarioDao.getUsuarioByHash(req, validacionValidated.hash);
  if (!usuario) {
    logger.warn(line(), "Usuario no existe: ", validacionValidated);
    throw new ClientError("El código de verificación no es válido o ha expidado", 404);
  }

  const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(req, usuario._idusuario, validacionValidated.codigo, filter_estado);
  if (!validacion) {
    logger.warn(line(), "Validación no existe: ", validacionValidated);
    throw new ClientError("El código de verificación no es válido o ha expidado", 404);
  }
  //jsonUtils.prettyPrint(validacion);

  //Desencriptamos token para hallar el otp
  let otp_desencriptado = cryptoUtils.decryptText(validacionValidated.token, config.TOKEN_KEY_OTP);
  logger.info(line(), "OTP Desencriptado", otp_desencriptado);

  if (otp_desencriptado === validacion.otp) {
    if (validacion.verificado === 0) {
      // Sumar 10 minutos y 10 segundos a la fecha de la base de datos
      const fechaConAjustes = new Date(validacion.tiempo_marca);
      fechaConAjustes.setMinutes(fechaConAjustes.getMinutes() + validacion.tiempo_expiracion);
      fechaConAjustes.setSeconds(fechaConAjustes.getSeconds() + 10);
      // Obtener la fecha actual
      const fechaActual = new Date();
      if (fechaActual <= fechaConAjustes) {
        // Validación conforme
      } else {
        logger.warn(line(), "El código de verificación ha expirado: ", validacionValidated);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }
    } else {
      logger.warn(line(), "El código de verificación ha sido validado anteriormente: ", validacionValidated);
      throw new ClientError("El código de verificación no es válido o ha expidado", 404);
    }
  } else {
    logger.warn(line(), "El código de verificación no es válido: ", validacionValidated);
    throw new ClientError("El código de verificación no es válido o ha expidado", 404);
  }
  var validacionReturned = {};
  validacionReturned.hash = validacionValidated.hash;
  response(res, 201, { ...validacionReturned });
};

export const sendTokenPassword = async (req, res) => {
  let EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  const filter_estado = [1];
  const validacionCreateSchema = Yup.object()
    .shape({
      email: Yup.string().trim().required().email().matches(EMAIL_REGX, "Debe ser un correo válido.").min(5).max(50),
    })
    .required();
  const validacionValidated = validacionCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  const usuario = await usuarioDao.getUsuarioByEmail(req, validacionValidated.email);
  if (!usuario) {
    logger.warn(line(), "Usuario no existe: ", validacionValidated);
  } else {
    const _idvalidaciontipo = 3; // 1: Para recuperar contraseña
    const resetpasswordvalidationcode = Math.floor(100000 + Math.random() * 900000); // Código aleaatorio de 6 dígitos
    const validacionPrev = await validacionDao.getValidacionByIdusuarioAndIdvalidaciontipo(req, usuario._idusuario, _idvalidaciontipo, filter_estado);
    if (!validacionPrev) {
      logger.warn(line(), "Validación no existe: ", validacionValidated);
      let validacionNew = {};
      validacionNew._idusuario = usuario._idusuario;
      validacionNew._idvalidaciontipo = _idvalidaciontipo;
      validacionNew.valor = validacionValidated.email;
      validacionNew.otp = resetpasswordvalidationcode;
      validacionNew.tiempo_marca = Sequelize.fn("now", 3);
      validacionNew.tiempo_expiracion = 15; // En minutos
      validacionNew.codigo = crypto.randomBytes(77).toString("hex").slice(0, 77);
      validacionNew.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      validacionNew.fechacrea = Sequelize.fn("now", 3);
      validacionNew.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      validacionNew.fechamod = Sequelize.fn("now", 3);
      validacionNew.estado = 1;

      const validacionCreated = await validacionDao.insertValidacion(req, validacionNew);
      if (!validacionCreated) {
        logger.warn(line(), "No fue posible insertar el objeto: ", validacionNew);
      }
    } else {
      let validacionUpdate = {};
      validacionUpdate.validacionid = validacionPrev.validacionid;
      validacionUpdate.otp = resetpasswordvalidationcode;
      validacionUpdate.tiempo_marca = Sequelize.fn("now", 3);
      validacionUpdate.tiempo_expiracion = 15; // En minutos
      validacionUpdate.verificado = 0;
      validacionUpdate.fechaverificado = null;
      validacionUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      validacionUpdate.fechamod = Sequelize.fn("now", 3);

      const validacionUpdated = await validacionDao.updateValidacion(req, validacionUpdate);
      if (!validacionUpdated) {
        logger.warn(line(), "No fue posible actualizar el objeto: ", validacionUpdate);
      }
    }
    const validacionNext = await validacionDao.getValidacionByIdusuarioAndIdvalidaciontipo(req, usuario._idusuario, _idvalidaciontipo, filter_estado);
    if (validacionNext) {
      //Enviar enlace para recuperar contraseña
      let otp_encriptado = cryptoUtils.encryptText(resetpasswordvalidationcode.toString(), config.TOKEN_KEY_OTP);
      let url = config.WEB_SITE + "token-verification-password?hash=" + usuario.hash + "&codigo=" + validacionNext.codigo + "&token=" + otp_encriptado;
      logger.info(line(), "url", url);
    }
  }

  let validacionReturned = {};
  response(res, 201, { ...validacionReturned });
};

export const sendVerificactionCode = async (req, res) => {
  const filter_estado = [1];
  const validacionCreateSchema = Yup.object()
    .shape({
      hash: Yup.string().max(50).trim().required(),
      codigo: Yup.string().max(100).trim().required(),
    })
    .required();
  const validacionValidated = validacionCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  const usuario = await usuarioDao.getUsuarioByHash(req, validacionValidated.hash);
  if (!usuario) {
    logger.warn(line(), "Usuario no existe: ", validacionValidated);
    throw new ClientError("Información no válida", 404);
  }

  const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(req, usuario._idusuario, validacionValidated.codigo, filter_estado);
  if (!validacion) {
    logger.warn(line(), "Validación no existe: ", validacionValidated);
    throw new ClientError("Información no válida", 404);
  }

  if (validacion.verificado != 0) {
    logger.warn(line(), "Valor ya se encuentra verificado: ", validacionValidated);
    throw new ClientError("Información no válida", 404);
  }

  const emailvalidationcode = Math.floor(100000 + Math.random() * 900000); // Código aleaatorio de 6 dígitos

  let validacionUpdate = {};
  validacionUpdate.validacionid = validacion.validacionid;
  validacionUpdate.otp = emailvalidationcode;
  validacionUpdate.tiempo_marca = Sequelize.fn("now", 3);
  validacionUpdate.tiempo_expiracion = 5; // En minutos
  validacionUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
  validacionUpdate.fechamod = Sequelize.fn("now", 3);

  const validacionUpdated = await validacionDao.updateValidacion(req, validacionUpdate);

  let validacionReturned = {};

  response(res, 201, { ...validacionReturned });
};

export const loginUser = async (req, res) => {
  // Get user input
  const { correo, clave } = req.body;

  let EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  const loginUserSchema = Yup.object()
    .shape({
      email: Yup.string().trim().required("Correo electrónico es requerido").email("Debe ser un correo válido").matches(EMAIL_REGX, "Debe ser un correo válido.").min(5, "Mínimo 5 caracteres").max(50, "Máximo 50 caracteres"),
      password: Yup.string().required("Contraseña es requerido").min(6, "Mínimo 6 caracteres").max(20, "Máximo 20 caracteres"),
    })
    .required();
  const loginUserValidated = loginUserSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  // Validate if user exist in our database
  const usuario_login = await usuarioDao.autenticarUsuario(req, loginUserValidated.email);
  if (usuario_login.length <= 0) {
    throw new ClientError("Usuario no existe", 404);
  }

  jsonUtils.prettyPrint(usuario_login);

  if (usuario_login[0].email && (await bcrypt.compare(loginUserValidated.password, usuario_login[0].password))) {
    // Consultamos todos los datos del usuario y sus roles
    const usuario_autenticado = await usuarioDao.getUsuarioAndRolesByEmail(req, loginUserValidated.email);
    // Obtén el primer registro de usuario_autenticado
    const usuario = usuario_autenticado[0];
    //jsonUtils.prettyPrint(usuario);
    // Create token
    const token = jwt.sign({ usuario: usuario }, config.TOKEN_KEY_JWT, {
      expiresIn: "200000h",
    });

    response(res, 201, { token });
  } else {
    throw new ClientError("Credenciales no válidas", 404);
  }
};

export const registerUsuario = async (req, res) => {
  let EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  let NAME_REGX = /^[a-zA-Z ]+$/;

  const usuarioCreateSchema = Yup.object()
    .shape({
      documentotipoid: Yup.string().min(36).max(36).trim().required(),
      documentonumero: Yup.string()
        .trim()
        .required()
        .matches(/^[0-9]*$/, "Ingrese solo números")
        .length(8),
      usuarionombres: Yup.string().trim().required().matches(NAME_REGX, "Debe ser un nombre válido").min(2).max(100),
      apellidopaterno: Yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
      apellidomaterno: Yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
      email: Yup.string().trim().required().email().matches(EMAIL_REGX, "Debe ser un correo válido.").min(5).max(50),
      celular: Yup.string().trim().required(),
      password: Yup.string().min(8).max(50).required(),
    })
    .required();
  const usuarioValidated = usuarioCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  const documentotipo = await documentotipoDao.findDocumentotipoPk(req, usuarioValidated.documentotipoid);
  if (!documentotipo) {
    throw new ClientError("Documento tipo no existe", 404);
  }

  //Validate unique register
  const usuariobynumerodocumento = await usuarioDao.getUsuarioByNumerodocumento(req, usuarioValidated.documentonumero);
  if (usuariobynumerodocumento) {
    throw new ClientError("El número de documento ya se encuentra registrado. ", 404);
  }

  const usuariobyemail = await usuarioDao.getUsuarioByEmail(req, usuarioValidated.email);
  if (usuariobyemail) {
    throw new ClientError("El correo electrónico ya se encuentra registrado. ", 404);
  }

  const personaverificacionestado_no_solicitado = 1; // 1: No solicitado
  const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByIdpersonaverificacionestado(req, personaverificacionestado_no_solicitado);
  if (!personaverificacionestado) {
    logger.warn(line(), "Persona verificación estado no existe: [" + personaverificacionestado_no_solicitado + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const emailvalidationcode = Math.floor(100000 + Math.random() * 900000); // Código aleaatorio de 6 dígitos
  const hash = crypto
    .createHash("sha1")
    .update(usuarioValidated.email + "|" + usuarioValidated.documentotipoid + "|" + usuarioValidated.documentonumero + "|" + Sequelize.fn("now", 3))
    .digest("hex");

  //Encrypt user password
  const encryptedPassword = await bcrypt.hash(usuarioValidated.password, 10);

  delete usuarioValidated.password;

  let camposFk = {};
  camposFk._iddocumentotipo = documentotipo._iddocumentotipo;

  let camposAdicionales = {};
  camposAdicionales.usuarioid = uuidv4();
  camposAdicionales.code = uuidv4().split("-")[0];
  camposAdicionales.password = encryptedPassword;
  camposAdicionales.hash = hash;
  camposAdicionales._idpersonaverificacionestado = personaverificacionestado._idpersonaverificacionestado;
  camposAdicionales.ispersonavalidated = personaverificacionestado.ispersonavalidated;

  let camposAuditoria = {};
  camposAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const usuarioCreated = await usuarioDao.insertUsuario(req, {
    ...camposFk,
    ...camposAdicionales,
    ...usuarioValidated,
    ...camposAuditoria,
  });

  let validacion = {};
  validacion._idusuario = usuarioCreated._idusuario;
  validacion._idvalidaciontipo = 1; // 1: Para Correo electrónico
  validacion.valor = usuarioValidated.email;
  validacion.otp = emailvalidationcode;
  validacion.tiempo_marca = Sequelize.fn("now", 3);
  validacion.tiempo_expiracion = 5; // En minutos
  validacion.codigo = crypto.randomBytes(77).toString("hex").slice(0, 77);
  validacion.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
  validacion.fechacrea = Sequelize.fn("now", 3);
  validacion.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
  validacion.fechamod = Sequelize.fn("now", 3);
  validacion.estado = 1;

  const validacionCreated = await validacionDao.insertValidacion(req, validacion);

  const usuarioReturned = {};
  usuarioReturned.hash = camposAdicionales.hash;
  usuarioReturned.email = usuarioValidated.email;
  usuarioReturned.codigo = validacion.codigo;

  var usuarioObfuscated = jsonUtils.ofuscarAtributos(usuarioReturned, ["email"], jsonUtils.PATRON_OFUSCAR_EMAIL);

  response(res, 201, { ...usuarioObfuscated });
};

export const validateEmail = async (req, res) => {
  //logger.info(line(),req);
  const filter_estado = [1];
  const validateRestorePasswordSchema = Yup.object({
    hash: Yup.string().trim().required().max(50),
    codigo: Yup.string().trim().required().max(100),
    otp: Yup.string().trim().required().max(6),
  }).required();
  const validacionValidated = validateRestorePasswordSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  const usuario = await usuarioDao.getUsuarioByHash(req, validacionValidated.hash);
  if (!usuario) {
    logger.warn(line(), "Usuario no existe: ", validacionValidated);
    throw new ClientError("El código de verificación no es válido o ha expidado", 404);
  }

  const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(req, usuario._idusuario, validacionValidated.codigo, filter_estado);
  if (!validacion) {
    logger.warn(line(), "Validación no existe: ", validacionValidated);
    throw new ClientError("El código de verificación no es válido o ha expidado", 404);
  }
  //jsonUtils.prettyPrint(validacion);

  if (validacionValidated.otp === validacion.otp) {
    if (validacion.verificado === 0) {
      // Sumar 10 minutos y 10 segundos a la fecha de la base de datos
      const fechaConAjustes = new Date(validacion.tiempo_marca);
      fechaConAjustes.setMinutes(fechaConAjustes.getMinutes() + validacion.tiempo_expiracion);
      fechaConAjustes.setSeconds(fechaConAjustes.getSeconds() + 10);
      // Obtener la fecha actual
      const fechaActual = new Date();
      if (fechaActual <= fechaConAjustes) {
        var validacionUpdate = {};
        validacionUpdate.validacionid = validacion.validacionid;
        validacionUpdate.verificado = 1;
        validacionUpdate.fecha_verificado = Sequelize.fn("now", 3);
        validacionUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
        validacionUpdate.fechamod = Sequelize.fn("now", 3);
        const validacionUpdated = await validacionDao.updateValidacion(req, validacionUpdate);

        const personaverificacionestado_pendiente = 2; // 2: Pendiente
        const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByIdpersonaverificacionestado(req, personaverificacionestado_pendiente);
        if (!personaverificacionestado) {
          logger.warn(line(), "Persona verificación estado no existe: [" + personaverificacionestado_pendiente + "]");
          throw new ClientError("Datos no válidos", 404);
        }

        var usuarioUpdate = {};
        usuarioUpdate.usuarioid = usuario.usuarioid;
        usuarioUpdate.isemailvalidated = 1; // true
        usuarioUpdate._idpersonaverificacionestado = personaverificacionestado._idpersonaverificacionestado;
        const usuarioUpdated = await usuarioDao.updateUsuario(req, usuarioUpdate);
      } else {
        logger.warn(line(), "El código de verificación ha expirado: ", validacionValidated);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }
    } else {
      logger.warn(line(), "El código de verificación ha sido validado anteriormente: ", validacionValidated);
      throw new ClientError("El código de verificación no es válido o ha expidado", 404);
    }
  } else {
    logger.warn(line(), "El código de verificación no es válido: ", validacionValidated);
    throw new ClientError("El código de verificación no es válido o ha expidado", 404);
  }
  var validacionReturned = {};
  validacionReturned.hash = validacionValidated.hash;
  response(res, 201, { ...validacionReturned });
};
