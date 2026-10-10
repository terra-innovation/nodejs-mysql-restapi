import { Request, Response } from "express";
import { line, log } from "#root/src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { z } from "zod";
import { objectInput, stringInput, inputEmailPattern } from "#src/utils/validationInputs.js";
import { loginUserService, resetPasswordService, validateRestorePasswordService, sendTokenPasswordService, sendVerificactionCodeService, registerUsuarioService, validateEmailService, LoginUserDto, ResetPasswordDto, ValidateRestorePasswordDto, SendVerificationCodeDto, RegisterUsuarioDto, ValidateEmailDto } from "#root/src/services/secure/secure.Service.js";

const EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const NAME_REGX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

export const loginUser = async (req: Request, res: Response) => {
  log.debug(line(), "controller::loginUser");

  const loginUserSchema = objectInput(
    z.object({
      email: stringInput(
        z
          .string({ error: "Correo electrónico es requerido" })
          .refine((value) => value.length > 0, "Correo electrónico es requerido")
          .refine((value) => value === "" || inputEmailPattern.test(value), "Debe ser un correo válido")
          .regex(EMAIL_REGX, "Debe ser un correo válido.")
          .refine((value) => value.length >= 5, "Mínimo 5 caracteres")
          .refine((value) => value.length <= 50, "Máximo 50 caracteres"),
        { trim: true },
      ),
      password: stringInput(
        z
          .string({ error: "Contraseña es requerido" })
          .refine((value) => value.length > 0, "Contraseña es requerido")
          .refine((value) => value.length >= 6, "Mínimo 6 caracteres")
          .refine((value) => value.length <= 50, "Máximo 50 caracteres"),
      ),
    }),
  );

  const loginUserValidated = loginUserSchema.parse(req.body) as LoginUserDto;

  const token = await loginUserService(loginUserValidated);
  response(res, 201, token);
};

export const resetPassword = async (req: Request, res: Response) => {
  log.debug(line(), "controller::resetPassword");
  const idUsuarioSession = req.session_user?.usuario?.idusuario ?? 1;

  const validateChangePasswordSchema = objectInput(
    z
      .object({
        hash: stringInput(
          z
            .string()
            .refine((value) => value.length > 0, "Campo requerido")
            .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
          { trim: true },
        ),
        codigo: stringInput(
          z
            .string()
            .refine((value) => value.length > 0, "Campo requerido")
            .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
          { trim: true },
        ),
        token: stringInput(
          z
            .string()
            .refine((value) => value.length > 0, "Campo requerido")
            .refine((value) => value.length <= 255, "Debe tener como máximo 255 caracteres"),
          { trim: true },
        ),
        password: stringInput(
          z
            .string()
            .refine((value) => value.length >= 8, "Debe tener al menos 8 caracteres")
            .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres")
            .refine((value) => value.length > 0, "Campo requerido"),
        ),
        confirmPassword: stringInput(
          z
            .string()
            .refine((value) => value.length > 0, "Campo requerido")
            .refine((value) => value.length >= 8, "Debe tener al menos 8 caracteres")
            .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        ),
      })
      .refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "¡Ambas contraseñas deben coincidir!" }),
  );

  const validacionValidated = validateChangePasswordSchema.parse(req.body) as ResetPasswordDto;

  const validacionReturned = await resetPasswordService(idUsuarioSession, validacionValidated);
  response(res, 201, { ...validacionReturned });
};

export const validateRestorePassword = async (req: Request, res: Response) => {
  log.debug(line(), "controller::validateRestorePassword");

  const validateRestorePasswordSchema = objectInput(
    z.object({
      hash: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      codigo: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
        { trim: true },
      ),
      token: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 255, "Debe tener como máximo 255 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validacionValidated = validateRestorePasswordSchema.parse(req.body) as ValidateRestorePasswordDto;

  const validacionReturned = await validateRestorePasswordService(validacionValidated);
  response(res, 201, { ...validacionReturned });
};

export const sendTokenPassword = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendTokenPassword");
  const idUsuarioSession = req.session_user?.usuario?.idusuario ?? 1;

  const validacionCreateSchema = objectInput(
    z.object({
      email: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value === "" || inputEmailPattern.test(value), "Debe ser un correo válido")
          .regex(EMAIL_REGX, "Debe ser un correo válido.")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validacionValidated = validacionCreateSchema.parse(req.body);

  const validacionReturned = await sendTokenPasswordService(idUsuarioSession, validacionValidated.email);
  response(res, 201, { ...validacionReturned });
};

export const sendVerificactionCode = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendVerificactionCode");
  const idUsuarioSession = req.session_user?.usuario?.idusuario ?? 1;

  const validacionCreateSchema = objectInput(
    z.object({
      hash: stringInput(
        z
          .string()
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres")
          .refine((value) => value.length > 0, "Campo requerido"),
        { trim: true },
      ),
      codigo: stringInput(
        z
          .string()
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres")
          .refine((value) => value.length > 0, "Campo requerido"),
        { trim: true },
      ),
    }),
  );

  const validacionValidated = validacionCreateSchema.parse(req.body) as SendVerificationCodeDto;

  const validacionReturned = await sendVerificactionCodeService(idUsuarioSession, validacionValidated);
  response(res, 201, { ...validacionReturned });
};

export const registerUsuario = async (req: Request, res: Response) => {
  log.debug(line(), "controller::registerUsuario");
  const idUsuarioSession = req.session_user?.usuario?.idusuario ?? 1;

  const usuarioCreateSchema = objectInput(
    z.object({
      documentotipoid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .refine((value) => value.length > 0, "Campo requerido"),
        { trim: true },
      ),
      documentonumero: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .regex(/^[0-9]*$/, "Ingrese solo números")
          .refine((value) => value.length === 8, "Debe tener exactamente 8 caracteres"),
        { trim: true },
      ),
      usuarionombres: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .regex(NAME_REGX, "Debe ser un nombre válido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
        { trim: true },
      ),
      apellidopaterno: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .regex(NAME_REGX, "Debe ser un apellido válido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      apellidomaterno: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .regex(NAME_REGX, "Debe ser un apellido válido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      email: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value === "" || inputEmailPattern.test(value), "Debe ser un correo válido")
          .regex(EMAIL_REGX, "Debe ser un correo válido.")
          .refine((value) => value.length >= 5, "Debe tener al menos 5 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      celular: stringInput(
        z.string().refine((value) => value.length > 0, "Campo requerido"),
        { trim: true },
      ),
      password: stringInput(
        z
          .string()
          .refine((value) => value.length >= 8, "Debe tener al menos 8 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres")
          .refine((value) => value.length > 0, "Campo requerido"),
      ),
    }),
  );

  const usuarioValidated = usuarioCreateSchema.parse(req.body) as RegisterUsuarioDto;

  const usuarioObfuscated = await registerUsuarioService(idUsuarioSession, usuarioValidated);
  response(res, 201, { ...usuarioObfuscated });
};

export const validateEmail = async (req: Request, res: Response) => {
  log.debug(line(), "controller::validateEmail");
  const idUsuarioSession = req.session_user?.usuario?.idusuario ?? 1;

  const validateRestorePasswordSchema = objectInput(
    z.object({
      hash: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      codigo: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
        { trim: true },
      ),
      otp: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 6, "Debe tener como máximo 6 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validacionValidated = validateRestorePasswordSchema.parse(req.body) as ValidateEmailDto;

  const validacionReturned = await validateEmailService(idUsuarioSession, validacionValidated);
  response(res, 201, { ...validacionReturned });
};
