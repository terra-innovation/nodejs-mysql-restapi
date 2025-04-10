import * as usuarioDao from "#src/daos/usuarioDao.js";
import * as documentotipoDao from "#src/daos/documentotipoDao.js";
import * as validacionDao from "#src/daos/validacionDao.js";
import * as credencialDao from "#src/daos/credencialDao.js";
import * as personaverificacionestadoDao from "#src/daos/personaverificacionestadoDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import * as cryptoUtils from "#src/utils/cryptoUtils.js";
import * as config from "#src/config.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { Sequelize } from "sequelize";

export const resetPassword = async (req, res) => {
  logger.debug(line(), "controller::resetPassword");
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

  const transaction = await sequelizeFT.transaction();
  try {
    const usuario = await usuarioDao.getUsuarioByHash(transaction, validacionValidated.hash);
    if (!usuario) {
      logger.warn(line(), "Usuario no existe: ", validacionValidated);
      throw new ClientError("El código de verificación no es válido o ha expidado", 404);
    }

    const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(transaction, usuario._idusuario, validacionValidated.codigo, filter_estado);
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
          //Encrypt user password. Cumple estándares PCI-DSS o la GDPR: hashing y salting
          const salt = bcrypt.genSaltSync(12); // 12 es el costo del salting
          const encryptedPassword = bcrypt.hashSync(validacionValidated.password, salt);

          const credencial = await credencialDao.getCredencialByIdusuario(transaction, usuario._idusuario);
          if (!credencial) {
            logger.warn(line(), "Credencial no existe por idusuario: ", usuario._idusuario);
            throw new ClientError("El código de verificación no es válido o ha expidado", 404);
          }

          let credencialUpdate = {};
          credencialUpdate.credencialid = credencial.credencialid;
          credencialUpdate.password = encryptedPassword;
          credencialUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
          credencialUpdate.fechamod = Sequelize.fn("now", 3);

          const credencialUpdated = await credencialDao.updateCredencial(transaction, credencialUpdate);
          if (credencialUpdated[0] == 0) {
            logger.warn(line(), "No fue posible actualizar el usuario: ", credencialUpdated);
            throw new ClientError("El código de verificación no es válido o ha expidado", 404);
          }

          // Actualizamos el validate
          var validacionUpdate = {};
          validacionUpdate.validacionid = validacion.validacionid;
          validacionUpdate.verificado = 1;
          validacionUpdate.fecha_verificado = Sequelize.fn("now", 3);
          validacionUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
          validacionUpdate.fechamod = Sequelize.fn("now", 3);
          const validacionUpdated = await validacionDao.updateValidacion(transaction, validacionUpdate);
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
    await transaction.commit();
    response(res, 201, { ...validacionReturned });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const validateRestorePassword = async (req, res) => {
  logger.debug(line(), "controller::validateRestorePassword");
  const transaction = await sequelizeFT.transaction();
  try {
    //logger.info(line(),req);
    const filter_estado = [1];
    const validateRestorePasswordSchema = Yup.object({
      hash: Yup.string().trim().required().max(50),
      codigo: Yup.string().trim().required().max(100),
      token: Yup.string().trim().required().max(255),
    }).required();
    const validacionValidated = validateRestorePasswordSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

    const usuario = await usuarioDao.getUsuarioByHash(transaction, validacionValidated.hash);
    if (!usuario) {
      logger.warn(line(), "Usuario no existe: ", validacionValidated);
      throw new ClientError("El código de verificación no es válido o ha expidado", 404);
    }

    const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(transaction, usuario._idusuario, validacionValidated.codigo, filter_estado);
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
    await transaction.commit();
    response(res, 201, { ...validacionReturned });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const sendTokenPassword = async (req, res) => {
  logger.debug(line(), "controller::sendTokenPassword");
  const transaction = await sequelizeFT.transaction();
  try {
    let EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const filter_estado = [1];
    const validacionCreateSchema = Yup.object()
      .shape({
        email: Yup.string().trim().required().email().matches(EMAIL_REGX, "Debe ser un correo válido.").min(5).max(50),
      })
      .required();
    const validacionValidated = validacionCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

    const usuario = await usuarioDao.getUsuarioByEmail(transaction, validacionValidated.email);
    if (!usuario) {
      logger.warn(line(), "Usuario no existe: ", validacionValidated);
    } else {
      const _idvalidaciontipo = 3; // 1: Para recuperar contraseña
      const resetpasswordvalidationcode = Math.floor(100000 + Math.random() * 900000); // Código aleaatorio de 6 dígitos
      const validacionPrev = await validacionDao.getValidacionByIdusuarioAndIdvalidaciontipo(transaction, usuario._idusuario, _idvalidaciontipo, filter_estado);
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

        const validacionCreated = await validacionDao.insertValidacion(transaction, validacionNew);
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

        const validacionUpdated = await validacionDao.updateValidacion(transaction, validacionUpdate);
        if (!validacionUpdated) {
          logger.warn(line(), "No fue posible actualizar el objeto: ", validacionUpdate);
        }
      }
      const validacionNext = await validacionDao.getValidacionByIdusuarioAndIdvalidaciontipo(transaction, usuario._idusuario, _idvalidaciontipo, filter_estado);
      if (validacionNext) {
        //Enviar enlace para recuperar contraseña
        let otp_encriptado = cryptoUtils.encryptText(resetpasswordvalidationcode.toString(), config.TOKEN_KEY_OTP);
        let url = config.WEB_SITE + "token-verification-password?hash=" + usuario.hash + "&codigo=" + validacionNext.codigo + "&token=" + otp_encriptado;
        logger.info(line(), "url", url);
      }
    }

    let validacionReturned = {};
    await transaction.commit();
    response(res, 201, { ...validacionReturned });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const sendVerificactionCode = async (req, res) => {
  logger.debug(line(), "controller::sendVerificactionCode");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1];
    const validacionCreateSchema = Yup.object()
      .shape({
        hash: Yup.string().max(50).trim().required(),
        codigo: Yup.string().max(100).trim().required(),
      })
      .required();
    const validacionValidated = validacionCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

    const usuario = await usuarioDao.getUsuarioByHash(transaction, validacionValidated.hash);
    if (!usuario) {
      logger.warn(line(), "Usuario no existe: ", validacionValidated);
      throw new ClientError("Información no válida", 404);
    }

    const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(transaction, usuario._idusuario, validacionValidated.codigo, filter_estado);
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

    const validacionUpdated = await validacionDao.updateValidacion(transaction, validacionUpdate);

    let validacionReturned = {};

    await transaction.commit();
    response(res, 201, { ...validacionReturned });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const loginUser = async (req, res) => {
  logger.debug(line(), "controller::loginUser");

  let EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  const loginUserSchema = Yup.object()
    .shape({
      email: Yup.string().trim().required("Correo electrónico es requerido").email("Debe ser un correo válido").matches(EMAIL_REGX, "Debe ser un correo válido.").min(5, "Mínimo 5 caracteres").max(50, "Máximo 50 caracteres"),
      password: Yup.string().required("Contraseña es requerido").min(6, "Mínimo 6 caracteres").max(20, "Máximo 20 caracteres"),
    })
    .required();
  const loginUserValidated = loginUserSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  const transaction = await sequelizeFT.transaction();
  try {
    // Validate if user exist in our database
    const usuario_login = await usuarioDao.autenticarUsuario(transaction, loginUserValidated.email);
    if (!usuario_login) {
      logger.warn(line(), "Usuario no existe: [" + loginUserValidated.email + "]");
      throw new ClientError("Usuario y/o contraseña no válida", 404);
    }

    if (usuario_login.email && usuario_login.credencial.password && bcrypt.compareSync(loginUserValidated.password, usuario_login.credencial.password)) {
      // Consultamos todos los datos del usuario y sus roles
      const usuario_autenticado = await usuarioDao.getUsuarioAndRolesByEmail(transaction, loginUserValidated.email);
      // Obtén el primer registro de usuario_autenticado
      const usuario = usuario_autenticado[0];
      //jsonUtils.prettyPrint(usuario);
      // Create token
      const token = jwt.sign({ usuario: usuario }, config.TOKEN_KEY_JWT, {
        expiresIn: "200000h",
      });

      await transaction.commit();
      response(res, 201, { token });
    } else {
      logger.warn(line(), "Credenciales no válidas: [" + loginUserValidated.email + "]");
      throw new ClientError("Usuario y/o contraseña no válida", 404);
    }
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const registerUsuario = async (req, res) => {
  logger.debug(line(), "controller::registerUsuario");
  const transaction = await sequelizeFT.transaction();
  try {
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

    const documentotipo = await documentotipoDao.findDocumentotipoPk(transaction, usuarioValidated.documentotipoid);
    if (!documentotipo) {
      throw new ClientError("Documento tipo no existe", 404);
    }

    //Validate unique register
    const usuariobynumerodocumento = await usuarioDao.getUsuarioByNumerodocumento(transaction, usuarioValidated.documentonumero);
    if (usuariobynumerodocumento) {
      throw new ClientError("El número de documento ya se encuentra registrado. ", 404);
    }

    const usuariobyemail = await usuarioDao.getUsuarioByEmail(transaction, usuarioValidated.email);
    if (usuariobyemail) {
      throw new ClientError("El correo electrónico ya se encuentra registrado. ", 404);
    }

    const personaverificacionestado_no_solicitado = 1; // 1: No solicitado
    const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByIdpersonaverificacionestado(transaction, personaverificacionestado_no_solicitado);
    if (!personaverificacionestado) {
      logger.warn(line(), "Persona verificación estado no existe: [" + personaverificacionestado_no_solicitado + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const emailvalidationcode = Math.floor(100000 + Math.random() * 900000); // Código aleaatorio de 6 dígitos
    const hash = crypto
      .createHash("sha1")
      .update(usuarioValidated.email + "|" + usuarioValidated.documentotipoid + "|" + usuarioValidated.documentonumero + "|" + Sequelize.fn("now", 3))
      .digest("hex");

    //Encrypt user password. Cumple estándares PCI-DSS o la GDPR: hashing y salting
    const salt = bcrypt.genSaltSync(12); // 12 es el costo del salting
    const encryptedPassword = bcrypt.hashSync(usuarioValidated.password, salt);

    delete usuarioValidated.password;

    let camposUsuarioFk = {};
    camposUsuarioFk._iddocumentotipo = documentotipo._iddocumentotipo;

    let camposUsuarioAdicionales = {};
    camposUsuarioAdicionales.usuarioid = uuidv4();
    camposUsuarioAdicionales.code = uuidv4().split("-")[0];
    camposUsuarioAdicionales.password = encryptedPassword;
    camposUsuarioAdicionales.hash = hash;
    camposUsuarioAdicionales.ispersonavalidated = personaverificacionestado.ispersonavalidated;

    let camposUsuarioAuditoria = {};
    camposUsuarioAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
    camposUsuarioAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposUsuarioAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    camposUsuarioAuditoria.fechamod = Sequelize.fn("now", 3);
    camposUsuarioAuditoria.estado = 1;

    const usuarioCreated = await usuarioDao.insertUsuario(transaction, {
      ...camposUsuarioFk,
      ...camposUsuarioAdicionales,
      ...usuarioValidated,
      ...camposUsuarioAuditoria,
    });
    logger.debug(line(), "usuarioCreated", usuarioCreated);

    let camposCredencialFk = {};
    camposCredencialFk._idusuario = usuarioCreated._idusuario;

    let camposCredencialAdicionales = {};
    camposCredencialAdicionales.usuarioid = uuidv4();
    camposCredencialAdicionales.code = uuidv4().split("-")[0];
    camposCredencialAdicionales.password = encryptedPassword;

    let camposCredencialoAuditoria = {};
    camposCredencialoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
    camposCredencialoAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposCredencialoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    camposCredencialoAuditoria.fechamod = Sequelize.fn("now", 3);
    camposCredencialoAuditoria.estado = 1;

    const credencialCreated = await credencialDao.insertCredencial(transaction, {
      ...camposCredencialFk,
      ...camposCredencialAdicionales,
      ...camposCredencialoAuditoria,
    });
    logger.debug(line(), "credencialCreated", credencialCreated);

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

    const validacionCreated = await validacionDao.insertValidacion(transaction, validacion);
    logger.debug(line(), "validacionCreated", validacionCreated);

    const usuarioReturned = {};
    usuarioReturned.hash = camposUsuarioAdicionales.hash;
    usuarioReturned.email = usuarioValidated.email;
    usuarioReturned.codigo = validacion.codigo;

    var usuarioObfuscated = jsonUtils.ofuscarAtributos(usuarioReturned, ["email"], jsonUtils.PATRON_OFUSCAR_EMAIL);

    await transaction.commit();
    response(res, 201, { ...usuarioObfuscated });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const validateEmail = async (req, res) => {
  logger.debug(line(), "controller::validateEmail");
  const transaction = await sequelizeFT.transaction();
  try {
    //logger.info(line(),req);
    const filter_estado = [1];
    const validateRestorePasswordSchema = Yup.object({
      hash: Yup.string().trim().required().max(50),
      codigo: Yup.string().trim().required().max(100),
      otp: Yup.string().trim().required().max(6),
    }).required();
    const validacionValidated = validateRestorePasswordSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

    const usuario = await usuarioDao.getUsuarioByHash(transaction, validacionValidated.hash);
    if (!usuario) {
      logger.warn(line(), "Usuario no existe: ", validacionValidated);
      throw new ClientError("El código de verificación no es válido o ha expidado", 404);
    }

    const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(transaction, usuario._idusuario, validacionValidated.codigo, filter_estado);
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
          const validacionUpdated = await validacionDao.updateValidacion(transaction, validacionUpdate);

          var usuarioUpdate = {};
          usuarioUpdate.usuarioid = usuario.usuarioid;
          usuarioUpdate.isemailvalidated = 1; // true
          const usuarioUpdated = await usuarioDao.updateUsuario(transaction, usuarioUpdate);
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
    await transaction.commit();
    response(res, 201, { ...validacionReturned });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
