import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as paisDao from "#src/daos/pais.prisma.Dao.js";
import * as provinciaDao from "#src/daos/provincia.prisma.Dao.js";
import * as distritoDao from "#src/daos/distrito.prisma.Dao.js";
import * as bancoDao from "#src/daos/banco.prisma.Dao.js";
import * as cuentatipoDao from "#src/daos/cuentatipo.prisma.Dao.js";
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
import * as servicioempresaestadoDao from "#src/daos/servicioempresaestado.prisma.Dao.js";
import * as servicioempresaverificacionDao from "#src/daos/servicioempresaverificacion.prisma.Dao.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";
import * as usuarioservicioempresaDao from "#src/daos/usuarioservicioempresa.prisma.Dao.js";
import * as usuarioservicioempresaestadoDao from "#src/daos/usuarioservicioempresaestado.prisma.Dao.js";
import * as usuarioservicioempresarolDao from "#src/daos/usuarioservicioempresarol.prisma.Dao.js";
import * as usuarioservicioDao from "#src/daos/usuarioservicio.prisma.Dao.js";
import * as usuarioservicioestadoDao from "#src/daos/usuarioservicioestado.prisma.Dao.js";
import * as usuarioservicioverificacionDao from "#src/daos/usuarioservicioverificacion.prisma.Dao.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as archivoempresaDao from "#src/daos/archivoempresa.prisma.Dao.js";
import * as archivocolaboradorDao from "#src/daos/archivocolaborador.prisma.Dao.js";
import * as archivocuentabancariaDao from "#src/daos/archivocuentabancaria.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import * as storageUtils from "#src/utils/storageUtils.js";
import * as validacionesYup from "#src/utils/validacionesYup.js";
import * as fs from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize, Op } from "sequelize";
import { cuenta_bancaria } from "#root/src/models/ft_factoring/CuentaBancaria";
import { inversionista_cuenta_bancaria } from "#root/src/models/ft_factoring/InversionistaCuentaBancaria";
import { usuario_servicio_verificacion } from "#root/src/models/ft_factoring/UsuarioServicioVerificacion";
import { usuario_servicio } from "#root/src/models/ft_factoring/UsuarioServicio";
import { empresa } from "#root/src/models/ft_factoring/Empresa";
import { colaborador } from "#root/src/models/ft_factoring/Colaborador";
import { EmpresaCuentaBancaria, empresa_cuenta_bancaria } from "#root/src/models/ft_factoring/EmpresaCuentaBancaria";
import { servicio_empresa } from "#root/src/models/ft_factoring/ServicioEmpresa";
import { usuario_servicio_empresa } from "#root/src/models/ft_factoring/UsuarioServicioEmpresa";
import { servicio_empresa_verificacion } from "#root/src/models/ft_factoring/ServicioEmpresaVerificacion";

export const suscribirUsuarioServicioFactoringInversionista = async (req: Request, res: Response) => {
  log.debug(line(), "controller::suscribirUsuarioServicioFactoringInversionista");
  const _idusuario = req.session_user?.usuario?._idusuario;
  const { id } = req.params;
  const filter_estado = [1, 2];
  const usuarioservicioSuscripcionSchema = yup
    .object()
    .shape({
      _idusuario: yup.number().required(),
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
  const usuarioservicioValidated = usuarioservicioSuscripcionSchema.validateSync({ ...req.files, ...req.body, _idusuario, usuarioservicioid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "usuarioservicioValidated:", usuarioservicioValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
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

      let inversionistaNuevo = {
        _idpersona: persona.idpersona,
        cuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const inversionistaCreated = await inversionistaDao.insertInversionista(tx, inversionistaNuevo);

      log.debug(line(), "inversionistaCreated:", inversionistaCreated);

      /* Creamos la Cuenta Bancaria asociada al Inversionista */

      let camposCuentabancariaNuevo: Partial<cuenta_bancaria> = {};
      camposCuentabancariaNuevo.numero = usuarioservicioValidated.numero;
      camposCuentabancariaNuevo.cci = usuarioservicioValidated.cci;
      camposCuentabancariaNuevo.alias = usuarioservicioValidated.alias;

      let camposCuentabancariaNuevoFk: Partial<cuenta_bancaria> = {};
      camposCuentabancariaNuevoFk.idbanco = banco.idbanco;
      camposCuentabancariaNuevoFk.idcuentatipo = cuentatipo.idcuentatipo;
      camposCuentabancariaNuevoFk.idmoneda = moneda.idmoneda;
      camposCuentabancariaNuevoFk.idcuentabancariaestado = cuentabancariaestado.idcuentabancariaestado;

      let camposCuentabancariaNuevoAdicionales: Partial<cuenta_bancaria> = {};
      camposCuentabancariaNuevoAdicionales.cuentabancariaid = uuidv4();
      camposCuentabancariaNuevoAdicionales.code = uuidv4().split("-")[0];

      let camposCuentabancariaNuevoAuditoria: Partial<cuenta_bancaria> = {};
      camposCuentabancariaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      camposCuentabancariaNuevoAuditoria.fechacrea = new Date();
      camposCuentabancariaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposCuentabancariaNuevoAuditoria.fechamod = new Date();
      camposCuentabancariaNuevoAuditoria.estado = 1;

      const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(tx, {
        ...camposCuentabancariaNuevo,
        ...camposCuentabancariaNuevoFk,
        ...camposCuentabancariaNuevoAdicionales,
        ...camposCuentabancariaNuevoAuditoria,
      });

      log.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

      let camposInversionistacuentabancariaNuevoFk: Partial<inversionista_cuenta_bancaria> = {};
      camposInversionistacuentabancariaNuevoFk.idinversionista = inversionistaCreated.idinversionista;
      camposInversionistacuentabancariaNuevoFk.idcuentabancaria = cuentabancariaCreated.idcuentabancaria;

      let camposInversionistacuentabancariaNuevoAdicionales: Partial<inversionista_cuenta_bancaria> = {};
      camposInversionistacuentabancariaNuevoAdicionales.inversionistacuentabancariaid = uuidv4();
      camposInversionistacuentabancariaNuevoAdicionales.code = uuidv4().split("-")[0];

      let camposInversionistacuentabancariaNuevoAuditoria: Partial<inversionista_cuenta_bancaria> = {};
      camposInversionistacuentabancariaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      camposInversionistacuentabancariaNuevoAuditoria.fechacrea = new Date();
      camposInversionistacuentabancariaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposInversionistacuentabancariaNuevoAuditoria.fechamod = new Date();
      camposInversionistacuentabancariaNuevoAuditoria.estado = 1;

      const imversionistacuentabancariaCreated = await inversionistacuentabancariaDao.insertInversionistacuentabancaria(tx, {
        ...camposInversionistacuentabancariaNuevoFk,
        ...camposInversionistacuentabancariaNuevoAdicionales,
        ...camposInversionistacuentabancariaNuevoAuditoria,
      });

      log.debug(line(), "imversionistacuentabancariaCreated:", imversionistacuentabancariaCreated);

      /* Registramos para la verificación del usuario_servicio en la tabla usuario_servicio_verificacion */
      const camposUsuarioservicioverificacionCreate: Partial<usuario_servicio_verificacion> = {};
      camposUsuarioservicioverificacionCreate.usuarioservicioverificacionid = uuidv4();
      camposUsuarioservicioverificacionCreate._idusuarioservicio = usuarioservicio._idusuarioservicio;
      camposUsuarioservicioverificacionCreate._idusuarioservicioestado = usuarioservicioestado._idusuarioservicioestado;
      camposUsuarioservicioverificacionCreate._idusuarioverifica = req.session_user?.usuario?._idusuario;
      camposUsuarioservicioverificacionCreate.comentariousuario = "";
      camposUsuarioservicioverificacionCreate.comentariointerno = "";
      camposUsuarioservicioverificacionCreate.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      camposUsuarioservicioverificacionCreate.fechacrea = new Date();
      camposUsuarioservicioverificacionCreate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposUsuarioservicioverificacionCreate.fechamod = new Date();
      camposUsuarioservicioverificacionCreate.estado = 1;

      const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(tx, camposUsuarioservicioverificacionCreate);
      log.debug(line(), "usuarioservicioverificacionCreated:", usuarioservicioverificacionCreated);

      /* Actualizamos el estado del usuario_servicio*/
      const camposUsuarioservicioUpdate: Partial<usuario_servicio> = {};
      camposUsuarioservicioUpdate._idusuarioservicio = usuarioservicio._idusuarioservicio;
      camposUsuarioservicioUpdate.usuarioservicioid = usuarioservicio.usuarioservicioid;
      camposUsuarioservicioUpdate._idusuarioservicioestado = usuarioservicioestado._idusuarioservicioestado;
      camposUsuarioservicioUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposUsuarioservicioUpdate.fechamod = new Date();

      const usuarioservicioUpdated = await usuarioservicioDao.updateUsuarioservicio(tx, camposUsuarioservicioUpdate);
      log.debug(line(), "usuarioservicioUpdated:", usuarioservicioUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, {});
};

export const suscribirUsuarioServicioFactoringEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::suscribirUsuarioServicioFactoringEmpresa");
  const _idusuario = req.session_user?.usuario?._idusuario;
  const { id } = req.params;
  const filter_estado = [1, 2];
  const usuarioservicioSuscripcionSchema = yup
    .object()
    .shape({
      _idusuario: yup.number().required(),
      usuarioservicioid: yup.string().trim().required().min(36).max(36),
      ficha_ruc: yup
        .mixed()
        .concat(validacionesYup.fileRequeridValidation())
        .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
        .concat(validacionesYup.fileTypeValidation(["application/pdf"])),
      reporte_tributario_para_terceros: yup
        .mixed()
        .concat(validacionesYup.fileRequeridValidation())
        .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
        .concat(validacionesYup.fileTypeValidation(["application/pdf"])),
      certificado_vigencia_poder: yup
        .mixed()
        .concat(validacionesYup.fileRequeridValidation())
        .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
        .concat(validacionesYup.fileTypeValidation(["application/pdf"])),
      encabezado_cuenta_bancaria: yup
        .mixed()
        .concat(validacionesYup.fileRequeridValidation())
        .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
        .concat(validacionesYup.fileTypeValidation(["image/png", "image/jpeg", "image/jpg", "application/pdf"])),

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

      declaracion_conformidad_contrato: yup.boolean().required(),
      declaracion_datos_reales: yup.boolean().required(),
    })
    .required();
  const usuarioservicioValidated = usuarioservicioSuscripcionSchema.validateSync({ ...req.files, ...req.body, _idusuario, usuarioservicioid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "usuarioservicioValidated:", usuarioservicioValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByUsuarioservicioid(tx, usuarioservicioValidated.usuarioservicioid);
      if (!usuarioservicio) {
        log.warn(line(), "El usuario servicio no existe: [" + usuarioservicioValidated.usuarioservicioid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      const empresa = await empresaDao.getEmpresaByRuc(tx, usuarioservicioValidated.ruc);
      if (!empresa) {
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

      let camposEmpresaNuevo: Partial<empresa> = {};
      camposEmpresaNuevo.ruc = usuarioservicioValidated.ruc;
      camposEmpresaNuevo.razon_social = usuarioservicioValidated.razon_social;
      camposEmpresaNuevo.direccion_sede = usuarioservicioValidated.direccion_sede;
      camposEmpresaNuevo.direccion_sede_referencia = usuarioservicioValidated.direccion_sede_referencia;

      let camposEmpresaNuevoFk: Partial<empresa> = {};
      camposEmpresaNuevoFk.idpaissede = paisSede.idpais;
      camposEmpresaNuevoFk.iddepartamentosede = provinciaResidencia.iddepartamento;
      camposEmpresaNuevoFk.idprovinciasede = distritoSede.idprovincia;
      camposEmpresaNuevoFk.iddistritosede = distritoSede.iddistrito;

      let camposEmpresaNuevoAdicionales: Partial<empresa> = {};
      camposEmpresaNuevoAdicionales.empresaid = uuidv4();
      camposEmpresaNuevoAdicionales.code = uuidv4().split("-")[0];

      let camposEmpresaNuevoAuditoria: Partial<empresa> = {};
      camposEmpresaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      camposEmpresaNuevoAuditoria.fechacrea = new Date();
      camposEmpresaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposEmpresaNuevoAuditoria.fechamod = new Date();
      camposEmpresaNuevoAuditoria.estado = 1;

      const empresaCreated = await empresaDao.insertEmpresa(tx, {
        ...camposEmpresaNuevo,
        ...camposEmpresaNuevoFk,
        ...camposEmpresaNuevoAdicionales,
        ...camposEmpresaNuevoAuditoria,
      });

      log.debug(line(), "empresaCreated:", empresaCreated);

      /* Creamos el Colaborador con los datos del usuario cómo representante legal */
      const usuarioConected = await usuarioDao.getUsuarioByIdusuario(tx, usuarioservicioValidated._idusuario);
      const personaConected = await personaDao.getPersonaByIdusuario(tx, usuarioservicioValidated._idusuario);

      let camposColaboradorNuevo: Partial<colaborador> = {};
      camposColaboradorNuevo.documentonumero = personaConected.documentonumero;
      camposColaboradorNuevo.nombrecolaborador = personaConected.personanombres;
      camposColaboradorNuevo.apellidocolaborador = personaConected.apellidopaterno + " " + personaConected.apellidomaterno;
      camposColaboradorNuevo.cargo = usuarioservicioValidated.cargo;
      camposColaboradorNuevo.email = personaConected.email;
      camposColaboradorNuevo.telefono = personaConected.celular;
      camposColaboradorNuevo.poderpartidanumero = usuarioservicioValidated.poderpartidanumero;
      camposColaboradorNuevo.poderpartidaciudad = usuarioservicioValidated.poderpartidaciudad;

      let camposColaboradorNuevoFk: Partial<colaborador> = {};
      camposColaboradorNuevoFk.idempresa = empresaCreated.idempresa;
      camposColaboradorNuevoFk.idpersona = personaConected.idpersona;
      camposColaboradorNuevoFk.idcolaboradortipo = colaboradorttipo.idcolaboradortipo;
      camposColaboradorNuevoFk.iddocumentotipo = personaConected.iddocumentotipo;

      let camposColaboradorNuevoAdicionales: Partial<colaborador> = {};
      camposColaboradorNuevoAdicionales.colaboradorid = uuidv4();

      let camposColaboradorNuevoAuditoria: Partial<colaborador> = {};
      camposColaboradorNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      camposColaboradorNuevoAuditoria.fechacrea = new Date();
      camposColaboradorNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposColaboradorNuevoAuditoria.fechamod = new Date();
      camposColaboradorNuevoAuditoria.estado = 1;

      const colaboradorCreated = await colaboradorDao.insertColaborador(tx, {
        ...camposColaboradorNuevo,
        ...camposColaboradorNuevoFk,
        ...camposColaboradorNuevoAdicionales,
        ...camposColaboradorNuevoAuditoria,
      });

      log.debug(line(), "colaboradorCreated:", colaboradorCreated);

      /* Creamos la Cuenta Bancaria asociada a la Empresa */

      let camposCuentabancariaNuevo: Partial<cuenta_bancaria> = {};
      camposCuentabancariaNuevo.numero = usuarioservicioValidated.numero;
      camposCuentabancariaNuevo.cci = usuarioservicioValidated.cci;
      camposCuentabancariaNuevo.alias = usuarioservicioValidated.alias;

      let camposCuentabancariaNuevoFk: Partial<cuenta_bancaria> = {};
      camposCuentabancariaNuevoFk.idbanco = banco.idbanco;
      camposCuentabancariaNuevoFk.idcuentatipo = cuentatipo.idcuentatipo;
      camposCuentabancariaNuevoFk.idmoneda = moneda.idmoneda;
      camposCuentabancariaNuevoFk.idcuentabancariaestado = cuentabancariaestado.idcuentabancariaestado;

      let camposCuentabancariaNuevoAdicionales: Partial<cuenta_bancaria> = {};
      camposCuentabancariaNuevoAdicionales.cuentabancariaid = uuidv4();
      camposCuentabancariaNuevoAdicionales.code = uuidv4().split("-")[0];

      let camposCuentabancariaNuevoAuditoria: Partial<cuenta_bancaria> = {};
      camposCuentabancariaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      camposCuentabancariaNuevoAuditoria.fechacrea = new Date();
      camposCuentabancariaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposCuentabancariaNuevoAuditoria.fechamod = new Date();
      camposCuentabancariaNuevoAuditoria.estado = 1;

      const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(tx, {
        ...camposCuentabancariaNuevo,
        ...camposCuentabancariaNuevoFk,
        ...camposCuentabancariaNuevoAdicionales,
        ...camposCuentabancariaNuevoAuditoria,
      });

      log.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

      let camposEmpresacuentabancariaNuevoFk: Partial<empresa_cuenta_bancaria> = {};
      camposEmpresacuentabancariaNuevoFk.idempresa = empresaCreated.idempresa;
      camposEmpresacuentabancariaNuevoFk.idcuentabancaria = cuentabancariaCreated.idcuentabancaria;

      let camposEmpresacuentabancariaNuevoAdicionales: Partial<empresa_cuenta_bancaria> = {};
      camposEmpresacuentabancariaNuevoAdicionales.empresacuentabancariaid = uuidv4();
      camposEmpresacuentabancariaNuevoAdicionales.code = uuidv4().split("-")[0];

      let camposEmpresacuentabancariaNuevoAuditoria: Partial<empresa_cuenta_bancaria> = {};
      camposEmpresacuentabancariaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      camposEmpresacuentabancariaNuevoAuditoria.fechacrea = new Date();
      camposEmpresacuentabancariaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposEmpresacuentabancariaNuevoAuditoria.fechamod = new Date();
      camposEmpresacuentabancariaNuevoAuditoria.estado = 1;

      const empresacuentabancariaCreated = await empresacuentabancariaDao.insertEmpresacuentabancaria(tx, {
        ...camposEmpresacuentabancariaNuevoFk,
        ...camposEmpresacuentabancariaNuevoAdicionales,
        ...camposEmpresacuentabancariaNuevoAuditoria,
      });

      log.debug(line(), "empresacuentabancariaCreated:", empresacuentabancariaCreated);

      /* Registramos el Servicio para la Empresa en la tabla servicio_empresa */

      let camposServicioempresaNuevoFk: Partial<servicio_empresa> = {};
      camposServicioempresaNuevoFk.idservicio = 1;
      camposServicioempresaNuevoFk.idempresa = empresaCreated.idempresa;
      camposServicioempresaNuevoFk._idusuariosuscriptor = usuarioConected._idusuario;
      camposServicioempresaNuevoFk.idservicioempresaestado = servicioempresaestado.idservicioempresaestado;

      let camposServicioempresaNuevoAdicionales: Partial<servicio_empresa> = {};
      camposServicioempresaNuevoAdicionales.servicioempresaid = uuidv4();
      camposServicioempresaNuevoAdicionales.code = uuidv4().split("-")[0];

      let camposServicioempresaNuevoAuditoria: Partial<servicio_empresa> = {};
      camposServicioempresaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      camposServicioempresaNuevoAuditoria.fechacrea = new Date();
      camposServicioempresaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposServicioempresaNuevoAuditoria.fechamod = new Date();
      camposServicioempresaNuevoAuditoria.estado = 1;

      const servicioempresaCreated = await servicioempresaDao.insertServicioempresa(tx, {
        ...camposServicioempresaNuevoFk,
        ...camposServicioempresaNuevoAdicionales,
        ...camposServicioempresaNuevoAuditoria,
      });

      log.debug(line(), "servicioempresaCreated:", servicioempresaCreated);

      /* Registramos el acceso del usuario a la Empresa en la tabla usuario_servicio_empresa */

      let camposUsuarioservicioempresaNuevoFk: Partial<usuario_servicio_empresa> = {};
      camposUsuarioservicioempresaNuevoFk._idusuario = usuarioConected._idusuario;
      camposUsuarioservicioempresaNuevoFk.idservicio = 1;
      camposUsuarioservicioempresaNuevoFk.idempresa = empresaCreated.idempresa;
      camposUsuarioservicioempresaNuevoFk._idusuarioservicioempresaestado = usuarioservicioempresaestado._idusuarioservicioempresaestado;
      camposUsuarioservicioempresaNuevoFk._idusuarioservicioempresarol = usuarioservicioempresarol._idusuarioservicioempresarol;

      let camposUsuarioservicioempresaNuevoAdicionales: Partial<usuario_servicio_empresa> = {};
      camposUsuarioservicioempresaNuevoAdicionales.usuarioservicioempresaid = uuidv4();
      camposUsuarioservicioempresaNuevoAdicionales.code = uuidv4().split("-")[0];

      let camposUsuarioservicioempresaNuevoAuditoria: Partial<usuario_servicio_empresa> = {};
      camposUsuarioservicioempresaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      camposUsuarioservicioempresaNuevoAuditoria.fechacrea = new Date();
      camposUsuarioservicioempresaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposUsuarioservicioempresaNuevoAuditoria.fechamod = new Date();
      camposUsuarioservicioempresaNuevoAuditoria.estado = 1;

      const usuarioservicioempresaCreated = await usuarioservicioempresaDao.insertUsuarioservicioempresa(tx, {
        ...camposUsuarioservicioempresaNuevoFk,
        ...camposUsuarioservicioempresaNuevoAdicionales,
        ...camposUsuarioservicioempresaNuevoAuditoria,
      });

      log.debug(line(), "usuarioservicioempresaCreated:", usuarioservicioempresaCreated);

      const ficharucCreated = await crearArchivoFichaRuc(req, tx, usuarioservicioValidated, empresaCreated);
      log.debug(line(), "ficharucCreated:", ficharucCreated);

      const reportetributarioCreated = await crearArchivoReporteTributarioParaTerceros(req, tx, usuarioservicioValidated, empresaCreated);
      log.debug(line(), "reportetributarioCreated:", reportetributarioCreated);

      const vigenciapoderCreated = await crearArchivoVigenciaPoderRepresentanteLegal(req, tx, usuarioservicioValidated, colaboradorCreated);
      log.debug(line(), "vigenciapoderCreated:", vigenciapoderCreated);

      const encabezadocuentabancariaCreated = await crearArchivoEncabezadoCuentaBancaria(req, tx, usuarioservicioValidated, cuentabancariaCreated);
      log.debug(line(), "encabezadocuentabancariaCreated:", encabezadocuentabancariaCreated);

      /* Registramos para la verificación del servicio_empresa en la tabla servicio_empresa_verificacion */
      const camposServicioempresaverificacionCreate: Partial<servicio_empresa_verificacion> = {};
      camposServicioempresaverificacionCreate.servicioempresaverificacionid = uuidv4();
      camposServicioempresaverificacionCreate.idservicioempresa = servicioempresaCreated.idservicioempresa;
      camposServicioempresaverificacionCreate.idservicioempresaestado = servicioempresaestado.idservicioempresaestado;
      camposServicioempresaverificacionCreate._idusuarioverifica = req.session_user?.usuario?._idusuario;
      camposServicioempresaverificacionCreate.comentariousuario = "";
      camposServicioempresaverificacionCreate.comentariointerno = "";
      camposServicioempresaverificacionCreate.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      camposServicioempresaverificacionCreate.fechacrea = new Date();
      camposServicioempresaverificacionCreate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposServicioempresaverificacionCreate.fechamod = new Date();
      camposServicioempresaverificacionCreate.estado = 1;

      const servicioempresaverificacionCreated = await servicioempresaverificacionDao.insertServicioempresaverificacion(tx, camposServicioempresaverificacionCreate);
      log.debug(line(), "servicioempresaverificacionCreated:", servicioempresaverificacionCreated);

      /* Registramos para la verificación del usuario_servicio en la tabla usuario_servicio_verificacion */
      const camposUsuarioservicioverificacionCreate: Partial<usuario_servicio_verificacion> = {};
      camposUsuarioservicioverificacionCreate.usuarioservicioverificacionid = uuidv4();
      camposUsuarioservicioverificacionCreate._idusuarioservicio = usuarioservicio._idusuarioservicio;
      camposUsuarioservicioverificacionCreate._idusuarioservicioestado = usuarioservicioestado._idusuarioservicioestado;
      camposUsuarioservicioverificacionCreate._idusuarioverifica = req.session_user?.usuario?._idusuario;
      camposUsuarioservicioverificacionCreate.comentariousuario = "";
      camposUsuarioservicioverificacionCreate.comentariointerno = "";
      camposUsuarioservicioverificacionCreate.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
      camposUsuarioservicioverificacionCreate.fechacrea = new Date();
      camposUsuarioservicioverificacionCreate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposUsuarioservicioverificacionCreate.fechamod = new Date();
      camposUsuarioservicioverificacionCreate.estado = 1;

      const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(tx, camposUsuarioservicioverificacionCreate);
      log.debug(line(), "usuarioservicioverificacionCreated:", usuarioservicioverificacionCreated);

      /* Actualizamos el estado del usuario_servicio*/
      const camposUsuarioservicioUpdate: Partial<usuario_servicio> = {};
      camposUsuarioservicioUpdate._idusuarioservicio = usuarioservicio._idusuarioservicio;
      camposUsuarioservicioUpdate.usuarioservicioid = usuarioservicio.usuarioservicioid;
      camposUsuarioservicioUpdate._idusuarioservicioestado = usuarioservicioestado._idusuarioservicioestado;
      camposUsuarioservicioUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
      camposUsuarioservicioUpdate.fechamod = new Date();

      const usuarioservicioUpdated = await usuarioservicioDao.updateUsuarioservicio(tx, camposUsuarioservicioUpdate);
      log.debug(line(), "usuarioservicioUpdated:", usuarioservicioUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, {});
};

export const getUsuarioservicioMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioservicioMaster");
  const session_idusuario = req.session_user?.usuario?._idusuario;
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
      const filter_estados = [1];

      const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByUsuarioservicioid(tx, usuarioservicioValidated.usuarioservicioid);
      const paises = await paisDao.getPaises(tx, filter_estados);
      const distritos = await distritoDao.getDistritos(tx, filter_estados);
      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);
      const cuentatipos = await cuentatipoDao.getCuentatipos(tx, filter_estados);
      const persona = await personaDao.getPersonaByIdusuario(tx, session_idusuario);

      let usuarioservicioMaster: Record<string, any> = {};
      usuarioservicioMaster.usuarioservicio = usuarioservicio;
      usuarioservicioMaster.paises = paises;
      usuarioservicioMaster.distritos = distritos;
      usuarioservicioMaster.bancos = bancos;
      usuarioservicioMaster.monedas = monedas;
      usuarioservicioMaster.cuentatipos = cuentatipos;
      usuarioservicioMaster.persona = persona;

      let usuarioservicioMasterJSON = jsonUtils.sequelizeToJSON(usuarioservicioMaster);
      //jsonUtils.prettyPrint(usuarioservicioMasterJSON);
      let usuarioservicioMasterObfuscated = jsonUtils.ofuscarAtributosDefault(usuarioservicioMasterJSON);
      //jsonUtils.prettyPrint(usuarioservicioMasterObfuscated);
      let usuarioservicioMasterFiltered = jsonUtils.removeAttributesPrivates(usuarioservicioMasterObfuscated);
      //jsonUtils.prettyPrint(usuarioservicioMaster);
      return usuarioservicioMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, usuarioservicioMasterFiltered);
};

export const getUsuarioservicios = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioservicios");
  const usuarioserviciosFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      //log.info(line(),req.session_user.usuario._idusuario);

      const session_idusuario = req.session_user.usuario._idusuario;
      const filter_estado = [1];
      const usuarioservicios = await usuarioservicioDao.getUsuarioserviciosByIdusuario(tx, session_idusuario, filter_estado);
      var usuarioserviciosJson = jsonUtils.sequelizeToJSON(usuarioservicios);
      //log.info(line(),empresaObfuscated);

      var usuarioserviciosFiltered = jsonUtils.removeAttributes(usuarioserviciosJson, ["score"]);
      usuarioserviciosFiltered = jsonUtils.removeAttributesPrivates(usuarioserviciosFiltered);
      return usuarioserviciosFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, usuarioserviciosFiltered);
};

const crearArchivoEncabezadoCuentaBancaria = async (req, tx, usuarioservicioValidated, cuentabancariaCreated) => {
  //Copiamos el archivo
  const { encabezado_cuenta_bancaria } = usuarioservicioValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = encabezado_cuenta_bancaria[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = encabezado_cuenta_bancaria[0];

  const archivoToCreate: Prisma.archivoCreateInput = {
    archivoid: uuidv4(),
    archivo_tipo: { connect: { idarchivotipo: 7 } },
    archivo_estado: { connect: { idarchivoestado: 1 } },
    codigo: codigo_archivo,
    nombrereal: originalname,
    nombrealmacenamiento: filename,
    ruta: carpetaDestino,
    tamanio: size,
    mimetype: mimetype,
    encoding: encoding,
    extension: extension,
    observacion: "",
    fechavencimiento: null,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };
  const archivoCreated = await archivoDao.insertArchivo(tx, archivoToCreate);

  const archivocuentabancariaToCreate: Prisma.archivo_cuenta_bancariaCreateInput = {
    archivo: { connect: { idarchivo: archivoCreated.idarchivo } },
    cuenta_bancaria: { connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria } },
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };

  await archivocuentabancariaDao.insertArchivoCuentaBancaria(tx, archivocuentabancariaToCreate);

  fs.unlinkSync(archivoOrigen);

  return archivoCreated;
};

const crearArchivoVigenciaPoderRepresentanteLegal = async (req, tx, usuarioservicioValidated, colaboradorCreated) => {
  //Copiamos el archivo
  const { certificado_vigencia_poder } = usuarioservicioValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = certificado_vigencia_poder[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = certificado_vigencia_poder[0];

  const archivoToCreate: Prisma.archivoCreateInput = {
    archivoid: uuidv4(),
    archivo_tipo: { connect: { idarchivotipo: 6 } },
    archivo_estado: { connect: { idarchivoestado: 1 } },
    codigo: codigo_archivo,
    nombrereal: originalname,
    nombrealmacenamiento: filename,
    ruta: carpetaDestino,
    tamanio: size,
    mimetype: mimetype,
    encoding: encoding,
    extension: extension,
    observacion: "",
    fechavencimiento: null,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };
  const archivoCreated = await archivoDao.insertArchivo(tx, archivoToCreate);

  const archivocolaboradorToCreate: Prisma.archivo_colaboradorCreateInput = {
    archivo: { connect: { idarchivo: archivoCreated.idarchivo } },
    colaborador: { connect: { idcolaborador: colaboradorCreated.idcolaborador } },
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };
  await archivocolaboradorDao.insertArchivoColaborador(tx, archivocolaboradorToCreate);

  fs.unlinkSync(archivoOrigen);

  return archivoCreated;
};

const crearArchivoReporteTributarioParaTerceros = async (req, tx, usuarioservicioValidated, empresaCreated) => {
  //Copiamos el archivo
  const { reporte_tributario_para_terceros } = usuarioservicioValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = reporte_tributario_para_terceros[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = reporte_tributario_para_terceros[0];

  const archivoToCreate: Prisma.archivoCreateInput = {
    archivoid: uuidv4(),
    archivo_tipo: { connect: { idarchivotipo: 5 } },
    archivo_estado: { connect: { idarchivoestado: 1 } },
    codigo: codigo_archivo,
    nombrereal: originalname,
    nombrealmacenamiento: filename,
    ruta: carpetaDestino,
    tamanio: size,
    mimetype: mimetype,
    encoding: encoding,
    extension: extension,
    observacion: "",
    fechavencimiento: null,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };
  const archivoCreated = await archivoDao.insertArchivo(tx, archivoToCreate);

  const archivoempresaToCreate: Prisma.archivo_empresaCreateInput = {
    archivo: { connect: { idarchivo: archivoCreated.idarchivo } },
    empresa: { connect: { idempresa: empresaCreated.idempresa } },
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };
  await archivoempresaDao.insertArchivoEmpresa(tx, archivoempresaToCreate);

  fs.unlinkSync(archivoOrigen);

  return archivoCreated;
};

const crearArchivoFichaRuc = async (req, tx, usuarioservicioValidated, empresaCreated) => {
  //Copiamos el archivo
  const { ficha_ruc } = usuarioservicioValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = ficha_ruc[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = ficha_ruc[0];

  const archivoToCreate: Prisma.archivoCreateInput = {
    archivoid: uuidv4(),
    archivo_tipo: { connect: { idarchivotipo: 4 } },
    archivo_estado: { connect: { idarchivoestado: 1 } },
    codigo: codigo_archivo,
    nombrereal: originalname,
    nombrealmacenamiento: filename,
    ruta: carpetaDestino,
    tamanio: size,
    mimetype: mimetype,
    encoding: encoding,
    extension: extension,
    observacion: "",
    fechavencimiento: null,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };
  const archivoCreated = await archivoDao.insertArchivo(tx, archivoToCreate);

  const archivoempresaToCreate: Prisma.archivo_empresaCreateInput = {
    archivo: { connect: { idarchivo: archivoCreated.idarchivo } },
    empresa: { connect: { idempresa: empresaCreated.idempresa } },
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: new Date(),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: new Date(),
    estado: 1,
  };
  await archivoempresaDao.insertArchivoEmpresa(tx, archivoempresaToCreate);

  fs.unlinkSync(archivoOrigen);

  return archivoCreated;
};
