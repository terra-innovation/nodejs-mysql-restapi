import * as paisDao from "#src/daos/paisDao.js";
import * as provinciaDao from "#src/daos/provinciaDao.js";
import * as distritoDao from "#src/daos/distritoDao.js";
import * as bancoDao from "#src/daos/bancoDao.js";
import * as cuentatipoDao from "#src/daos/cuentatipoDao.js";
import * as monedaDao from "#src/daos/monedaDao.js";
import * as personaDao from "#src/daos/personaDao.js";
import * as cuentabancariaDao from "#src/daos/cuentabancariaDao.js";
import * as cuentabancariaestadoDao from "#src/daos/cuentabancariaestadoDao.js";
import * as empresacuentabancariaDao from "#src/daos/empresacuentabancariaDao.js";
import * as colaboradortipoDao from "#src/daos/colaboradortipoDao.js";
import * as colaboradorDao from "#src/daos/colaboradorDao.js";
import * as servicioempresaDao from "#src/daos/servicioempresaDao.js";
import * as servicioempresaestadoDao from "#src/daos/servicioempresaestadoDao.js";
import * as servicioempresaverificacionDao from "#src/daos/servicioempresaverificacionDao.js";
import * as usuarioDao from "#src/daos/usuarioDao.js";
import * as usuarioservicioempresaDao from "#src/daos/usuarioservicioempresaDao.js";
import * as usuarioservicioempresaestadoDao from "#src/daos/usuarioservicioempresaestadoDao.js";
import * as usuarioservicioempresarolDao from "#src/daos/usuarioservicioempresarolDao.js";
import * as usuarioservicioDao from "#src/daos/usuarioservicioDao.js";
import * as usuarioservicioestadoDao from "#src/daos/usuarioservicioestadoDao.js";
import * as usuarioservicioverificacionDao from "#src/daos/usuarioservicioverificacionDao.js";
import * as archivoDao from "#src/daos/archivoDao.js";
import * as archivoempresaDao from "#src/daos/archivoempresaDao.js";
import * as archivocolaboradorDao from "#src/daos/archivocolaboradorDao.js";
import * as archivocuentabancariaDao from "#src/daos/archivocuentabancariaDao.js";
import * as empresaDao from "#src/daos/empresaDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import * as validacionesYup from "#src/utils/validacionesYup.js";
import * as fs from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const suscribirUsuarioServicioFactoringEmpresa = async (req, res) => {
  logger.debug(line(), "controller::suscribirUsuarioServicioFactoringEmpresa");
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
  logger.debug(line(), "usuarioservicioValidated:", usuarioservicioValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByUsuarioservicioid(transaction, usuarioservicioValidated.usuarioservicioid);
    if (!usuarioservicio) {
      logger.warn(line(), "El usuario servicio no existe: [" + usuarioservicioValidated.usuarioservicioid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    const empresa = await empresaDao.getEmpresaByRuc(transaction, usuarioservicioValidated.ruc);
    if (empresa && empresa.length > 0) {
      logger.warn(line(), "La empresa con RUC [" + usuarioservicioValidated.ruc + "] ya se encuentra registrada.");
      throw new ClientError("La empresa con RUC [" + usuarioservicioValidated.ruc + "] se encuentra registrada.", 404);
    }

    const paisSede = await paisDao.findPaisPk(transaction, usuarioservicioValidated.paissedeid);
    if (!paisSede) {
      logger.warn(line(), "País de sede no existe: [" + usuarioservicioValidated.paissedeid + "]");
      throw new ClientError("Datos no válidos", 404);
    }
    const distritoSede = await distritoDao.getDistritoByDistritoid(transaction, usuarioservicioValidated.distritosedeid);
    if (!distritoSede) {
      logger.warn(line(), "Distrito de sede no existe: [" + usuarioservicioValidated.distritosedeid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const banco = await bancoDao.findBancoPk(transaction, usuarioservicioValidated.bancoid);
    if (!banco) {
      logger.warn(line(), "Banco no existe: [" + usuarioservicioValidated.bancoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const cuentatipo = await cuentatipoDao.findCuentatipoPk(transaction, usuarioservicioValidated.cuentatipoid);
    if (!cuentatipo) {
      logger.warn(line(), "Cuenta tipo no existe: [" + usuarioservicioValidated.cuentatipoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const moneda = await monedaDao.findMonedaPk(transaction, usuarioservicioValidated.monedaid);
    if (!moneda) {
      logger.warn(line(), "Moneda no existe: [" + usuarioservicioValidated.monedaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(transaction, banco._idbanco, usuarioservicioValidated.numero, filter_estado);
    if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
      logger.warn(line(), "El número de cuenta [" + usuarioservicioValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.");
      throw new ClientError("El número de cuenta [" + usuarioservicioValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
    }

    if (!usuarioservicioValidated.declaracion_representante_legal) {
      logger.warn(line(), "No aceptó la declaración de representante legal: [" + usuarioservicioValidated.declaracion_representante_legal + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    if (!usuarioservicioValidated.declaracion_conformidad_contrato) {
      logger.warn(line(), "No aceptó la declaración de conformidad del contrato: [" + usuarioservicioValidated.declaracion_conformidad_contrato + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    if (!usuarioservicioValidated.declaracion_datos_reales) {
      logger.warn(line(), "No aceptó la declaración de datos reales: [" + usuarioservicioValidated.declaracion_datos_reales + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const colaboradorttipo_representante_legal = 1;
    const colaboradorttipo = await colaboradortipoDao.getColaboradortipoByIdcolaboradortipo(transaction, colaboradorttipo_representante_legal);
    if (!colaboradorttipo) {
      logger.warn(line(), "Colaborador tipo no existe: [" + colaboradorttipo_representante_legal + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const cuentabancariaestado_pendiente = 1;
    const cuentabancariaestado = await cuentabancariaestadoDao.getCuentabancariaestadoByIdcuentabancariaestado(transaction, cuentabancariaestado_pendiente);
    if (!cuentabancariaestado) {
      logger.warn(line(), "Cuenta bancaria estado no existe: [" + cuentabancariaestado_pendiente + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const servicioempresaestado_en_revision = 1;
    const servicioempresaestado = await servicioempresaestadoDao.getServicioempresaestadoByIdservicioempresaestado(transaction, servicioempresaestado_en_revision);
    if (!servicioempresaestado) {
      logger.warn(line(), "Servicio empresa estado no existe: [" + servicioempresaestado_en_revision + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const usuarioservicioempresaestado_sin_acceso = 1;
    const usuarioservicioempresaestado = await usuarioservicioempresaestadoDao.getUsuarioservicioempresaestadoByIdusuarioservicioempresaestado(transaction, usuarioservicioempresaestado_sin_acceso);
    if (!usuarioservicioempresaestado) {
      logger.warn(line(), "Usuario servicio empresa estado no existe: [" + usuarioservicioempresaestado_sin_acceso + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const usuarioservicioempresarol_administrador = 1;
    const usuarioservicioempresarol = await usuarioservicioempresarolDao.getUsuarioservicioempresarolByIdusuarioservicioempresarol(transaction, usuarioservicioempresarol_administrador);
    if (!usuarioservicioempresarol) {
      logger.warn(line(), "Usuario servicio empresa estado no existe: [" + usuarioservicioempresarol_administrador + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const usuarioservicioaestado_en_revision = 3;
    const usuarioservicioestado = await usuarioservicioestadoDao.getUsuarioservicioestadoByIdusuarioservicioestado(transaction, usuarioservicioaestado_en_revision);
    if (!usuarioservicioestado) {
      logger.warn(line(), "Usuario servicio estado no existe: [" + usuarioservicioaestado_en_revision + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    /* Creamos la Empresa */
    const provinciaResidencia = await provinciaDao.getProvinciaByIdprovincia(transaction, distritoSede._idprovincia);

    let camposEmpresaNuevo = {};
    camposEmpresaNuevo.ruc = usuarioservicioValidated.ruc;
    camposEmpresaNuevo.razon_social = usuarioservicioValidated.razon_social;
    camposEmpresaNuevo.direccion_sede = usuarioservicioValidated.direccion_sede;
    camposEmpresaNuevo.direccion_sede_referencia = usuarioservicioValidated.direccion_sede_referencia;

    let camposEmpresaNuevoFk = {};
    camposEmpresaNuevoFk._idpaissede = paisSede._idpais;
    camposEmpresaNuevoFk._iddepartamentosede = provinciaResidencia._iddepartamento;
    camposEmpresaNuevoFk._idprovinciasede = distritoSede._idprovincia;
    camposEmpresaNuevoFk._iddistritosede = distritoSede._iddistrito;

    let camposEmpresaNuevoAdicionales = {};
    camposEmpresaNuevoAdicionales.empresaid = uuidv4();
    camposEmpresaNuevoAdicionales.code = uuidv4().split("-")[0];

    let camposEmpresaNuevoAuditoria = {};
    camposEmpresaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
    camposEmpresaNuevoAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposEmpresaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    camposEmpresaNuevoAuditoria.fechamod = Sequelize.fn("now", 3);
    camposEmpresaNuevoAuditoria.estado = 1;

    const empresaCreated = await empresaDao.insertEmpresa(transaction, {
      ...camposEmpresaNuevo,
      ...camposEmpresaNuevoFk,
      ...camposEmpresaNuevoAdicionales,
      ...camposEmpresaNuevoAuditoria,
    });

    logger.debug(line(), "empresaCreated:", empresaCreated);

    /* Creamos el Colaborador con los datos del usuario cómo representante legal */
    const usuarioConected = await usuarioDao.getUsuarioByIdusuario(transaction, usuarioservicioValidated._idusuario);
    const personaConected = await personaDao.getPersonaByIdusuario(transaction, usuarioservicioValidated._idusuario);

    let camposColaboradorNuevo = {};
    camposColaboradorNuevo.documentonumero = personaConected.documentonumero;
    camposColaboradorNuevo.nombrecolaborador = personaConected.personanombres;
    camposColaboradorNuevo.apellidocolaborador = personaConected.apellidopaterno + " " + personaConected.apellidomaterno;
    camposColaboradorNuevo.cargo = usuarioservicioValidated.cargo;
    camposColaboradorNuevo.email = personaConected.email;
    camposColaboradorNuevo.telefono = personaConected.celular;
    camposColaboradorNuevo.poderpartidanumero = usuarioservicioValidated.poderpartidanumero;
    camposColaboradorNuevo.poderpartidaciudad = usuarioservicioValidated.poderpartidaciudad;

    let camposColaboradorNuevoFk = {};
    camposColaboradorNuevoFk._idempresa = empresaCreated._idempresa;
    camposColaboradorNuevoFk._idpersona = personaConected._idpersona;
    camposColaboradorNuevoFk._idcolaboradortipo = colaboradorttipo._idcolaboradortipo;
    camposColaboradorNuevoFk._iddocumentotipo = personaConected._iddocumentotipo;

    let camposColaboradorNuevoAdicionales = {};
    camposColaboradorNuevoAdicionales.colaboradorid = uuidv4();

    let camposColaboradorNuevoAuditoria = {};
    camposColaboradorNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
    camposColaboradorNuevoAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposColaboradorNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    camposColaboradorNuevoAuditoria.fechamod = Sequelize.fn("now", 3);
    camposColaboradorNuevoAuditoria.estado = 1;

    const colaboradorCreated = await colaboradorDao.insertColaborador(transaction, {
      ...camposColaboradorNuevo,
      ...camposColaboradorNuevoFk,
      ...camposColaboradorNuevoAdicionales,
      ...camposColaboradorNuevoAuditoria,
    });

    logger.debug(line(), "colaboradorCreated:", colaboradorCreated);

    /* Creamos la Cuenta Bancaria asociada a la Empresa */

    let camposCuentabancariaNuevo = {};
    camposCuentabancariaNuevo.numero = usuarioservicioValidated.numero;
    camposCuentabancariaNuevo.cci = usuarioservicioValidated.cci;
    camposCuentabancariaNuevo.alias = usuarioservicioValidated.alias;

    let camposCuentabancariaNuevoFk = {};
    camposCuentabancariaNuevoFk._idbanco = banco._idbanco;
    camposCuentabancariaNuevoFk._idcuentatipo = cuentatipo._idcuentatipo;
    camposCuentabancariaNuevoFk._idmoneda = moneda._idmoneda;
    camposCuentabancariaNuevoFk._idcuentabancariaestado = cuentabancariaestado._idcuentabancariaestado;

    let camposCuentabancariaNuevoAdicionales = {};
    camposCuentabancariaNuevoAdicionales.cuentabancariaid = uuidv4();
    camposCuentabancariaNuevoAdicionales.code = uuidv4().split("-")[0];

    let camposCuentabancariaNuevoAuditoria = {};
    camposCuentabancariaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
    camposCuentabancariaNuevoAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposCuentabancariaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    camposCuentabancariaNuevoAuditoria.fechamod = Sequelize.fn("now", 3);
    camposCuentabancariaNuevoAuditoria.estado = 1;

    const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(transaction, {
      ...camposCuentabancariaNuevo,
      ...camposCuentabancariaNuevoFk,
      ...camposCuentabancariaNuevoAdicionales,
      ...camposCuentabancariaNuevoAuditoria,
    });

    logger.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

    let camposEmpresacuentabancariaNuevoFk = {};
    camposEmpresacuentabancariaNuevoFk._idempresa = empresaCreated._idempresa;
    camposEmpresacuentabancariaNuevoFk._idcuentabancaria = cuentabancariaCreated._idcuentabancaria;

    let camposEmpresacuentabancariaNuevoAdicionales = {};
    camposEmpresacuentabancariaNuevoAdicionales.empresacuentabancariaid = uuidv4();
    camposEmpresacuentabancariaNuevoAdicionales.code = uuidv4().split("-")[0];

    let camposEmpresacuentabancariaNuevoAuditoria = {};
    camposEmpresacuentabancariaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
    camposEmpresacuentabancariaNuevoAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposEmpresacuentabancariaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    camposEmpresacuentabancariaNuevoAuditoria.fechamod = Sequelize.fn("now", 3);
    camposEmpresacuentabancariaNuevoAuditoria.estado = 1;

    const empresacuentabancariaCreated = await empresacuentabancariaDao.insertEmpresacuentabancaria(transaction, {
      ...camposEmpresacuentabancariaNuevoFk,
      ...camposEmpresacuentabancariaNuevoAdicionales,
      ...camposEmpresacuentabancariaNuevoAuditoria,
    });

    logger.debug(line(), "empresacuentabancariaCreated:", empresacuentabancariaCreated);

    /* Registramos el Servicio para la Empresa en la tabla servicio_empresa */

    let camposServicioempresaNuevoFk = {};
    camposServicioempresaNuevoFk._idservicio = 1;
    camposServicioempresaNuevoFk._idempresa = empresaCreated._idempresa;
    camposServicioempresaNuevoFk._idusuariosuscriptor = usuarioConected._idusuario;
    camposServicioempresaNuevoFk._idservicioempresaestado = servicioempresaestado._idservicioempresaestado;

    let camposServicioempresaNuevoAdicionales = {};
    camposServicioempresaNuevoAdicionales.servicioempresaid = uuidv4();
    camposServicioempresaNuevoAdicionales.code = uuidv4().split("-")[0];

    let camposServicioempresaNuevoAuditoria = {};
    camposServicioempresaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
    camposServicioempresaNuevoAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposServicioempresaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    camposServicioempresaNuevoAuditoria.fechamod = Sequelize.fn("now", 3);
    camposServicioempresaNuevoAuditoria.estado = 1;

    const servicioempresaCreated = await servicioempresaDao.insertServicioempresa(transaction, {
      ...camposServicioempresaNuevoFk,
      ...camposServicioempresaNuevoAdicionales,
      ...camposServicioempresaNuevoAuditoria,
    });

    logger.debug(line(), "servicioempresaCreated:", servicioempresaCreated);

    /* Registramos el acceso del usuario a la Empresa en la tabla usuario_servicio_empresa */

    let camposUsuarioservicioempresaNuevoFk = {};
    camposUsuarioservicioempresaNuevoFk._idusuario = usuarioConected._idusuario;
    camposUsuarioservicioempresaNuevoFk._idservicio = 1;
    camposUsuarioservicioempresaNuevoFk._idempresa = empresaCreated._idempresa;
    camposUsuarioservicioempresaNuevoFk._idusuarioservicioempresaestado = usuarioservicioempresaestado._idusuarioservicioempresaestado;
    camposUsuarioservicioempresaNuevoFk._idusuarioservicioempresarol = usuarioservicioempresarol._idusuarioservicioempresarol;

    let camposUsuarioservicioempresaNuevoAdicionales = {};
    camposUsuarioservicioempresaNuevoAdicionales.usuarioservicioempresaid = uuidv4();
    camposUsuarioservicioempresaNuevoAdicionales.code = uuidv4().split("-")[0];

    let camposUsuarioservicioempresaNuevoAuditoria = {};
    camposUsuarioservicioempresaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
    camposUsuarioservicioempresaNuevoAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposUsuarioservicioempresaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    camposUsuarioservicioempresaNuevoAuditoria.fechamod = Sequelize.fn("now", 3);
    camposUsuarioservicioempresaNuevoAuditoria.estado = 1;

    const usuarioservicioempresaCreated = await usuarioservicioempresaDao.insertUsuarioservicioempresa(transaction, {
      ...camposUsuarioservicioempresaNuevoFk,
      ...camposUsuarioservicioempresaNuevoAdicionales,
      ...camposUsuarioservicioempresaNuevoAuditoria,
    });

    logger.debug(line(), "usuarioservicioempresaCreated:", usuarioservicioempresaCreated);

    const ficharucCreated = await crearArchivoFichaRuc(req, transaction, usuarioservicioValidated, empresaCreated);
    logger.debug(line(), "ficharucCreated:", ficharucCreated);

    const reportetributarioCreated = await crearArchivoReporteTributarioParaTerceros(req, transaction, usuarioservicioValidated, empresaCreated);
    logger.debug(line(), "reportetributarioCreated:", reportetributarioCreated);

    const vigenciapoderCreated = await crearArchivoVigenciaPoderRepresentanteLegal(req, transaction, usuarioservicioValidated, colaboradorCreated);
    logger.debug(line(), "vigenciapoderCreated:", vigenciapoderCreated);

    const encabezadocuentabancariaCreated = await crearArchivoEncabezadoCuentaBancaria(req, transaction, usuarioservicioValidated, cuentabancariaCreated);
    logger.debug(line(), "encabezadocuentabancariaCreated:", encabezadocuentabancariaCreated);

    /* Registramos para la verificación del servicio_empresa en la tabla servicio_empresa_verificacion */
    const camposServicioempresaverificacionCreate = {};
    camposServicioempresaverificacionCreate.servicioempresaverificacionid = uuidv4();
    camposServicioempresaverificacionCreate._idservicioempresa = servicioempresaCreated._idservicioempresa;
    camposServicioempresaverificacionCreate._idservicioempresaestado = servicioempresaestado._idservicioempresaestado;
    camposServicioempresaverificacionCreate._idusuarioverifica = req.session_user?.usuario?._idusuario;
    camposServicioempresaverificacionCreate.comentariousuario = "";
    camposServicioempresaverificacionCreate.comentariointerno = "";
    camposServicioempresaverificacionCreate.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
    camposServicioempresaverificacionCreate.fechacrea = Sequelize.fn("now", 3);
    camposServicioempresaverificacionCreate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    camposServicioempresaverificacionCreate.fechamod = Sequelize.fn("now", 3);
    camposServicioempresaverificacionCreate.estado = 1;

    const servicioempresaverificacionCreated = await servicioempresaverificacionDao.insertServicioempresaverificacion(transaction, camposServicioempresaverificacionCreate);
    logger.debug(line(), "servicioempresaverificacionCreated:", servicioempresaverificacionCreated);

    /* Registramos para la verificación del usuario_servicio en la tabla usuario_servicio_verificacion */
    const camposUsuarioservicioverificacionCreate = {};
    camposUsuarioservicioverificacionCreate.usuarioservicioverificacionid = uuidv4();
    camposUsuarioservicioverificacionCreate._idusuarioservicio = usuarioservicio._idusuarioservicio;
    camposUsuarioservicioverificacionCreate._idusuarioservicioestado = usuarioservicioestado._idusuarioservicioestado;
    camposUsuarioservicioverificacionCreate._idusuarioverifica = req.session_user?.usuario?._idusuario;
    camposUsuarioservicioverificacionCreate.comentariousuario = "";
    camposUsuarioservicioverificacionCreate.comentariointerno = "";
    camposUsuarioservicioverificacionCreate.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
    camposUsuarioservicioverificacionCreate.fechacrea = Sequelize.fn("now", 3);
    camposUsuarioservicioverificacionCreate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    camposUsuarioservicioverificacionCreate.fechamod = Sequelize.fn("now", 3);
    camposUsuarioservicioverificacionCreate.estado = 1;

    const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(transaction, camposUsuarioservicioverificacionCreate);
    logger.debug(line(), "usuarioservicioverificacionCreated:", usuarioservicioverificacionCreated);

    /* Actualizamos el estado del usuario_servicio*/
    const camposUsuarioservicioUpdate = {};
    camposUsuarioservicioUpdate._idusuarioservicio = usuarioservicio._idusuarioservicio;
    camposUsuarioservicioUpdate.usuarioservicioid = usuarioservicio.usuarioservicioid;
    camposUsuarioservicioUpdate._idusuarioservicioestado = usuarioservicioestado._idusuarioservicioestado;
    camposUsuarioservicioUpdate.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
    camposUsuarioservicioUpdate.fechamod = Sequelize.fn("now", 3);

    const usuarioservicioUpdated = await usuarioservicioDao.updateUsuarioservicio(transaction, camposUsuarioservicioUpdate);
    logger.debug(line(), "usuarioservicioUpdated:", usuarioservicioUpdated);

    await transaction.commit();
    response(res, 200, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getUsuarioservicioMaster = async (req, res) => {
  logger.debug(line(), "controller::getUsuarioservicioMaster");
  const session_idusuario = req.session_user?.usuario?._idusuario;
  const { id } = req.params;
  const usuarioservicioSchema = yup
    .object()
    .shape({
      usuarioservicioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const usuarioservicioValidated = usuarioservicioSchema.validateSync({ usuarioservicioid: id }, { abortEarly: false, stripUnknown: true });

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];

    const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByUsuarioservicioid(transaction, usuarioservicioValidated.usuarioservicioid);
    const paises = await paisDao.getPaises(transaction, filter_estados);
    const distritos = await distritoDao.getDistritos(transaction, filter_estados);
    const bancos = await bancoDao.getBancos(transaction, filter_estados);
    const monedas = await monedaDao.getMonedas(transaction, filter_estados);
    const cuentatipos = await cuentatipoDao.getCuentatipos(transaction, filter_estados);

    let usuarioservicioMaster = {};
    usuarioservicioMaster.usuarioservicio = usuarioservicio;
    usuarioservicioMaster.paises = paises;
    usuarioservicioMaster.distritos = distritos;
    usuarioservicioMaster.bancos = bancos;
    usuarioservicioMaster.monedas = monedas;
    usuarioservicioMaster.cuentatipos = cuentatipos;

    let usuarioservicioMasterJSON = jsonUtils.sequelizeToJSON(usuarioservicioMaster);
    //jsonUtils.prettyPrint(usuarioservicioMasterJSON);
    let usuarioservicioMasterObfuscated = jsonUtils.ofuscarAtributosDefault(usuarioservicioMasterJSON);
    //jsonUtils.prettyPrint(usuarioservicioMasterObfuscated);
    let usuarioservicioMasterFiltered = jsonUtils.removeAttributesPrivates(usuarioservicioMasterObfuscated);
    //jsonUtils.prettyPrint(usuarioservicioMaster);
    await transaction.commit();
    response(res, 201, usuarioservicioMasterFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getUsuarioservicios = async (req, res) => {
  logger.debug(line(), "controller::getUsuarioservicios");
  const transaction = await sequelizeFT.transaction();
  try {
    //logger.info(line(),req.session_user.usuario._idusuario);

    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estado = [1];
    const usuarioservicios = await usuarioservicioDao.getUsuarioserviciosByIdusuario(transaction, session_idusuario, filter_estado);
    var usuarioserviciosJson = jsonUtils.sequelizeToJSON(usuarioservicios);
    //logger.info(line(),empresaObfuscated);

    var usuarioserviciosFiltered = jsonUtils.removeAttributes(usuarioserviciosJson, ["score"]);
    usuarioserviciosFiltered = jsonUtils.removeAttributesPrivates(usuarioserviciosFiltered);
    await transaction.commit();
    response(res, 201, usuarioserviciosFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

const crearArchivoEncabezadoCuentaBancaria = async (req, transaction, usuarioservicioValidated, cuentabancariaCreated) => {
  //Copiamos el archivo
  const { encabezado_cuenta_bancaria } = usuarioservicioValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = encabezado_cuenta_bancaria[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = encabezado_cuenta_bancaria[0];

  let camposArchivoNuevo = {
    archivoid: uuidv4(),
    _idarchivotipo: 7,
    _idarchivoestado: 1,
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
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  };
  const archivoCreated = await archivoDao.insertArchivo(transaction, camposArchivoNuevo);

  await archivocuentabancariaDao.insertArchivoCuentaBancaria(transaction, {
    _idarchivo: archivoCreated._idarchivo,
    _idcuentabancaria: cuentabancariaCreated._idcuentabancaria,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  });

  fs.unlinkSync(archivoOrigen);

  return archivoCreated;
};

const crearArchivoVigenciaPoderRepresentanteLegal = async (req, transaction, usuarioservicioValidated, colaboradorCreated) => {
  //Copiamos el archivo
  const { certificado_vigencia_poder } = usuarioservicioValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = certificado_vigencia_poder[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = certificado_vigencia_poder[0];

  let camposArchivoNuevo = {
    archivoid: uuidv4(),
    _idarchivotipo: 6,
    _idarchivoestado: 1,
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
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  };
  const archivoCreated = await archivoDao.insertArchivo(transaction, camposArchivoNuevo);

  await archivocolaboradorDao.insertArchivoColaborador(transaction, {
    _idarchivo: archivoCreated._idarchivo,
    _idcolaborador: colaboradorCreated._idcolaborador,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  });

  fs.unlinkSync(archivoOrigen);

  return archivoCreated;
};

const crearArchivoReporteTributarioParaTerceros = async (req, transaction, usuarioservicioValidated, empresaCreated) => {
  //Copiamos el archivo
  const { reporte_tributario_para_terceros } = usuarioservicioValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = reporte_tributario_para_terceros[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = reporte_tributario_para_terceros[0];

  let camposArchivoNuevo = {
    archivoid: uuidv4(),
    _idarchivotipo: 5,
    _idarchivoestado: 1,
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
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  };
  const archivoCreated = await archivoDao.insertArchivo(transaction, camposArchivoNuevo);

  await archivoempresaDao.insertArchivoEmpresa(transaction, {
    _idarchivo: archivoCreated._idarchivo,
    _idempresa: empresaCreated._idempresa,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  });

  fs.unlinkSync(archivoOrigen);

  return archivoCreated;
};

const crearArchivoFichaRuc = async (req, transaction, usuarioservicioValidated, empresaCreated) => {
  //Copiamos el archivo
  const { ficha_ruc } = usuarioservicioValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = ficha_ruc[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = ficha_ruc[0];

  let camposArchivoNuevo = {
    archivoid: uuidv4(),
    _idarchivotipo: 4,
    _idarchivoestado: 1,
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
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  };
  const archivoCreated = await archivoDao.insertArchivo(transaction, camposArchivoNuevo);

  await archivoempresaDao.insertArchivoEmpresa(transaction, {
    _idarchivo: archivoCreated._idarchivo,
    _idempresa: empresaCreated._idempresa,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  });

  fs.unlinkSync(archivoOrigen);

  return archivoCreated;
};
