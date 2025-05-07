import type { Sequelize } from "sequelize";
import { Archivo as _Archivo } from './Archivo.js';
import type { ArchivoAttributes, ArchivoCreationAttributes } from './Archivo.js';
import { ArchivoColaborador as _ArchivoColaborador } from './ArchivoColaborador.js';
import type { ArchivoColaboradorAttributes, ArchivoColaboradorCreationAttributes } from './ArchivoColaborador.js';
import { ArchivoCuentaBancaria as _ArchivoCuentaBancaria } from './ArchivoCuentaBancaria.js';
import type { ArchivoCuentaBancariaAttributes, ArchivoCuentaBancariaCreationAttributes } from './ArchivoCuentaBancaria.js';
import { ArchivoEmpresa as _ArchivoEmpresa } from './ArchivoEmpresa.js';
import type { ArchivoEmpresaAttributes, ArchivoEmpresaCreationAttributes } from './ArchivoEmpresa.js';
import { ArchivoEstado as _ArchivoEstado } from './ArchivoEstado.js';
import type { ArchivoEstadoAttributes, ArchivoEstadoCreationAttributes } from './ArchivoEstado.js';
import { ArchivoFactoringHistorialEstado as _ArchivoFactoringHistorialEstado } from './ArchivoFactoringHistorialEstado.js';
import type { ArchivoFactoringHistorialEstadoAttributes, ArchivoFactoringHistorialEstadoCreationAttributes } from './ArchivoFactoringHistorialEstado.js';
import { ArchivoFactura as _ArchivoFactura } from './ArchivoFactura.js';
import type { ArchivoFacturaAttributes, ArchivoFacturaCreationAttributes } from './ArchivoFactura.js';
import { ArchivoInversionistaDeposito as _ArchivoInversionistaDeposito } from './ArchivoInversionistaDeposito.js';
import type { ArchivoInversionistaDepositoAttributes, ArchivoInversionistaDepositoCreationAttributes } from './ArchivoInversionistaDeposito.js';
import { ArchivoInversionistaRetiro as _ArchivoInversionistaRetiro } from './ArchivoInversionistaRetiro.js';
import type { ArchivoInversionistaRetiroAttributes, ArchivoInversionistaRetiroCreationAttributes } from './ArchivoInversionistaRetiro.js';
import { ArchivoPersona as _ArchivoPersona } from './ArchivoPersona.js';
import type { ArchivoPersonaAttributes, ArchivoPersonaCreationAttributes } from './ArchivoPersona.js';
import { ArchivoTipo as _ArchivoTipo } from './ArchivoTipo.js';
import type { ArchivoTipoAttributes, ArchivoTipoCreationAttributes } from './ArchivoTipo.js';
import { Banco as _Banco } from './Banco.js';
import type { BancoAttributes, BancoCreationAttributes } from './Banco.js';
import { BancoCuenta as _BancoCuenta } from './BancoCuenta.js';
import type { BancoCuentaAttributes, BancoCuentaCreationAttributes } from './BancoCuenta.js';
import { BancoCuentaEstado as _BancoCuentaEstado } from './BancoCuentaEstado.js';
import type { BancoCuentaEstadoAttributes, BancoCuentaEstadoCreationAttributes } from './BancoCuentaEstado.js';
import { BancoCuentaTipo as _BancoCuentaTipo } from './BancoCuentaTipo.js';
import type { BancoCuentaTipoAttributes, BancoCuentaTipoCreationAttributes } from './BancoCuentaTipo.js';
import { BancoTransaccion as _BancoTransaccion } from './BancoTransaccion.js';
import type { BancoTransaccionAttributes, BancoTransaccionCreationAttributes } from './BancoTransaccion.js';
import { BancoTransaccionEstado as _BancoTransaccionEstado } from './BancoTransaccionEstado.js';
import type { BancoTransaccionEstadoAttributes, BancoTransaccionEstadoCreationAttributes } from './BancoTransaccionEstado.js';
import { BancoTransaccionEstadoHistorial as _BancoTransaccionEstadoHistorial } from './BancoTransaccionEstadoHistorial.js';
import type { BancoTransaccionEstadoHistorialAttributes, BancoTransaccionEstadoHistorialCreationAttributes } from './BancoTransaccionEstadoHistorial.js';
import { BancoTransaccionFactoringInversion as _BancoTransaccionFactoringInversion } from './BancoTransaccionFactoringInversion.js';
import type { BancoTransaccionFactoringInversionAttributes, BancoTransaccionFactoringInversionCreationAttributes } from './BancoTransaccionFactoringInversion.js';
import { BancoTransaccionInversionistaDeposito as _BancoTransaccionInversionistaDeposito } from './BancoTransaccionInversionistaDeposito.js';
import type { BancoTransaccionInversionistaDepositoAttributes, BancoTransaccionInversionistaDepositoCreationAttributes } from './BancoTransaccionInversionistaDeposito.js';
import { BancoTransaccionInversionistaRetiro as _BancoTransaccionInversionistaRetiro } from './BancoTransaccionInversionistaRetiro.js';
import type { BancoTransaccionInversionistaRetiroAttributes, BancoTransaccionInversionistaRetiroCreationAttributes } from './BancoTransaccionInversionistaRetiro.js';
import { BancoTransaccionTipo as _BancoTransaccionTipo } from './BancoTransaccionTipo.js';
import type { BancoTransaccionTipoAttributes, BancoTransaccionTipoCreationAttributes } from './BancoTransaccionTipo.js';
import { Colaborador as _Colaborador } from './Colaborador.js';
import type { ColaboradorAttributes, ColaboradorCreationAttributes } from './Colaborador.js';
import { ColaboradorTipo as _ColaboradorTipo } from './ColaboradorTipo.js';
import type { ColaboradorTipoAttributes, ColaboradorTipoCreationAttributes } from './ColaboradorTipo.js';
import { ConfiguracionApp as _ConfiguracionApp } from './ConfiguracionApp.js';
import type { ConfiguracionAppAttributes, ConfiguracionAppCreationAttributes } from './ConfiguracionApp.js';
import { Contacto as _Contacto } from './Contacto.js';
import type { ContactoAttributes, ContactoCreationAttributes } from './Contacto.js';
import { Credencial as _Credencial } from './Credencial.js';
import type { CredencialAttributes, CredencialCreationAttributes } from './Credencial.js';
import { CuentaBancaria as _CuentaBancaria } from './CuentaBancaria.js';
import type { CuentaBancariaAttributes, CuentaBancariaCreationAttributes } from './CuentaBancaria.js';
import { CuentaBancariaEstado as _CuentaBancariaEstado } from './CuentaBancariaEstado.js';
import type { CuentaBancariaEstadoAttributes, CuentaBancariaEstadoCreationAttributes } from './CuentaBancariaEstado.js';
import { CuentaTipo as _CuentaTipo } from './CuentaTipo.js';
import type { CuentaTipoAttributes, CuentaTipoCreationAttributes } from './CuentaTipo.js';
import { Departamento as _Departamento } from './Departamento.js';
import type { DepartamentoAttributes, DepartamentoCreationAttributes } from './Departamento.js';
import { Distrito as _Distrito } from './Distrito.js';
import type { DistritoAttributes, DistritoCreationAttributes } from './Distrito.js';
import { DocumentoTipo as _DocumentoTipo } from './DocumentoTipo.js';
import type { DocumentoTipoAttributes, DocumentoTipoCreationAttributes } from './DocumentoTipo.js';
import { Empresa as _Empresa } from './Empresa.js';
import type { EmpresaAttributes, EmpresaCreationAttributes } from './Empresa.js';
import { EmpresaCuentaBancaria as _EmpresaCuentaBancaria } from './EmpresaCuentaBancaria.js';
import type { EmpresaCuentaBancariaAttributes, EmpresaCuentaBancariaCreationAttributes } from './EmpresaCuentaBancaria.js';
import { EmpresaDeclaracion as _EmpresaDeclaracion } from './EmpresaDeclaracion.js';
import type { EmpresaDeclaracionAttributes, EmpresaDeclaracionCreationAttributes } from './EmpresaDeclaracion.js';
import { Factor as _Factor } from './Factor.js';
import type { FactorAttributes, FactorCreationAttributes } from './Factor.js';
import { FactorCuentaBancaria as _FactorCuentaBancaria } from './FactorCuentaBancaria.js';
import type { FactorCuentaBancariaAttributes, FactorCuentaBancariaCreationAttributes } from './FactorCuentaBancaria.js';
import { Factoring as _Factoring } from './Factoring.js';
import type { FactoringAttributes, FactoringCreationAttributes } from './Factoring.js';
import { FactoringConfigComision as _FactoringConfigComision } from './FactoringConfigComision.js';
import type { FactoringConfigComisionAttributes, FactoringConfigComisionCreationAttributes } from './FactoringConfigComision.js';
import { FactoringConfigGarantia as _FactoringConfigGarantia } from './FactoringConfigGarantia.js';
import type { FactoringConfigGarantiaAttributes, FactoringConfigGarantiaCreationAttributes } from './FactoringConfigGarantia.js';
import { FactoringConfigTasaDescuento as _FactoringConfigTasaDescuento } from './FactoringConfigTasaDescuento.js';
import type { FactoringConfigTasaDescuentoAttributes, FactoringConfigTasaDescuentoCreationAttributes } from './FactoringConfigTasaDescuento.js';
import { FactoringEjecutado as _FactoringEjecutado } from './FactoringEjecutado.js';
import type { FactoringEjecutadoAttributes, FactoringEjecutadoCreationAttributes } from './FactoringEjecutado.js';
import { FactoringEjecutadoEstado as _FactoringEjecutadoEstado } from './FactoringEjecutadoEstado.js';
import type { FactoringEjecutadoEstadoAttributes, FactoringEjecutadoEstadoCreationAttributes } from './FactoringEjecutadoEstado.js';
import { FactoringEstado as _FactoringEstado } from './FactoringEstado.js';
import type { FactoringEstadoAttributes, FactoringEstadoCreationAttributes } from './FactoringEstado.js';
import { FactoringEstrategia as _FactoringEstrategia } from './FactoringEstrategia.js';
import type { FactoringEstrategiaAttributes, FactoringEstrategiaCreationAttributes } from './FactoringEstrategia.js';
import { FactoringFactura as _FactoringFactura } from './FactoringFactura.js';
import type { FactoringFacturaAttributes, FactoringFacturaCreationAttributes } from './FactoringFactura.js';
import { FactoringHistorialEstado as _FactoringHistorialEstado } from './FactoringHistorialEstado.js';
import type { FactoringHistorialEstadoAttributes, FactoringHistorialEstadoCreationAttributes } from './FactoringHistorialEstado.js';
import { FactoringInversion as _FactoringInversion } from './FactoringInversion.js';
import type { FactoringInversionAttributes, FactoringInversionCreationAttributes } from './FactoringInversion.js';
import { FactoringPago as _FactoringPago } from './FactoringPago.js';
import type { FactoringPagoAttributes, FactoringPagoCreationAttributes } from './FactoringPago.js';
import { FactoringPropuesta as _FactoringPropuesta } from './FactoringPropuesta.js';
import type { FactoringPropuestaAttributes, FactoringPropuestaCreationAttributes } from './FactoringPropuesta.js';
import { FactoringPropuestaEstado as _FactoringPropuestaEstado } from './FactoringPropuestaEstado.js';
import type { FactoringPropuestaEstadoAttributes, FactoringPropuestaEstadoCreationAttributes } from './FactoringPropuestaEstado.js';
import { FactoringPropuestaFinanciero as _FactoringPropuestaFinanciero } from './FactoringPropuestaFinanciero.js';
import type { FactoringPropuestaFinancieroAttributes, FactoringPropuestaFinancieroCreationAttributes } from './FactoringPropuestaFinanciero.js';
import { FactoringTipo as _FactoringTipo } from './FactoringTipo.js';
import type { FactoringTipoAttributes, FactoringTipoCreationAttributes } from './FactoringTipo.js';
import { Factura as _Factura } from './Factura.js';
import type { FacturaAttributes, FacturaCreationAttributes } from './Factura.js';
import { FacturaImpuesto as _FacturaImpuesto } from './FacturaImpuesto.js';
import type { FacturaImpuestoAttributes, FacturaImpuestoCreationAttributes } from './FacturaImpuesto.js';
import { FacturaItem as _FacturaItem } from './FacturaItem.js';
import type { FacturaItemAttributes, FacturaItemCreationAttributes } from './FacturaItem.js';
import { FacturaMedioPago as _FacturaMedioPago } from './FacturaMedioPago.js';
import type { FacturaMedioPagoAttributes, FacturaMedioPagoCreationAttributes } from './FacturaMedioPago.js';
import { FacturaNota as _FacturaNota } from './FacturaNota.js';
import type { FacturaNotaAttributes, FacturaNotaCreationAttributes } from './FacturaNota.js';
import { FacturaTerminoPago as _FacturaTerminoPago } from './FacturaTerminoPago.js';
import type { FacturaTerminoPagoAttributes, FacturaTerminoPagoCreationAttributes } from './FacturaTerminoPago.js';
import { FinancieroConcepto as _FinancieroConcepto } from './FinancieroConcepto.js';
import type { FinancieroConceptoAttributes, FinancieroConceptoCreationAttributes } from './FinancieroConcepto.js';
import { FinancieroTipo as _FinancieroTipo } from './FinancieroTipo.js';
import type { FinancieroTipoAttributes, FinancieroTipoCreationAttributes } from './FinancieroTipo.js';
import { Genero as _Genero } from './Genero.js';
import type { GeneroAttributes, GeneroCreationAttributes } from './Genero.js';
import { Inversionista as _Inversionista } from './Inversionista.js';
import type { InversionistaAttributes, InversionistaCreationAttributes } from './Inversionista.js';
import { InversionistaBancoCuenta as _InversionistaBancoCuenta } from './InversionistaBancoCuenta.js';
import type { InversionistaBancoCuentaAttributes, InversionistaBancoCuentaCreationAttributes } from './InversionistaBancoCuenta.js';
import { InversionistaCuentaBancaria as _InversionistaCuentaBancaria } from './InversionistaCuentaBancaria.js';
import type { InversionistaCuentaBancariaAttributes, InversionistaCuentaBancariaCreationAttributes } from './InversionistaCuentaBancaria.js';
import { InversionistaDeposito as _InversionistaDeposito } from './InversionistaDeposito.js';
import type { InversionistaDepositoAttributes, InversionistaDepositoCreationAttributes } from './InversionistaDeposito.js';
import { InversionistaRetiro as _InversionistaRetiro } from './InversionistaRetiro.js';
import type { InversionistaRetiroAttributes, InversionistaRetiroCreationAttributes } from './InversionistaRetiro.js';
import { Moneda as _Moneda } from './Moneda.js';
import type { MonedaAttributes, MonedaCreationAttributes } from './Moneda.js';
import { Pais as _Pais } from './Pais.js';
import type { PaisAttributes, PaisCreationAttributes } from './Pais.js';
import { PepVinculo as _PepVinculo } from './PepVinculo.js';
import type { PepVinculoAttributes, PepVinculoCreationAttributes } from './PepVinculo.js';
import { Persona as _Persona } from './Persona.js';
import type { PersonaAttributes, PersonaCreationAttributes } from './Persona.js';
import { PersonaCuentaBancaria as _PersonaCuentaBancaria } from './PersonaCuentaBancaria.js';
import type { PersonaCuentaBancariaAttributes, PersonaCuentaBancariaCreationAttributes } from './PersonaCuentaBancaria.js';
import { PersonaDeclaracion as _PersonaDeclaracion } from './PersonaDeclaracion.js';
import type { PersonaDeclaracionAttributes, PersonaDeclaracionCreationAttributes } from './PersonaDeclaracion.js';
import { PersonaPepDirecto as _PersonaPepDirecto } from './PersonaPepDirecto.js';
import type { PersonaPepDirectoAttributes, PersonaPepDirectoCreationAttributes } from './PersonaPepDirecto.js';
import { PersonaPepIndirecto as _PersonaPepIndirecto } from './PersonaPepIndirecto.js';
import type { PersonaPepIndirectoAttributes, PersonaPepIndirectoCreationAttributes } from './PersonaPepIndirecto.js';
import { PersonaVerificacion as _PersonaVerificacion } from './PersonaVerificacion.js';
import type { PersonaVerificacionAttributes, PersonaVerificacionCreationAttributes } from './PersonaVerificacion.js';
import { PersonaVerificacionEstado as _PersonaVerificacionEstado } from './PersonaVerificacionEstado.js';
import type { PersonaVerificacionEstadoAttributes, PersonaVerificacionEstadoCreationAttributes } from './PersonaVerificacionEstado.js';
import { Provincia as _Provincia } from './Provincia.js';
import type { ProvinciaAttributes, ProvinciaCreationAttributes } from './Provincia.js';
import { RegionNatural as _RegionNatural } from './RegionNatural.js';
import type { RegionNaturalAttributes, RegionNaturalCreationAttributes } from './RegionNatural.js';
import { Riesgo as _Riesgo } from './Riesgo.js';
import type { RiesgoAttributes, RiesgoCreationAttributes } from './Riesgo.js';
import { Rol as _Rol } from './Rol.js';
import type { RolAttributes, RolCreationAttributes } from './Rol.js';
import { Servicio as _Servicio } from './Servicio.js';
import type { ServicioAttributes, ServicioCreationAttributes } from './Servicio.js';
import { ServicioEmpresa as _ServicioEmpresa } from './ServicioEmpresa.js';
import type { ServicioEmpresaAttributes, ServicioEmpresaCreationAttributes } from './ServicioEmpresa.js';
import { ServicioEmpresaEstado as _ServicioEmpresaEstado } from './ServicioEmpresaEstado.js';
import type { ServicioEmpresaEstadoAttributes, ServicioEmpresaEstadoCreationAttributes } from './ServicioEmpresaEstado.js';
import { ServicioEmpresaVerificacion as _ServicioEmpresaVerificacion } from './ServicioEmpresaVerificacion.js';
import type { ServicioEmpresaVerificacionAttributes, ServicioEmpresaVerificacionCreationAttributes } from './ServicioEmpresaVerificacion.js';
import { Usuario as _Usuario } from './Usuario.js';
import type { UsuarioAttributes, UsuarioCreationAttributes } from './Usuario.js';
import { UsuarioRol as _UsuarioRol } from './UsuarioRol.js';
import type { UsuarioRolAttributes, UsuarioRolCreationAttributes } from './UsuarioRol.js';
import { UsuarioServicio as _UsuarioServicio } from './UsuarioServicio.js';
import type { UsuarioServicioAttributes, UsuarioServicioCreationAttributes } from './UsuarioServicio.js';
import { UsuarioServicioEmpresa as _UsuarioServicioEmpresa } from './UsuarioServicioEmpresa.js';
import type { UsuarioServicioEmpresaAttributes, UsuarioServicioEmpresaCreationAttributes } from './UsuarioServicioEmpresa.js';
import { UsuarioServicioEmpresaEstado as _UsuarioServicioEmpresaEstado } from './UsuarioServicioEmpresaEstado.js';
import type { UsuarioServicioEmpresaEstadoAttributes, UsuarioServicioEmpresaEstadoCreationAttributes } from './UsuarioServicioEmpresaEstado.js';
import { UsuarioServicioEmpresaRol as _UsuarioServicioEmpresaRol } from './UsuarioServicioEmpresaRol.js';
import type { UsuarioServicioEmpresaRolAttributes, UsuarioServicioEmpresaRolCreationAttributes } from './UsuarioServicioEmpresaRol.js';
import { UsuarioServicioEstado as _UsuarioServicioEstado } from './UsuarioServicioEstado.js';
import type { UsuarioServicioEstadoAttributes, UsuarioServicioEstadoCreationAttributes } from './UsuarioServicioEstado.js';
import { UsuarioServicioVerificacion as _UsuarioServicioVerificacion } from './UsuarioServicioVerificacion.js';
import type { UsuarioServicioVerificacionAttributes, UsuarioServicioVerificacionCreationAttributes } from './UsuarioServicioVerificacion.js';
import { Validacion as _Validacion } from './Validacion.js';
import type { ValidacionAttributes, ValidacionCreationAttributes } from './Validacion.js';
import { ValidacionTipo as _ValidacionTipo } from './ValidacionTipo.js';
import type { ValidacionTipoAttributes, ValidacionTipoCreationAttributes } from './ValidacionTipo.js';
import { ZlaboratorioPedido as _ZlaboratorioPedido } from './ZlaboratorioPedido.js';
import type { ZlaboratorioPedidoAttributes, ZlaboratorioPedidoCreationAttributes } from './ZlaboratorioPedido.js';
import { ZlaboratorioUsuario as _ZlaboratorioUsuario } from './ZlaboratorioUsuario.js';
import type { ZlaboratorioUsuarioAttributes, ZlaboratorioUsuarioCreationAttributes } from './ZlaboratorioUsuario.js';

export {
  _Archivo as Archivo,
  _ArchivoColaborador as ArchivoColaborador,
  _ArchivoCuentaBancaria as ArchivoCuentaBancaria,
  _ArchivoEmpresa as ArchivoEmpresa,
  _ArchivoEstado as ArchivoEstado,
  _ArchivoFactoringHistorialEstado as ArchivoFactoringHistorialEstado,
  _ArchivoFactura as ArchivoFactura,
  _ArchivoInversionistaDeposito as ArchivoInversionistaDeposito,
  _ArchivoInversionistaRetiro as ArchivoInversionistaRetiro,
  _ArchivoPersona as ArchivoPersona,
  _ArchivoTipo as ArchivoTipo,
  _Banco as Banco,
  _BancoCuenta as BancoCuenta,
  _BancoCuentaEstado as BancoCuentaEstado,
  _BancoCuentaTipo as BancoCuentaTipo,
  _BancoTransaccion as BancoTransaccion,
  _BancoTransaccionEstado as BancoTransaccionEstado,
  _BancoTransaccionEstadoHistorial as BancoTransaccionEstadoHistorial,
  _BancoTransaccionFactoringInversion as BancoTransaccionFactoringInversion,
  _BancoTransaccionInversionistaDeposito as BancoTransaccionInversionistaDeposito,
  _BancoTransaccionInversionistaRetiro as BancoTransaccionInversionistaRetiro,
  _BancoTransaccionTipo as BancoTransaccionTipo,
  _Colaborador as Colaborador,
  _ColaboradorTipo as ColaboradorTipo,
  _ConfiguracionApp as ConfiguracionApp,
  _Contacto as Contacto,
  _Credencial as Credencial,
  _CuentaBancaria as CuentaBancaria,
  _CuentaBancariaEstado as CuentaBancariaEstado,
  _CuentaTipo as CuentaTipo,
  _Departamento as Departamento,
  _Distrito as Distrito,
  _DocumentoTipo as DocumentoTipo,
  _Empresa as Empresa,
  _EmpresaCuentaBancaria as EmpresaCuentaBancaria,
  _EmpresaDeclaracion as EmpresaDeclaracion,
  _Factor as Factor,
  _FactorCuentaBancaria as FactorCuentaBancaria,
  _Factoring as Factoring,
  _FactoringConfigComision as FactoringConfigComision,
  _FactoringConfigGarantia as FactoringConfigGarantia,
  _FactoringConfigTasaDescuento as FactoringConfigTasaDescuento,
  _FactoringEjecutado as FactoringEjecutado,
  _FactoringEjecutadoEstado as FactoringEjecutadoEstado,
  _FactoringEstado as FactoringEstado,
  _FactoringEstrategia as FactoringEstrategia,
  _FactoringFactura as FactoringFactura,
  _FactoringHistorialEstado as FactoringHistorialEstado,
  _FactoringInversion as FactoringInversion,
  _FactoringPago as FactoringPago,
  _FactoringPropuesta as FactoringPropuesta,
  _FactoringPropuestaEstado as FactoringPropuestaEstado,
  _FactoringPropuestaFinanciero as FactoringPropuestaFinanciero,
  _FactoringTipo as FactoringTipo,
  _Factura as Factura,
  _FacturaImpuesto as FacturaImpuesto,
  _FacturaItem as FacturaItem,
  _FacturaMedioPago as FacturaMedioPago,
  _FacturaNota as FacturaNota,
  _FacturaTerminoPago as FacturaTerminoPago,
  _FinancieroConcepto as FinancieroConcepto,
  _FinancieroTipo as FinancieroTipo,
  _Genero as Genero,
  _Inversionista as Inversionista,
  _InversionistaBancoCuenta as InversionistaBancoCuenta,
  _InversionistaCuentaBancaria as InversionistaCuentaBancaria,
  _InversionistaDeposito as InversionistaDeposito,
  _InversionistaRetiro as InversionistaRetiro,
  _Moneda as Moneda,
  _Pais as Pais,
  _PepVinculo as PepVinculo,
  _Persona as Persona,
  _PersonaCuentaBancaria as PersonaCuentaBancaria,
  _PersonaDeclaracion as PersonaDeclaracion,
  _PersonaPepDirecto as PersonaPepDirecto,
  _PersonaPepIndirecto as PersonaPepIndirecto,
  _PersonaVerificacion as PersonaVerificacion,
  _PersonaVerificacionEstado as PersonaVerificacionEstado,
  _Provincia as Provincia,
  _RegionNatural as RegionNatural,
  _Riesgo as Riesgo,
  _Rol as Rol,
  _Servicio as Servicio,
  _ServicioEmpresa as ServicioEmpresa,
  _ServicioEmpresaEstado as ServicioEmpresaEstado,
  _ServicioEmpresaVerificacion as ServicioEmpresaVerificacion,
  _Usuario as Usuario,
  _UsuarioRol as UsuarioRol,
  _UsuarioServicio as UsuarioServicio,
  _UsuarioServicioEmpresa as UsuarioServicioEmpresa,
  _UsuarioServicioEmpresaEstado as UsuarioServicioEmpresaEstado,
  _UsuarioServicioEmpresaRol as UsuarioServicioEmpresaRol,
  _UsuarioServicioEstado as UsuarioServicioEstado,
  _UsuarioServicioVerificacion as UsuarioServicioVerificacion,
  _Validacion as Validacion,
  _ValidacionTipo as ValidacionTipo,
  _ZlaboratorioPedido as ZlaboratorioPedido,
  _ZlaboratorioUsuario as ZlaboratorioUsuario,
};

export type {
  ArchivoAttributes,
  ArchivoCreationAttributes,
  ArchivoColaboradorAttributes,
  ArchivoColaboradorCreationAttributes,
  ArchivoCuentaBancariaAttributes,
  ArchivoCuentaBancariaCreationAttributes,
  ArchivoEmpresaAttributes,
  ArchivoEmpresaCreationAttributes,
  ArchivoEstadoAttributes,
  ArchivoEstadoCreationAttributes,
  ArchivoFactoringHistorialEstadoAttributes,
  ArchivoFactoringHistorialEstadoCreationAttributes,
  ArchivoFacturaAttributes,
  ArchivoFacturaCreationAttributes,
  ArchivoInversionistaDepositoAttributes,
  ArchivoInversionistaDepositoCreationAttributes,
  ArchivoInversionistaRetiroAttributes,
  ArchivoInversionistaRetiroCreationAttributes,
  ArchivoPersonaAttributes,
  ArchivoPersonaCreationAttributes,
  ArchivoTipoAttributes,
  ArchivoTipoCreationAttributes,
  BancoAttributes,
  BancoCreationAttributes,
  BancoCuentaAttributes,
  BancoCuentaCreationAttributes,
  BancoCuentaEstadoAttributes,
  BancoCuentaEstadoCreationAttributes,
  BancoCuentaTipoAttributes,
  BancoCuentaTipoCreationAttributes,
  BancoTransaccionAttributes,
  BancoTransaccionCreationAttributes,
  BancoTransaccionEstadoAttributes,
  BancoTransaccionEstadoCreationAttributes,
  BancoTransaccionEstadoHistorialAttributes,
  BancoTransaccionEstadoHistorialCreationAttributes,
  BancoTransaccionFactoringInversionAttributes,
  BancoTransaccionFactoringInversionCreationAttributes,
  BancoTransaccionInversionistaDepositoAttributes,
  BancoTransaccionInversionistaDepositoCreationAttributes,
  BancoTransaccionInversionistaRetiroAttributes,
  BancoTransaccionInversionistaRetiroCreationAttributes,
  BancoTransaccionTipoAttributes,
  BancoTransaccionTipoCreationAttributes,
  ColaboradorAttributes,
  ColaboradorCreationAttributes,
  ColaboradorTipoAttributes,
  ColaboradorTipoCreationAttributes,
  ConfiguracionAppAttributes,
  ConfiguracionAppCreationAttributes,
  ContactoAttributes,
  ContactoCreationAttributes,
  CredencialAttributes,
  CredencialCreationAttributes,
  CuentaBancariaAttributes,
  CuentaBancariaCreationAttributes,
  CuentaBancariaEstadoAttributes,
  CuentaBancariaEstadoCreationAttributes,
  CuentaTipoAttributes,
  CuentaTipoCreationAttributes,
  DepartamentoAttributes,
  DepartamentoCreationAttributes,
  DistritoAttributes,
  DistritoCreationAttributes,
  DocumentoTipoAttributes,
  DocumentoTipoCreationAttributes,
  EmpresaAttributes,
  EmpresaCreationAttributes,
  EmpresaCuentaBancariaAttributes,
  EmpresaCuentaBancariaCreationAttributes,
  EmpresaDeclaracionAttributes,
  EmpresaDeclaracionCreationAttributes,
  FactorAttributes,
  FactorCreationAttributes,
  FactorCuentaBancariaAttributes,
  FactorCuentaBancariaCreationAttributes,
  FactoringAttributes,
  FactoringCreationAttributes,
  FactoringConfigComisionAttributes,
  FactoringConfigComisionCreationAttributes,
  FactoringConfigGarantiaAttributes,
  FactoringConfigGarantiaCreationAttributes,
  FactoringConfigTasaDescuentoAttributes,
  FactoringConfigTasaDescuentoCreationAttributes,
  FactoringEjecutadoAttributes,
  FactoringEjecutadoCreationAttributes,
  FactoringEjecutadoEstadoAttributes,
  FactoringEjecutadoEstadoCreationAttributes,
  FactoringEstadoAttributes,
  FactoringEstadoCreationAttributes,
  FactoringEstrategiaAttributes,
  FactoringEstrategiaCreationAttributes,
  FactoringFacturaAttributes,
  FactoringFacturaCreationAttributes,
  FactoringHistorialEstadoAttributes,
  FactoringHistorialEstadoCreationAttributes,
  FactoringInversionAttributes,
  FactoringInversionCreationAttributes,
  FactoringPagoAttributes,
  FactoringPagoCreationAttributes,
  FactoringPropuestaAttributes,
  FactoringPropuestaCreationAttributes,
  FactoringPropuestaEstadoAttributes,
  FactoringPropuestaEstadoCreationAttributes,
  FactoringPropuestaFinancieroAttributes,
  FactoringPropuestaFinancieroCreationAttributes,
  FactoringTipoAttributes,
  FactoringTipoCreationAttributes,
  FacturaAttributes,
  FacturaCreationAttributes,
  FacturaImpuestoAttributes,
  FacturaImpuestoCreationAttributes,
  FacturaItemAttributes,
  FacturaItemCreationAttributes,
  FacturaMedioPagoAttributes,
  FacturaMedioPagoCreationAttributes,
  FacturaNotaAttributes,
  FacturaNotaCreationAttributes,
  FacturaTerminoPagoAttributes,
  FacturaTerminoPagoCreationAttributes,
  FinancieroConceptoAttributes,
  FinancieroConceptoCreationAttributes,
  FinancieroTipoAttributes,
  FinancieroTipoCreationAttributes,
  GeneroAttributes,
  GeneroCreationAttributes,
  InversionistaAttributes,
  InversionistaCreationAttributes,
  InversionistaBancoCuentaAttributes,
  InversionistaBancoCuentaCreationAttributes,
  InversionistaCuentaBancariaAttributes,
  InversionistaCuentaBancariaCreationAttributes,
  InversionistaDepositoAttributes,
  InversionistaDepositoCreationAttributes,
  InversionistaRetiroAttributes,
  InversionistaRetiroCreationAttributes,
  MonedaAttributes,
  MonedaCreationAttributes,
  PaisAttributes,
  PaisCreationAttributes,
  PepVinculoAttributes,
  PepVinculoCreationAttributes,
  PersonaAttributes,
  PersonaCreationAttributes,
  PersonaCuentaBancariaAttributes,
  PersonaCuentaBancariaCreationAttributes,
  PersonaDeclaracionAttributes,
  PersonaDeclaracionCreationAttributes,
  PersonaPepDirectoAttributes,
  PersonaPepDirectoCreationAttributes,
  PersonaPepIndirectoAttributes,
  PersonaPepIndirectoCreationAttributes,
  PersonaVerificacionAttributes,
  PersonaVerificacionCreationAttributes,
  PersonaVerificacionEstadoAttributes,
  PersonaVerificacionEstadoCreationAttributes,
  ProvinciaAttributes,
  ProvinciaCreationAttributes,
  RegionNaturalAttributes,
  RegionNaturalCreationAttributes,
  RiesgoAttributes,
  RiesgoCreationAttributes,
  RolAttributes,
  RolCreationAttributes,
  ServicioAttributes,
  ServicioCreationAttributes,
  ServicioEmpresaAttributes,
  ServicioEmpresaCreationAttributes,
  ServicioEmpresaEstadoAttributes,
  ServicioEmpresaEstadoCreationAttributes,
  ServicioEmpresaVerificacionAttributes,
  ServicioEmpresaVerificacionCreationAttributes,
  UsuarioAttributes,
  UsuarioCreationAttributes,
  UsuarioRolAttributes,
  UsuarioRolCreationAttributes,
  UsuarioServicioAttributes,
  UsuarioServicioCreationAttributes,
  UsuarioServicioEmpresaAttributes,
  UsuarioServicioEmpresaCreationAttributes,
  UsuarioServicioEmpresaEstadoAttributes,
  UsuarioServicioEmpresaEstadoCreationAttributes,
  UsuarioServicioEmpresaRolAttributes,
  UsuarioServicioEmpresaRolCreationAttributes,
  UsuarioServicioEstadoAttributes,
  UsuarioServicioEstadoCreationAttributes,
  UsuarioServicioVerificacionAttributes,
  UsuarioServicioVerificacionCreationAttributes,
  ValidacionAttributes,
  ValidacionCreationAttributes,
  ValidacionTipoAttributes,
  ValidacionTipoCreationAttributes,
  ZlaboratorioPedidoAttributes,
  ZlaboratorioPedidoCreationAttributes,
  ZlaboratorioUsuarioAttributes,
  ZlaboratorioUsuarioCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const Archivo = _Archivo.initModel(sequelize);
  const ArchivoColaborador = _ArchivoColaborador.initModel(sequelize);
  const ArchivoCuentaBancaria = _ArchivoCuentaBancaria.initModel(sequelize);
  const ArchivoEmpresa = _ArchivoEmpresa.initModel(sequelize);
  const ArchivoEstado = _ArchivoEstado.initModel(sequelize);
  const ArchivoFactoringHistorialEstado = _ArchivoFactoringHistorialEstado.initModel(sequelize);
  const ArchivoFactura = _ArchivoFactura.initModel(sequelize);
  const ArchivoInversionistaDeposito = _ArchivoInversionistaDeposito.initModel(sequelize);
  const ArchivoInversionistaRetiro = _ArchivoInversionistaRetiro.initModel(sequelize);
  const ArchivoPersona = _ArchivoPersona.initModel(sequelize);
  const ArchivoTipo = _ArchivoTipo.initModel(sequelize);
  const Banco = _Banco.initModel(sequelize);
  const BancoCuenta = _BancoCuenta.initModel(sequelize);
  const BancoCuentaEstado = _BancoCuentaEstado.initModel(sequelize);
  const BancoCuentaTipo = _BancoCuentaTipo.initModel(sequelize);
  const BancoTransaccion = _BancoTransaccion.initModel(sequelize);
  const BancoTransaccionEstado = _BancoTransaccionEstado.initModel(sequelize);
  const BancoTransaccionEstadoHistorial = _BancoTransaccionEstadoHistorial.initModel(sequelize);
  const BancoTransaccionFactoringInversion = _BancoTransaccionFactoringInversion.initModel(sequelize);
  const BancoTransaccionInversionistaDeposito = _BancoTransaccionInversionistaDeposito.initModel(sequelize);
  const BancoTransaccionInversionistaRetiro = _BancoTransaccionInversionistaRetiro.initModel(sequelize);
  const BancoTransaccionTipo = _BancoTransaccionTipo.initModel(sequelize);
  const Colaborador = _Colaborador.initModel(sequelize);
  const ColaboradorTipo = _ColaboradorTipo.initModel(sequelize);
  const ConfiguracionApp = _ConfiguracionApp.initModel(sequelize);
  const Contacto = _Contacto.initModel(sequelize);
  const Credencial = _Credencial.initModel(sequelize);
  const CuentaBancaria = _CuentaBancaria.initModel(sequelize);
  const CuentaBancariaEstado = _CuentaBancariaEstado.initModel(sequelize);
  const CuentaTipo = _CuentaTipo.initModel(sequelize);
  const Departamento = _Departamento.initModel(sequelize);
  const Distrito = _Distrito.initModel(sequelize);
  const DocumentoTipo = _DocumentoTipo.initModel(sequelize);
  const Empresa = _Empresa.initModel(sequelize);
  const EmpresaCuentaBancaria = _EmpresaCuentaBancaria.initModel(sequelize);
  const EmpresaDeclaracion = _EmpresaDeclaracion.initModel(sequelize);
  const Factor = _Factor.initModel(sequelize);
  const FactorCuentaBancaria = _FactorCuentaBancaria.initModel(sequelize);
  const Factoring = _Factoring.initModel(sequelize);
  const FactoringConfigComision = _FactoringConfigComision.initModel(sequelize);
  const FactoringConfigGarantia = _FactoringConfigGarantia.initModel(sequelize);
  const FactoringConfigTasaDescuento = _FactoringConfigTasaDescuento.initModel(sequelize);
  const FactoringEjecutado = _FactoringEjecutado.initModel(sequelize);
  const FactoringEjecutadoEstado = _FactoringEjecutadoEstado.initModel(sequelize);
  const FactoringEstado = _FactoringEstado.initModel(sequelize);
  const FactoringEstrategia = _FactoringEstrategia.initModel(sequelize);
  const FactoringFactura = _FactoringFactura.initModel(sequelize);
  const FactoringHistorialEstado = _FactoringHistorialEstado.initModel(sequelize);
  const FactoringInversion = _FactoringInversion.initModel(sequelize);
  const FactoringPago = _FactoringPago.initModel(sequelize);
  const FactoringPropuesta = _FactoringPropuesta.initModel(sequelize);
  const FactoringPropuestaEstado = _FactoringPropuestaEstado.initModel(sequelize);
  const FactoringPropuestaFinanciero = _FactoringPropuestaFinanciero.initModel(sequelize);
  const FactoringTipo = _FactoringTipo.initModel(sequelize);
  const Factura = _Factura.initModel(sequelize);
  const FacturaImpuesto = _FacturaImpuesto.initModel(sequelize);
  const FacturaItem = _FacturaItem.initModel(sequelize);
  const FacturaMedioPago = _FacturaMedioPago.initModel(sequelize);
  const FacturaNota = _FacturaNota.initModel(sequelize);
  const FacturaTerminoPago = _FacturaTerminoPago.initModel(sequelize);
  const FinancieroConcepto = _FinancieroConcepto.initModel(sequelize);
  const FinancieroTipo = _FinancieroTipo.initModel(sequelize);
  const Genero = _Genero.initModel(sequelize);
  const Inversionista = _Inversionista.initModel(sequelize);
  const InversionistaBancoCuenta = _InversionistaBancoCuenta.initModel(sequelize);
  const InversionistaCuentaBancaria = _InversionistaCuentaBancaria.initModel(sequelize);
  const InversionistaDeposito = _InversionistaDeposito.initModel(sequelize);
  const InversionistaRetiro = _InversionistaRetiro.initModel(sequelize);
  const Moneda = _Moneda.initModel(sequelize);
  const Pais = _Pais.initModel(sequelize);
  const PepVinculo = _PepVinculo.initModel(sequelize);
  const Persona = _Persona.initModel(sequelize);
  const PersonaCuentaBancaria = _PersonaCuentaBancaria.initModel(sequelize);
  const PersonaDeclaracion = _PersonaDeclaracion.initModel(sequelize);
  const PersonaPepDirecto = _PersonaPepDirecto.initModel(sequelize);
  const PersonaPepIndirecto = _PersonaPepIndirecto.initModel(sequelize);
  const PersonaVerificacion = _PersonaVerificacion.initModel(sequelize);
  const PersonaVerificacionEstado = _PersonaVerificacionEstado.initModel(sequelize);
  const Provincia = _Provincia.initModel(sequelize);
  const RegionNatural = _RegionNatural.initModel(sequelize);
  const Riesgo = _Riesgo.initModel(sequelize);
  const Rol = _Rol.initModel(sequelize);
  const Servicio = _Servicio.initModel(sequelize);
  const ServicioEmpresa = _ServicioEmpresa.initModel(sequelize);
  const ServicioEmpresaEstado = _ServicioEmpresaEstado.initModel(sequelize);
  const ServicioEmpresaVerificacion = _ServicioEmpresaVerificacion.initModel(sequelize);
  const Usuario = _Usuario.initModel(sequelize);
  const UsuarioRol = _UsuarioRol.initModel(sequelize);
  const UsuarioServicio = _UsuarioServicio.initModel(sequelize);
  const UsuarioServicioEmpresa = _UsuarioServicioEmpresa.initModel(sequelize);
  const UsuarioServicioEmpresaEstado = _UsuarioServicioEmpresaEstado.initModel(sequelize);
  const UsuarioServicioEmpresaRol = _UsuarioServicioEmpresaRol.initModel(sequelize);
  const UsuarioServicioEstado = _UsuarioServicioEstado.initModel(sequelize);
  const UsuarioServicioVerificacion = _UsuarioServicioVerificacion.initModel(sequelize);
  const Validacion = _Validacion.initModel(sequelize);
  const ValidacionTipo = _ValidacionTipo.initModel(sequelize);
  const ZlaboratorioPedido = _ZlaboratorioPedido.initModel(sequelize);
  const ZlaboratorioUsuario = _ZlaboratorioUsuario.initModel(sequelize);

  Archivo.belongsToMany(Colaborador, { as: "colaborador_colaboradors", through: ArchivoColaborador, foreignKey: "_idarchivo", otherKey: "_idcolaborador" });
  Archivo.belongsToMany(CuentaBancaria, { as: "cuentabancaria_cuenta_bancaria", through: ArchivoCuentaBancaria, foreignKey: "_idarchivo", otherKey: "_idcuentabancaria" });
  Archivo.belongsToMany(Empresa, { as: "empresa_empresas", through: ArchivoEmpresa, foreignKey: "_idarchivo", otherKey: "_idempresa" });
  Archivo.belongsToMany(FactoringHistorialEstado, { as: "factoringhistorialestado_factoring_historial_estados", through: ArchivoFactoringHistorialEstado, foreignKey: "_idarchivo", otherKey: "_idfactoringhistorialestado" });
  Archivo.belongsToMany(Factura, { as: "factura_facturas", through: ArchivoFactura, foreignKey: "_idarchivo", otherKey: "_idfactura" });
  Archivo.belongsToMany(InversionistaDeposito, { as: "inversionistadeposito_inversionista_depositos", through: ArchivoInversionistaDeposito, foreignKey: "_idarchivo", otherKey: "_idinversionistadeposito" });
  Archivo.belongsToMany(InversionistaRetiro, { as: "inversionistaretiro_inversionista_retiros", through: ArchivoInversionistaRetiro, foreignKey: "_idarchivo", otherKey: "_idinversionistaretiro" });
  Archivo.belongsToMany(Persona, { as: "persona_personas", through: ArchivoPersona, foreignKey: "_idarchivo", otherKey: "_idpersona" });
  BancoCuenta.belongsToMany(Inversionista, { as: "inversionista_inversionista", through: InversionistaBancoCuenta, foreignKey: "_idbancocuenta", otherKey: "_idinversionista" });
  BancoTransaccion.belongsToMany(FactoringInversion, { as: "factoringinversion_factoring_inversions", through: BancoTransaccionFactoringInversion, foreignKey: "_idbancotransaccion", otherKey: "_idfactoringinversion" });
  BancoTransaccion.belongsToMany(InversionistaDeposito, { as: "inversionistadeposito_inversionista_deposito_banco_transaccion_inversionista_depositos", through: BancoTransaccionInversionistaDeposito, foreignKey: "_idbancotransaccion", otherKey: "_idinversionistadeposito" });
  BancoTransaccion.belongsToMany(InversionistaRetiro, { as: "inversionistaretiro_inversionista_retiro_banco_transaccion_inversionista_retiros", through: BancoTransaccionInversionistaRetiro, foreignKey: "_idbancotransaccion", otherKey: "_idinversionistaretiro" });
  Colaborador.belongsToMany(Archivo, { as: "archivo_archivos", through: ArchivoColaborador, foreignKey: "_idcolaborador", otherKey: "_idarchivo" });
  CuentaBancaria.belongsToMany(Archivo, { as: "archivo_archivo_archivo_cuenta_bancaria", through: ArchivoCuentaBancaria, foreignKey: "_idcuentabancaria", otherKey: "_idarchivo" });
  Empresa.belongsToMany(Archivo, { as: "archivo_archivo_archivo_empresas", through: ArchivoEmpresa, foreignKey: "_idempresa", otherKey: "_idarchivo" });
  Factoring.belongsToMany(Factura, { as: "factura_factura_factoring_facturas", through: FactoringFactura, foreignKey: "_idfactoring", otherKey: "_idfactura" });
  FactoringHistorialEstado.belongsToMany(Archivo, { as: "archivo_archivo_archivo_factoring_historial_estados", through: ArchivoFactoringHistorialEstado, foreignKey: "_idfactoringhistorialestado", otherKey: "_idarchivo" });
  FactoringInversion.belongsToMany(BancoTransaccion, { as: "bancotransaccion_banco_transaccions", through: BancoTransaccionFactoringInversion, foreignKey: "_idfactoringinversion", otherKey: "_idbancotransaccion" });
  Factura.belongsToMany(Archivo, { as: "archivo_archivo_archivo_facturas", through: ArchivoFactura, foreignKey: "_idfactura", otherKey: "_idarchivo" });
  Factura.belongsToMany(Factoring, { as: "factoring_factorings", through: FactoringFactura, foreignKey: "_idfactura", otherKey: "_idfactoring" });
  Inversionista.belongsToMany(BancoCuenta, { as: "bancocuenta_banco_cuenta", through: InversionistaBancoCuenta, foreignKey: "_idinversionista", otherKey: "_idbancocuenta" });
  InversionistaDeposito.belongsToMany(Archivo, { as: "archivo_archivo_archivo_inversionista_depositos", through: ArchivoInversionistaDeposito, foreignKey: "_idinversionistadeposito", otherKey: "_idarchivo" });
  InversionistaDeposito.belongsToMany(BancoTransaccion, { as: "bancotransaccion_banco_transaccion_banco_transaccion_inversionista_depositos", through: BancoTransaccionInversionistaDeposito, foreignKey: "_idinversionistadeposito", otherKey: "_idbancotransaccion" });
  InversionistaRetiro.belongsToMany(Archivo, { as: "archivo_archivo_archivo_inversionista_retiros", through: ArchivoInversionistaRetiro, foreignKey: "_idinversionistaretiro", otherKey: "_idarchivo" });
  InversionistaRetiro.belongsToMany(BancoTransaccion, { as: "bancotransaccion_banco_transaccion_banco_transaccion_inversionista_retiros", through: BancoTransaccionInversionistaRetiro, foreignKey: "_idinversionistaretiro", otherKey: "_idbancotransaccion" });
  Persona.belongsToMany(Archivo, { as: "archivo_archivo_archivo_personas", through: ArchivoPersona, foreignKey: "_idpersona", otherKey: "_idarchivo" });
  Rol.belongsToMany(Usuario, { as: "usuario_usuarios", through: UsuarioRol, foreignKey: "_idrol", otherKey: "_idusuario" });
  Usuario.belongsToMany(Rol, { as: "rol_rols", through: UsuarioRol, foreignKey: "_idusuario", otherKey: "_idrol" });
  ArchivoColaborador.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo"});
  Archivo.hasMany(ArchivoColaborador, { as: "archivo_colaboradors", foreignKey: "_idarchivo"});
  ArchivoCuentaBancaria.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo"});
  Archivo.hasMany(ArchivoCuentaBancaria, { as: "archivo_cuenta_bancaria", foreignKey: "_idarchivo"});
  ArchivoEmpresa.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo"});
  Archivo.hasMany(ArchivoEmpresa, { as: "archivo_empresas", foreignKey: "_idarchivo"});
  ArchivoFactoringHistorialEstado.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo"});
  Archivo.hasMany(ArchivoFactoringHistorialEstado, { as: "archivo_factoring_historial_estados", foreignKey: "_idarchivo"});
  ArchivoFactura.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo"});
  Archivo.hasMany(ArchivoFactura, { as: "archivo_facturas", foreignKey: "_idarchivo"});
  ArchivoInversionistaDeposito.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo"});
  Archivo.hasMany(ArchivoInversionistaDeposito, { as: "archivo_inversionista_depositos", foreignKey: "_idarchivo"});
  ArchivoInversionistaRetiro.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo"});
  Archivo.hasMany(ArchivoInversionistaRetiro, { as: "archivo_inversionista_retiros", foreignKey: "_idarchivo"});
  ArchivoPersona.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo"});
  Archivo.hasMany(ArchivoPersona, { as: "archivo_personas", foreignKey: "_idarchivo"});
  Archivo.belongsTo(ArchivoEstado, { as: "archivoestado_archivo_estado", foreignKey: "_idarchivoestado"});
  ArchivoEstado.hasMany(Archivo, { as: "archivos", foreignKey: "_idarchivoestado"});
  Archivo.belongsTo(ArchivoTipo, { as: "archivotipo_archivo_tipo", foreignKey: "_idarchivotipo"});
  ArchivoTipo.hasMany(Archivo, { as: "archivos", foreignKey: "_idarchivotipo"});
  CuentaBancaria.belongsTo(Banco, { as: "banco_banco", foreignKey: "_idbanco"});
  Banco.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idbanco"});
  BancoTransaccion.belongsTo(BancoCuenta, { as: "bancocuenta_banco_cuentum", foreignKey: "_idbancocuenta"});
  BancoCuenta.hasMany(BancoTransaccion, { as: "banco_transaccions", foreignKey: "_idbancocuenta"});
  InversionistaBancoCuenta.belongsTo(BancoCuenta, { as: "bancocuenta_banco_cuentum", foreignKey: "_idbancocuenta"});
  BancoCuenta.hasMany(InversionistaBancoCuenta, { as: "inversionista_banco_cuenta", foreignKey: "_idbancocuenta"});
  InversionistaDeposito.belongsTo(BancoCuenta, { as: "bancocuenta_banco_cuentum", foreignKey: "_idbancocuenta"});
  BancoCuenta.hasMany(InversionistaDeposito, { as: "inversionista_depositos", foreignKey: "_idbancocuenta"});
  InversionistaRetiro.belongsTo(BancoCuenta, { as: "bancocuenta_banco_cuentum", foreignKey: "_idbancocuenta"});
  BancoCuenta.hasMany(InversionistaRetiro, { as: "inversionista_retiros", foreignKey: "_idbancocuenta"});
  BancoCuenta.belongsTo(BancoCuentaEstado, { as: "bancocuentaestado_banco_cuenta_estado", foreignKey: "_idbancocuentaestado"});
  BancoCuentaEstado.hasMany(BancoCuenta, { as: "banco_cuenta", foreignKey: "_idbancocuentaestado"});
  BancoCuenta.belongsTo(BancoCuentaTipo, { as: "bancocuentatipo_banco_cuenta_tipo", foreignKey: "_idbancocuentatipo"});
  BancoCuentaTipo.hasMany(BancoCuenta, { as: "banco_cuenta", foreignKey: "_idbancocuentatipo"});
  BancoTransaccionEstadoHistorial.belongsTo(BancoTransaccion, { as: "bancotransaccion_banco_transaccion", foreignKey: "_idbancotransaccion"});
  BancoTransaccion.hasMany(BancoTransaccionEstadoHistorial, { as: "banco_transaccion_estado_historials", foreignKey: "_idbancotransaccion"});
  BancoTransaccionFactoringInversion.belongsTo(BancoTransaccion, { as: "bancotransaccion_banco_transaccion", foreignKey: "_idbancotransaccion"});
  BancoTransaccion.hasMany(BancoTransaccionFactoringInversion, { as: "banco_transaccion_factoring_inversions", foreignKey: "_idbancotransaccion"});
  BancoTransaccionInversionistaDeposito.belongsTo(BancoTransaccion, { as: "bancotransaccion_banco_transaccion", foreignKey: "_idbancotransaccion"});
  BancoTransaccion.hasMany(BancoTransaccionInversionistaDeposito, { as: "banco_transaccion_inversionista_depositos", foreignKey: "_idbancotransaccion"});
  BancoTransaccionInversionistaRetiro.belongsTo(BancoTransaccion, { as: "bancotransaccion_banco_transaccion", foreignKey: "_idbancotransaccion"});
  BancoTransaccion.hasMany(BancoTransaccionInversionistaRetiro, { as: "banco_transaccion_inversionista_retiros", foreignKey: "_idbancotransaccion"});
  BancoTransaccion.belongsTo(BancoTransaccionEstado, { as: "bancotransaccionestado_banco_transaccion_estado", foreignKey: "_idbancotransaccionestado"});
  BancoTransaccionEstado.hasMany(BancoTransaccion, { as: "banco_transaccions", foreignKey: "_idbancotransaccionestado"});
  BancoTransaccionEstadoHistorial.belongsTo(BancoTransaccionEstado, { as: "bancotransaccionestado_banco_transaccion_estado", foreignKey: "_idbancotransaccionestado"});
  BancoTransaccionEstado.hasMany(BancoTransaccionEstadoHistorial, { as: "banco_transaccion_estado_historials", foreignKey: "_idbancotransaccionestado"});
  BancoTransaccion.belongsTo(BancoTransaccionEstadoHistorial, { as: "bancotransaccionestadohistorial_banco_transaccion_estado_historial", foreignKey: "_idbancotransaccionestadohistorial"});
  BancoTransaccionEstadoHistorial.hasMany(BancoTransaccion, { as: "banco_transaccions", foreignKey: "_idbancotransaccionestadohistorial"});
  BancoTransaccion.belongsTo(BancoTransaccionTipo, { as: "bancotransaciontipo_banco_transaccion_tipo", foreignKey: "_idbancotransaciontipo"});
  BancoTransaccionTipo.hasMany(BancoTransaccion, { as: "banco_transaccions", foreignKey: "_idbancotransaciontipo"});
  ArchivoColaborador.belongsTo(Colaborador, { as: "colaborador_colaborador", foreignKey: "_idcolaborador"});
  Colaborador.hasMany(ArchivoColaborador, { as: "archivo_colaboradors", foreignKey: "_idcolaborador"});
  Factoring.belongsTo(Colaborador, { as: "contactocedente_colaborador", foreignKey: "_idcontactocedente"});
  Colaborador.hasMany(Factoring, { as: "factorings", foreignKey: "_idcontactocedente"});
  Colaborador.belongsTo(ColaboradorTipo, { as: "colaboradortipo_colaborador_tipo", foreignKey: "_idcolaboradortipo"});
  ColaboradorTipo.hasMany(Colaborador, { as: "colaboradors", foreignKey: "_idcolaboradortipo"});
  Factoring.belongsTo(Contacto, { as: "contactoaceptante_contacto", foreignKey: "_idcontactoaceptante"});
  Contacto.hasMany(Factoring, { as: "factorings", foreignKey: "_idcontactoaceptante"});
  ArchivoCuentaBancaria.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria"});
  CuentaBancaria.hasMany(ArchivoCuentaBancaria, { as: "archivo_cuenta_bancaria", foreignKey: "_idcuentabancaria"});
  EmpresaCuentaBancaria.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria"});
  CuentaBancaria.hasMany(EmpresaCuentaBancaria, { as: "empresa_cuenta_bancaria", foreignKey: "_idcuentabancaria"});
  FactorCuentaBancaria.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria"});
  CuentaBancaria.hasMany(FactorCuentaBancaria, { as: "factor_cuenta_bancaria", foreignKey: "_idcuentabancaria"});
  Factoring.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria"});
  CuentaBancaria.hasMany(Factoring, { as: "factorings", foreignKey: "_idcuentabancaria"});
  InversionistaCuentaBancaria.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria"});
  CuentaBancaria.hasMany(InversionistaCuentaBancaria, { as: "inversionista_cuenta_bancaria", foreignKey: "_idcuentabancaria"});
  PersonaCuentaBancaria.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria"});
  CuentaBancaria.hasMany(PersonaCuentaBancaria, { as: "persona_cuenta_bancaria", foreignKey: "_idcuentabancaria"});
  CuentaBancaria.belongsTo(CuentaBancariaEstado, { as: "cuentabancariaestado_cuenta_bancaria_estado", foreignKey: "_idcuentabancariaestado"});
  CuentaBancariaEstado.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idcuentabancariaestado"});
  CuentaBancaria.belongsTo(CuentaTipo, { as: "cuentatipo_cuenta_tipo", foreignKey: "_idcuentatipo"});
  CuentaTipo.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idcuentatipo"});
  Empresa.belongsTo(Departamento, { as: "departamentosede_departamento", foreignKey: "_iddepartamentosede"});
  Departamento.hasMany(Empresa, { as: "empresas", foreignKey: "_iddepartamentosede"});
  Factor.belongsTo(Departamento, { as: "departamentosede_departamento", foreignKey: "_iddepartamentosede"});
  Departamento.hasMany(Factor, { as: "factors", foreignKey: "_iddepartamentosede"});
  Persona.belongsTo(Departamento, { as: "departamentoresidencia_departamento", foreignKey: "_iddepartamentoresidencia"});
  Departamento.hasMany(Persona, { as: "personas", foreignKey: "_iddepartamentoresidencia"});
  Provincia.belongsTo(Departamento, { as: "departamento_departamento", foreignKey: "_iddepartamento"});
  Departamento.hasMany(Provincia, { as: "provincia", foreignKey: "_iddepartamento"});
  Empresa.belongsTo(Distrito, { as: "distritosede_distrito", foreignKey: "_iddistritosede"});
  Distrito.hasMany(Empresa, { as: "empresas", foreignKey: "_iddistritosede"});
  Factor.belongsTo(Distrito, { as: "distritosede_distrito", foreignKey: "_iddistritosede"});
  Distrito.hasMany(Factor, { as: "factors", foreignKey: "_iddistritosede"});
  Persona.belongsTo(Distrito, { as: "distritoresidencia_distrito", foreignKey: "_iddistritoresidencia"});
  Distrito.hasMany(Persona, { as: "personas", foreignKey: "_iddistritoresidencia"});
  Colaborador.belongsTo(DocumentoTipo, { as: "documentotipo_documento_tipo", foreignKey: "_iddocumentotipo"});
  DocumentoTipo.hasMany(Colaborador, { as: "colaboradors", foreignKey: "_iddocumentotipo"});
  Persona.belongsTo(DocumentoTipo, { as: "documentotipo_documento_tipo", foreignKey: "_iddocumentotipo"});
  DocumentoTipo.hasMany(Persona, { as: "personas", foreignKey: "_iddocumentotipo"});
  Usuario.belongsTo(DocumentoTipo, { as: "documentotipo_documento_tipo", foreignKey: "_iddocumentotipo"});
  DocumentoTipo.hasMany(Usuario, { as: "usuarios", foreignKey: "_iddocumentotipo"});
  ArchivoEmpresa.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa"});
  Empresa.hasMany(ArchivoEmpresa, { as: "archivo_empresas", foreignKey: "_idempresa"});
  Colaborador.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa"});
  Empresa.hasMany(Colaborador, { as: "colaboradors", foreignKey: "_idempresa"});
  Contacto.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa"});
  Empresa.hasMany(Contacto, { as: "contactos", foreignKey: "_idempresa"});
  EmpresaCuentaBancaria.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa"});
  Empresa.hasMany(EmpresaCuentaBancaria, { as: "empresa_cuenta_bancaria", foreignKey: "_idempresa"});
  Factoring.belongsTo(Empresa, { as: "aceptante_empresa", foreignKey: "_idaceptante"});
  Empresa.hasMany(Factoring, { as: "factorings", foreignKey: "_idaceptante"});
  Factoring.belongsTo(Empresa, { as: "cedente_empresa", foreignKey: "_idcedente"});
  Empresa.hasMany(Factoring, { as: "cedente_factorings", foreignKey: "_idcedente"});
  ServicioEmpresa.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa"});
  Empresa.hasMany(ServicioEmpresa, { as: "servicio_empresas", foreignKey: "_idempresa"});
  UsuarioServicioEmpresa.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa"});
  Empresa.hasMany(UsuarioServicioEmpresa, { as: "usuario_servicio_empresas", foreignKey: "_idempresa"});
  FactoringPago.belongsTo(EmpresaCuentaBancaria, { as: "empresacuentabancaria_empresa_cuenta_bancarium", foreignKey: "_idempresacuentabancaria"});
  EmpresaCuentaBancaria.hasMany(FactoringPago, { as: "factoring_pagos", foreignKey: "_idempresacuentabancaria"});
  FactorCuentaBancaria.belongsTo(Factor, { as: "factor_factor", foreignKey: "_idfactor"});
  Factor.hasMany(FactorCuentaBancaria, { as: "factor_cuenta_bancaria", foreignKey: "_idfactor"});
  FactoringPago.belongsTo(FactorCuentaBancaria, { as: "factorcuentabancaria_factor_cuenta_bancarium", foreignKey: "_idfactorcuentabancaria"});
  FactorCuentaBancaria.hasMany(FactoringPago, { as: "factoring_pagos", foreignKey: "_idfactorcuentabancaria"});
  InversionistaDeposito.belongsTo(FactorCuentaBancaria, { as: "factorcuentabancaria_factor_cuenta_bancarium", foreignKey: "_idfactorcuentabancaria"});
  FactorCuentaBancaria.hasMany(InversionistaDeposito, { as: "inversionista_depositos", foreignKey: "_idfactorcuentabancaria"});
  InversionistaRetiro.belongsTo(FactorCuentaBancaria, { as: "factorcuentabancaria_factor_cuenta_bancarium", foreignKey: "_idfactorcuentabancaria"});
  FactorCuentaBancaria.hasMany(InversionistaRetiro, { as: "inversionista_retiros", foreignKey: "_idfactorcuentabancaria"});
  FactoringEjecutado.belongsTo(Factoring, { as: "factoring_factoring", foreignKey: "_idfactoring"});
  Factoring.hasMany(FactoringEjecutado, { as: "factoring_ejecutados", foreignKey: "_idfactoring"});
  FactoringFactura.belongsTo(Factoring, { as: "factoring_factoring", foreignKey: "_idfactoring"});
  Factoring.hasMany(FactoringFactura, { as: "factoring_facturas", foreignKey: "_idfactoring"});
  FactoringHistorialEstado.belongsTo(Factoring, { as: "factoring_factoring", foreignKey: "_idfactoring"});
  Factoring.hasMany(FactoringHistorialEstado, { as: "factoring_historial_estados", foreignKey: "_idfactoring"});
  FactoringPago.belongsTo(Factoring, { as: "factoring_factoring", foreignKey: "_idfactoring"});
  Factoring.hasMany(FactoringPago, { as: "factoring_pagos", foreignKey: "_idfactoring"});
  FactoringPropuesta.belongsTo(Factoring, { as: "factoring_factoring", foreignKey: "_idfactoring"});
  Factoring.hasMany(FactoringPropuesta, { as: "factoring_propuesta", foreignKey: "_idfactoring"});
  Factoring.belongsTo(FactoringEjecutado, { as: "factoringejecutado_factoring_ejecutado", foreignKey: "_idfactoringejecutado"});
  FactoringEjecutado.hasMany(Factoring, { as: "factorings", foreignKey: "_idfactoringejecutado"});
  FactoringEjecutado.belongsTo(FactoringEjecutadoEstado, { as: "factoringejecutadoaestado_factoring_ejecutado_estado", foreignKey: "_idfactoringejecutadoaestado"});
  FactoringEjecutadoEstado.hasMany(FactoringEjecutado, { as: "factoring_ejecutados", foreignKey: "_idfactoringejecutadoaestado"});
  Factoring.belongsTo(FactoringEstado, { as: "factoringestado_factoring_estado", foreignKey: "_idfactoringestado"});
  FactoringEstado.hasMany(Factoring, { as: "factorings", foreignKey: "_idfactoringestado"});
  FactoringHistorialEstado.belongsTo(FactoringEstado, { as: "factoringestado_factoring_estado", foreignKey: "_idfactoringestado"});
  FactoringEstado.hasMany(FactoringHistorialEstado, { as: "factoring_historial_estados", foreignKey: "_idfactoringestado"});
  FactoringPropuesta.belongsTo(FactoringEstrategia, { as: "factoringestrategia_factoring_estrategium", foreignKey: "_idfactoringestrategia"});
  FactoringEstrategia.hasMany(FactoringPropuesta, { as: "factoring_propuesta", foreignKey: "_idfactoringestrategia"});
  ArchivoFactoringHistorialEstado.belongsTo(FactoringHistorialEstado, { as: "factoringhistorialestado_factoring_historial_estado", foreignKey: "_idfactoringhistorialestado"});
  FactoringHistorialEstado.hasMany(ArchivoFactoringHistorialEstado, { as: "archivo_factoring_historial_estados", foreignKey: "_idfactoringhistorialestado"});
  BancoTransaccionFactoringInversion.belongsTo(FactoringInversion, { as: "factoringinversion_factoring_inversion", foreignKey: "_idfactoringinversion"});
  FactoringInversion.hasMany(BancoTransaccionFactoringInversion, { as: "banco_transaccion_factoring_inversions", foreignKey: "_idfactoringinversion"});
  Factoring.belongsTo(FactoringPropuesta, { as: "factoringpropuestaaceptada_factoring_propuestum", foreignKey: "_idfactoringpropuestaaceptada"});
  FactoringPropuesta.hasMany(Factoring, { as: "factorings", foreignKey: "_idfactoringpropuestaaceptada"});
  FactoringPropuestaFinanciero.belongsTo(FactoringPropuesta, { as: "factoringpropuesta_factoring_propuestum", foreignKey: "_idfactoringpropuesta"});
  FactoringPropuesta.hasMany(FactoringPropuestaFinanciero, { as: "factoring_propuesta_financieros", foreignKey: "_idfactoringpropuesta"});
  FactoringPropuesta.belongsTo(FactoringPropuestaEstado, { as: "factoringpropuestaestado_factoring_propuesta_estado", foreignKey: "_idfactoringpropuestaestado"});
  FactoringPropuestaEstado.hasMany(FactoringPropuesta, { as: "factoring_propuesta", foreignKey: "_idfactoringpropuestaestado"});
  FactoringPropuesta.belongsTo(FactoringTipo, { as: "factoringtipo_factoring_tipo", foreignKey: "_idfactoringtipo"});
  FactoringTipo.hasMany(FactoringPropuesta, { as: "factoring_propuesta", foreignKey: "_idfactoringtipo"});
  ArchivoFactura.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura"});
  Factura.hasMany(ArchivoFactura, { as: "archivo_facturas", foreignKey: "_idfactura"});
  FactoringFactura.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura"});
  Factura.hasMany(FactoringFactura, { as: "factoring_facturas", foreignKey: "_idfactura"});
  FacturaImpuesto.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura"});
  Factura.hasMany(FacturaImpuesto, { as: "factura_impuestos", foreignKey: "_idfactura"});
  FacturaItem.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura"});
  Factura.hasMany(FacturaItem, { as: "factura_items", foreignKey: "_idfactura"});
  FacturaMedioPago.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura"});
  Factura.hasMany(FacturaMedioPago, { as: "factura_medio_pagos", foreignKey: "_idfactura"});
  FacturaNota.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura"});
  Factura.hasMany(FacturaNota, { as: "factura_nota", foreignKey: "_idfactura"});
  FacturaTerminoPago.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura"});
  Factura.hasMany(FacturaTerminoPago, { as: "factura_termino_pagos", foreignKey: "_idfactura"});
  FactoringPropuestaFinanciero.belongsTo(FinancieroConcepto, { as: "financieroconcepto_financiero_concepto", foreignKey: "_idfinancieroconcepto"});
  FinancieroConcepto.hasMany(FactoringPropuestaFinanciero, { as: "factoring_propuesta_financieros", foreignKey: "_idfinancieroconcepto"});
  FactoringPropuestaFinanciero.belongsTo(FinancieroTipo, { as: "financierotipo_financiero_tipo", foreignKey: "_idfinancierotipo"});
  FinancieroTipo.hasMany(FactoringPropuestaFinanciero, { as: "factoring_propuesta_financieros", foreignKey: "_idfinancierotipo"});
  Persona.belongsTo(Genero, { as: "genero_genero", foreignKey: "_idgenero"});
  Genero.hasMany(Persona, { as: "personas", foreignKey: "_idgenero"});
  InversionistaBancoCuenta.belongsTo(Inversionista, { as: "inversionista_inversionistum", foreignKey: "_idinversionista"});
  Inversionista.hasMany(InversionistaBancoCuenta, { as: "inversionista_banco_cuenta", foreignKey: "_idinversionista"});
  InversionistaCuentaBancaria.belongsTo(Inversionista, { as: "inversionista_inversionistum", foreignKey: "_idinversionista"});
  Inversionista.hasMany(InversionistaCuentaBancaria, { as: "inversionista_cuenta_bancaria", foreignKey: "_idinversionista"});
  InversionistaDeposito.belongsTo(InversionistaCuentaBancaria, { as: "inversionistacuentabancaria_inversionista_cuenta_bancarium", foreignKey: "_idinversionistacuentabancaria"});
  InversionistaCuentaBancaria.hasMany(InversionistaDeposito, { as: "inversionista_depositos", foreignKey: "_idinversionistacuentabancaria"});
  InversionistaRetiro.belongsTo(InversionistaCuentaBancaria, { as: "inversionistacuentabancaria_inversionista_cuenta_bancarium", foreignKey: "_idinversionistacuentabancaria"});
  InversionistaCuentaBancaria.hasMany(InversionistaRetiro, { as: "inversionista_retiros", foreignKey: "_idinversionistacuentabancaria"});
  ArchivoInversionistaDeposito.belongsTo(InversionistaDeposito, { as: "inversionistadeposito_inversionista_deposito", foreignKey: "_idinversionistadeposito"});
  InversionistaDeposito.hasMany(ArchivoInversionistaDeposito, { as: "archivo_inversionista_depositos", foreignKey: "_idinversionistadeposito"});
  BancoTransaccionInversionistaDeposito.belongsTo(InversionistaDeposito, { as: "inversionistadeposito_inversionista_deposito", foreignKey: "_idinversionistadeposito"});
  InversionistaDeposito.hasMany(BancoTransaccionInversionistaDeposito, { as: "banco_transaccion_inversionista_depositos", foreignKey: "_idinversionistadeposito"});
  ArchivoInversionistaRetiro.belongsTo(InversionistaRetiro, { as: "inversionistaretiro_inversionista_retiro", foreignKey: "_idinversionistaretiro"});
  InversionistaRetiro.hasMany(ArchivoInversionistaRetiro, { as: "archivo_inversionista_retiros", foreignKey: "_idinversionistaretiro"});
  BancoTransaccionInversionistaRetiro.belongsTo(InversionistaRetiro, { as: "inversionistaretiro_inversionista_retiro", foreignKey: "_idinversionistaretiro"});
  InversionistaRetiro.hasMany(BancoTransaccionInversionistaRetiro, { as: "banco_transaccion_inversionista_retiros", foreignKey: "_idinversionistaretiro"});
  BancoCuenta.belongsTo(Moneda, { as: "moneda_moneda", foreignKey: "_idmoneda"});
  Moneda.hasMany(BancoCuenta, { as: "banco_cuenta", foreignKey: "_idmoneda"});
  CuentaBancaria.belongsTo(Moneda, { as: "moneda_moneda", foreignKey: "_idmoneda"});
  Moneda.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idmoneda"});
  Factoring.belongsTo(Moneda, { as: "moneda_moneda", foreignKey: "_idmoneda"});
  Moneda.hasMany(Factoring, { as: "factorings", foreignKey: "_idmoneda"});
  Departamento.belongsTo(Pais, { as: "pais_pai", foreignKey: "_idpais"});
  Pais.hasMany(Departamento, { as: "departamentos", foreignKey: "_idpais"});
  Empresa.belongsTo(Pais, { as: "paissede_pai", foreignKey: "_idpaissede"});
  Pais.hasMany(Empresa, { as: "empresas", foreignKey: "_idpaissede"});
  Factor.belongsTo(Pais, { as: "paissede_pai", foreignKey: "_idpaissede"});
  Pais.hasMany(Factor, { as: "factors", foreignKey: "_idpaissede"});
  Persona.belongsTo(Pais, { as: "paisnacionalidad_pai", foreignKey: "_idpaisnacionalidad"});
  Pais.hasMany(Persona, { as: "personas", foreignKey: "_idpaisnacionalidad"});
  Persona.belongsTo(Pais, { as: "paisnacimiento_pai", foreignKey: "_idpaisnacimiento"});
  Pais.hasMany(Persona, { as: "paisnacimiento_personas", foreignKey: "_idpaisnacimiento"});
  Persona.belongsTo(Pais, { as: "paisresidencia_pai", foreignKey: "_idpaisresidencia"});
  Pais.hasMany(Persona, { as: "paisresidencia_personas", foreignKey: "_idpaisresidencia"});
  PersonaPepIndirecto.belongsTo(PepVinculo, { as: "pepevinculo_pep_vinculo", foreignKey: "_idpepevinculo"});
  PepVinculo.hasMany(PersonaPepIndirecto, { as: "persona_pep_indirectos", foreignKey: "_idpepevinculo"});
  ArchivoPersona.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona"});
  Persona.hasMany(ArchivoPersona, { as: "archivo_personas", foreignKey: "_idpersona"});
  Colaborador.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona"});
  Persona.hasMany(Colaborador, { as: "colaboradors", foreignKey: "_idpersona"});
  Inversionista.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona"});
  Persona.hasOne(Inversionista, { as: "inversionistum", foreignKey: "_idpersona"});
  PersonaCuentaBancaria.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona"});
  Persona.hasMany(PersonaCuentaBancaria, { as: "persona_cuenta_bancaria", foreignKey: "_idpersona"});
  PersonaDeclaracion.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona"});
  Persona.hasMany(PersonaDeclaracion, { as: "persona_declaracions", foreignKey: "_idpersona"});
  PersonaPepDirecto.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona"});
  Persona.hasMany(PersonaPepDirecto, { as: "persona_pep_directos", foreignKey: "_idpersona"});
  PersonaPepIndirecto.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona"});
  Persona.hasMany(PersonaPepIndirecto, { as: "persona_pep_indirectos", foreignKey: "_idpersona"});
  PersonaVerificacion.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona"});
  Persona.hasMany(PersonaVerificacion, { as: "persona_verificacions", foreignKey: "_idpersona"});
  Persona.belongsTo(PersonaVerificacionEstado, { as: "personaverificacionestado_persona_verificacion_estado", foreignKey: "_idpersonaverificacionestado"});
  PersonaVerificacionEstado.hasMany(Persona, { as: "personas", foreignKey: "_idpersonaverificacionestado"});
  PersonaVerificacion.belongsTo(PersonaVerificacionEstado, { as: "personaverificacionestado_persona_verificacion_estado", foreignKey: "_idpersonaverificacionestado"});
  PersonaVerificacionEstado.hasMany(PersonaVerificacion, { as: "persona_verificacions", foreignKey: "_idpersonaverificacionestado"});
  Distrito.belongsTo(Provincia, { as: "provincia_provincium", foreignKey: "_idprovincia"});
  Provincia.hasMany(Distrito, { as: "distritos", foreignKey: "_idprovincia"});
  Empresa.belongsTo(Provincia, { as: "provinciasede_provincium", foreignKey: "_idprovinciasede"});
  Provincia.hasMany(Empresa, { as: "empresas", foreignKey: "_idprovinciasede"});
  Factor.belongsTo(Provincia, { as: "provinciasede_provincium", foreignKey: "_idprovinciasede"});
  Provincia.hasMany(Factor, { as: "factors", foreignKey: "_idprovinciasede"});
  Persona.belongsTo(Provincia, { as: "provinciaresidencia_provincium", foreignKey: "_idprovinciaresidencia"});
  Provincia.hasMany(Persona, { as: "personas", foreignKey: "_idprovinciaresidencia"});
  Distrito.belongsTo(RegionNatural, { as: "regionnatural_region_natural", foreignKey: "_idregionnatural"});
  RegionNatural.hasMany(Distrito, { as: "distritos", foreignKey: "_idregionnatural"});
  Empresa.belongsTo(Riesgo, { as: "riesgo_riesgo", foreignKey: "_idriesgo"});
  Riesgo.hasMany(Empresa, { as: "empresas", foreignKey: "_idriesgo"});
  Factor.belongsTo(Riesgo, { as: "riesgo_riesgo", foreignKey: "_idriesgo"});
  Riesgo.hasMany(Factor, { as: "factors", foreignKey: "_idriesgo"});
  FactoringConfigComision.belongsTo(Riesgo, { as: "riesgo_riesgo", foreignKey: "_idriesgo"});
  Riesgo.hasMany(FactoringConfigComision, { as: "factoring_config_comisions", foreignKey: "_idriesgo"});
  FactoringConfigGarantia.belongsTo(Riesgo, { as: "riesgo_riesgo", foreignKey: "_idriesgo"});
  Riesgo.hasMany(FactoringConfigGarantia, { as: "factoring_config_garantia", foreignKey: "_idriesgo"});
  FactoringConfigTasaDescuento.belongsTo(Riesgo, { as: "riesgo_riesgo", foreignKey: "_idriesgo"});
  Riesgo.hasMany(FactoringConfigTasaDescuento, { as: "factoring_config_tasa_descuentos", foreignKey: "_idriesgo"});
  FactoringPropuesta.belongsTo(Riesgo, { as: "riesgooperacion_riesgo", foreignKey: "_idriesgooperacion"});
  Riesgo.hasMany(FactoringPropuesta, { as: "factoring_propuesta", foreignKey: "_idriesgooperacion"});
  FactoringPropuesta.belongsTo(Riesgo, { as: "riesgoaceptante_riesgo", foreignKey: "_idriesgoaceptante"});
  Riesgo.hasMany(FactoringPropuesta, { as: "riesgoaceptante_factoring_propuesta", foreignKey: "_idriesgoaceptante"});
  FactoringPropuesta.belongsTo(Riesgo, { as: "riesgocedente_riesgo", foreignKey: "_idriesgocedente"});
  Riesgo.hasMany(FactoringPropuesta, { as: "riesgocedente_factoring_propuesta", foreignKey: "_idriesgocedente"});
  UsuarioRol.belongsTo(Rol, { as: "rol_rol", foreignKey: "_idrol"});
  Rol.hasMany(UsuarioRol, { as: "usuario_rols", foreignKey: "_idrol"});
  ServicioEmpresa.belongsTo(Servicio, { as: "servicio_servicio", foreignKey: "_idservicio"});
  Servicio.hasMany(ServicioEmpresa, { as: "servicio_empresas", foreignKey: "_idservicio"});
  UsuarioServicio.belongsTo(Servicio, { as: "servicio_servicio", foreignKey: "_idservicio"});
  Servicio.hasMany(UsuarioServicio, { as: "usuario_servicios", foreignKey: "_idservicio"});
  UsuarioServicioEmpresa.belongsTo(Servicio, { as: "servicio_servicio", foreignKey: "_idservicio"});
  Servicio.hasMany(UsuarioServicioEmpresa, { as: "usuario_servicio_empresas", foreignKey: "_idservicio"});
  ServicioEmpresaVerificacion.belongsTo(ServicioEmpresa, { as: "servicioempresa_servicio_empresa", foreignKey: "_idservicioempresa"});
  ServicioEmpresa.hasMany(ServicioEmpresaVerificacion, { as: "servicio_empresa_verificacions", foreignKey: "_idservicioempresa"});
  ServicioEmpresa.belongsTo(ServicioEmpresaEstado, { as: "servicioempresaestado_servicio_empresa_estado", foreignKey: "_idservicioempresaestado"});
  ServicioEmpresaEstado.hasMany(ServicioEmpresa, { as: "servicio_empresas", foreignKey: "_idservicioempresaestado"});
  ServicioEmpresaVerificacion.belongsTo(ServicioEmpresaEstado, { as: "servicioempresaestado_servicio_empresa_estado", foreignKey: "_idservicioempresaestado"});
  ServicioEmpresaEstado.hasMany(ServicioEmpresaVerificacion, { as: "servicio_empresa_verificacions", foreignKey: "_idservicioempresaestado"});
  BancoTransaccionEstadoHistorial.belongsTo(Usuario, { as: "usuariomodifica_usuario", foreignKey: "_idusuariomodifica"});
  Usuario.hasMany(BancoTransaccionEstadoHistorial, { as: "banco_transaccion_estado_historials", foreignKey: "_idusuariomodifica"});
  Credencial.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario"});
  Usuario.hasOne(Credencial, { as: "credencial", foreignKey: "_idusuario"});
  FactoringHistorialEstado.belongsTo(Usuario, { as: "usuariomodifica_usuario", foreignKey: "_idusuariomodifica"});
  Usuario.hasMany(FactoringHistorialEstado, { as: "factoring_historial_estados", foreignKey: "_idusuariomodifica"});
  Factura.belongsTo(Usuario, { as: "usuarioupload_usuario", foreignKey: "_idusuarioupload"});
  Usuario.hasMany(Factura, { as: "facturas", foreignKey: "_idusuarioupload"});
  Persona.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario"});
  Usuario.hasOne(Persona, { as: "persona", foreignKey: "_idusuario"});
  PersonaVerificacion.belongsTo(Usuario, { as: "usuarioverifica_usuario", foreignKey: "_idusuarioverifica"});
  Usuario.hasMany(PersonaVerificacion, { as: "persona_verificacions", foreignKey: "_idusuarioverifica"});
  ServicioEmpresa.belongsTo(Usuario, { as: "usuariosuscriptor_usuario", foreignKey: "_idusuariosuscriptor"});
  Usuario.hasMany(ServicioEmpresa, { as: "servicio_empresas", foreignKey: "_idusuariosuscriptor"});
  ServicioEmpresaVerificacion.belongsTo(Usuario, { as: "usuarioverifica_usuario", foreignKey: "_idusuarioverifica"});
  Usuario.hasMany(ServicioEmpresaVerificacion, { as: "servicio_empresa_verificacions", foreignKey: "_idusuarioverifica"});
  UsuarioRol.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario"});
  Usuario.hasMany(UsuarioRol, { as: "usuario_rols", foreignKey: "_idusuario"});
  UsuarioServicio.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario"});
  Usuario.hasMany(UsuarioServicio, { as: "usuario_servicios", foreignKey: "_idusuario"});
  UsuarioServicioEmpresa.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario"});
  Usuario.hasMany(UsuarioServicioEmpresa, { as: "usuario_servicio_empresas", foreignKey: "_idusuario"});
  UsuarioServicioVerificacion.belongsTo(Usuario, { as: "usuarioverifica_usuario", foreignKey: "_idusuarioverifica"});
  Usuario.hasMany(UsuarioServicioVerificacion, { as: "usuario_servicio_verificacions", foreignKey: "_idusuarioverifica"});
  Validacion.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario"});
  Usuario.hasMany(Validacion, { as: "validacions", foreignKey: "_idusuario"});
  UsuarioServicioVerificacion.belongsTo(UsuarioServicio, { as: "usuarioservicio_usuario_servicio", foreignKey: "_idusuarioservicio"});
  UsuarioServicio.hasMany(UsuarioServicioVerificacion, { as: "usuario_servicio_verificacions", foreignKey: "_idusuarioservicio"});
  UsuarioServicioEmpresa.belongsTo(UsuarioServicioEmpresaEstado, { as: "usuarioservicioempresaestado_usuario_servicio_empresa_estado", foreignKey: "_idusuarioservicioempresaestado"});
  UsuarioServicioEmpresaEstado.hasMany(UsuarioServicioEmpresa, { as: "usuario_servicio_empresas", foreignKey: "_idusuarioservicioempresaestado"});
  UsuarioServicioEmpresa.belongsTo(UsuarioServicioEmpresaRol, { as: "usuarioservicioempresarol_usuario_servicio_empresa_rol", foreignKey: "_idusuarioservicioempresarol"});
  UsuarioServicioEmpresaRol.hasMany(UsuarioServicioEmpresa, { as: "usuario_servicio_empresas", foreignKey: "_idusuarioservicioempresarol"});
  UsuarioServicio.belongsTo(UsuarioServicioEstado, { as: "usuarioservicioestado_usuario_servicio_estado", foreignKey: "_idusuarioservicioestado"});
  UsuarioServicioEstado.hasMany(UsuarioServicio, { as: "usuario_servicios", foreignKey: "_idusuarioservicioestado"});
  UsuarioServicioVerificacion.belongsTo(UsuarioServicioEstado, { as: "usuarioservicioestado_usuario_servicio_estado", foreignKey: "_idusuarioservicioestado"});
  UsuarioServicioEstado.hasMany(UsuarioServicioVerificacion, { as: "usuario_servicio_verificacions", foreignKey: "_idusuarioservicioestado"});
  Validacion.belongsTo(ValidacionTipo, { as: "validaciontipo_validacion_tipo", foreignKey: "_idvalidaciontipo"});
  ValidacionTipo.hasMany(Validacion, { as: "validacions", foreignKey: "_idvalidaciontipo"});
  ZlaboratorioPedido.belongsTo(ZlaboratorioUsuario, { as: "usuario_zlaboratorio_usuario", foreignKey: "_idusuario"});
  ZlaboratorioUsuario.hasMany(ZlaboratorioPedido, { as: "zlaboratorio_pedidos", foreignKey: "_idusuario"});

  return {
    Archivo: Archivo,
    ArchivoColaborador: ArchivoColaborador,
    ArchivoCuentaBancaria: ArchivoCuentaBancaria,
    ArchivoEmpresa: ArchivoEmpresa,
    ArchivoEstado: ArchivoEstado,
    ArchivoFactoringHistorialEstado: ArchivoFactoringHistorialEstado,
    ArchivoFactura: ArchivoFactura,
    ArchivoInversionistaDeposito: ArchivoInversionistaDeposito,
    ArchivoInversionistaRetiro: ArchivoInversionistaRetiro,
    ArchivoPersona: ArchivoPersona,
    ArchivoTipo: ArchivoTipo,
    Banco: Banco,
    BancoCuenta: BancoCuenta,
    BancoCuentaEstado: BancoCuentaEstado,
    BancoCuentaTipo: BancoCuentaTipo,
    BancoTransaccion: BancoTransaccion,
    BancoTransaccionEstado: BancoTransaccionEstado,
    BancoTransaccionEstadoHistorial: BancoTransaccionEstadoHistorial,
    BancoTransaccionFactoringInversion: BancoTransaccionFactoringInversion,
    BancoTransaccionInversionistaDeposito: BancoTransaccionInversionistaDeposito,
    BancoTransaccionInversionistaRetiro: BancoTransaccionInversionistaRetiro,
    BancoTransaccionTipo: BancoTransaccionTipo,
    Colaborador: Colaborador,
    ColaboradorTipo: ColaboradorTipo,
    ConfiguracionApp: ConfiguracionApp,
    Contacto: Contacto,
    Credencial: Credencial,
    CuentaBancaria: CuentaBancaria,
    CuentaBancariaEstado: CuentaBancariaEstado,
    CuentaTipo: CuentaTipo,
    Departamento: Departamento,
    Distrito: Distrito,
    DocumentoTipo: DocumentoTipo,
    Empresa: Empresa,
    EmpresaCuentaBancaria: EmpresaCuentaBancaria,
    EmpresaDeclaracion: EmpresaDeclaracion,
    Factor: Factor,
    FactorCuentaBancaria: FactorCuentaBancaria,
    Factoring: Factoring,
    FactoringConfigComision: FactoringConfigComision,
    FactoringConfigGarantia: FactoringConfigGarantia,
    FactoringConfigTasaDescuento: FactoringConfigTasaDescuento,
    FactoringEjecutado: FactoringEjecutado,
    FactoringEjecutadoEstado: FactoringEjecutadoEstado,
    FactoringEstado: FactoringEstado,
    FactoringEstrategia: FactoringEstrategia,
    FactoringFactura: FactoringFactura,
    FactoringHistorialEstado: FactoringHistorialEstado,
    FactoringInversion: FactoringInversion,
    FactoringPago: FactoringPago,
    FactoringPropuesta: FactoringPropuesta,
    FactoringPropuestaEstado: FactoringPropuestaEstado,
    FactoringPropuestaFinanciero: FactoringPropuestaFinanciero,
    FactoringTipo: FactoringTipo,
    Factura: Factura,
    FacturaImpuesto: FacturaImpuesto,
    FacturaItem: FacturaItem,
    FacturaMedioPago: FacturaMedioPago,
    FacturaNota: FacturaNota,
    FacturaTerminoPago: FacturaTerminoPago,
    FinancieroConcepto: FinancieroConcepto,
    FinancieroTipo: FinancieroTipo,
    Genero: Genero,
    Inversionista: Inversionista,
    InversionistaBancoCuenta: InversionistaBancoCuenta,
    InversionistaCuentaBancaria: InversionistaCuentaBancaria,
    InversionistaDeposito: InversionistaDeposito,
    InversionistaRetiro: InversionistaRetiro,
    Moneda: Moneda,
    Pais: Pais,
    PepVinculo: PepVinculo,
    Persona: Persona,
    PersonaCuentaBancaria: PersonaCuentaBancaria,
    PersonaDeclaracion: PersonaDeclaracion,
    PersonaPepDirecto: PersonaPepDirecto,
    PersonaPepIndirecto: PersonaPepIndirecto,
    PersonaVerificacion: PersonaVerificacion,
    PersonaVerificacionEstado: PersonaVerificacionEstado,
    Provincia: Provincia,
    RegionNatural: RegionNatural,
    Riesgo: Riesgo,
    Rol: Rol,
    Servicio: Servicio,
    ServicioEmpresa: ServicioEmpresa,
    ServicioEmpresaEstado: ServicioEmpresaEstado,
    ServicioEmpresaVerificacion: ServicioEmpresaVerificacion,
    Usuario: Usuario,
    UsuarioRol: UsuarioRol,
    UsuarioServicio: UsuarioServicio,
    UsuarioServicioEmpresa: UsuarioServicioEmpresa,
    UsuarioServicioEmpresaEstado: UsuarioServicioEmpresaEstado,
    UsuarioServicioEmpresaRol: UsuarioServicioEmpresaRol,
    UsuarioServicioEstado: UsuarioServicioEstado,
    UsuarioServicioVerificacion: UsuarioServicioVerificacion,
    Validacion: Validacion,
    ValidacionTipo: ValidacionTipo,
    ZlaboratorioPedido: ZlaboratorioPedido,
    ZlaboratorioUsuario: ZlaboratorioUsuario,
  };
}
