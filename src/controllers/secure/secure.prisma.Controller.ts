import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";
import * as documentotipoDao from "#src/daos/documentotipo.prisma.Dao.js";
import * as validacionDao from "#src/daos/validacion.prisma.Dao.js";
import * as credencialDao from "#src/daos/credencial.prisma.Dao.js";
import * as personaverificacionestadoDao from "#src/daos/personaverificacionestado.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#root/src/utils/logger.pino.js";

import * as cryptoUtils from "#src/utils/cryptoUtils.js";
import { env } from "#src/config.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { Sequelize } from "sequelize";
import type { credencial } from "#src/models/prisma/ft_factoring/client";
import type { validacion } from "#src/models/prisma/ft_factoring/client";
import type { usuario } from "#src/models/prisma/ft_factoring/client";

export const resetPassword = async (req: Request, res: Response) => {
  log.debug(line(), "controller::resetPassword");
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

  const validacionReturned = await prismaFT.client.$transaction(
    async (tx) => {
      const usuario = await usuarioDao.getUsuarioByHash(tx, validacionValidated.hash);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: ", validacionValidated);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }

      const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(tx, usuario._idusuario, validacionValidated.codigo, filter_estado);
      if (!validacion) {
        log.warn(line(), "Validación no existe: ", validacionValidated);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }
      //jsonUtils.prettyPrint(validacion);

      //Desencriptamos token para hallar el otp
      let otp_desencriptado = cryptoUtils.decryptText(validacionValidated.token, env.TOKEN_KEY_OTP);
      log.info(line(), "OTP Desencriptado", otp_desencriptado);

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

            const credencial = await credencialDao.getCredencialByIdusuario(tx, usuario._idusuario);
            if (!credencial) {
              log.warn(line(), "Credencial no existe por idusuario: ", usuario._idusuario);
              throw new ClientError("El código de verificación no es válido o ha expidado", 404);
            }

            let credencialUpdate: Partial<credencial> = {};
            credencialUpdate.credencialid = credencial.credencialid;
            credencialUpdate.password = encryptedPassword;
            credencialUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
            credencialUpdate.fechamod = new Date();

            const credencialUpdated = await credencialDao.updateCredencial(tx, credencialUpdate);
            if (credencialUpdated[0] == 0) {
              log.warn(line(), "No fue posible actualizar el usuario: ", credencialUpdated);
              throw new ClientError("El código de verificación no es válido o ha expidado", 404);
            }

            // Actualizamos el validate
            var validacionUpdate: Partial<validacion> = {};
            validacionUpdate.validacionid = validacion.validacionid;
            validacionUpdate.verificado = 1;
            validacionUpdate.fecha_verificado = new Date();
            validacionUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
            validacionUpdate.fechamod = new Date();
            const validacionUpdated = await validacionDao.updateValidacion(tx, validacionUpdate);
          } else {
            log.warn(line(), "El código de verificación ha expirado: ", validacionValidated);
            throw new ClientError("El código de verificación no es válido o ha expidado", 404);
          }
        } else {
          log.warn(line(), "El código de verificación ha sido validado anteriormente: ", validacionValidated);
          throw new ClientError("El código de verificación no es válido o ha expidado", 404);
        }
      } else {
        log.warn(line(), "El código de verificación no es válido: ", validacionValidated);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }
      var validacionReturned: Record<string, any> = {};
      validacionReturned.hash = validacionValidated.hash;
      return validacionReturned;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...validacionReturned });
};

export const validateRestorePassword = async (req: Request, res: Response) => {
  log.debug(line(), "controller::validateRestorePassword");

  //log.info(line(),req);
  const filter_estado = [1];
  const validateRestorePasswordSchema = Yup.object({
    hash: Yup.string().trim().required().max(50),
    codigo: Yup.string().trim().required().max(100),
    token: Yup.string().trim().required().max(255),
  }).required();
  const validacionValidated = validateRestorePasswordSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  const validacionReturned = await prismaFT.client.$transaction(
    async (tx) => {
      const usuario = await usuarioDao.getUsuarioByHash(tx, validacionValidated.hash);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: ", validacionValidated);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }

      const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(tx, usuario._idusuario, validacionValidated.codigo, filter_estado);
      if (!validacion) {
        log.warn(line(), "Validación no existe: ", validacionValidated);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }
      //jsonUtils.prettyPrint(validacion);

      //Desencriptamos token para hallar el otp
      let otp_desencriptado = cryptoUtils.decryptText(validacionValidated.token, env.TOKEN_KEY_OTP);
      log.info(line(), "OTP Desencriptado", otp_desencriptado);

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
            log.warn(line(), "El código de verificación ha expirado: ", validacionValidated);
            throw new ClientError("El código de verificación no es válido o ha expidado", 404);
          }
        } else {
          log.warn(line(), "El código de verificación ha sido validado anteriormente: ", validacionValidated);
          throw new ClientError("El código de verificación no es válido o ha expidado", 404);
        }
      } else {
        log.warn(line(), "El código de verificación no es válido: ", validacionValidated);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }
      var validacionReturned: Record<string, any> = {};
      validacionReturned.hash = validacionValidated.hash;
      return validacionReturned;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...validacionReturned });
};

export const sendTokenPassword = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendTokenPassword");
  const validacionReturned = await prismaFT.client.$transaction(
    async (tx) => {
      let EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
      const filter_estado = [1];
      const validacionCreateSchema = Yup.object()
        .shape({
          email: Yup.string().trim().required().email().matches(EMAIL_REGX, "Debe ser un correo válido.").min(5).max(50),
        })
        .required();
      const validacionValidated = validacionCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

      const usuario = await usuarioDao.getUsuarioByEmail(tx, validacionValidated.email);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: ", validacionValidated);
      } else {
        const _idvalidaciontipo = 3; // 1: Para recuperar contraseña
        const resetpasswordvalidationcode = String(Math.floor(100000 + Math.random() * 900000)); // Código aleaatorio de 6 dígitos
        const validacionPrev = await validacionDao.getValidacionByIdusuarioAndIdvalidaciontipo(tx, usuario._idusuario, _idvalidaciontipo, filter_estado);
        if (!validacionPrev) {
          log.warn(line(), "Validación no existe: ", validacionValidated);
          let validacionNew: Partial<validacion> = {};
          validacionNew._idusuario = usuario._idusuario;
          validacionNew.idvalidaciontipo = _idvalidaciontipo;
          validacionNew.valor = validacionValidated.email;
          validacionNew.otp = resetpasswordvalidationcode;
          validacionNew.tiempo_marca = new Date();
          validacionNew.tiempo_expiracion = 15; // En minutos
          validacionNew.codigo = crypto.randomBytes(77).toString("hex").slice(0, 77);
          validacionNew.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
          validacionNew.fechacrea = new Date();
          validacionNew.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
          validacionNew.fechamod = new Date();
          validacionNew.estado = 1;

          const validacionCreated = await validacionDao.insertValidacion(tx, validacionNew);
          if (!validacionCreated) {
            log.warn(line(), "No fue posible insertar el objeto: ", validacionNew);
          }
        } else {
          let validacionUpdate: Partial<validacion> = {};
          validacionUpdate.validacionid = validacionPrev.validacionid;
          validacionUpdate.otp = resetpasswordvalidationcode;
          validacionUpdate.tiempo_marca = new Date();
          validacionUpdate.tiempo_expiracion = 15; // En minutos
          validacionUpdate.verificado = 0;
          validacionUpdate.fecha_verificado = null;
          validacionUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
          validacionUpdate.fechamod = new Date();

          const validacionUpdated = await validacionDao.updateValidacion(tx, validacionUpdate);
          if (!validacionUpdated) {
            log.warn(line(), "No fue posible actualizar el objeto: ", validacionUpdate);
          }
        }
        const validacionNext = await validacionDao.getValidacionByIdusuarioAndIdvalidaciontipo(tx, usuario._idusuario, _idvalidaciontipo, filter_estado);
        if (validacionNext) {
          //Enviar enlace para recuperar contraseña
          let otp_encriptado = cryptoUtils.encryptText(resetpasswordvalidationcode.toString(), env.TOKEN_KEY_OTP);
          let url = env.WEB_SITE + "token-verification-password?hash=" + usuario.hash + "&codigo=" + validacionNext.codigo + "&token=" + otp_encriptado;
          log.info(line(), "url", url);
        }
      }

      let validacionReturned = {};
      return validacionReturned;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...validacionReturned });
};

export const sendVerificactionCode = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendVerificactionCode");

  const filter_estado = [1];
  const validacionCreateSchema = Yup.object()
    .shape({
      hash: Yup.string().max(50).trim().required(),
      codigo: Yup.string().max(100).trim().required(),
    })
    .required();
  const validacionValidated = validacionCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  const validacionReturned = await prismaFT.client.$transaction(
    async (tx) => {
      const usuario = await usuarioDao.getUsuarioByHash(tx, validacionValidated.hash);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: ", validacionValidated);
        throw new ClientError("Información no válida", 404);
      }

      const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(tx, usuario._idusuario, validacionValidated.codigo, filter_estado);
      if (!validacion) {
        log.warn(line(), "Validación no existe: ", validacionValidated);
        throw new ClientError("Información no válida", 404);
      }

      if (validacion.verificado != 0) {
        log.warn(line(), "Valor ya se encuentra verificado: ", validacionValidated);
        throw new ClientError("Información no válida", 404);
      }

      const emailvalidationcode = String(Math.floor(100000 + Math.random() * 900000)); // Código aleaatorio de 6 dígitos

      let validacionUpdate: Partial<validacion> = {};
      validacionUpdate.validacionid = validacion.validacionid;
      validacionUpdate.otp = emailvalidationcode;
      validacionUpdate.tiempo_marca = new Date();
      validacionUpdate.tiempo_expiracion = 5; // En minutos
      validacionUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      validacionUpdate.fechamod = new Date();

      const validacionUpdated = await validacionDao.updateValidacion(tx, validacionUpdate);

      let validacionReturned = {};

      return validacionReturned;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...validacionReturned });
};

export const loginUser = async (req: Request, res: Response) => {
  log.debug(line(), "controller::loginUser");

  let EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  const loginUserSchema = Yup.object()
    .shape({
      email: Yup.string().trim().required("Correo electrónico es requerido").email("Debe ser un correo válido").matches(EMAIL_REGX, "Debe ser un correo válido.").min(5, "Mínimo 5 caracteres").max(50, "Máximo 50 caracteres"),
      password: Yup.string().required("Contraseña es requerido").min(6, "Mínimo 6 caracteres").max(20, "Máximo 20 caracteres"),
    })
    .required();
  const loginUserValidated = loginUserSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  const token = await prismaFT.client.$transaction(
    async (tx) => {
      // Validate if user exist in our database
      const usuario_login = await usuarioDao.autenticarUsuario(tx, loginUserValidated.email);
      if (!usuario_login) {
        log.warn(line(), "Usuario no existe: [" + loginUserValidated.email + "]");
        throw new ClientError("Usuario y/o contraseña no válida", 404);
      }

      if (usuario_login.email && usuario_login.credencial.password && bcrypt.compareSync(loginUserValidated.password, usuario_login.credencial.password)) {
        // Consultamos todos los datos del usuario y sus roles
        const usuario_autenticado = await usuarioDao.getUsuarioAndRolesByEmail(tx, loginUserValidated.email);
        // Obtén el primer registro de usuario_autenticado
        const usuario = usuario_autenticado[0];
        //jsonUtils.prettyPrint(usuario);
        // Create token
        const token = jwt.sign({ usuario: usuario }, env.TOKEN_KEY_JWT, {
          expiresIn: "200000h",
        });
      } else {
        log.warn(line(), "Credenciales no válidas: [" + loginUserValidated.email + "]");
        throw new ClientError("Usuario y/o contraseña no válida", 404);
      }
      return token;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { token });
};

export const registerUsuario = async (req: Request, res: Response) => {
  log.debug(line(), "controller::registerUsuario");
  const usuarioObfuscated = await prismaFT.client.$transaction(
    async (tx) => {
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

      const documentotipo = await documentotipoDao.findDocumentotipoPk(tx, usuarioValidated.documentotipoid);
      if (!documentotipo) {
        throw new ClientError("Documento tipo no existe", 404);
      }

      //Validate unique register
      const usuariobynumerodocumento = await usuarioDao.getUsuarioByNumerodocumento(tx, usuarioValidated.documentonumero);
      if (usuariobynumerodocumento) {
        throw new ClientError("El número de documento ya se encuentra registrado. ", 404);
      }

      const usuariobyemail = await usuarioDao.getUsuarioByEmail(tx, usuarioValidated.email);
      if (usuariobyemail) {
        throw new ClientError("El correo electrónico ya se encuentra registrado. ", 404);
      }

      const personaverificacionestado_no_solicitado = 1; // 1: No solicitado
      const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByIdpersonaverificacionestado(tx, personaverificacionestado_no_solicitado);
      if (!personaverificacionestado) {
        log.warn(line(), "Persona verificación estado no existe: [" + personaverificacionestado_no_solicitado + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const emailvalidationcode = String(Math.floor(100000 + Math.random() * 900000)); // Código aleaatorio de 6 dígitos
      const hash = crypto
        .createHash("sha1")
        .update(usuarioValidated.email + "|" + usuarioValidated.documentotipoid + "|" + usuarioValidated.documentonumero + "|" + Sequelize.fn("now", 3))
        .digest("hex");

      //Encrypt user password. Cumple estándares PCI-DSS o la GDPR: hashing y salting
      const salt = bcrypt.genSaltSync(12); // 12 es el costo del salting
      const encryptedPassword = bcrypt.hashSync(usuarioValidated.password, salt);

      delete usuarioValidated.password;

      let camposUsuarioFk: Partial<usuario> = {};
      camposUsuarioFk.iddocumentotipo = documentotipo.iddocumentotipo;

      let camposUsuarioAdicionales: Partial<usuario> = {};
      camposUsuarioAdicionales.usuarioid = uuidv4();
      camposUsuarioAdicionales.code = uuidv4().split("-")[0];
      camposUsuarioAdicionales.hash = hash;
      camposUsuarioAdicionales.ispersonavalidated = personaverificacionestado.ispersonavalidated;

      let camposUsuarioAuditoria: Partial<usuario> = {};
      camposUsuarioAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      camposUsuarioAuditoria.fechacrea = new Date();
      camposUsuarioAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposUsuarioAuditoria.fechamod = new Date();
      camposUsuarioAuditoria.estado = 1;

      const usuarioCreated = await usuarioDao.insertUsuario(tx, {
        ...camposUsuarioFk,
        ...camposUsuarioAdicionales,
        ...usuarioValidated,
        ...camposUsuarioAuditoria,
      });
      log.debug(line(), "usuarioCreated", usuarioCreated);

      let camposCredencialFk: Partial<credencial> = {};
      camposCredencialFk._idusuario = usuarioCreated._idusuario;

      let camposCredencialAdicionales: Partial<credencial> = {};
      camposCredencialAdicionales.credencialid = uuidv4();
      camposCredencialAdicionales.code = uuidv4().split("-")[0];
      camposCredencialAdicionales.password = encryptedPassword;

      let camposCredencialoAuditoria: Partial<credencial> = {};
      camposCredencialoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      camposCredencialoAuditoria.fechacrea = new Date();
      camposCredencialoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposCredencialoAuditoria.fechamod = new Date();
      camposCredencialoAuditoria.estado = 1;

      const credencialCreated = await credencialDao.insertCredencial(tx, {
        ...camposCredencialFk,
        ...camposCredencialAdicionales,
        ...camposCredencialoAuditoria,
      });
      log.debug(line(), "credencialCreated", credencialCreated);

      let validacion: Partial<validacion> = {};
      validacion._idusuario = usuarioCreated._idusuario;
      validacion.idvalidaciontipo = 1; // 1: Para Correo electrónico
      validacion.valor = usuarioValidated.email;
      validacion.otp = emailvalidationcode;
      validacion.tiempo_marca = new Date();
      validacion.tiempo_expiracion = 5; // En minutos
      validacion.codigo = crypto.randomBytes(77).toString("hex").slice(0, 77);
      validacion.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      validacion.fechacrea = new Date();
      validacion.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      validacion.fechamod = new Date();
      validacion.estado = 1;

      const validacionCreated = await validacionDao.insertValidacion(tx, validacion);
      log.debug(line(), "validacionCreated", validacionCreated);

      const usuarioReturned: Record<string, any> = {};
      usuarioReturned.hash = camposUsuarioAdicionales.hash;
      usuarioReturned.email = usuarioValidated.email;
      usuarioReturned.codigo = validacion.codigo;

      var usuarioObfuscated = jsonUtils.ofuscarAtributos(usuarioReturned, ["email"], jsonUtils.PATRON_OFUSCAR_EMAIL);

      return usuarioObfuscated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...usuarioObfuscated });
};

export const validateEmail = async (req: Request, res: Response) => {
  log.debug(line(), "controller::validateEmail");
  const validacionReturned = await prismaFT.client.$transaction(
    async (tx) => {
      //log.info(line(),req);
      const filter_estado = [1];
      const validateRestorePasswordSchema = Yup.object({
        hash: Yup.string().trim().required().max(50),
        codigo: Yup.string().trim().required().max(100),
        otp: Yup.string().trim().required().max(6),
      }).required();
      const validacionValidated = validateRestorePasswordSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

      const usuario = await usuarioDao.getUsuarioByHash(tx, validacionValidated.hash);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: ", validacionValidated);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }

      const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(tx, usuario._idusuario, validacionValidated.codigo, filter_estado);
      if (!validacion) {
        log.warn(line(), "Validación no existe: ", validacionValidated);
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
            var validacionUpdate: Partial<validacion> = {};
            validacionUpdate.validacionid = validacion.validacionid;
            validacionUpdate.verificado = 1;
            validacionUpdate.fecha_verificado = new Date();
            validacionUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
            validacionUpdate.fechamod = new Date();
            const validacionUpdated = await validacionDao.updateValidacion(tx, validacionUpdate);

            var usuarioUpdate: Partial<usuario> = {};
            usuarioUpdate.usuarioid = usuario.usuarioid;
            usuarioUpdate.isemailvalidated = 1; // true
            const usuarioUpdated = await usuarioDao.updateUsuario(tx, usuarioUpdate);
          } else {
            log.warn(line(), "El código de verificación ha expirado: ", validacionValidated);
            throw new ClientError("El código de verificación no es válido o ha expidado", 404);
          }
        } else {
          log.warn(line(), "El código de verificación ha sido validado anteriormente: ", validacionValidated);
          throw new ClientError("El código de verificación no es válido o ha expidado", 404);
        }
      } else {
        log.warn(line(), "El código de verificación no es válido: ", validacionValidated);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }
      var validacionReturned: Record<string, any> = {};
      validacionReturned.hash = validacionValidated.hash;
      return validacionReturned;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...validacionReturned });
};
