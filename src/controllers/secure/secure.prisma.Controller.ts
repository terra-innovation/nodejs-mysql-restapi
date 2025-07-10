import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";
import * as usuariorolDao from "#src/daos/usuariorol.prisma.Dao.js";
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

import EmailSender from "#src/utils/email/emailSender.js";
import TemplateManager from "#src/utils/email/TemplateManager.js";

import { UsuarioSession } from "#root/src/types/UsuarioSession.types.js";

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
        const jwtPayload: UsuarioSession = {
          usuario: usuario_autenticado,
        };

        const token = jwt.sign(jwtPayload, env.TOKEN_KEY_JWT, {
          expiresIn: "200000h",
        });
        return { token, usuarioid: usuario_login.usuarioid };
      } else {
        log.warn(line(), "Credenciales no válidas: [" + loginUserValidated.email + "]");
        throw new ClientError("Usuario y/o contraseña no válida", 404);
      }
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, token);
};

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

      const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(tx, usuario.idusuario, validacionValidated.codigo, filter_estado);
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

            const credencial = await credencialDao.getCredencialByIdusuario(tx, usuario.idusuario);
            if (!credencial) {
              log.warn(line(), "Credencial no existe por idusuario: ", usuario.idusuario);
              throw new ClientError("El código de verificación no es válido o ha expidado", 404);
            }

            const credencialToUpdate: Prisma.credencialUpdateInput = {
              password: encryptedPassword,
              idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
              fechamod: new Date(),
            };

            const credencialUpdated = await credencialDao.updateCredencial(tx, credencial.credencialid, credencialToUpdate);
            if (credencialUpdated[0] == 0) {
              log.warn(line(), "No fue posible actualizar el usuario: ", credencialUpdated);
              throw new ClientError("El código de verificación no es válido o ha expidado", 404);
            }

            // Actualizamos el validate

            const validacionToUpdate: Prisma.validacionUpdateInput = {
              verificado: 1,
              fecha_verificado: new Date(),
              idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
              fechamod: new Date(),
            };
            const validacionUpdated = await validacionDao.updateValidacion(tx, validacion.validacionid, validacionToUpdate);
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

      const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(tx, usuario.idusuario, validacionValidated.codigo, filter_estado);
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
        const idvalidaciontipo = 3; // 1: Para recuperar contraseña
        const resetpasswordvalidationcode = String(Math.floor(100000 + Math.random() * 900000)); // Código aleaatorio de 6 dígitos
        const validacionPrev = await validacionDao.getValidacionByIdusuarioAndIdvalidaciontipo(tx, usuario.idusuario, idvalidaciontipo, filter_estado);
        if (!validacionPrev) {
          log.warn(line(), "Validación no existe: ", validacionValidated);

          const validacionToCreate: Prisma.validacionCreateInput = {
            usuario: { connect: { idusuario: usuario.idusuario } },
            validacion_tipo: { connect: { idvalidaciontipo: idvalidaciontipo } },

            valor: validacionValidated.email,
            otp: resetpasswordvalidationcode,
            tiempo_marca: new Date(),
            tiempo_expiracion: 15, // En minutos
            codigo: crypto.randomBytes(77).toString("hex").slice(0, 77),
            idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
            fechacrea: new Date(),
            idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
            fechamod: new Date(),
            estado: 1,
          };

          const validacionCreated = await validacionDao.insertValidacion(tx, validacionToCreate);
          if (!validacionCreated) {
            log.warn(line(), "No fue posible insertar el objeto: ", validacionToCreate);
          }
        } else {
          const validacionToUpdate: Prisma.validacionUpdateInput = {
            otp: resetpasswordvalidationcode,
            tiempo_marca: new Date(),
            tiempo_expiracion: 15, // En minutos
            verificado: 0,
            fecha_verificado: null,
            idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
            fechamod: new Date(),
          };

          const validacionUpdated = await validacionDao.updateValidacion(tx, validacionPrev.validacionid, validacionToUpdate);
          if (!validacionUpdated) {
            log.warn(line(), "No fue posible actualizar el objeto: ", validacionToUpdate);
          }
        }
        const validacionNext = await validacionDao.getValidacionByIdusuarioAndIdvalidaciontipo(tx, usuario.idusuario, idvalidaciontipo, filter_estado);
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

      const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(tx, usuario.idusuario, validacionValidated.codigo, filter_estado);
      if (!validacion) {
        log.warn(line(), "Validación no existe: ", validacionValidated);
        throw new ClientError("Información no válida", 404);
      }

      if (validacion.verificado != 0) {
        log.warn(line(), "Valor ya se encuentra verificado: ", validacionValidated);
        throw new ClientError("Información no válida", 404);
      }

      const emailvalidationcode = String(Math.floor(100000 + Math.random() * 900000)); // Código aleaatorio de 6 dígitos

      const validacionToUpdate: Prisma.validacionUpdateInput = {
        otp: emailvalidationcode,
        tiempo_marca: new Date(),
        tiempo_expiracion: 5, // En minutos
        idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
        fechamod: new Date(),
      };

      const validacionUpdated = await validacionDao.updateValidacion(tx, validacion.validacionid, validacionToUpdate);

      let validacionReturned = {};

      return validacionReturned;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...validacionReturned });
};

export const registerUsuario = async (req: Request, res: Response) => {
  log.debug(line(), "controller::registerUsuario");
  const usuarioObfuscated = await prismaFT.client.$transaction(
    async (tx) => {
      let EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
      let NAME_REGX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

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
        .update(usuarioValidated.email + "|" + usuarioValidated.documentotipoid + "|" + usuarioValidated.documentonumero + "|" + new Date().getTime())
        .digest("hex");

      //Encrypt user password. Cumple estándares PCI-DSS o la GDPR: hashing y salting
      const salt = bcrypt.genSaltSync(12); // 12 es el costo del salting
      const encryptedPassword = bcrypt.hashSync(usuarioValidated.password, salt);

      delete usuarioValidated.password;

      const usuarioToCreate: Prisma.usuarioCreateInput = {
        documento_tipo: { connect: { iddocumentotipo: documentotipo.iddocumentotipo } },
        usuarioid: uuidv4(),
        code: uuidv4().split("-")[0],

        documentonumero: usuarioValidated.documentonumero,
        usuarionombres: usuarioValidated.usuarionombres,
        apellidopaterno: usuarioValidated.apellidopaterno,
        apellidomaterno: usuarioValidated.apellidomaterno,
        email: usuarioValidated.email,
        celular: usuarioValidated.celular,
        hash: hash,
        ispersonavalidated: personaverificacionestado.ispersonavalidated,
        idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const usuarioCreated = await usuarioDao.insertUsuario(tx, usuarioToCreate);
      log.debug(line(), "usuarioCreated", usuarioCreated);

      const credencialToCreate: Prisma.credencialCreateInput = {
        usuario: { connect: { idusuario: usuarioCreated.idusuario } },
        credencialid: uuidv4(),
        code: uuidv4().split("-")[0],
        password: encryptedPassword,
        idusuariocrea: req.session_user?.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const credencialCreated = await credencialDao.insertCredencial(tx, credencialToCreate);
      log.debug(line(), "credencialCreated", credencialCreated);

      const idvalidaciontipo = 1; // 1: Para Correo electrónico
      const validacionToCreate: Prisma.validacionCreateInput = {
        usuario: { connect: { idusuario: usuarioCreated.idusuario } },
        validacion_tipo: { connect: { idvalidaciontipo: idvalidaciontipo } },
        valor: usuarioValidated.email,
        otp: emailvalidationcode,
        tiempo_marca: new Date(),
        tiempo_expiracion: 5, // En minutos
        codigo: crypto.randomBytes(77).toString("hex").slice(0, 77),
        idusuariocrea: req.session_user?.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const validacionCreated = await validacionDao.insertValidacion(tx, validacionToCreate);
      log.debug(line(), "validacionCreated", validacionCreated);

      /* Enviar Email con el código de verificación */
      const templateManager = new TemplateManager();
      const emailSender = new EmailSender();
      const dataEmail = {
        otp: validacionToCreate.otp,
        duracion_minutos: validacionToCreate.tiempo_expiracion,
        fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
      };
      const emailTemplate = await templateManager.templateCodigoVerificacion(dataEmail);

      const mailOptions = {
        to: usuarioValidated.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      };

      await emailSender.sendContactoFinanzatech(mailOptions);
      log.debug(line(), "Correo templateCodigoVerificacion enviado exitosamente.", usuarioValidated.email);

      /* Retornar datos para la validación del usuarioP */
      const usuarioReturned: Record<string, any> = {};
      usuarioReturned.hash = usuarioToCreate.hash;
      usuarioReturned.email = usuarioValidated.email;
      usuarioReturned.codigo = validacionToCreate.codigo;

      var usuarioObfuscated = jsonUtils.ofuscarAtributos(usuarioReturned, ["email"], jsonUtils.PATRON_OFUSCAR_EMAIL);

      return usuarioObfuscated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...usuarioObfuscated });
};

export const validateEmail = async (req: Request, res: Response) => {
  log.debug(line(), "controller::validateEmail");
  const filter_estado = [1];
  const validateRestorePasswordSchema = Yup.object({
    hash: Yup.string().trim().required().max(50),
    codigo: Yup.string().trim().required().max(100),
    otp: Yup.string().trim().required().max(6),
  }).required();
  const validacionValidated = validateRestorePasswordSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  const validacionReturned = await prismaFT.client.$transaction(
    async (tx) => {
      //log.info(line(),req);

      const usuario = await usuarioDao.getUsuarioByHash(tx, validacionValidated.hash);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: ", validacionValidated);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }

      const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(tx, usuario.idusuario, validacionValidated.codigo, filter_estado);
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
            const validacionToUpdate: Prisma.validacionUpdateInput = {
              verificado: 1,
              fecha_verificado: new Date(),
              idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
              fechamod: new Date(),
            };
            const validacionUpdated = await validacionDao.updateValidacion(tx, validacion.validacionid, validacionToUpdate);

            const usuarioToUpdate: Prisma.usuarioUpdateInput = {
              isemailvalidated: true,
            };
            const usuarioUpdated = await usuarioDao.updateUsuario(tx, usuario.usuarioid, usuarioToUpdate);

            /* Damos acceso al usuario como Usuario General */
            const idrol_usuariogeneral = 5;

            const usuariorolToCreate: Prisma.usuario_rolCreateInput = {
              usuario: { connect: { idusuario: usuario.idusuario } },
              rol: { connect: { idrol: idrol_usuariogeneral } },
              idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
              fechacrea: new Date(),
              idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
              fechamod: new Date(),
              estado: 1,
            };

            const usuariorolCreated = await usuariorolDao.insertUsuariorol(tx, usuariorolToCreate);
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
