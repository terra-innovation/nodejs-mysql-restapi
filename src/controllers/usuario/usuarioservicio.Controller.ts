import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput, numberInput, booleanInput } from "#src/utils/validationInputs.js";
import * as usuarioservicioService from "#root/src/services/usuario/usuarioservicio.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const suscribirUsuarioServicioFactoringInversionista = async (req: Request, res: Response) => {
  log.debug(line(), "controller::suscribirUsuarioServicioFactoringInversionista");
  const idusuario = req.session_user?.usuario?.idusuario;
  const { id } = req.params;

  const usuarioservicioSuscripcionSchema = objectInput(
    z.object({
      idusuario: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value))),
      usuarioservicioid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      personaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),

      bancoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      cuentatipoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      monedaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      numero: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
      ),
      cci: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
      ),
      alias: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
      ),

      declaracion_conformidad_contrato: booleanInput(z.boolean()),
      declaracion_datos_reales: booleanInput(z.boolean()),
    }),
  );

  const usuarioservicioValidated = usuarioservicioSuscripcionSchema.parse({ ...req.body, idusuario, usuarioservicioid: id });
  log.debug(line(), "usuarioservicioValidated:", usuarioservicioValidated);

  await usuarioservicioService.suscribirUsuarioServicioFactoringInversionistaService(idusuario, usuarioservicioValidated as usuarioservicioService.SuscribirInversionistaPayload);

  response(res, 200, {});
};

export const suscribirUsuarioServicioFactoringEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::suscribirUsuarioServicioFactoringEmpresa");
  const idusuario = req.session_user?.usuario?.idusuario;
  const { id } = req.params;

  const funcionarioSchema = objectInput(
    z.object({
      nombres: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
      apellidos: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
      documentotipoid: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
      documentonumero: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
      cargo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
      paisid: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
      es_pep: booleanInput(z.boolean()),
      pep_cargo: stringInput(z.string().nullable().optional(), { transforms: [(v) => v || ""] }),
      pep_institucion: stringInput(z.string().nullable().optional(), { transforms: [(v) => v || ""] }),
      pep_vinculo: stringInput(z.string().nullable().optional(), { transforms: [(v) => v || ""] }),
      pep_nombre_completo: stringInput(z.string().nullable().optional(), { transforms: [(v) => v || ""] }),
    }),
  );

  type Accionista = {
    tipo: "PN" | "PJ";
    porcentaje_acciones: number;
    paisid: string;
    nombres?: string;
    apellidos?: string;
    documentotipoid?: string;
    documentonumero?: string;
    es_pep?: boolean;
    razon_social?: string;
    ruc?: string;
    pep_cargo?: string;
    pep_institucion?: string;
    pep_vinculo?: string;
    pep_nombre_completo?: string;
    accionistas?: Accionista[] | null;
  };
  const accionistaSchema: z.ZodType<Accionista> = z.lazy(() => {
    const common = {
      porcentaje_acciones: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value))),
      paisid: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
      pep_cargo: stringInput(z.string().nullable().optional(), { transforms: [(v) => v || ""] }),
      pep_institucion: stringInput(z.string().nullable().optional(), { transforms: [(v) => v || ""] }),
      pep_vinculo: stringInput(z.string().nullable().optional(), { transforms: [(v) => v || ""] }),
      pep_nombre_completo: stringInput(z.string().nullable().optional(), { transforms: [(v) => v || ""] }),
      accionistas: z.array(accionistaSchema).nullable().optional(),
    };
    const persona = z.object({ ...common, tipo: z.literal("PN"), nombres: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")), apellidos: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")), documentotipoid: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")), documentonumero: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")), es_pep: booleanInput(z.boolean()) });
    const empresa = z.object({ ...common, tipo: z.literal("PJ"), razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")), ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")) });
    return z
      .preprocess(
        (value) => {
          if (value === null || typeof value !== "object" || Array.isArray(value)) return value;
          const input = { ...value } as Record<string, unknown>;
          input.tipo = typeof input.tipo === "string" || input.tipo == null ? input.tipo : String(input.tipo);
          return input;
        },
        z.discriminatedUnion("tipo", [persona, empresa]),
      )
      .transform((value) => ({ ...value, porcentaje_acciones: value.porcentaje_acciones!, paisid: value.paisid! }));
  });

  const usuarioservicioSuscripcionSchema = objectInput(
    z.object({
      idusuario: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value))),
      usuarioservicioid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      ficha_ruc: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      reporte_tributario_para_terceros: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      certificado_vigencia_poder: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      encabezado_cuenta_bancaria: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),

      ruc: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 11, "Debe tener al menos 11 caracteres")
          .refine((value) => value.length <= 11, "Debe tener como máximo 11 caracteres"),
        { trim: true },
      ),
      razon_social: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      paissedeid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      distritosedeid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      direccion_sede: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      direccion_sede_referencia: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),

      declaracion_representante_legal: booleanInput(z.boolean()),
      cargo: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
        { trim: true },
      ),
      poderpartidanumero: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
        { trim: true },
      ),
      poderpartidaciudad: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),

      bancoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      cuentatipoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      monedaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      numero: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
      ),
      cci: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
      ),
      alias: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
      ),

      accionistas: z.array(accionistaSchema),

      funcionarios: z.array(funcionarioSchema),

      declaracion_accionistas_autorizacion_datos: booleanInput(z.boolean()),
      declaracion_funcionarios_autorizacion_datos: booleanInput(z.boolean()),
      declaracion_conformidad_contrato: booleanInput(z.boolean()),
      declaracion_datos_reales: booleanInput(z.boolean()),
    }),
  );

  const usuarioservicioValidated = usuarioservicioSuscripcionSchema.parse({ ...req.files, ...req.body, idusuario, usuarioservicioid: id });
  log.debug(line(), "usuarioservicioValidated:", usuarioservicioValidated);

  await usuarioservicioService.suscribirUsuarioServicioFactoringEmpresaService(idusuario, usuarioservicioValidated as usuarioservicioService.SuscribirEmpresaPayload);

  response(res, 200, {});
};

export const getUsuarioservicioMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioservicioMaster");
  const session_idusuario = req.session_user?.usuario?.idusuario;
  const { id } = req.params;

  const usuarioservicioSchema = objectInput(
    z.object({
      usuarioservicioid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const usuarioservicioValidated = usuarioservicioSchema.parse({ usuarioservicioid: id });

  const usuarioservicioMaster = await usuarioservicioService.getUsuarioservicioMasterService(session_idusuario, usuarioservicioValidated.usuarioservicioid);

  response(res, 201, usuarioservicioMaster);
};

export const getUsuarioservicios = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioservicios");
  const session_idusuario = req.session_user.usuario.idusuario;

  const usuarioserviciosFiltered = await usuarioservicioService.getUsuarioserviciosService(session_idusuario);

  response(res, 201, usuarioserviciosFiltered);
};
