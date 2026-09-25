import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as accionistaDao from "#root/src/daos/accionista.Dao.js";
import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as archivocolaboradorDao from "#root/src/daos/archivocolaborador.Dao.js";
import * as archivocuentabancariaDao from "#root/src/daos/archivocuentabancaria.Dao.js";
import * as archivoempresaDao from "#root/src/daos/archivoempresa.Dao.js";
import { ARCHIVO_TIPO } from "#root/src/daos/archivotipo.Dao.js";
import * as bancoDao from "#root/src/daos/banco.Dao.js";
import * as colaboradorDao from "#root/src/daos/colaborador.Dao.js";
import * as colaboradortipoDao from "#root/src/daos/colaboradortipo.Dao.js";
import * as cuentabancariaDao from "#root/src/daos/cuentabancaria.Dao.js";
import * as cuentabancariaestadoDao from "#root/src/daos/cuentabancariaestado.Dao.js";
import * as cuentatipoDao from "#root/src/daos/cuentatipo.Dao.js";
import * as distritoDao from "#root/src/daos/distrito.Dao.js";
import * as documentotipoDao from "#root/src/daos/documentotipo.Dao.js";
import * as empresaDao from "#root/src/daos/empresa.Dao.js";
import * as empresacuentabancariaDao from "#root/src/daos/empresacuentabancaria.Dao.js";
import * as empresadeclaracionDao from "#root/src/daos/empresadeclaracion.Dao.js";
import * as funcionarioDao from "#root/src/daos/funcionario.Dao.js";
import * as inversionistaDao from "#root/src/daos/inversionista.Dao.js";
import * as inversionistacuentabancariaDao from "#root/src/daos/inversionistacuentabancaria.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import * as paisDao from "#root/src/daos/pais.Dao.js";
import * as personaDao from "#root/src/daos/persona.Dao.js";
import * as provinciaDao from "#root/src/daos/provincia.Dao.js";
import * as servicioempresaDao from "#root/src/daos/servicioempresa.Dao.js";
import * as servicioempresaestadoDao from "#root/src/daos/servicioempresaestado.Dao.js";
import * as servicioempresaverificacionDao from "#root/src/daos/servicioempresaverificacion.Dao.js";
import * as servicioinversionistaDao from "#root/src/daos/servicioinversionista.Dao.js";
import * as servicioinversionistaestadoDao from "#root/src/daos/servicioinversionistaestado.Dao.js";
import * as servicioinversionistaverificacionDao from "#root/src/daos/servicioinversionistaverificacion.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import * as usuarioservicioDao from "#root/src/daos/usuarioservicio.Dao.js";
import * as usuarioservicioempresaDao from "#root/src/daos/usuarioservicioempresa.Dao.js";
import * as usuarioservicioempresaestadoDao from "#root/src/daos/usuarioservicioempresaestado.Dao.js";
import * as usuarioservicioempresarolDao from "#root/src/daos/usuarioservicioempresarol.Dao.js";
import * as usuarioservicioestadoDao from "#root/src/daos/usuarioservicioestado.Dao.js";
import * as usuarioservicioverificacionDao from "#root/src/daos/usuarioservicioverificacion.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { isProduction } from "#src/config.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as telegramService from "#src/providers/telegram/telegram.Provider.js";
import { newEmpresaVerificationMessage } from "#src/templates/telegram/usuarioservicio.Template.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Decimal } from "@prisma/client/runtime/library";
import { v4 as uuidv4 } from "uuid";

export interface SuscribirInversionistaPayload {
  idusuario: number;
  usuarioservicioid: string;
  personaid: string;
  bancoid: string;
  cuentatipoid: string;
  monedaid: string;
  numero: string;
  cci: string;
  alias: string;
  declaracion_conformidad_contrato: boolean;
  declaracion_datos_reales: boolean;
}

export interface SuscribirEmpresaPayload {
  idusuario: number;
  usuarioservicioid: string;
  ficha_ruc: string;
  reporte_tributario_para_terceros: string;
  certificado_vigencia_poder: string;
  encabezado_cuenta_bancaria: string;
  ruc: string;
  razon_social: string;
  paissedeid: string;
  distritosedeid: string;
  direccion_sede: string;
  direccion_sede_referencia: string;
  declaracion_representante_legal: boolean;
  cargo: string;
  poderpartidanumero: string;
  poderpartidaciudad: string;
  bancoid: string;
  cuentatipoid: string;
  monedaid: string;
  numero: string;
  cci: string;
  alias: string;
  accionistas: any[];
  funcionarios: any[];
  declaracion_accionistas_autorizacion_datos: boolean;
  declaracion_funcionarios_autorizacion_datos: boolean;
  declaracion_conformidad_contrato: boolean;
  declaracion_datos_reales: boolean;
}

export const suscribirUsuarioServicioFactoringInversionistaService = async (
  session_idusuario: number,
  usuarioservicioValidated: SuscribirInversionistaPayload,
) => {
  log.debug(line(), "service::suscribirUsuarioServicioFactoringInversionistaService");
  const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

  return await prismaFT.client.$transaction(
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
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
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
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
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
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
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
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioinversionistaCreated = await servicioinversionistaDao.insertServicioinversionista(tx, servicioinversionistaToCreate);
      log.debug(line(), "servicioinversionistaCreated:", servicioinversionistaCreated);

      /* Registramos para la verificación del servicio_inversionista en la tabla servicio_inversionista_verificacion */
      const servicioinversionistaverificacionToCreate: Prisma.servicio_inversionista_verificacionCreateInput = {
        servicio_inversionista: { connect: { idservicioinversionista: servicioinversionistaCreated.idservicioinversionista } },
        servicio_inversionista_estado: { connect: { idservicioinversionistaestado: servicioinversionistaestado.idservicioinversionistaestado } },
        usuario_verifica: { connect: { idusuario: session_idusuario } },
        comentariointerno: "",
        comentariousuario: "",
        servicioinversionistaverificacionid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioinversionistaverificacionCreated = await servicioinversionistaverificacionDao.insertServicioinversionistaverificacion(tx, servicioinversionistaverificacionToCreate);
      log.debug(line(), "servicioinversionistaverificacionCreated:", servicioinversionistaverificacionCreated);

      /* Registramos para la verificación del usuario_servicio en la tabla usuario_servicio_verificacion */
      const usuarioservicioverificacionToCreate: Prisma.usuario_servicio_verificacionCreateInput = {
        usuario_servicio: { connect: { idusuarioservicio: usuarioservicio.idusuarioservicio } },
        usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
        usuario_verifica: { connect: { idusuario: session_idusuario } },
        usuarioservicioverificacionid: uuidv4(),
        comentariousuario: "",
        comentariointerno: "",
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(tx, usuarioservicioverificacionToCreate);
      log.debug(line(), "usuarioservicioverificacionCreated:", usuarioservicioverificacionCreated);

      /* Actualizamos el estado del usuario_servicio*/
      const usuarioservicioToUpdate: Prisma.usuario_servicioUpdateInput = {
        usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
      };

      const usuarioservicioUpdated = await usuarioservicioDao.updateUsuarioservicio(tx, usuarioservicio.usuarioservicioid, usuarioservicioToUpdate);
      log.debug(line(), "usuarioservicioUpdated:", usuarioservicioUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const suscribirUsuarioServicioFactoringEmpresaService = async (
  session_idusuario: number,
  usuarioservicioValidated: SuscribirEmpresaPayload,
) => {
  log.debug(line(), "service::suscribirUsuarioServicioFactoringEmpresaService");
  const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

  return await prismaFT.client.$transaction(
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
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
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
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const empresadeclaracionCreated = await empresadeclaracionDao.insertEmpresadeclaracion(tx, empresadeclaracionToCreate);
      log.debug(line(), "empresadeclaracionCreated:", empresadeclaracionCreated);

      /* Registramos los accionistas */
      const accionistas = usuarioservicioValidated.accionistas;
      if (Array.isArray(accionistas)) {
        await crearAccionistasRecursivo(session_idusuario, tx, empresaCreated, accionistas);
      }

      /* Registramos los funcionarios */
      const funcionarios = usuarioservicioValidated.funcionarios;
      if (Array.isArray(funcionarios)) {
        await crearFuncionarios(session_idusuario, tx, empresaCreated, funcionarios);
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
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
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
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
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
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
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
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
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
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const usuarioservicioempresaCreated = await usuarioservicioempresaDao.insertUsuarioservicioempresa(tx, usuarioservicioempresaToCreate);
      log.debug(line(), "usuarioservicioempresaCreated:", usuarioservicioempresaCreated);

      const ficharucCreated = await vincularArchivoFichaRuc(session_idusuario, tx, ficharuc, empresaCreated);
      log.debug(line(), "ficharucCreated:", ficharucCreated);

      const reportetributarioCreated = await vincularArchivoReporteTributarioParaTerceros(session_idusuario, tx, reportetributario, empresaCreated);
      log.debug(line(), "reportetributarioCreated:", reportetributarioCreated);

      const vigenciapoderCreated = await vincularArchivoVigenciaPoderRepresentanteLegal(session_idusuario, tx, vigenciapoder, colaboradorCreated);
      log.debug(line(), "vigenciapoderCreated:", vigenciapoderCreated);

      const encabezadocuentabancariaCreated = await vincularArchivoEncabezadoCuentaBancaria(session_idusuario, tx, encabezadocuentabancaria, cuentabancariaCreated);
      log.debug(line(), "encabezadocuentabancariaCreated:", encabezadocuentabancariaCreated);

      /* Registramos para la verificación del servicio_empresa en la tabla servicio_empresa_verificacion */
      const servicioempresaverificacionToCreate: Prisma.servicio_empresa_verificacionCreateInput = {
        servicio_empresa: { connect: { idservicioempresa: servicioempresaCreated.idservicioempresa } },
        servicio_empresa_estado: { connect: { idservicioempresaestado: servicioempresaestado.idservicioempresaestado } },
        usuario_verifica: { connect: { idusuario: session_idusuario } },
        comentariointerno: "",
        comentariousuario: "",
        servicioempresaverificacionid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
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
          usuario_verifica: { connect: { idusuario: session_idusuario } },
          usuarioservicioverificacionid: uuidv4(),
          comentariousuario: "",
          comentariointerno: "",
          idusuariocrea: session_idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: session_idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const usuarioservicioverificacionCreated = await usuarioservicioverificacionDao.insertUsuarioservicioverificacion(tx, usuarioservicioverificacionToCreate);
        log.debug(line(), "usuarioservicioverificacionCreated:", usuarioservicioverificacionCreated);

        /* Actualizamos el estado del usuario_servicio*/
        const usuarioservicioToUpdate: Prisma.usuario_servicioUpdateInput = {
          usuario_servicio_estado: { connect: { idusuarioservicioestado: usuarioservicioestado.idusuarioservicioestado } },
          idusuariomod: session_idusuario ?? 1,
          fechamod: new Date(),
        };
        const usuarioservicioUpdated = await usuarioservicioDao.updateUsuarioservicio(tx, usuarioservicio.usuarioservicioid, usuarioservicioToUpdate);
        log.debug(line(), "usuarioservicioUpdated:", usuarioservicioUpdated);
      }

      const msnTelegram = newEmpresaVerificationMessage(empresaToCreate);
      telegramService.sendMessageImportant(msnTelegram);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getUsuarioservicioMasterService = async (session_idusuario: number, usuarioservicioid: string) => {
  log.debug(line(), "service::getUsuarioservicioMasterService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByUsuarioservicioid(tx, usuarioservicioid);
      const paises = await paisDao.getPaises(tx, filter_estados);
      const paisesperu = await paisDao.getPaisesPeru(tx);
      const distritos = await distritoDao.getDistritos(tx, filter_estados);
      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);
      const cuentatipos = await cuentatipoDao.getCuentatipos(tx, filter_estados);
      const documentotipos = await documentotipoDao.getDocumentotipos(tx, filter_estados);
      const persona = await personaDao.getPersonaByIdusuario(tx, session_idusuario);

      const usuarioservicioMaster: Record<string, any> = {
        usuarioservicio,
        paises,
        paisesperu,
        distritos,
        bancos,
        monedas,
        cuentatipos,
        documentotipos,
        persona,
      };

      return usuarioservicioMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getUsuarioserviciosService = async (session_idusuario: number) => {
  log.debug(line(), "service::getUsuarioserviciosService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO];
      const usuarioservicios = await usuarioservicioDao.getUsuarioserviciosByIdusuario(tx, session_idusuario, filter_estado);

      let usuarioserviciosFiltered = jsonUtils.removeAttributes(usuarioservicios, ["score"]);
      usuarioserviciosFiltered = jsonUtils.removeAttributesPrivates(usuarioserviciosFiltered);
      return usuarioserviciosFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

const vincularArchivoEncabezadoCuentaBancaria = async (idusuario: number, tx: any, archivo: any, cuentabancariaCreated: any) => {
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

const vincularArchivoVigenciaPoderRepresentanteLegal = async (idusuario: number, tx: any, archivo: any, colaboradorCreated: any) => {
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

const vincularArchivoReporteTributarioParaTerceros = async (idusuario: number, tx: any, archivo: any, empresaCreated: any) => {
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

const vincularArchivoFichaRuc = async (idusuario: number, tx: any, archivo: any, empresaCreated: any) => {
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

const crearAccionistasRecursivo = async (idusuario: number, tx: any, empresaCreated: any, accionistas: any[], idaccionista_padre: number | null = null) => {
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

      idusuariocrea: idusuario ?? 1,
      fechacrea: new Date(),
      idusuariomod: idusuario ?? 1,
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
      await crearAccionistasRecursivo(idusuario, tx, empresaCreated, acc.accionistas, accionistaCreated.idaccionista);
    }
  }
};

const crearFuncionarios = async (idusuario: number, tx: any, empresaCreated: any, funcionarios: any[]) => {
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
      idusuariocrea: idusuario ?? 1,
      fechacrea: new Date(),
      idusuariomod: idusuario ?? 1,
      fechamod: new Date(),
      estado: 1,
    };

    await funcionarioDao.insertFuncionario(tx, funcionarioToCreate);
  }
};
