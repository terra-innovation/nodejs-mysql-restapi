import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Decimal } from "@prisma/client/runtime/library";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as paisDao from "#src/daos/pais.prisma.Dao.js";
import * as provinciaDao from "#src/daos/provincia.prisma.Dao.js";
import * as distritoDao from "#src/daos/distrito.prisma.Dao.js";
import * as bancoDao from "#src/daos/banco.prisma.Dao.js";
import * as cuentatipoDao from "#src/daos/cuentatipo.prisma.Dao.js";
import * as documentotipoDao from "#src/daos/documentotipo.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import * as personaDao from "#src/daos/persona.prisma.Dao.js";
import * as inversionistaDao from "#src/daos/inversionista.prisma.Dao.js";
import * as cuentabancariaDao from "#src/daos/cuentabancaria.prisma.Dao.js";
import * as cuentabancariaestadoDao from "#src/daos/cuentabancariaestado.prisma.Dao.js";
import * as empresacuentabancariaDao from "#src/daos/empresacuentabancaria.prisma.Dao.js";
import * as inversionistacuentabancariaDao from "#src/daos/inversionistacuentabancaria.prisma.Dao.js";
import * as colaboradortipoDao from "#src/daos/colaboradortipo.prisma.Dao.js";
import * as colaboradorDao from "#src/daos/colaborador.prisma.Dao.js";
import * as servicioempresaDao from "#src/daos/servicioempresa.prisma.Dao.js";
import * as servicioinversionistaDao from "#src/daos/servicioinversionista.prisma.Dao.js";
import * as servicioempresaestadoDao from "#src/daos/servicioempresaestado.prisma.Dao.js";
import * as servicioinversionistaestadoDao from "#src/daos/servicioinversionistaestado.prisma.Dao.js";
import * as servicioempresaverificacionDao from "#src/daos/servicioempresaverificacion.prisma.Dao.js";
import * as servicioinversionistaverificacionDao from "#src/daos/servicioinversionistaverificacion.prisma.Dao.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";
import * as usuarioservicioempresaDao from "#src/daos/usuarioservicioempresa.prisma.Dao.js";
import * as usuarioservicioempresaestadoDao from "#src/daos/usuarioservicioempresaestado.prisma.Dao.js";
import * as usuarioservicioempresarolDao from "#src/daos/usuarioservicioempresarol.prisma.Dao.js";
import * as usuarioservicioDao from "#src/daos/usuarioservicio.prisma.Dao.js";
import * as usuarioservicioestadoDao from "#src/daos/usuarioservicioestado.prisma.Dao.js";
import * as usuarioservicioverificacionDao from "#src/daos/usuarioservicioverificacion.prisma.Dao.js";

import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as accionistaDao from "#src/daos/accionista.prisma.Dao.js";
import * as archivoempresaDao from "#src/daos/archivoempresa.prisma.Dao.js";
import * as archivocolaboradorDao from "#src/daos/archivocolaborador.prisma.Dao.js";
import * as archivocuentabancariaDao from "#src/daos/archivocuentabancaria.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as empresadeclaracionDao from "#src/daos/empresadeclaracion.prisma.Dao.js";
import * as funcionarioDao from "#src/daos/funcionario.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ARCHIVO_TIPO } from "#src/daos/archivotipo.prisma.Dao.js";


import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import * as telegramService from "#src/services/telegram.Service.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import { isProduction } from "#src/config.js";


export const suscribirUsuarioServicioFactoringInversionista = async (req: Request, res: Response) => {
  log.debug(line(), "controller::suscribirUsuarioServicioFactoringInversionista");
  const idusuario = req.session_user?.usuario?.idusuario;
  const { id } = req.params;
  const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
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
  const usuarioservicioValidated = usuarioservicioSuscripcionSchema.validateSync({ ...req.body, idusuario, usuarioservicioid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "usuarioservicioValidated:", usuarioservicioValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const usuarioConected = await usuarioDao.getUsuarioByIdusuario(tx, usuarioservicioValidated.idusuario);

      const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByUsuarioservicioid(tx, usuarioservicioValidated.usuarioservicioid);
      if (!usuarioservicio) {
        log.warn(line(), "El usuario servicio no existe: [" + usuarioservicioValidated.usuarioservicioid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const persona = await personaDao.getPersonaByPersonaid(tx, usuarioservicioValidated.personaid);
      if (!persona) {
        log.warn(line(), "La persona no existe: [" + usuarioservicioValidated.personaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const banco = await bancoDao.findBancoPk(tx, usuarioservicioValidated.bancoid);
      if (!banco) {
        log.warn(line(), "Banco no existe: [" + usuarioservicioValidated.bancoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentatipo = await cuentatipoDao.findCuentatipoPk(tx, usuarioservicioValidated.cuentatipoid);
      if (!cuentatipo) {
        log.warn(line(), "Cuenta tipo no existe: [" + usuarioservicioValidated.cuentatipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const moneda = await monedaDao.findMonedaPk(tx, usuarioservicioValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + usuarioservicioValidated.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(tx, banco.idbanco, usuarioservicioValidated.numero, filter_estado);
      if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
        log.warn(line(), "El número de cuenta [" + usuarioservicioValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.");
        throw new ClientError("El número de cuenta [" + usuarioservicioValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
      }

      if (!usuarioservicioValidated.declaracion_conformidad_contrato) {
        log.warn(line(), "No aceptó la declaración de conformidad del contrato: [" + usuarioservicioValidated.declaracion_conformidad_contrato + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      if (!usuarioservicioValidated.declaracion_datos_reales) {
        log.warn(line(), "No aceptó la declaración de datos reales: [" + usuarioservicioValidated.declaracion_datos_reales + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const servicioinversionistaestado_en_revision = 1;
      const servicioinversionistaestado = await servicioinversionistaestadoDao.getServicioinversionistaestadoByIdservicioinversionistaestado(tx, servicioinversionistaestado_en_revision);
      if (!servicioinversionistaestado) {
        log.warn(line(), "Servicio inversionsita estado no existe: [" + servicioinversionistaestado_en_revision + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancariaestado_pendiente = 1;
      const cuentabancariaestado = await cuentabancariaestadoDao.getCuentabancariaestadoByIdcuentabancariaestado(tx, cuentabancariaestado_pendiente);
      if (!cuentabancariaestado) {
        log.warn(line(), "Cuenta bancaria estado no existe: [" + cuentabancariaestado_pendiente + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const usuarioservicioaestado_en_revision = 3;
      const usuarioservicioestado = await usuarioservicioestadoDao.getUsuarioservicioestadoByIdusuarioservicioestado(tx, usuarioservicioaestado_en_revision);
      if (!usuarioservicioestado) {
        log.warn(line(), "Usuario servicio estado no existe: [" + usuarioservicioaestado_en_revision + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      /* Creamos al Inversionista */
      const inversionistaToCreate: Prisma.inversionistaCreateInput = {
        persona: { connect: { idpersona: persona.idpersona } },
        inversionistaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const inversionistaCreated = await inversionistaDao.insertInversionista(tx, inversionistaToCreate);
      log.debug(line(), "inversionistaCreated:", inversionistaCreated);

      /* Creamos la Cuenta Bancaria asociada al Inversionista */

      const cuentabancariaToCreate: Prisma.cuenta_bancariaCreateInput = {
        banco: { connect: { idbanco: banco.idbanco } },
        cuenta_tipo: { connect: { idcuentatipo: cuentatipo.idcuentatipo } },
        moneda: { connect: { idmoneda: moneda.idmoneda } },
        cuenta_bancaria_estado: { connect: { idcuentabancariaestado: cuentabancariaestado.idcuentabancariaestado } },
        cuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        numero: usuarioservicioValidated.numero,
        cci: usuarioservicioValidated.cci,
        alias: usuarioservicioValidated.alias,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(tx, cuentabancariaToCreate);

      log.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

      const inversionistacuentabancariaToCreate: Prisma.inversionista_cuenta_bancariaCreateInput = {
        inversionista: { connect: { idinversionista: inversionistaCreated.idinversionista } },
        cuenta_bancaria: { connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria } },

        inversionistacuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };
      const imversionistacuentabancariaCreated = await inversionistacuentabancariaDao.insertInversionistacuentabancaria(tx, inversionistacuentabancariaToCreate);

      log.debug(line(), "imversionistacuentabancariaCreated:", imversionistacuentabancariaCreated);

      /* Registramos el Servicio para el Inversionista en la tabla servicio_inversionista */
      const servicioinversionistaToCreate: Prisma.servicio_inversionistaCreateInput = {
        servicio: { connect: { idservicio: 2 } },
        inversionista: { connect: { idinversionista: inversionistaCreated.idinversionista } },
        usuario_suscriptor: { connect: { idusuario: usuarioConected.idusuario } },
        servicio_inversionista_estado: { connect: { idservicioinversionistaestado: servicioinversionistaestado.idservicioinversionistaestado } },

        servicioinversionistaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioinversionistaCreated = await servicioinversionistaDao.insertServicioinversionista(tx, servicioinversionistaToCreate);

      log.debug(line(), "servicioinversionistaCreated:", servicioinversionistaCreated);

      /* Registramos para la verificación del servicio_inversionista en la tabla servicio_inversionista_verificacion */
      const servicioinversionistaverificacionToCreate: Prisma.servicio_inversionista_verificacionCreateInput = {
        servicio_inversionista: { connect: { idservicioinversionista: servicioinversionistaCreated.idservicioinversionista } },
        servicio_inversionista_estado: { connect: { idservicioinversionistaestado: servicioinversionistaestado.idservicioinversionistaestado } },
        usuario_verifica: { connect: { idusuario: req.session_user.usuario.idusuario } },
        comentariointerno: "",
        comentariousuario: "",
        servicioinversionistaverificacionid: uuidv4(),
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioinversionistaverificacionCreated = await servicioinversionistaverificacionDao.insertServicioinversionistaverificacion(tx, servicioinversionistaverificacionToCreate);
      log.debug(line(), "servicioinversionistaverificacionCreated:", servicioinversionistaverificacionCreated);

      /* Registramos para la verificación del usuario_servicio en la tabla usuario_servicio_verificacion */
      const usuarioservicioverificacionToCreate: Prisma.usuario_servicio_verificacionCreateInput = {
        usuario_servicio: { connect: { idusuarioservicio: usuarioservicio.idusuarioservicio } },
        usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
        usuario_verifica: { connect: { idusuario: req.session_user?.usuario?.idusuario } },
        usuarioservicioverificacionid: uuidv4(),
        comentariousuario: "",
        comentariointerno: "",
        idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(tx, usuarioservicioverificacionToCreate);
      log.debug(line(), "usuarioservicioverificacionCreated:", usuarioservicioverificacionCreated);

      /* Actualizamos el estado del usuario_servicio*/
      const usuarioservicioToUpdate: Prisma.usuario_servicioUpdateInput = {
        usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const usuarioservicioUpdated = await usuarioservicioDao.updateUsuarioservicio(tx, usuarioservicio.usuarioservicioid, usuarioservicioToUpdate);
      log.debug(line(), "usuarioservicioUpdated:", usuarioservicioUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 200, {});
};

export const suscribirUsuarioServicioFactoringEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::suscribirUsuarioServicioFactoringEmpresa");
  const idusuario = req.session_user?.usuario?.idusuario;
  const { id } = req.params;
  const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
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
  const usuarioservicioValidated = usuarioservicioSuscripcionSchema.validateSync({ ...req.files, ...req.body, idusuario, usuarioservicioid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "usuarioservicioValidated:", usuarioservicioValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByUsuarioservicioid(tx, usuarioservicioValidated.usuarioservicioid);
      if (!usuarioservicio) {
        log.warn(line(), "El usuario servicio no existe: [" + usuarioservicioValidated.usuarioservicioid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const empresa = await empresaDao.getEmpresaByRuc(tx, usuarioservicioValidated.ruc);
      if (empresa) {
        log.warn(line(), "La empresa con RUC [" + usuarioservicioValidated.ruc + "] ya se encuentra registrada.");
        throw new ClientError("La empresa con RUC [" + usuarioservicioValidated.ruc + "] se encuentra registrada.", 404);
      }

      const paisSede = await paisDao.findPaisPk(tx, usuarioservicioValidated.paissedeid);
      if (!paisSede) {
        log.warn(line(), "País de sede no existe: [" + usuarioservicioValidated.paissedeid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const distritoSede = await distritoDao.getDistritoByDistritoid(tx, usuarioservicioValidated.distritosedeid);
      if (!distritoSede) {
        log.warn(line(), "Distrito de sede no existe: [" + usuarioservicioValidated.distritosedeid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const banco = await bancoDao.findBancoPk(tx, usuarioservicioValidated.bancoid);
      if (!banco) {
        log.warn(line(), "Banco no existe: [" + usuarioservicioValidated.bancoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentatipo = await cuentatipoDao.findCuentatipoPk(tx, usuarioservicioValidated.cuentatipoid);
      if (!cuentatipo) {
        log.warn(line(), "Cuenta tipo no existe: [" + usuarioservicioValidated.cuentatipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const moneda = await monedaDao.findMonedaPk(tx, usuarioservicioValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + usuarioservicioValidated.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(tx, banco.idbanco, usuarioservicioValidated.numero, filter_estado);
      if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
        log.warn(line(), "El número de cuenta [" + usuarioservicioValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.");
        throw new ClientError("El número de cuenta [" + usuarioservicioValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
      }

      if (!usuarioservicioValidated.declaracion_representante_legal) {
        log.warn(line(), "No aceptó la declaración de representante legal: [" + usuarioservicioValidated.declaracion_representante_legal + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      if (!usuarioservicioValidated.declaracion_conformidad_contrato) {
        log.warn(line(), "No aceptó la declaración de conformidad del contrato: [" + usuarioservicioValidated.declaracion_conformidad_contrato + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      if (!usuarioservicioValidated.declaracion_datos_reales) {
        log.warn(line(), "No aceptó la declaración de datos reales: [" + usuarioservicioValidated.declaracion_datos_reales + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const colaboradorttipo_representante_legal = 1;
      const colaboradorttipo = await colaboradortipoDao.getColaboradortipoByIdcolaboradortipo(tx, colaboradorttipo_representante_legal);
      if (!colaboradorttipo) {
        log.warn(line(), "Colaborador tipo no existe: [" + colaboradorttipo_representante_legal + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancariaestado_pendiente = 1;
      const cuentabancariaestado = await cuentabancariaestadoDao.getCuentabancariaestadoByIdcuentabancariaestado(tx, cuentabancariaestado_pendiente);
      if (!cuentabancariaestado) {
        log.warn(line(), "Cuenta bancaria estado no existe: [" + cuentabancariaestado_pendiente + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const servicioempresaestado_en_revision = 1;
      const servicioempresaestado = await servicioempresaestadoDao.getServicioempresaestadoByIdservicioempresaestado(tx, servicioempresaestado_en_revision);
      if (!servicioempresaestado) {
        log.warn(line(), "Servicio empresa estado no existe: [" + servicioempresaestado_en_revision + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const filter_estado_archivo = isProduction ? [ESTADO.ACTIVO] : [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const ficharuc = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(tx, usuarioservicioValidated.ficha_ruc, ARCHIVO_TIPO.FICHA_RUC, filter_estado_archivo);
      if (!ficharuc) {
        log.warn(line(), "Ficha RUC no existe o tipo no coincide: [" + usuarioservicioValidated.ficha_ruc + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const reportetributario = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(tx, usuarioservicioValidated.reporte_tributario_para_terceros, ARCHIVO_TIPO.REPORTE_TRIBUTARIO_PARA_TERCEROS, filter_estado_archivo);
      if (!reportetributario) {
        log.warn(line(), "Reporte tributario no existe o tipo no coincide: [" + usuarioservicioValidated.reporte_tributario_para_terceros + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const vigenciapoder = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(tx, usuarioservicioValidated.certificado_vigencia_poder, ARCHIVO_TIPO.VIGENCIA_DE_PODER_REPRESENTANTE_LEGAL, filter_estado_archivo);
      if (!vigenciapoder) {
        log.warn(line(), "Vigencia de poder no existe o tipo no coincide: [" + usuarioservicioValidated.certificado_vigencia_poder + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const encabezadocuentabancaria = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(tx, usuarioservicioValidated.encabezado_cuenta_bancaria, ARCHIVO_TIPO.ENCABEZADO_DEL_EECC_DE_LA_CUENTA_BANCARIA, filter_estado_archivo);
      if (!encabezadocuentabancaria) {
        log.warn(line(), "Encabezado de cuenta bancaria no existe o tipo no coincide: [" + usuarioservicioValidated.encabezado_cuenta_bancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const usuarioservicioempresaestado_sin_acceso = 1;
      const usuarioservicioempresaestado = await usuarioservicioempresaestadoDao.getUsuarioservicioempresaestadoByIdusuarioservicioempresaestado(tx, usuarioservicioempresaestado_sin_acceso);
      if (!usuarioservicioempresaestado) {
        log.warn(line(), "Usuario servicio empresa estado no existe: [" + usuarioservicioempresaestado_sin_acceso + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const usuarioservicioempresarol_administrador = 1;
      const usuarioservicioempresarol = await usuarioservicioempresarolDao.getUsuarioservicioempresarolByIdusuarioservicioempresarol(tx, usuarioservicioempresarol_administrador);
      if (!usuarioservicioempresarol) {
        log.warn(line(), "Usuario servicio empresa estado no existe: [" + usuarioservicioempresarol_administrador + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const usuarioservicioaestado_en_revision = 3;
      const usuarioservicioestado = await usuarioservicioestadoDao.getUsuarioservicioestadoByIdusuarioservicioestado(tx, usuarioservicioaestado_en_revision);
      if (!usuarioservicioestado) {
        log.warn(line(), "Usuario servicio estado no existe: [" + usuarioservicioaestado_en_revision + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      /* Creamos la Empresa */
      const provinciaResidencia = await provinciaDao.getProvinciaByIdprovincia(tx, distritoSede.idprovincia);

      const empresaToCreate: Prisma.empresaCreateInput = {
        pais_sede: { connect: { idpais: paisSede.idpais } },
        departamento_sede: { connect: { iddepartamento: provinciaResidencia.iddepartamento } },
        provincia_sede: { connect: { idprovincia: distritoSede.idprovincia } },
        distrito_sede: { connect: { iddistrito: distritoSede.iddistrito } },
        ruc: usuarioservicioValidated.ruc,
        razon_social: usuarioservicioValidated.razon_social,
        direccion_sede: usuarioservicioValidated.direccion_sede,
        direccion_sede_referencia: usuarioservicioValidated.direccion_sede_referencia,
        empresaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const empresaCreated = await empresaDao.insertEmpresa(tx, empresaToCreate);

      log.debug(line(), "empresaCreated:", empresaCreated);

      /* Registramos las declaraciones de la Empresa */
      const empresadeclaracionToCreate: Prisma.empresa_declaracionCreateInput = {
        empresa: { connect: { idempresa: empresaCreated.idempresa } },
        empresadeclaracionid: uuidv4(),
        declaracion_conformidad_contrato: usuarioservicioValidated.declaracion_conformidad_contrato,
        declaracion_datos_reales: usuarioservicioValidated.declaracion_datos_reales,
        declaracion_accionistas_autorizacion_datos: usuarioservicioValidated.declaracion_accionistas_autorizacion_datos,
        declaracion_funcionarios_autorizacion_datos: usuarioservicioValidated.declaracion_funcionarios_autorizacion_datos,
        idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const empresadeclaracionCreated = await empresadeclaracionDao.insertEmpresadeclaracion(tx, empresadeclaracionToCreate);
      log.debug(line(), "empresadeclaracionCreated:", empresadeclaracionCreated);

      /* Registramos los accionistas */
      const accionistas = usuarioservicioValidated.accionistas;
      if (Array.isArray(accionistas)) {
        await crearAccionistasRecursivo(req, tx, empresaCreated, accionistas);
      }

      /* Registramos los funcionarios */
      const funcionarios = usuarioservicioValidated.funcionarios;
      if (Array.isArray(funcionarios)) {
        await crearFuncionarios(req, tx, empresaCreated, funcionarios);
      }

      /* Creamos el Colaborador con los datos del usuario cómo representante legal */
      const usuarioConected = await usuarioDao.getUsuarioByIdusuario(tx, usuarioservicioValidated.idusuario);
      const personaConected = await personaDao.getPersonaByIdusuario(tx, usuarioservicioValidated.idusuario);

      const colaboradorToCreate: Prisma.colaboradorCreateInput = {
        empresa: { connect: { idempresa: empresaCreated.idempresa } },
        persona: { connect: { idpersona: personaConected.idpersona } },
        colaborador_tipo: { connect: { idcolaboradortipo: colaboradorttipo.idcolaboradortipo } },
        documento_tipo: { connect: { iddocumentotipo: personaConected.iddocumentotipo } },
        colaboradorid: uuidv4(),
        code: uuidv4().split("-")[0],
        documentonumero: personaConected.documentonumero,
        nombrecolaborador: personaConected.personanombres,
        apellidocolaborador: personaConected.apellidopaterno + " " + personaConected.apellidomaterno,
        cargo: usuarioservicioValidated.cargo,
        email: personaConected.email,
        telefono: personaConected.celular,
        poderpartidanumero: usuarioservicioValidated.poderpartidanumero,
        poderpartidaciudad: usuarioservicioValidated.poderpartidaciudad,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const colaboradorCreated = await colaboradorDao.insertColaborador(tx, colaboradorToCreate);

      log.debug(line(), "colaboradorCreated:", colaboradorCreated);

      /* Creamos la Cuenta Bancaria asociada a la Empresa */
      const cuentabancariaToCreate: Prisma.cuenta_bancariaCreateInput = {
        banco: { connect: { idbanco: banco.idbanco } },
        cuenta_tipo: { connect: { idcuentatipo: cuentatipo.idcuentatipo } },
        moneda: { connect: { idmoneda: moneda.idmoneda } },
        cuenta_bancaria_estado: { connect: { idcuentabancariaestado: cuentabancariaestado.idcuentabancariaestado } },
        cuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        numero: usuarioservicioValidated.numero,
        cci: usuarioservicioValidated.cci,
        alias: usuarioservicioValidated.alias,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(tx, cuentabancariaToCreate);
      log.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

      const empresacuentabancariaToCreate: Prisma.empresa_cuenta_bancariaCreateInput = {
        empresa: { connect: { idempresa: empresaCreated.idempresa } },
        cuenta_bancaria: { connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria } },
        empresacuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const empresacuentabancariaCreated = await empresacuentabancariaDao.insertEmpresacuentabancaria(tx, empresacuentabancariaToCreate);

      log.debug(line(), "empresacuentabancariaCreated:", empresacuentabancariaCreated);

      /* Registramos el Servicio para la Empresa en la tabla servicio_empresa */
      const servicioempresaToCreate: Prisma.servicio_empresaCreateInput = {
        servicio: { connect: { idservicio: 1 } },
        empresa: { connect: { idempresa: empresaCreated.idempresa } },
        usuario_suscriptor: { connect: { idusuario: usuarioConected.idusuario } },
        servicio_empresa_estado: { connect: { idservicioempresaestado: servicioempresaestado.idservicioempresaestado } },

        servicioempresaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioempresaCreated = await servicioempresaDao.insertServicioempresa(tx, servicioempresaToCreate);

      log.debug(line(), "servicioempresaCreated:", servicioempresaCreated);

      /* Registramos el acceso del usuario a la Empresa en la tabla usuario_servicio_empresa */
      const usuarioservicioempresaToCreate: Prisma.usuario_servicio_empresaCreateInput = {
        usuario: { connect: { idusuario: usuarioConected.idusuario } },
        servicio: { connect: { idservicio: 1 } },
        empresa: { connect: { idempresa: empresaCreated.idempresa } },
        usuario_servicio_empresa_estado: { connect: { idusuarioservicioempresaestado: usuarioservicioempresaestado.idusuarioservicioempresaestado } },
        usuario_servicio_empresa_rol: { connect: { idusuarioservicioempresarol: usuarioservicioempresarol.idusuarioservicioempresarol } },
        usuarioservicioempresaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const usuarioservicioempresaCreated = await usuarioservicioempresaDao.insertUsuarioservicioempresa(tx, usuarioservicioempresaToCreate);

      log.debug(line(), "usuarioservicioempresaCreated:", usuarioservicioempresaCreated);

      const ficharucCreated = await vincularArchivoFichaRuc(req, tx, ficharuc, empresaCreated);
      log.debug(line(), "ficharucCreated:", ficharucCreated);

      const reportetributarioCreated = await vincularArchivoReporteTributarioParaTerceros(req, tx, reportetributario, empresaCreated);
      log.debug(line(), "reportetributarioCreated:", reportetributarioCreated);

      const vigenciapoderCreated = await vincularArchivoVigenciaPoderRepresentanteLegal(req, tx, vigenciapoder, colaboradorCreated);
      log.debug(line(), "vigenciapoderCreated:", vigenciapoderCreated);

      const encabezadocuentabancariaCreated = await vincularArchivoEncabezadoCuentaBancaria(req, tx, encabezadocuentabancaria, cuentabancariaCreated);
      log.debug(line(), "encabezadocuentabancariaCreated:", encabezadocuentabancariaCreated);

      /* Registramos para la verificación del servicio_empresa en la tabla servicio_empresa_verificacion */
      const servicioempresaverificacionToCreate: Prisma.servicio_empresa_verificacionCreateInput = {
        servicio_empresa: { connect: { idservicioempresa: servicioempresaCreated.idservicioempresa } },
        servicio_empresa_estado: { connect: { idservicioempresaestado: servicioempresaestado.idservicioempresaestado } },
        usuario_verifica: { connect: { idusuario: req.session_user.usuario.idusuario } },
        comentariointerno: "",
        comentariousuario: "",
        servicioempresaverificacionid: uuidv4(),
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioempresaverificacionCreated = await servicioempresaverificacionDao.insertServicioempresaverificacion(tx, servicioempresaverificacionToCreate);
      log.debug(line(), "servicioempresaverificacionCreated:", servicioempresaverificacionCreated);

      /* Solo si está en estado Suscribirse */
      if (usuarioservicio.idusuarioservicioestado == 1) {
        /* Registramos para la verificación del usuario_servicio en la tabla usuario_servicio_verificacion */
        const usuarioservicioverificacionToCreate: Prisma.usuario_servicio_verificacionCreateInput = {
          usuario_servicio: { connect: { idusuarioservicio: usuarioservicio.idusuarioservicio } },
          usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
          usuario_verifica: { connect: { idusuario: req.session_user.usuario.idusuario } },
          usuarioservicioverificacionid: uuidv4(),
          comentariousuario: "",
          comentariointerno: "",
          idusuariocrea: req.session_user.usuario.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(tx, usuarioservicioverificacionToCreate);
        log.debug(line(), "usuarioservicioverificacionCreated:", usuarioservicioverificacionCreated);

        /* Actualizamos el estado del usuario_servicio*/
        const usuarioservicioToUpdate: Prisma.usuario_servicioUpdateInput = {
          usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
          idusuariomod: req.session_user.usuario.idusuario ?? 1,
          fechamod: new Date(),
        };
        const usuarioservicioUpdated = await usuarioservicioDao.updateUsuarioservicio(tx, usuarioservicio.usuarioservicioid, usuarioservicioToUpdate);
        log.debug(line(), "usuarioservicioUpdated:", usuarioservicioUpdated);
      }

      const msnTelegram = {
        title: "Nueva solicitud de verificación de Empresa",
        code: empresaToCreate.code,
        ruc: empresaToCreate.ruc,
        razon_social: empresaToCreate.razon_social,
        direccion_sede: empresaToCreate.direccion_sede,
      };

      telegramService.sendMessageTelegramInfo(msnTelegram);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
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
  const usuarioservicioValidated = usuarioservicioSchema.validateSync({ usuarioservicioid: id }, { abortEarly: false, stripUnknown: true });

  const usuarioservicioMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByUsuarioservicioid(tx, usuarioservicioValidated.usuarioservicioid);
      const paises = await paisDao.getPaises(tx, filter_estados);
      const paisesperu = await paisDao.getPaisesPeru(tx);
      const distritos = await distritoDao.getDistritos(tx, filter_estados);
      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);
      const cuentatipos = await cuentatipoDao.getCuentatipos(tx, filter_estados);
      const documentotipos = await documentotipoDao.getDocumentotipos(tx, filter_estados);
      const persona = await personaDao.getPersonaByIdusuario(tx, session_idusuario);

      let usuarioservicioMaster: Record<string, any> = {};
      usuarioservicioMaster.usuarioservicio = usuarioservicio;
      usuarioservicioMaster.paises = paises;
      usuarioservicioMaster.paisesperu = paisesperu;
      usuarioservicioMaster.distritos = distritos;
      usuarioservicioMaster.bancos = bancos;
      usuarioservicioMaster.monedas = monedas;
      usuarioservicioMaster.cuentatipos = cuentatipos;
      usuarioservicioMaster.documentotipos = documentotipos;
      usuarioservicioMaster.persona = persona;

      //let usuarioservicioMasterJSON = jsonUtils.sequelizeToJSON(usuarioservicioMaster);
      //jsonUtils.prettyPrint(usuarioservicioMasterJSON);
      //let usuarioservicioMasterObfuscated = jsonUtils.ofuscarAtributosDefault(usuarioservicioMasterJSON);
      //jsonUtils.prettyPrint(usuarioservicioMasterObfuscated);
      //let usuarioservicioMasterFiltered = jsonUtils.removeAttributesPrivates(usuarioservicioMasterObfuscated);
      //jsonUtils.prettyPrint(usuarioservicioMaster);
      return usuarioservicioMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, usuarioservicioMasterFiltered);
};

export const getUsuarioservicios = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioservicios");
  const usuarioserviciosFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      //log.info(line(),req.session_user.usuario.idusuario);

      const session_idusuario = req.session_user.usuario.idusuario;
      const filter_estado = [ESTADO.ACTIVO];
      const usuarioservicios = await usuarioservicioDao.getUsuarioserviciosByIdusuario(tx, session_idusuario, filter_estado);
      var usuarioserviciosJson = jsonUtils.sequelizeToJSON(usuarioservicios);
      //log.info(line(),empresaObfuscated);

      var usuarioserviciosFiltered = jsonUtils.removeAttributes(usuarioserviciosJson, ["score"]);
      usuarioserviciosFiltered = jsonUtils.removeAttributesPrivates(usuarioserviciosFiltered);
      return usuarioserviciosFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, usuarioserviciosFiltered);
};

const vincularArchivoEncabezadoCuentaBancaria = async (req, tx, archivo, cuentabancariaCreated) => {
  const idusuario = req.session_user?.usuario?.idusuario ?? 1;

  const archivocuentabancariaToCreate: Prisma.archivo_cuenta_bancariaCreateInput = {
    archivo: { connect: { idarchivo: archivo.idarchivo } },
    cuenta_bancaria: { connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria } },
    idusuariocrea: idusuario,
    fechacrea: new Date(),
    idusuariomod: idusuario,
    fechamod: new Date(),
    estado: 1,
  };

  await archivocuentabancariaDao.insertArchivoCuentaBancaria(tx, archivocuentabancariaToCreate);
  return archivo;
};

const vincularArchivoVigenciaPoderRepresentanteLegal = async (req, tx, archivo, colaboradorCreated) => {
  const idusuario = req.session_user?.usuario?.idusuario ?? 1;

  const archivocolaboradorToCreate: Prisma.archivo_colaboradorCreateInput = {
    archivo: { connect: { idarchivo: archivo.idarchivo } },
    colaborador: { connect: { idcolaborador: colaboradorCreated.idcolaborador } },
    idusuariocrea: idusuario,
    fechacrea: new Date(),
    idusuariomod: idusuario,
    fechamod: new Date(),
    estado: 1,
  };
  await archivocolaboradorDao.insertArchivoColaborador(tx, archivocolaboradorToCreate);
  return archivo;
};

const vincularArchivoReporteTributarioParaTerceros = async (req, tx, archivo, empresaCreated) => {
  const idusuario = req.session_user?.usuario?.idusuario ?? 1;

  const archivoempresaToCreate: Prisma.archivo_empresaCreateInput = {
    archivo: { connect: { idarchivo: archivo.idarchivo } },
    empresa: { connect: { idempresa: empresaCreated.idempresa } },
    idusuariocrea: idusuario,
    fechacrea: new Date(),
    idusuariomod: idusuario,
    fechamod: new Date(),
    estado: 1,
  };
  await archivoempresaDao.insertArchivoEmpresa(tx, archivoempresaToCreate);
  return archivo;
};

const vincularArchivoFichaRuc = async (req, tx, archivo, empresaCreated) => {
  const idusuario = req.session_user?.usuario?.idusuario ?? 1;

  const archivoempresaToCreate: Prisma.archivo_empresaCreateInput = {
    archivo: { connect: { idarchivo: archivo.idarchivo } },
    empresa: { connect: { idempresa: empresaCreated.idempresa } },
    idusuariocrea: idusuario,
    fechacrea: new Date(),
    idusuariomod: idusuario,
    fechamod: new Date(),
    estado: 1,
  };
  await archivoempresaDao.insertArchivoEmpresa(tx, archivoempresaToCreate);
  return archivo;
};

const crearAccionistasRecursivo = async (req: Request, tx: any, empresaCreated: any, accionistas: any[], idaccionista_padre: number | null = null) => {
  for (const acc of accionistas) {
    const pais = await paisDao.findPaisPk(tx, acc.paisid);

    if (!pais) {
      log.warn(line(), "Pais no existe: [" + acc.paisid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    const documentotipo = acc.documentotipoid ? await documentotipoDao.findDocumentotipoPk(tx, acc.documentotipoid) : null;

    const accionistaToCreate: any = {
      empresa: { connect: { idempresa: empresaCreated.idempresa } },
      pais: { connect: { idpais: pais.idpais } },
      accionistaid: uuidv4(),
      code: uuidv4().split("-")[0],
      tipo: acc.tipo,
      porcentaje_acciones: new Decimal(acc.porcentaje_acciones),

      idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
      fechacrea: new Date(),
      idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
      fechamod: new Date(),
      estado: 1,
    };

    if (idaccionista_padre) {
      accionistaToCreate.accionista = { connect: { idaccionista: idaccionista_padre } };
    }

    if (acc.tipo === "PN") {
      accionistaToCreate.nombres = acc.nombres;
      accionistaToCreate.apellidos = acc.apellidos;
      accionistaToCreate.documento_numero = acc.documentonumero;
      if (documentotipo) {
        accionistaToCreate.documento_tipo = { connect: { iddocumentotipo: documentotipo.iddocumentotipo } };
      }
      accionistaToCreate.es_pep = acc.es_pep;
      accionistaToCreate.pep_cargo = acc.pep_cargo || "";
      accionistaToCreate.pep_institucion = acc.pep_institucion || "";
      accionistaToCreate.pep_vinculo = acc.pep_vinculo || "";
      accionistaToCreate.pep_nombre_completo_referencia = acc.pep_nombre_completo || "";
    } else {
      accionistaToCreate.razon_social = acc.razon_social;
      accionistaToCreate.ruc = acc.ruc;
    }

    const accionistaCreated = await accionistaDao.insertAccionista(tx, accionistaToCreate);

    if (acc.tipo === "PJ" && acc.accionistas && Array.isArray(acc.accionistas) && acc.accionistas.length > 0) {
      await crearAccionistasRecursivo(req, tx, empresaCreated, acc.accionistas, accionistaCreated.idaccionista);
    }
  }
};

const crearFuncionarios = async (req: Request, tx: any, empresaCreated: any, funcionarios: any[]) => {
  for (const fun of funcionarios) {
    const pais = await paisDao.findPaisPk(tx, fun.paisid);
    if (!pais) {
      log.warn(line(), "Pais no existe: [" + fun.paisid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    const documentotipo = await documentotipoDao.findDocumentotipoPk(tx, fun.documentotipoid);
    if (!documentotipo) {
      log.warn(line(), "Documento tipo no existe: [" + fun.documentotipoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const funcionarioToCreate: Prisma.funcionarioCreateInput = {
      empresa: { connect: { idempresa: empresaCreated.idempresa } },
      pais: { connect: { idpais: pais.idpais } },
      documento_tipo: { connect: { iddocumentotipo: documentotipo.iddocumentotipo } },
      funcionarioid: uuidv4(),
      code: uuidv4().split("-")[0],
      nombres: fun.nombres,
      apellidos: fun.apellidos,
      documento_numero: fun.documentonumero,
      cargo: fun.cargo,
      es_pep: fun.es_pep,
      pep_vinculo: fun.pep_vinculo || "",
      pep_nombre_completo_referencia: fun.pep_nombre_completo || "",
      pep_cargo: fun.pep_cargo || "",
      pep_institucion: fun.pep_institucion || "",
      idusuariocrea: req.session_user?.usuario?.idusuario ?? 1,
      fechacrea: new Date(),
      idusuariomod: req.session_user?.usuario?.idusuario ?? 1,
      fechamod: new Date(),
      estado: 1,
    };

    await funcionarioDao.insertFuncionario(tx, funcionarioToCreate);
  }
};
