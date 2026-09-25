import { Request, Response } from "express";
import { line, log } from "#root/src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as Yup from "yup";
import {
  loginUserService,
  resetPasswordService,
  validateRestorePasswordService,
  sendTokenPasswordService,
  sendVerificactionCodeService,
  registerUsuarioService,
  validateEmailService,
  LoginUserDto,
  ResetPasswordDto,
  ValidateRestorePasswordDto,
  SendVerificationCodeDto,
  RegisterUsuarioDto,
  ValidateEmailDto,
} from "#root/src/services/secure/secure.Service.js";

const EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const NAME_REGX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

export const loginUser = async (req: Request, res: Response) => {
  log.debug(line(), "controller::loginUser");

  const loginUserSchema = Yup.object()
    .shape({
      email: Yup.string()
        .trim()
        .required("Correo electrónico es requerido")
        .email("Debe ser un correo válido")
        .matches(EMAIL_REGX, "Debe ser un correo válido.")
        .min(5, "Mínimo 5 caracteres")
        .max(50, "Máximo 50 caracteres"),
      password: Yup.string()
        .required("Contraseña es requerido")
        .min(6, "Mínimo 6 caracteres")
        .max(50, "Máximo 50 caracteres"),
    })
    .required();

  const loginUserValidated = loginUserSchema.validateSync(req.body, {
    abortEarly: false,
    stripUnknown: true,
  }) as LoginUserDto;

  const token = await loginUserService(loginUserValidated);
  response(res, 201, token);
};

export const resetPassword = async (req: Request, res: Response) => {
  log.debug(line(), "controller::resetPassword");
  const idUsuarioSession = req.session_user?.usuario?.idusuario ?? 1;

  const validateChangePasswordSchema = Yup.object({
    hash: Yup.string().trim().required().max(50),
    codigo: Yup.string().trim().required().max(100),
    token: Yup.string().trim().required().max(255),
    password: Yup.string().min(8).max(50).required(),
    confirmPassword: Yup.string()
      .required()
      .min(8)
      .max(50)
      .test(
        "confirmPassword",
        "¡Ambas contraseñas deben coincidir!",
        (confirmPassword, yup) => yup.parent.password === confirmPassword,
      ),
  }).required();

  const validacionValidated = validateChangePasswordSchema.validateSync(req.body, {
    abortEarly: false,
    stripUnknown: true,
  }) as ResetPasswordDto;

  const validacionReturned = await resetPasswordService(idUsuarioSession, validacionValidated);
  response(res, 201, { ...validacionReturned });
};

export const validateRestorePassword = async (req: Request, res: Response) => {
  log.debug(line(), "controller::validateRestorePassword");

  const validateRestorePasswordSchema = Yup.object({
    hash: Yup.string().trim().required().max(50),
    codigo: Yup.string().trim().required().max(100),
    token: Yup.string().trim().required().max(255),
  }).required();

  const validacionValidated = validateRestorePasswordSchema.validateSync(req.body, {
    abortEarly: false,
    stripUnknown: true,
  }) as ValidateRestorePasswordDto;

  const validacionReturned = await validateRestorePasswordService(validacionValidated);
  response(res, 201, { ...validacionReturned });
};

export const sendTokenPassword = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendTokenPassword");
  const idUsuarioSession = req.session_user?.usuario?.idusuario ?? 1;

  const validacionCreateSchema = Yup.object()
    .shape({
      email: Yup.string().trim().required().email().matches(EMAIL_REGX, "Debe ser un correo válido.").min(5).max(50),
    })
    .required();

  const validacionValidated = validacionCreateSchema.validateSync(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  const validacionReturned = await sendTokenPasswordService(idUsuarioSession, validacionValidated.email);
  response(res, 201, { ...validacionReturned });
};

export const sendVerificactionCode = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendVerificactionCode");
  const idUsuarioSession = req.session_user?.usuario?.idusuario ?? 1;

  const validacionCreateSchema = Yup.object()
    .shape({
      hash: Yup.string().max(50).trim().required(),
      codigo: Yup.string().max(100).trim().required(),
    })
    .required();

  const validacionValidated = validacionCreateSchema.validateSync(req.body, {
    abortEarly: false,
    stripUnknown: true,
  }) as SendVerificationCodeDto;

  const validacionReturned = await sendVerificactionCodeService(idUsuarioSession, validacionValidated);
  response(res, 201, { ...validacionReturned });
};

export const registerUsuario = async (req: Request, res: Response) => {
  log.debug(line(), "controller::registerUsuario");
  const idUsuarioSession = req.session_user?.usuario?.idusuario ?? 1;

  const usuarioCreateSchema = Yup.object()
    .shape({
      documentotipoid: Yup.string().min(36).max(36).trim().required(),
      documentonumero: Yup.string()
        .trim()
        .required()
        .matches(/^[0-9]*$/, "Ingrese solo números")
        .length(8),
      usuarionombres: Yup.string().trim().required().matches(NAME_REGX, "Debe ser un nombre válido").min(2).max(100),
      apellidopaterno: Yup.string()
        .trim()
        .required()
        .matches(NAME_REGX, "Debe ser un apellido válido")
        .min(2)
        .max(50),
      apellidomaterno: Yup.string()
        .trim()
        .required()
        .matches(NAME_REGX, "Debe ser un apellido válido")
        .min(2)
        .max(50),
      email: Yup.string().trim().required().email().matches(EMAIL_REGX, "Debe ser un correo válido.").min(5).max(50),
      celular: Yup.string().trim().required(),
      password: Yup.string().min(8).max(50).required(),
    })
    .required();

  const usuarioValidated = usuarioCreateSchema.validateSync(req.body, {
    abortEarly: false,
    stripUnknown: true,
  }) as RegisterUsuarioDto;

  const usuarioObfuscated = await registerUsuarioService(idUsuarioSession, usuarioValidated);
  response(res, 201, { ...usuarioObfuscated });
};

export const validateEmail = async (req: Request, res: Response) => {
  log.debug(line(), "controller::validateEmail");
  const idUsuarioSession = req.session_user?.usuario?.idusuario ?? 1;

  const validateRestorePasswordSchema = Yup.object({
    hash: Yup.string().trim().required().max(50),
    codigo: Yup.string().trim().required().max(100),
    otp: Yup.string().trim().required().max(6),
  }).required();

  const validacionValidated = validateRestorePasswordSchema.validateSync(req.body, {
    abortEarly: false,
    stripUnknown: true,
  }) as ValidateEmailDto;

  const validacionReturned = await validateEmailService(idUsuarioSession, validacionValidated);
  response(res, 201, { ...validacionReturned });
};
