import * as usuarioservicioDao from "../../daos/usuarioservicioDao.js";
import * as documentotipoDao from "../../daos/documentotipoDao.js";
import * as paisDao from "../../daos/paisDao.js";
import * as provinciaDao from "../../daos/provinciaDao.js";
import * as distritoDao from "../../daos/distritoDao.js";
import * as bancoDao from "../../daos/bancoDao.js";
import * as cuentatipoDao from "../../daos/cuentatipoDao.js";
import * as monedaDao from "../../daos/monedaDao.js";
import * as personaDao from "../../daos/personaDao.js";
import * as cuentabancariaDao from "../../daos/cuentabancariaDao.js";
import * as cuentabancariaestadoDao from "../../daos/cuentabancariaestadoDao.js";
import * as empresacuentabancariaDao from "../../daos/empresacuentabancariaDao.js";
import * as colaboradortipoDao from "../../daos/colaboradortipoDao.js";
import * as colaboradorDao from "../../daos/colaboradorDao.js";
import * as servicioempresaDao from "../../daos/servicioempresaDao.js";
import * as servicioempresaestadoDao from "../../daos/servicioempresaestadoDao.js";
import * as usuarioservicioempresaDao from "../../daos/usuarioservicioempresaDao.js";
import * as usuarioservicioempresaestadoDao from "../../daos/usuarioservicioempresaestadoDao.js";
import * as usuarioservicioempresarolDao from "../../daos/usuarioservicioempresarolDao.js";
import * as archivopersonaDao from "../../daos/archivopersonaDao.js";
import * as personaverificacionestadoDao from "../../daos/personaverificacionestadoDao.js";
import * as generoDao from "../../daos/generoDao.js";
import * as empresaDao from "../../daos/empresaDao.js";
import * as usuarioDao from "../../daos/usuarioDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import * as storageUtils from "../../utils/storageUtils.js";
import * as validacionesYup from "../../utils/validacionesYup.js";
import * as fs from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const suscribirEmpresaServicio = async (req, res) => {
  const _idusuario = req.session_user?.usuario?._idusuario;
  const filter_estado = [1, 2];
  const empresaservicioSuscripcionSchema = yup
    .object()
    .shape({
      _idusuario: yup.number().required(),
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
  const empresaservicioValidated = empresaservicioSuscripcionSchema.validateSync({ ...req.files, ...req.body, _idusuario }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresaservicioValidated:", empresaservicioValidated);

  const empresa = await empresaDao.getEmpresaByRuc(req, empresaservicioValidated.ruc);
  if (empresa && empresa.length > 0) {
    logger.warn(line(), "La empresa con RUC [" + empresaservicioValidated.ruc + "] ya se encuentra registrada.");
    throw new ClientError("La empresa con RUC [" + empresaservicioValidated.ruc + "] se encuentra registrada.", 404);
  }

  const paisSede = await paisDao.findPaisPk(req, empresaservicioValidated.paissedeid);
  if (!paisSede) {
    logger.warn(line(), "País de sede no existe: [" + empresaservicioValidated.paissedeid + "]");
    throw new ClientError("Datos no válidos", 404);
  }
  const distritoSede = await distritoDao.getDistritoByDistritoid(req, empresaservicioValidated.distritosedeid);
  if (!distritoSede) {
    logger.warn(line(), "Distrito de sede no existe: [" + empresaservicioValidated.distritosedeid + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const banco = await bancoDao.findBancoPk(req, empresaservicioValidated.bancoid);
  if (!banco) {
    logger.warn(line(), "Banco no existe: [" + empresaservicioValidated.bancoid + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const cuentatipo = await cuentatipoDao.findCuentatipoPk(req, empresaservicioValidated.cuentatipoid);
  if (!cuentatipo) {
    logger.warn(line(), "Cuenta tipo no existe: [" + empresaservicioValidated.cuentatipoid + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const moneda = await monedaDao.findMonedaPk(req, empresaservicioValidated.monedaid);
  if (!moneda) {
    logger.warn(line(), "Moneda no existe: [" + empresaservicioValidated.monedaid + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(req, banco._idbanco, empresaservicioValidated.numero, filter_estado);
  if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
    logger.warn(line(), "El número de cuenta [" + empresaservicioValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.");
    throw new ClientError("El número de cuenta [" + empresaservicioValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
  }

  if (!empresaservicioValidated.declaracion_representante_legal) {
    logger.warn(line(), "No aceptó la declaración de representante legal: [" + empresaservicioValidated.declaracion_representante_legal + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  if (!empresaservicioValidated.declaracion_conformidad_contrato) {
    logger.warn(line(), "No aceptó la declaración de conformidad del contrato: [" + empresaservicioValidated.declaracion_conformidad_contrato + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  if (!empresaservicioValidated.declaracion_datos_reales) {
    logger.warn(line(), "No aceptó la declaración de datos reales: [" + empresaservicioValidated.declaracion_datos_reales + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const colaboradorttipo_representante_legal = 1;
  const colaboradorttipo = await colaboradortipoDao.getColaboradortipoByIdcolaboradortipo(req, colaboradorttipo_representante_legal);
  if (!colaboradorttipo) {
    logger.warn(line(), "Colaborador tipo no existe: [" + colaboradorttipo_representante_legal + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const cuentabancariaestado_pendiente = 1;
  const cuentabancariaestado = await cuentabancariaestadoDao.getCuentaBancariaEstadoByIdcuentabancariaestado(req, cuentabancariaestado_pendiente);
  if (!cuentabancariaestado) {
    logger.warn(line(), "Cuenta bancaria estado no existe: [" + cuentabancariaestado_pendiente + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const servicioempresaestado_en_revision = 1;
  const servicioempresaestado = await servicioempresaestadoDao.getServicioempresaestadoByIdservicioempresaestado(req, servicioempresaestado_en_revision);
  if (!servicioempresaestado) {
    logger.warn(line(), "Servicio empresa estado no existe: [" + servicioempresaestado_en_revision + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioempresaestado_sin_acceso = 1;
  const usuarioservicioempresaestado = await usuarioservicioempresaestadoDao.getUsuarioservicioempresaestadoByIdusuarioservicioempresaestado(req, usuarioservicioempresaestado_sin_acceso);
  if (!usuarioservicioempresaestado) {
    logger.warn(line(), "Usuario servicio empresa estado no existe: [" + usuarioservicioempresaestado_sin_acceso + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  const usuarioservicioempresarol_administrador = 1;
  const usuarioservicioempresarol = await usuarioservicioempresarolDao.getUsuarioservicioempresarolByIdusuarioservicioempresarol(req, usuarioservicioempresarol_administrador);
  if (!usuarioservicioempresarol) {
    logger.warn(line(), "Usuario servicio empresa estado no existe: [" + usuarioservicioempresarol_administrador + "]");
    throw new ClientError("Datos no válidos", 404);
  }

  /* Creamos la Empresa */
  const provinciaResidencia = await provinciaDao.getProvinciaByIdprovincia(req, distritoSede._idprovincia);

  let camposEmpresaNuevo = {};
  camposEmpresaNuevo.ruc = empresaservicioValidated.ruc;
  camposEmpresaNuevo.razon_social = empresaservicioValidated.razon_social;
  camposEmpresaNuevo.direccion_sede = empresaservicioValidated.direccion_sede;
  camposEmpresaNuevo.direccion_sede_referencia = empresaservicioValidated.direccion_sede_referencia;

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

  const empresaCreated = await empresaDao.insertEmpresa(req, {
    ...camposEmpresaNuevo,
    ...camposEmpresaNuevoFk,
    ...camposEmpresaNuevoAdicionales,
    ...camposEmpresaNuevoAuditoria,
  });

  logger.debug(line(), "empresaCreated:", empresaCreated);

  /* Creamos el Colaborador con los datos del usuario cómo representante legal */
  const usuarioConected = await usuarioDao.getUsuarioByIdusuario(req, empresaservicioValidated._idusuario);
  const personaConected = await personaDao.getPersonaByIdusuario(req, empresaservicioValidated._idusuario);

  let camposColaboradorNuevo = {};
  camposColaboradorNuevo.documentonumero = personaConected.documentonumero;
  camposColaboradorNuevo.nombrecolaborador = personaConected.personanombres + " " + personaConected.apellidopaterno + " " + personaConected.apellidomaterno;
  camposColaboradorNuevo.cargo = empresaservicioValidated.cargo;
  camposColaboradorNuevo.email = personaConected.email;
  camposColaboradorNuevo.telefono = personaConected.celular;
  camposColaboradorNuevo.poderpartidanumero = empresaservicioValidated.poderpartidanumero;
  camposColaboradorNuevo.poderpartidaciudad = empresaservicioValidated.poderpartidaciudad;

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

  const colaboradorCreated = await colaboradorDao.insertColaborador(req, {
    ...camposColaboradorNuevo,
    ...camposColaboradorNuevoFk,
    ...camposColaboradorNuevoAdicionales,
    ...camposColaboradorNuevoAuditoria,
  });

  logger.debug(line(), "colaboradorCreated:", colaboradorCreated);

  /* Creamos la Cuenta Bancaria asociada a la Empresa */

  let camposCuentabancariaNuevo = {};
  camposCuentabancariaNuevo.numero = empresaservicioValidated.numero;
  camposCuentabancariaNuevo.cci = empresaservicioValidated.cci;
  camposCuentabancariaNuevo.alias = empresaservicioValidated.alias;

  let camposCuentabancariaNuevoFk = {};
  camposCuentabancariaNuevoFk._idbanco = banco._idbanco;
  camposCuentabancariaNuevoFk._idcuentatipo = cuentatipo._idcuentatipo;
  camposCuentabancariaNuevoFk._idmoneda = moneda._idmoneda;
  camposCuentabancariaNuevoFk._idcuentabancariaestado = cuentabancariaestado._idcuentabancariaestado;

  let camposCuentabancariaNuevoAdicionales = {};
  camposCuentabancariaNuevoAdicionales.cuentabancariaid = uuidv4();

  let camposCuentabancariaNuevoAuditoria = {};
  camposCuentabancariaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
  camposCuentabancariaNuevoAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposCuentabancariaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
  camposCuentabancariaNuevoAuditoria.fechamod = Sequelize.fn("now", 3);
  camposCuentabancariaNuevoAuditoria.estado = 1;

  const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(req, {
    ...camposCuentabancariaNuevo,
    ...camposCuentabancariaNuevoFk,
    ...camposCuentabancariaNuevoAdicionales,
    ...camposCuentabancariaNuevoAuditoria,
  });

  logger.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

  let camposEmpresacuentabancariaNuevoFk = {};
  camposEmpresacuentabancariaNuevoFk._idempresa = empresaCreated._idempresa;
  camposEmpresacuentabancariaNuevoFk._idcuentabancaria = cuentabancariaCreated._idcuentabancaria;

  let camposEmpresacuentabancariaNuevoAuditoria = {};
  camposEmpresacuentabancariaNuevoAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
  camposEmpresacuentabancariaNuevoAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposEmpresacuentabancariaNuevoAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
  camposEmpresacuentabancariaNuevoAuditoria.fechamod = Sequelize.fn("now", 3);
  camposEmpresacuentabancariaNuevoAuditoria.estado = 1;

  const empresacuentabancariaCreated = await empresacuentabancariaDao.insertEmpresacuentabancaria(req, {
    ...camposEmpresacuentabancariaNuevoFk,
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

  const servicioempresaCreated = await servicioempresaDao.insertServicioempresa(req, {
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

  const usuarioservicioempresaCreated = await usuarioservicioempresaDao.insertUsuarioservicioempresa(req, {
    ...camposUsuarioservicioempresaNuevoFk,
    ...camposUsuarioservicioempresaNuevoAdicionales,
    ...camposUsuarioservicioempresaNuevoAuditoria,
  });

  logger.debug(line(), "usuarioservicioempresaCreated:", usuarioservicioempresaCreated);

  /*

  //let personaCreated = { _idpersona: 4 };

  await usuarioDao.updateUsuario(req, {});

  const personaverificacionestado_en_revision = 3; // 3: En revisión
  const personaverificacionestado = await personaverificacionestadoDao.getPersonaverificacionestadoByIdpersonaverificacionestado(req, personaverificacionestado_en_revision);
  if (!personaverificacionestado) {
    logger.warn(line(), "Persona verificación estado no existe: [" + personaverificacionestado_en_revision + "]");
    throw new ClientError("Datos no válidos", 404);
  }
*/
  response(res, 200, {});
};
