import { Request, Response } from "express";
import * as yup from "yup";
import * as usuarioservicioService from "#root/src/services/usuario/usuarioservicio.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const suscribirUsuarioServicioFactoringInversionista = async (req: Request, res: Response) => {
  log.debug(line(), "controller::suscribirUsuarioServicioFactoringInversionista");
  const idusuario = req.session_user?.usuario?.idusuario;
  const { id } = req.params;

  const usuarioservicioSuscripcionSchema = yup
    .object()
    .shape({
      idusuario: yup.number().required(),
      usuarioservicioid: yup.string().trim().required().min(36).max(36),
      personaid: yup.string().trim().required().min(36).max(36),

      bancoid: yup.string().trim().required().min(36).max(36),
      cuentatipoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      numero: yup.string().required().max(20),
      cci: yup.string().required().max(20),
      alias: yup.string().required().max(50),

      declaracion_conformidad_contrato: yup.boolean().required(),
      declaracion_datos_reales: yup.boolean().required(),
    })
    .required();

  const usuarioservicioValidated = usuarioservicioSuscripcionSchema.validateSync(
    { ...req.body, idusuario, usuarioservicioid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "usuarioservicioValidated:", usuarioservicioValidated);

  await usuarioservicioService.suscribirUsuarioServicioFactoringInversionistaService(
    idusuario,
    usuarioservicioValidated as usuarioservicioService.SuscribirInversionistaPayload,
  );

  response(res, 200, {});
};

export const suscribirUsuarioServicioFactoringEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::suscribirUsuarioServicioFactoringEmpresa");
  const idusuario = req.session_user?.usuario?.idusuario;
  const { id } = req.params;

  const funcionarioSchema = yup.object().shape({
    nombres: yup.string().required(),
    apellidos: yup.string().required(),
    documentotipoid: yup.string().required(),
    documentonumero: yup.string().required(),
    cargo: yup.string().required(),
    paisid: yup.string().required(),
    es_pep: yup.boolean().required(),
    pep_cargo: yup
      .string()
      .nullable()
      .transform((v) => v || ""),
    pep_institucion: yup
      .string()
      .nullable()
      .transform((v) => v || ""),
    pep_vinculo: yup
      .string()
      .nullable()
      .transform((v) => v || ""),
    pep_nombre_completo: yup
      .string()
      .nullable()
      .transform((v) => v || ""),
  });

  const accionistaSchema: yup.ObjectSchema<any> = yup.object().shape({
    tipo: yup.string().oneOf(["PN", "PJ"]).required(),
    nombres: yup.string().when("tipo", { is: "PN", then: (s) => s.required(), otherwise: (s) => s.strip() }),
    apellidos: yup.string().when("tipo", { is: "PN", then: (s) => s.required(), otherwise: (s) => s.strip() }),
    documentotipoid: yup.string().when("tipo", { is: "PN", then: (s) => s.required(), otherwise: (s) => s.strip() }),
    documentonumero: yup.string().when("tipo", { is: "PN", then: (s) => s.required(), otherwise: (s) => s.strip() }),
    porcentaje_acciones: yup.number().required(),
    paisid: yup.string().required(),
    es_pep: yup.boolean().when("tipo", { is: "PN", then: (s) => s.required(), otherwise: (s) => s.strip() }),
    pep_cargo: yup
      .string()
      .nullable()
      .transform((v) => v || ""),
    pep_institucion: yup
      .string()
      .nullable()
      .transform((v) => v || ""),
    pep_vinculo: yup
      .string()
      .nullable()
      .transform((v) => v || ""),
    pep_nombre_completo: yup
      .string()
      .nullable()
      .transform((v) => v || ""),
    razon_social: yup.string().when("tipo", { is: "PJ", then: (s) => s.required(), otherwise: (s) => s.strip() }),
    ruc: yup.string().when("tipo", { is: "PJ", then: (s) => s.required(), otherwise: (s) => s.strip() }),
    accionistas: yup.lazy(() => yup.array().of(accionistaSchema).nullable()),
  });

  const usuarioservicioSuscripcionSchema = yup
    .object()
    .shape({
      idusuario: yup.number().required(),
      usuarioservicioid: yup.string().trim().required().min(36).max(36),
      ficha_ruc: yup.string().trim().required().min(36).max(36),
      reporte_tributario_para_terceros: yup.string().trim().required().min(36).max(36),
      certificado_vigencia_poder: yup.string().trim().required().min(36).max(36),
      encabezado_cuenta_bancaria: yup.string().trim().required().min(36).max(36),

      ruc: yup.string().trim().required().min(11).max(11),
      razon_social: yup.string().trim().required().max(200),
      paissedeid: yup.string().trim().required().min(36).max(36),
      distritosedeid: yup.string().trim().required().min(36).max(36),
      direccion_sede: yup.string().trim().required().max(200),
      direccion_sede_referencia: yup.string().trim().required().max(200),

      declaracion_representante_legal: yup.boolean().required(),
      cargo: yup.string().trim().required().max(100),
      poderpartidanumero: yup.string().trim().required().max(20),
      poderpartidaciudad: yup.string().trim().required().max(50),

      bancoid: yup.string().trim().required().min(36).max(36),
      cuentatipoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      numero: yup.string().required().max(20),
      cci: yup.string().required().max(20),
      alias: yup.string().required().max(50),

      accionistas: yup.array().of(accionistaSchema).required(),

      funcionarios: yup.array().of(funcionarioSchema).required(),

      declaracion_accionistas_autorizacion_datos: yup.boolean().required(),
      declaracion_funcionarios_autorizacion_datos: yup.boolean().required(),
      declaracion_conformidad_contrato: yup.boolean().required(),
      declaracion_datos_reales: yup.boolean().required(),
    })
    .required();

  const usuarioservicioValidated = usuarioservicioSuscripcionSchema.validateSync(
    { ...req.files, ...req.body, idusuario, usuarioservicioid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "usuarioservicioValidated:", usuarioservicioValidated);

  await usuarioservicioService.suscribirUsuarioServicioFactoringEmpresaService(
    idusuario,
    usuarioservicioValidated as usuarioservicioService.SuscribirEmpresaPayload,
  );

  response(res, 200, {});
};

export const getUsuarioservicioMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioservicioMaster");
  const session_idusuario = req.session_user?.usuario?.idusuario;
  const { id } = req.params;

  const usuarioservicioSchema = yup
    .object()
    .shape({
      usuarioservicioid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const usuarioservicioValidated = usuarioservicioSchema.validateSync(
    { usuarioservicioid: id },
    { abortEarly: false, stripUnknown: true },
  );

  const usuarioservicioMaster = await usuarioservicioService.getUsuarioservicioMasterService(
    session_idusuario,
    usuarioservicioValidated.usuarioservicioid,
  );

  response(res, 201, usuarioservicioMaster);
};

export const getUsuarioservicios = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioservicios");
  const session_idusuario = req.session_user.usuario.idusuario;

  const usuarioserviciosFiltered = await usuarioservicioService.getUsuarioserviciosService(session_idusuario);

  response(res, 201, usuarioserviciosFiltered);
};
