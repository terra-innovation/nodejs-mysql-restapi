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

import { cuenta_bancaria } from "#src/models/prisma/ft_factoring/client";
import { inversionista_cuenta_bancaria } from "#src/models/prisma/ft_factoring/client";
import { usuario_servicio_verificacion } from "#src/models/prisma/ft_factoring/client";
import { usuario_servicio } from "#src/models/prisma/ft_factoring/client";
import { empresa } from "#src/models/prisma/ft_factoring/client";
import { colaborador } from "#src/models/prisma/ft_factoring/client";
import { empresa_cuenta_bancaria } from "#src/models/prisma/ft_factoring/client";
import { servicio_empresa } from "#src/models/prisma/ft_factoring/client";
import { usuario_servicio_empresa } from "#src/models/prisma/ft_factoring/client";
import { servicio_empresa_verificacion } from "#src/models/prisma/ft_factoring/client";

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
      const inversionistaToCreate: Prisma.inversionistaCreateInput = {
        persona: { connect: { idpersona: persona.idpersona } },
        inversionistaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
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
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
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
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };
      const imversionistacuentabancariaCreated = await inversionistacuentabancariaDao.insertInversionistacuentabancaria(tx, inversionistacuentabancariaToCreate);

      log.debug(line(), "imversionistacuentabancariaCreated:", imversionistacuentabancariaCreated);

      /* Registramos para la verificación del usuario_servicio en la tabla usuario_servicio_verificacion */

      const usuarioservicioverificacionToCreate: Prisma.usuario_servicio_verificacionCreateInput = {
        usuario_servicio: { connect: { idusuarioservicio: usuarioservicio.idusuarioservicio } },
        usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
        usuario_verifica: { connect: { idusuario: req.session_user?.usuario?._idusuario } },
        usuarioservicioverificacionid: uuidv4(),
        comentariousuario: "",
        comentariointerno: "",
        idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(tx, usuarioservicioverificacionToCreate);
      log.debug(line(), "usuarioservicioverificacionCreated:", usuarioservicioverificacionCreated);

      /* Actualizamos el estado del usuario_servicio*/
      const camposUsuarioservicioUpdate: Partial<usuario_servicio> = {};
      camposUsuarioservicioUpdate.idusuarioservicio = usuarioservicio.idusuarioservicio;
      camposUsuarioservicioUpdate.usuarioservicioid = usuarioservicio.usuarioservicioid;
      camposUsuarioservicioUpdate.idusuarioservicioestado = usuarioservicioestado.idusuarioservicioestado;
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
        idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const empresaCreated = await empresaDao.insertEmpresa(tx, empresaToCreate);

      log.debug(line(), "empresaCreated:", empresaCreated);

      /* Creamos el Colaborador con los datos del usuario cómo representante legal */
      const usuarioConected = await usuarioDao.getUsuarioByIdusuario(tx, usuarioservicioValidated._idusuario);
      const personaConected = await personaDao.getPersonaByIdusuario(tx, usuarioservicioValidated._idusuario);

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
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
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
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(tx, cuentabancariaToCreate);
      log.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

      const empresacuentabancariaToCreate: Prisma.empresa_cuenta_bancariaCreateInput = {
        empresa: { connect: { idempresa: empresa.idempresa } },
        cuenta_bancaria: { connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria } },
        empresacuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
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
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
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
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const usuarioservicioempresaCreated = await usuarioservicioempresaDao.insertUsuarioservicioempresa(tx, usuarioservicioempresaToCreate);

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
      const servicioempresaverificacionToCreate: Prisma.servicio_empresa_verificacionCreateInput = {
        servicio_empresa: { connect: { idservicioempresa: servicioempresaCreated.idservicioempresa } },
        servicio_empresa_estado: { connect: { idservicioempresaestado: servicioempresaestado.idservicioempresaestado } },
        usuario_verifica: { connect: { idusuario: req.session_user.usuario.idusuario } },
        comentariointerno: "",
        comentariousuario: "",
        servicioempresaverificacionid: uuidv4(),
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioempresaverificacionCreated = await servicioempresaverificacionDao.insertServicioempresaverificacion(tx, servicioempresaverificacionToCreate);
      log.debug(line(), "servicioempresaverificacionCreated:", servicioempresaverificacionCreated);

      /* Registramos para la verificación del usuario_servicio en la tabla usuario_servicio_verificacion */
      const usuarioservicioverificacionToCreate: Prisma.usuario_servicio_verificacionCreateInput = {
        usuario_servicio: { connect: { idusuarioservicio: usuarioservicio.idusuarioservicio } },
        usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
        usuario_verifica: { connect: { idusuario: req.session_user.usuario._idusuario } },
        usuarioservicioverificacionid: uuidv4(),
        comentariousuario: "",
        comentariointerno: "",
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(tx, usuarioservicioverificacionToCreate);
      log.debug(line(), "usuarioservicioverificacionCreated:", usuarioservicioverificacionCreated);

      /* Actualizamos el estado del usuario_servicio*/
      const camposUsuarioservicioUpdate: Partial<usuario_servicio> = {};
      camposUsuarioservicioUpdate.idusuarioservicio = usuarioservicio.idusuarioservicio;
      camposUsuarioservicioUpdate.usuarioservicioid = usuarioservicio.usuarioservicioid;
      camposUsuarioservicioUpdate.idusuarioservicioestado = usuarioservicioestado.idusuarioservicioestado;
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
