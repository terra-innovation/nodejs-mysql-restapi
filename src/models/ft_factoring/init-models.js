import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Archivo from "./Archivo.js";
import _ArchivoColaborador from "./ArchivoColaborador.js";
import _ArchivoCuentaBancaria from "./ArchivoCuentaBancaria.js";
import _ArchivoEmpresa from "./ArchivoEmpresa.js";
import _ArchivoEstado from "./ArchivoEstado.js";
import _ArchivoFactoringHistorialEstado from "./ArchivoFactoringHistorialEstado.js";
import _ArchivoFactura from "./ArchivoFactura.js";
import _ArchivoInversionistaDeposito from "./ArchivoInversionistaDeposito.js";
import _ArchivoInversionistaRetiro from "./ArchivoInversionistaRetiro.js";
import _ArchivoPersona from "./ArchivoPersona.js";
import _ArchivoTipo from "./ArchivoTipo.js";
import _Banco from "./Banco.js";
import _BancoCuenta from "./BancoCuenta.js";
import _BancoCuentaEstado from "./BancoCuentaEstado.js";
import _BancoCuentaTipo from "./BancoCuentaTipo.js";
import _BancoTransaccion from "./BancoTransaccion.js";
import _BancoTransaccionEstado from "./BancoTransaccionEstado.js";
import _BancoTransaccionEstadoHistorial from "./BancoTransaccionEstadoHistorial.js";
import _BancoTransaccionFactoringInversion from "./BancoTransaccionFactoringInversion.js";
import _BancoTransaccionInversionistaDeposito from "./BancoTransaccionInversionistaDeposito.js";
import _BancoTransaccionInversionistaRetiro from "./BancoTransaccionInversionistaRetiro.js";
import _BancoTransaccionTipo from "./BancoTransaccionTipo.js";
import _Colaborador from "./Colaborador.js";
import _ColaboradorTipo from "./ColaboradorTipo.js";
import _ConfiguracionApp from "./ConfiguracionApp.js";
import _Contacto from "./Contacto.js";
import _Credencial from "./Credencial.js";
import _CuentaBancaria from "./CuentaBancaria.js";
import _CuentaBancariaEstado from "./CuentaBancariaEstado.js";
import _CuentaTipo from "./CuentaTipo.js";
import _Departamento from "./Departamento.js";
import _Distrito from "./Distrito.js";
import _DocumentoTipo from "./DocumentoTipo.js";
import _Empresa from "./Empresa.js";
import _EmpresaCuentaBancaria from "./EmpresaCuentaBancaria.js";
import _EmpresaDeclaracion from "./EmpresaDeclaracion.js";
import _Factor from "./Factor.js";
import _FactorCuentaBancaria from "./FactorCuentaBancaria.js";
import _Factoring from "./Factoring.js";
import _FactoringConfigComision from "./FactoringConfigComision.js";
import _FactoringConfigGarantia from "./FactoringConfigGarantia.js";
import _FactoringConfigTasaDescuento from "./FactoringConfigTasaDescuento.js";
import _FactoringEjecutado from "./FactoringEjecutado.js";
import _FactoringEjecutadoEstado from "./FactoringEjecutadoEstado.js";
import _FactoringEstado from "./FactoringEstado.js";
import _FactoringEstrategia from "./FactoringEstrategia.js";
import _FactoringFactura from "./FactoringFactura.js";
import _FactoringHistorialEstado from "./FactoringHistorialEstado.js";
import _FactoringInversion from "./FactoringInversion.js";
import _FactoringPago from "./FactoringPago.js";
import _FactoringPropuesta from "./FactoringPropuesta.js";
import _FactoringPropuestaEstado from "./FactoringPropuestaEstado.js";
import _FactoringPropuestaFinanciero from "./FactoringPropuestaFinanciero.js";
import _FactoringTipo from "./FactoringTipo.js";
import _Factura from "./Factura.js";
import _FacturaImpuesto from "./FacturaImpuesto.js";
import _FacturaItem from "./FacturaItem.js";
import _FacturaMedioPago from "./FacturaMedioPago.js";
import _FacturaNota from "./FacturaNota.js";
import _FacturaTerminoPago from "./FacturaTerminoPago.js";
import _FinancieroConcepto from "./FinancieroConcepto.js";
import _FinancieroTipo from "./FinancieroTipo.js";
import _Genero from "./Genero.js";
import _Inversionista from "./Inversionista.js";
import _InversionistaBancoCuenta from "./InversionistaBancoCuenta.js";
import _InversionistaCuentaBancaria from "./InversionistaCuentaBancaria.js";
import _InversionistaDeposito from "./InversionistaDeposito.js";
import _InversionistaRetiro from "./InversionistaRetiro.js";
import _Moneda from "./Moneda.js";
import _Pais from "./Pais.js";
import _PepVinculo from "./PepVinculo.js";
import _Persona from "./Persona.js";
import _PersonaCuentaBancaria from "./PersonaCuentaBancaria.js";
import _PersonaDeclaracion from "./PersonaDeclaracion.js";
import _PersonaPepDirecto from "./PersonaPepDirecto.js";
import _PersonaPepIndirecto from "./PersonaPepIndirecto.js";
import _PersonaVerificacion from "./PersonaVerificacion.js";
import _PersonaVerificacionEstado from "./PersonaVerificacionEstado.js";
import _Provincia from "./Provincia.js";
import _RegionNatural from "./RegionNatural.js";
import _Riesgo from "./Riesgo.js";
import _Rol from "./Rol.js";
import _Servicio from "./Servicio.js";
import _ServicioEmpresa from "./ServicioEmpresa.js";
import _ServicioEmpresaEstado from "./ServicioEmpresaEstado.js";
import _ServicioEmpresaVerificacion from "./ServicioEmpresaVerificacion.js";
import _Usuario from "./Usuario.js";
import _UsuarioRol from "./UsuarioRol.js";
import _UsuarioServicio from "./UsuarioServicio.js";
import _UsuarioServicioEmpresa from "./UsuarioServicioEmpresa.js";
import _UsuarioServicioEmpresaEstado from "./UsuarioServicioEmpresaEstado.js";
import _UsuarioServicioEmpresaRol from "./UsuarioServicioEmpresaRol.js";
import _UsuarioServicioEstado from "./UsuarioServicioEstado.js";
import _UsuarioServicioVerificacion from "./UsuarioServicioVerificacion.js";
import _Validacion from "./Validacion.js";
import _ValidacionTipo from "./ValidacionTipo.js";
import _ZlaboratorioPedido from "./ZlaboratorioPedido.js";
import _ZlaboratorioUsuario from "./ZlaboratorioUsuario.js";

export default function initModels(sequelize) {
  const Archivo = _Archivo.init(sequelize, DataTypes);
  const ArchivoColaborador = _ArchivoColaborador.init(sequelize, DataTypes);
  const ArchivoCuentaBancaria = _ArchivoCuentaBancaria.init(sequelize, DataTypes);
  const ArchivoEmpresa = _ArchivoEmpresa.init(sequelize, DataTypes);
  const ArchivoEstado = _ArchivoEstado.init(sequelize, DataTypes);
  const ArchivoFactoringHistorialEstado = _ArchivoFactoringHistorialEstado.init(sequelize, DataTypes);
  const ArchivoFactura = _ArchivoFactura.init(sequelize, DataTypes);
  const ArchivoInversionistaDeposito = _ArchivoInversionistaDeposito.init(sequelize, DataTypes);
  const ArchivoInversionistaRetiro = _ArchivoInversionistaRetiro.init(sequelize, DataTypes);
  const ArchivoPersona = _ArchivoPersona.init(sequelize, DataTypes);
  const ArchivoTipo = _ArchivoTipo.init(sequelize, DataTypes);
  const Banco = _Banco.init(sequelize, DataTypes);
  const BancoCuenta = _BancoCuenta.init(sequelize, DataTypes);
  const BancoCuentaEstado = _BancoCuentaEstado.init(sequelize, DataTypes);
  const BancoCuentaTipo = _BancoCuentaTipo.init(sequelize, DataTypes);
  const BancoTransaccion = _BancoTransaccion.init(sequelize, DataTypes);
  const BancoTransaccionEstado = _BancoTransaccionEstado.init(sequelize, DataTypes);
  const BancoTransaccionEstadoHistorial = _BancoTransaccionEstadoHistorial.init(sequelize, DataTypes);
  const BancoTransaccionFactoringInversion = _BancoTransaccionFactoringInversion.init(sequelize, DataTypes);
  const BancoTransaccionInversionistaDeposito = _BancoTransaccionInversionistaDeposito.init(sequelize, DataTypes);
  const BancoTransaccionInversionistaRetiro = _BancoTransaccionInversionistaRetiro.init(sequelize, DataTypes);
  const BancoTransaccionTipo = _BancoTransaccionTipo.init(sequelize, DataTypes);
  const Colaborador = _Colaborador.init(sequelize, DataTypes);
  const ColaboradorTipo = _ColaboradorTipo.init(sequelize, DataTypes);
  const ConfiguracionApp = _ConfiguracionApp.init(sequelize, DataTypes);
  const Contacto = _Contacto.init(sequelize, DataTypes);
  const Credencial = _Credencial.init(sequelize, DataTypes);
  const CuentaBancaria = _CuentaBancaria.init(sequelize, DataTypes);
  const CuentaBancariaEstado = _CuentaBancariaEstado.init(sequelize, DataTypes);
  const CuentaTipo = _CuentaTipo.init(sequelize, DataTypes);
  const Departamento = _Departamento.init(sequelize, DataTypes);
  const Distrito = _Distrito.init(sequelize, DataTypes);
  const DocumentoTipo = _DocumentoTipo.init(sequelize, DataTypes);
  const Empresa = _Empresa.init(sequelize, DataTypes);
  const EmpresaCuentaBancaria = _EmpresaCuentaBancaria.init(sequelize, DataTypes);
  const EmpresaDeclaracion = _EmpresaDeclaracion.init(sequelize, DataTypes);
  const Factor = _Factor.init(sequelize, DataTypes);
  const FactorCuentaBancaria = _FactorCuentaBancaria.init(sequelize, DataTypes);
  const Factoring = _Factoring.init(sequelize, DataTypes);
  const FactoringConfigComision = _FactoringConfigComision.init(sequelize, DataTypes);
  const FactoringConfigGarantia = _FactoringConfigGarantia.init(sequelize, DataTypes);
  const FactoringConfigTasaDescuento = _FactoringConfigTasaDescuento.init(sequelize, DataTypes);
  const FactoringEjecutado = _FactoringEjecutado.init(sequelize, DataTypes);
  const FactoringEjecutadoEstado = _FactoringEjecutadoEstado.init(sequelize, DataTypes);
  const FactoringEstado = _FactoringEstado.init(sequelize, DataTypes);
  const FactoringEstrategia = _FactoringEstrategia.init(sequelize, DataTypes);
  const FactoringFactura = _FactoringFactura.init(sequelize, DataTypes);
  const FactoringHistorialEstado = _FactoringHistorialEstado.init(sequelize, DataTypes);
  const FactoringInversion = _FactoringInversion.init(sequelize, DataTypes);
  const FactoringPago = _FactoringPago.init(sequelize, DataTypes);
  const FactoringPropuesta = _FactoringPropuesta.init(sequelize, DataTypes);
  const FactoringPropuestaEstado = _FactoringPropuestaEstado.init(sequelize, DataTypes);
  const FactoringPropuestaFinanciero = _FactoringPropuestaFinanciero.init(sequelize, DataTypes);
  const FactoringTipo = _FactoringTipo.init(sequelize, DataTypes);
  const Factura = _Factura.init(sequelize, DataTypes);
  const FacturaImpuesto = _FacturaImpuesto.init(sequelize, DataTypes);
  const FacturaItem = _FacturaItem.init(sequelize, DataTypes);
  const FacturaMedioPago = _FacturaMedioPago.init(sequelize, DataTypes);
  const FacturaNota = _FacturaNota.init(sequelize, DataTypes);
  const FacturaTerminoPago = _FacturaTerminoPago.init(sequelize, DataTypes);
  const FinancieroConcepto = _FinancieroConcepto.init(sequelize, DataTypes);
  const FinancieroTipo = _FinancieroTipo.init(sequelize, DataTypes);
  const Genero = _Genero.init(sequelize, DataTypes);
  const Inversionista = _Inversionista.init(sequelize, DataTypes);
  const InversionistaBancoCuenta = _InversionistaBancoCuenta.init(sequelize, DataTypes);
  const InversionistaCuentaBancaria = _InversionistaCuentaBancaria.init(sequelize, DataTypes);
  const InversionistaDeposito = _InversionistaDeposito.init(sequelize, DataTypes);
  const InversionistaRetiro = _InversionistaRetiro.init(sequelize, DataTypes);
  const Moneda = _Moneda.init(sequelize, DataTypes);
  const Pais = _Pais.init(sequelize, DataTypes);
  const PepVinculo = _PepVinculo.init(sequelize, DataTypes);
  const Persona = _Persona.init(sequelize, DataTypes);
  const PersonaCuentaBancaria = _PersonaCuentaBancaria.init(sequelize, DataTypes);
  const PersonaDeclaracion = _PersonaDeclaracion.init(sequelize, DataTypes);
  const PersonaPepDirecto = _PersonaPepDirecto.init(sequelize, DataTypes);
  const PersonaPepIndirecto = _PersonaPepIndirecto.init(sequelize, DataTypes);
  const PersonaVerificacion = _PersonaVerificacion.init(sequelize, DataTypes);
  const PersonaVerificacionEstado = _PersonaVerificacionEstado.init(sequelize, DataTypes);
  const Provincia = _Provincia.init(sequelize, DataTypes);
  const RegionNatural = _RegionNatural.init(sequelize, DataTypes);
  const Riesgo = _Riesgo.init(sequelize, DataTypes);
  const Rol = _Rol.init(sequelize, DataTypes);
  const Servicio = _Servicio.init(sequelize, DataTypes);
  const ServicioEmpresa = _ServicioEmpresa.init(sequelize, DataTypes);
  const ServicioEmpresaEstado = _ServicioEmpresaEstado.init(sequelize, DataTypes);
  const ServicioEmpresaVerificacion = _ServicioEmpresaVerificacion.init(sequelize, DataTypes);
  const Usuario = _Usuario.init(sequelize, DataTypes);
  const UsuarioRol = _UsuarioRol.init(sequelize, DataTypes);
  const UsuarioServicio = _UsuarioServicio.init(sequelize, DataTypes);
  const UsuarioServicioEmpresa = _UsuarioServicioEmpresa.init(sequelize, DataTypes);
  const UsuarioServicioEmpresaEstado = _UsuarioServicioEmpresaEstado.init(sequelize, DataTypes);
  const UsuarioServicioEmpresaRol = _UsuarioServicioEmpresaRol.init(sequelize, DataTypes);
  const UsuarioServicioEstado = _UsuarioServicioEstado.init(sequelize, DataTypes);
  const UsuarioServicioVerificacion = _UsuarioServicioVerificacion.init(sequelize, DataTypes);
  const Validacion = _Validacion.init(sequelize, DataTypes);
  const ValidacionTipo = _ValidacionTipo.init(sequelize, DataTypes);
  const ZlaboratorioPedido = _ZlaboratorioPedido.init(sequelize, DataTypes);
  const ZlaboratorioUsuario = _ZlaboratorioUsuario.init(sequelize, DataTypes);

  Archivo.belongsToMany(Colaborador, { as: "colaborador_colaboradors", through: ArchivoColaborador, foreignKey: "_idarchivo", otherKey: "_idcolaborador" });
  Archivo.belongsToMany(CuentaBancaria, { as: "cuentabancaria_cuenta_bancaria", through: ArchivoCuentaBancaria, foreignKey: "_idarchivo", otherKey: "_idcuentabancaria" });
  Archivo.belongsToMany(Empresa, { as: "empresa_empresas", through: ArchivoEmpresa, foreignKey: "_idarchivo", otherKey: "_idempresa" });
  Archivo.belongsToMany(FactoringHistorialEstado, { as: "factoringhistorialestado_factoring_historial_estados", through: ArchivoFactoringHistorialEstado, foreignKey: "_idarchivo", otherKey: "_idfactoringhistorialestado" });
  Archivo.belongsToMany(Factura, { as: "factura_facturas", through: ArchivoFactura, foreignKey: "_idarchivo", otherKey: "_idfactura" });
  Archivo.belongsToMany(InversionistaDeposito, { as: "inversionistadeposito_inversionista_depositos", through: ArchivoInversionistaDeposito, foreignKey: "_idarchivo", otherKey: "_idinversionistadeposito" });
  Archivo.belongsToMany(InversionistaRetiro, { as: "inversionistaretiro_inversionista_retiros", through: ArchivoInversionistaRetiro, foreignKey: "_idarchivo", otherKey: "_idinversionistaretiro" });
  Archivo.belongsToMany(Persona, { as: "persona_personas", through: ArchivoPersona, foreignKey: "_idarchivo", otherKey: "_idpersona" });
  BancoCuenta.belongsToMany(Inversionista, { as: "inversionista_inversionista", through: InversionistaBancoCuenta, foreignKey: "_idbancocuenta", otherKey: "_idinversionista" });
  BancoTransaccion.belongsToMany(InversionistaDeposito, { as: "inversionistadeposito_inversionista_deposito_banco_transaccion_inversionista_depositos", through: BancoTransaccionInversionistaDeposito, foreignKey: "_idbancotransaccion", otherKey: "_idinversionistadeposito" });
  BancoTransaccion.belongsToMany(InversionistaRetiro, { as: "inversionistaretiro_inversionista_retiro_banco_transaccion_inversionista_retiros", through: BancoTransaccionInversionistaRetiro, foreignKey: "_idbancotransaccion", otherKey: "_idinversionistaretiro" });
  Colaborador.belongsToMany(Archivo, { as: "archivo_archivos", through: ArchivoColaborador, foreignKey: "_idcolaborador", otherKey: "_idarchivo" });
  CuentaBancaria.belongsToMany(Archivo, { as: "archivo_archivo_archivo_cuenta_bancaria", through: ArchivoCuentaBancaria, foreignKey: "_idcuentabancaria", otherKey: "_idarchivo" });
  Empresa.belongsToMany(Archivo, { as: "archivo_archivo_archivo_empresas", through: ArchivoEmpresa, foreignKey: "_idempresa", otherKey: "_idarchivo" });
  Factoring.belongsToMany(Factura, { as: "factura_factura_factoring_facturas", through: FactoringFactura, foreignKey: "_idfactoring", otherKey: "_idfactura" });
  FactoringHistorialEstado.belongsToMany(Archivo, { as: "archivo_archivo_archivo_factoring_historial_estados", through: ArchivoFactoringHistorialEstado, foreignKey: "_idfactoringhistorialestado", otherKey: "_idarchivo" });
  Factura.belongsToMany(Archivo, { as: "archivo_archivo_archivo_facturas", through: ArchivoFactura, foreignKey: "_idfactura", otherKey: "_idarchivo" });
  Factura.belongsToMany(Factoring, { as: "factoring_factorings", through: FactoringFactura, foreignKey: "_idfactura", otherKey: "_idfactoring" });
  Inversionista.belongsToMany(BancoCuenta, { as: "bancocuenta_banco_cuenta", through: InversionistaBancoCuenta, foreignKey: "_idinversionista", otherKey: "_idbancocuenta" });
  InversionistaDeposito.belongsToMany(Archivo, { as: "archivo_archivo_archivo_inversionista_depositos", through: ArchivoInversionistaDeposito, foreignKey: "_idinversionistadeposito", otherKey: "_idarchivo" });
  InversionistaDeposito.belongsToMany(BancoTransaccion, { as: "bancotransaccion_banco_transaccions", through: BancoTransaccionInversionistaDeposito, foreignKey: "_idinversionistadeposito", otherKey: "_idbancotransaccion" });
  InversionistaRetiro.belongsToMany(Archivo, { as: "archivo_archivo_archivo_inversionista_retiros", through: ArchivoInversionistaRetiro, foreignKey: "_idinversionistaretiro", otherKey: "_idarchivo" });
  InversionistaRetiro.belongsToMany(BancoTransaccion, { as: "bancotransaccion_banco_transaccion_banco_transaccion_inversionista_retiros", through: BancoTransaccionInversionistaRetiro, foreignKey: "_idinversionistaretiro", otherKey: "_idbancotransaccion" });
  Persona.belongsToMany(Archivo, { as: "archivo_archivo_archivo_personas", through: ArchivoPersona, foreignKey: "_idpersona", otherKey: "_idarchivo" });
  Rol.belongsToMany(Usuario, { as: "usuario_usuarios", through: UsuarioRol, foreignKey: "_idrol", otherKey: "_idusuario" });
  Usuario.belongsToMany(Rol, { as: "rol_rols", through: UsuarioRol, foreignKey: "_idusuario", otherKey: "_idrol" });
  ArchivoColaborador.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo" });
  Archivo.hasMany(ArchivoColaborador, { as: "archivo_colaboradors", foreignKey: "_idarchivo" });
  ArchivoCuentaBancaria.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo" });
  Archivo.hasMany(ArchivoCuentaBancaria, { as: "archivo_cuenta_bancaria", foreignKey: "_idarchivo" });
  ArchivoEmpresa.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo" });
  Archivo.hasMany(ArchivoEmpresa, { as: "archivo_empresas", foreignKey: "_idarchivo" });
  ArchivoFactoringHistorialEstado.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo" });
  Archivo.hasMany(ArchivoFactoringHistorialEstado, { as: "archivo_factoring_historial_estados", foreignKey: "_idarchivo" });
  ArchivoFactura.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo" });
  Archivo.hasMany(ArchivoFactura, { as: "archivo_facturas", foreignKey: "_idarchivo" });
  ArchivoInversionistaDeposito.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo" });
  Archivo.hasMany(ArchivoInversionistaDeposito, { as: "archivo_inversionista_depositos", foreignKey: "_idarchivo" });
  ArchivoInversionistaRetiro.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo" });
  Archivo.hasMany(ArchivoInversionistaRetiro, { as: "archivo_inversionista_retiros", foreignKey: "_idarchivo" });
  ArchivoPersona.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo" });
  Archivo.hasMany(ArchivoPersona, { as: "archivo_personas", foreignKey: "_idarchivo" });
  Archivo.belongsTo(ArchivoEstado, { as: "archivoestado_archivo_estado", foreignKey: "_idarchivoestado" });
  ArchivoEstado.hasMany(Archivo, { as: "archivos", foreignKey: "_idarchivoestado" });
  Archivo.belongsTo(ArchivoTipo, { as: "archivotipo_archivo_tipo", foreignKey: "_idarchivotipo" });
  ArchivoTipo.hasMany(Archivo, { as: "archivos", foreignKey: "_idarchivotipo" });
  CuentaBancaria.belongsTo(Banco, { as: "banco_banco", foreignKey: "_idbanco" });
  Banco.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idbanco" });
  BancoTransaccion.belongsTo(BancoCuenta, { as: "bancocuenta_banco_cuentum", foreignKey: "_idbancocuenta" });
  BancoCuenta.hasMany(BancoTransaccion, { as: "banco_transaccions", foreignKey: "_idbancocuenta" });
  InversionistaBancoCuenta.belongsTo(BancoCuenta, { as: "bancocuenta_banco_cuentum", foreignKey: "_idbancocuenta" });
  BancoCuenta.hasMany(InversionistaBancoCuenta, { as: "inversionista_banco_cuenta", foreignKey: "_idbancocuenta" });
  InversionistaDeposito.belongsTo(BancoCuenta, { as: "bancocuenta_banco_cuentum", foreignKey: "_idbancocuenta" });
  BancoCuenta.hasMany(InversionistaDeposito, { as: "inversionista_depositos", foreignKey: "_idbancocuenta" });
  InversionistaRetiro.belongsTo(BancoCuenta, { as: "bancocuenta_banco_cuentum", foreignKey: "_idbancocuenta" });
  BancoCuenta.hasMany(InversionistaRetiro, { as: "inversionista_retiros", foreignKey: "_idbancocuenta" });
  BancoCuenta.belongsTo(BancoCuentaEstado, { as: "bancocuentaestado_banco_cuenta_estado", foreignKey: "_idbancocuentaestado" });
  BancoCuentaEstado.hasMany(BancoCuenta, { as: "banco_cuenta", foreignKey: "_idbancocuentaestado" });
  BancoCuenta.belongsTo(BancoCuentaTipo, { as: "bancocuentatipo_banco_cuenta_tipo", foreignKey: "_idbancocuentatipo" });
  BancoCuentaTipo.hasMany(BancoCuenta, { as: "banco_cuenta", foreignKey: "_idbancocuentatipo" });
  BancoTransaccionEstadoHistorial.belongsTo(BancoTransaccion, { as: "bancotransaccion_banco_transaccion", foreignKey: "_idbancotransaccion" });
  BancoTransaccion.hasMany(BancoTransaccionEstadoHistorial, { as: "banco_transaccion_estado_historials", foreignKey: "_idbancotransaccion" });
  BancoTransaccionFactoringInversion.belongsTo(BancoTransaccion, { as: "bancotransaccion_banco_transaccion", foreignKey: "_idbancotransaccion" });
  BancoTransaccion.hasMany(BancoTransaccionFactoringInversion, { as: "banco_transaccion_factoring_inversions", foreignKey: "_idbancotransaccion" });
  BancoTransaccionInversionistaDeposito.belongsTo(BancoTransaccion, { as: "bancotransaccion_banco_transaccion", foreignKey: "_idbancotransaccion" });
  BancoTransaccion.hasMany(BancoTransaccionInversionistaDeposito, { as: "banco_transaccion_inversionista_depositos", foreignKey: "_idbancotransaccion" });
  BancoTransaccionInversionistaRetiro.belongsTo(BancoTransaccion, { as: "bancotransaccion_banco_transaccion", foreignKey: "_idbancotransaccion" });
  BancoTransaccion.hasMany(BancoTransaccionInversionistaRetiro, { as: "banco_transaccion_inversionista_retiros", foreignKey: "_idbancotransaccion" });
  BancoTransaccion.belongsTo(BancoTransaccionEstado, { as: "bancotransaccionestado_banco_transaccion_estado", foreignKey: "_idbancotransaccionestado" });
  BancoTransaccionEstado.hasMany(BancoTransaccion, { as: "banco_transaccions", foreignKey: "_idbancotransaccionestado" });
  BancoTransaccionEstadoHistorial.belongsTo(BancoTransaccionEstado, { as: "bancotransaccionestado_banco_transaccion_estado", foreignKey: "_idbancotransaccionestado" });
  BancoTransaccionEstado.hasMany(BancoTransaccionEstadoHistorial, { as: "banco_transaccion_estado_historials", foreignKey: "_idbancotransaccionestado" });
  BancoTransaccion.belongsTo(BancoTransaccionEstadoHistorial, { as: "bancotransaccionestadohistorial_banco_transaccion_estado_historial", foreignKey: "_idbancotransaccionestadohistorial" });
  BancoTransaccionEstadoHistorial.hasMany(BancoTransaccion, { as: "banco_transaccions", foreignKey: "_idbancotransaccionestadohistorial" });
  BancoTransaccion.belongsTo(BancoTransaccionTipo, { as: "bancotransaciontipo_banco_transaccion_tipo", foreignKey: "_idbancotransaciontipo" });
  BancoTransaccionTipo.hasMany(BancoTransaccion, { as: "banco_transaccions", foreignKey: "_idbancotransaciontipo" });
  ArchivoColaborador.belongsTo(Colaborador, { as: "colaborador_colaborador", foreignKey: "_idcolaborador" });
  Colaborador.hasMany(ArchivoColaborador, { as: "archivo_colaboradors", foreignKey: "_idcolaborador" });
  Factoring.belongsTo(Colaborador, { as: "contactocedente_colaborador", foreignKey: "_idcontactocedente" });
  Colaborador.hasMany(Factoring, { as: "factorings", foreignKey: "_idcontactocedente" });
  Colaborador.belongsTo(ColaboradorTipo, { as: "colaboradortipo_colaborador_tipo", foreignKey: "_idcolaboradortipo" });
  ColaboradorTipo.hasMany(Colaborador, { as: "colaboradors", foreignKey: "_idcolaboradortipo" });
  Factoring.belongsTo(Contacto, { as: "contactoaceptante_contacto", foreignKey: "_idcontactoaceptante" });
  Contacto.hasMany(Factoring, { as: "factorings", foreignKey: "_idcontactoaceptante" });
  ArchivoCuentaBancaria.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.hasMany(ArchivoCuentaBancaria, { as: "archivo_cuenta_bancaria", foreignKey: "_idcuentabancaria" });
  EmpresaCuentaBancaria.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.hasMany(EmpresaCuentaBancaria, { as: "empresa_cuenta_bancaria", foreignKey: "_idcuentabancaria" });
  FactorCuentaBancaria.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.hasMany(FactorCuentaBancaria, { as: "factor_cuenta_bancaria", foreignKey: "_idcuentabancaria" });
  Factoring.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.hasMany(Factoring, { as: "factorings", foreignKey: "_idcuentabancaria" });
  InversionistaCuentaBancaria.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.hasMany(InversionistaCuentaBancaria, { as: "inversionista_cuenta_bancaria", foreignKey: "_idcuentabancaria" });
  PersonaCuentaBancaria.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.hasMany(PersonaCuentaBancaria, { as: "persona_cuenta_bancaria", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.belongsTo(CuentaBancariaEstado, { as: "cuentabancariaestado_cuenta_bancaria_estado", foreignKey: "_idcuentabancariaestado" });
  CuentaBancariaEstado.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idcuentabancariaestado" });
  CuentaBancaria.belongsTo(CuentaTipo, { as: "cuentatipo_cuenta_tipo", foreignKey: "_idcuentatipo" });
  CuentaTipo.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idcuentatipo" });
  Empresa.belongsTo(Departamento, { as: "departamentosede_departamento", foreignKey: "_iddepartamentosede" });
  Departamento.hasMany(Empresa, { as: "empresas", foreignKey: "_iddepartamentosede" });
  Factor.belongsTo(Departamento, { as: "departamentosede_departamento", foreignKey: "_iddepartamentosede" });
  Departamento.hasMany(Factor, { as: "factors", foreignKey: "_iddepartamentosede" });
  Persona.belongsTo(Departamento, { as: "departamentoresidencia_departamento", foreignKey: "_iddepartamentoresidencia" });
  Departamento.hasMany(Persona, { as: "personas", foreignKey: "_iddepartamentoresidencia" });
  Provincia.belongsTo(Departamento, { as: "departamento_departamento", foreignKey: "_iddepartamento" });
  Departamento.hasMany(Provincia, { as: "provincia", foreignKey: "_iddepartamento" });
  Empresa.belongsTo(Distrito, { as: "distritosede_distrito", foreignKey: "_iddistritosede" });
  Distrito.hasMany(Empresa, { as: "empresas", foreignKey: "_iddistritosede" });
  Factor.belongsTo(Distrito, { as: "distritosede_distrito", foreignKey: "_iddistritosede" });
  Distrito.hasMany(Factor, { as: "factors", foreignKey: "_iddistritosede" });
  Persona.belongsTo(Distrito, { as: "distritoresidencia_distrito", foreignKey: "_iddistritoresidencia" });
  Distrito.hasMany(Persona, { as: "personas", foreignKey: "_iddistritoresidencia" });
  Colaborador.belongsTo(DocumentoTipo, { as: "documentotipo_documento_tipo", foreignKey: "_iddocumentotipo" });
  DocumentoTipo.hasMany(Colaborador, { as: "colaboradors", foreignKey: "_iddocumentotipo" });
  Persona.belongsTo(DocumentoTipo, { as: "documentotipo_documento_tipo", foreignKey: "_iddocumentotipo" });
  DocumentoTipo.hasMany(Persona, { as: "personas", foreignKey: "_iddocumentotipo" });
  Usuario.belongsTo(DocumentoTipo, { as: "documentotipo_documento_tipo", foreignKey: "_iddocumentotipo" });
  DocumentoTipo.hasMany(Usuario, { as: "usuarios", foreignKey: "_iddocumentotipo" });
  ArchivoEmpresa.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa" });
  Empresa.hasMany(ArchivoEmpresa, { as: "archivo_empresas", foreignKey: "_idempresa" });
  Colaborador.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa" });
  Empresa.hasMany(Colaborador, { as: "colaboradors", foreignKey: "_idempresa" });
  Contacto.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa" });
  Empresa.hasMany(Contacto, { as: "contactos", foreignKey: "_idempresa" });
  EmpresaCuentaBancaria.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa" });
  Empresa.hasMany(EmpresaCuentaBancaria, { as: "empresa_cuenta_bancaria", foreignKey: "_idempresa" });
  Factoring.belongsTo(Empresa, { as: "aceptante_empresa", foreignKey: "_idaceptante" });
  Empresa.hasMany(Factoring, { as: "factorings", foreignKey: "_idaceptante" });
  Factoring.belongsTo(Empresa, { as: "cedente_empresa", foreignKey: "_idcedente" });
  Empresa.hasMany(Factoring, { as: "cedente_factorings", foreignKey: "_idcedente" });
  ServicioEmpresa.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa" });
  Empresa.hasMany(ServicioEmpresa, { as: "servicio_empresas", foreignKey: "_idempresa" });
  UsuarioServicioEmpresa.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa" });
  Empresa.hasMany(UsuarioServicioEmpresa, { as: "usuario_servicio_empresas", foreignKey: "_idempresa" });
  FactoringPago.belongsTo(EmpresaCuentaBancaria, { as: "empresacuentabancaria_empresa_cuenta_bancarium", foreignKey: "_idempresacuentabancaria" });
  EmpresaCuentaBancaria.hasMany(FactoringPago, { as: "factoring_pagos", foreignKey: "_idempresacuentabancaria" });
  FactorCuentaBancaria.belongsTo(Factor, { as: "factor_factor", foreignKey: "_idfactor" });
  Factor.hasMany(FactorCuentaBancaria, { as: "factor_cuenta_bancaria", foreignKey: "_idfactor" });
  FactoringPago.belongsTo(FactorCuentaBancaria, { as: "factorcuentabancaria_factor_cuenta_bancarium", foreignKey: "_idfactorcuentabancaria" });
  FactorCuentaBancaria.hasMany(FactoringPago, { as: "factoring_pagos", foreignKey: "_idfactorcuentabancaria" });
  InversionistaDeposito.belongsTo(FactorCuentaBancaria, { as: "factorcuentabancaria_factor_cuenta_bancarium", foreignKey: "_idfactorcuentabancaria" });
  FactorCuentaBancaria.hasMany(InversionistaDeposito, { as: "inversionista_depositos", foreignKey: "_idfactorcuentabancaria" });
  InversionistaRetiro.belongsTo(FactorCuentaBancaria, { as: "factorcuentabancaria_factor_cuenta_bancarium", foreignKey: "_idfactorcuentabancaria" });
  FactorCuentaBancaria.hasMany(InversionistaRetiro, { as: "inversionista_retiros", foreignKey: "_idfactorcuentabancaria" });
  FactoringEjecutado.belongsTo(Factoring, { as: "factoring_factoring", foreignKey: "_idfactoring" });
  Factoring.hasMany(FactoringEjecutado, { as: "factoring_ejecutados", foreignKey: "_idfactoring" });
  FactoringFactura.belongsTo(Factoring, { as: "factoring_factoring", foreignKey: "_idfactoring" });
  Factoring.hasMany(FactoringFactura, { as: "factoring_facturas", foreignKey: "_idfactoring" });
  FactoringHistorialEstado.belongsTo(Factoring, { as: "factoring_factoring", foreignKey: "_idfactoring" });
  Factoring.hasMany(FactoringHistorialEstado, { as: "factoring_historial_estados", foreignKey: "_idfactoring" });
  FactoringPago.belongsTo(Factoring, { as: "factoring_factoring", foreignKey: "_idfactoring" });
  Factoring.hasMany(FactoringPago, { as: "factoring_pagos", foreignKey: "_idfactoring" });
  FactoringPropuesta.belongsTo(Factoring, { as: "factoring_factoring", foreignKey: "_idfactoring" });
  Factoring.hasMany(FactoringPropuesta, { as: "factoring_propuesta", foreignKey: "_idfactoring" });
  Factoring.belongsTo(FactoringEjecutado, { as: "factoringejecutado_factoring_ejecutado", foreignKey: "_idfactoringejecutado" });
  FactoringEjecutado.hasMany(Factoring, { as: "factorings", foreignKey: "_idfactoringejecutado" });
  FactoringEjecutado.belongsTo(FactoringEjecutadoEstado, { as: "factoringejecutadoaestado_factoring_ejecutado_estado", foreignKey: "_idfactoringejecutadoaestado" });
  FactoringEjecutadoEstado.hasMany(FactoringEjecutado, { as: "factoring_ejecutados", foreignKey: "_idfactoringejecutadoaestado" });
  Factoring.belongsTo(FactoringEstado, { as: "factoringestado_factoring_estado", foreignKey: "_idfactoringestado" });
  FactoringEstado.hasMany(Factoring, { as: "factorings", foreignKey: "_idfactoringestado" });
  FactoringHistorialEstado.belongsTo(FactoringEstado, { as: "factoringestado_factoring_estado", foreignKey: "_idfactoringestado" });
  FactoringEstado.hasMany(FactoringHistorialEstado, { as: "factoring_historial_estados", foreignKey: "_idfactoringestado" });
  FactoringPropuesta.belongsTo(FactoringEstrategia, { as: "factoringestrategia_factoring_estrategium", foreignKey: "_idfactoringestrategia" });
  FactoringEstrategia.hasMany(FactoringPropuesta, { as: "factoring_propuesta", foreignKey: "_idfactoringestrategia" });
  ArchivoFactoringHistorialEstado.belongsTo(FactoringHistorialEstado, { as: "factoringhistorialestado_factoring_historial_estado", foreignKey: "_idfactoringhistorialestado" });
  FactoringHistorialEstado.hasMany(ArchivoFactoringHistorialEstado, { as: "archivo_factoring_historial_estados", foreignKey: "_idfactoringhistorialestado" });
  BancoTransaccionFactoringInversion.belongsTo(FactoringInversion, { as: "factoringinversion_factoring_inversion", foreignKey: "_idfactoringinversion" });
  FactoringInversion.hasMany(BancoTransaccionFactoringInversion, { as: "banco_transaccion_factoring_inversions", foreignKey: "_idfactoringinversion" });
  Factoring.belongsTo(FactoringPropuesta, { as: "factoringpropuestaaceptada_factoring_propuestum", foreignKey: "_idfactoringpropuestaaceptada" });
  FactoringPropuesta.hasMany(Factoring, { as: "factorings", foreignKey: "_idfactoringpropuestaaceptada" });
  FactoringPropuestaFinanciero.belongsTo(FactoringPropuesta, { as: "factoringpropuesta_factoring_propuestum", foreignKey: "_idfactoringpropuesta" });
  FactoringPropuesta.hasMany(FactoringPropuestaFinanciero, { as: "factoring_propuesta_financieros", foreignKey: "_idfactoringpropuesta" });
  FactoringPropuesta.belongsTo(FactoringPropuestaEstado, { as: "factoringpropuestaestado_factoring_propuesta_estado", foreignKey: "_idfactoringpropuestaestado" });
  FactoringPropuestaEstado.hasMany(FactoringPropuesta, { as: "factoring_propuesta", foreignKey: "_idfactoringpropuestaestado" });
  FactoringPropuesta.belongsTo(FactoringTipo, { as: "factoringtipo_factoring_tipo", foreignKey: "_idfactoringtipo" });
  FactoringTipo.hasMany(FactoringPropuesta, { as: "factoring_propuesta", foreignKey: "_idfactoringtipo" });
  ArchivoFactura.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura" });
  Factura.hasMany(ArchivoFactura, { as: "archivo_facturas", foreignKey: "_idfactura" });
  FactoringFactura.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura" });
  Factura.hasMany(FactoringFactura, { as: "factoring_facturas", foreignKey: "_idfactura" });
  FacturaImpuesto.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura" });
  Factura.hasMany(FacturaImpuesto, { as: "factura_impuestos", foreignKey: "_idfactura" });
  FacturaItem.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura" });
  Factura.hasMany(FacturaItem, { as: "factura_items", foreignKey: "_idfactura" });
  FacturaMedioPago.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura" });
  Factura.hasMany(FacturaMedioPago, { as: "factura_medio_pagos", foreignKey: "_idfactura" });
  FacturaNota.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura" });
  Factura.hasMany(FacturaNota, { as: "factura_nota", foreignKey: "_idfactura" });
  FacturaTerminoPago.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura" });
  Factura.hasMany(FacturaTerminoPago, { as: "factura_termino_pagos", foreignKey: "_idfactura" });
  FactoringPropuestaFinanciero.belongsTo(FinancieroConcepto, { as: "financieroconcepto_financiero_concepto", foreignKey: "_idfinancieroconcepto" });
  FinancieroConcepto.hasMany(FactoringPropuestaFinanciero, { as: "factoring_propuesta_financieros", foreignKey: "_idfinancieroconcepto" });
  FactoringPropuestaFinanciero.belongsTo(FinancieroTipo, { as: "financierotipo_financiero_tipo", foreignKey: "_idfinancierotipo" });
  FinancieroTipo.hasMany(FactoringPropuestaFinanciero, { as: "factoring_propuesta_financieros", foreignKey: "_idfinancierotipo" });
  Persona.belongsTo(Genero, { as: "genero_genero", foreignKey: "_idgenero" });
  Genero.hasMany(Persona, { as: "personas", foreignKey: "_idgenero" });
  InversionistaBancoCuenta.belongsTo(Inversionista, { as: "inversionista_inversionistum", foreignKey: "_idinversionista" });
  Inversionista.hasMany(InversionistaBancoCuenta, { as: "inversionista_banco_cuenta", foreignKey: "_idinversionista" });
  InversionistaCuentaBancaria.belongsTo(Inversionista, { as: "inversionista_inversionistum", foreignKey: "_idinversionista" });
  Inversionista.hasMany(InversionistaCuentaBancaria, { as: "inversionista_cuenta_bancaria", foreignKey: "_idinversionista" });
  InversionistaDeposito.belongsTo(InversionistaCuentaBancaria, { as: "inversionistacuentabancaria_inversionista_cuenta_bancarium", foreignKey: "_idinversionistacuentabancaria" });
  InversionistaCuentaBancaria.hasMany(InversionistaDeposito, { as: "inversionista_depositos", foreignKey: "_idinversionistacuentabancaria" });
  InversionistaRetiro.belongsTo(InversionistaCuentaBancaria, { as: "inversionistacuentabancaria_inversionista_cuenta_bancarium", foreignKey: "_idinversionistacuentabancaria" });
  InversionistaCuentaBancaria.hasMany(InversionistaRetiro, { as: "inversionista_retiros", foreignKey: "_idinversionistacuentabancaria" });
  ArchivoInversionistaDeposito.belongsTo(InversionistaDeposito, { as: "inversionistadeposito_inversionista_deposito", foreignKey: "_idinversionistadeposito" });
  InversionistaDeposito.hasMany(ArchivoInversionistaDeposito, { as: "archivo_inversionista_depositos", foreignKey: "_idinversionistadeposito" });
  BancoTransaccionInversionistaDeposito.belongsTo(InversionistaDeposito, { as: "inversionistadeposito_inversionista_deposito", foreignKey: "_idinversionistadeposito" });
  InversionistaDeposito.hasMany(BancoTransaccionInversionistaDeposito, { as: "banco_transaccion_inversionista_depositos", foreignKey: "_idinversionistadeposito" });
  ArchivoInversionistaRetiro.belongsTo(InversionistaRetiro, { as: "inversionistaretiro_inversionista_retiro", foreignKey: "_idinversionistaretiro" });
  InversionistaRetiro.hasMany(ArchivoInversionistaRetiro, { as: "archivo_inversionista_retiros", foreignKey: "_idinversionistaretiro" });
  BancoTransaccionInversionistaRetiro.belongsTo(InversionistaRetiro, { as: "inversionistaretiro_inversionista_retiro", foreignKey: "_idinversionistaretiro" });
  InversionistaRetiro.hasMany(BancoTransaccionInversionistaRetiro, { as: "banco_transaccion_inversionista_retiros", foreignKey: "_idinversionistaretiro" });
  BancoCuenta.belongsTo(Moneda, { as: "moneda_moneda", foreignKey: "_idmoneda" });
  Moneda.hasMany(BancoCuenta, { as: "banco_cuenta", foreignKey: "_idmoneda" });
  CuentaBancaria.belongsTo(Moneda, { as: "moneda_moneda", foreignKey: "_idmoneda" });
  Moneda.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idmoneda" });
  Factoring.belongsTo(Moneda, { as: "moneda_moneda", foreignKey: "_idmoneda" });
  Moneda.hasMany(Factoring, { as: "factorings", foreignKey: "_idmoneda" });
  Departamento.belongsTo(Pais, { as: "pais_pai", foreignKey: "_idpais" });
  Pais.hasMany(Departamento, { as: "departamentos", foreignKey: "_idpais" });
  Empresa.belongsTo(Pais, { as: "paissede_pai", foreignKey: "_idpaissede" });
  Pais.hasMany(Empresa, { as: "empresas", foreignKey: "_idpaissede" });
  Factor.belongsTo(Pais, { as: "paissede_pai", foreignKey: "_idpaissede" });
  Pais.hasMany(Factor, { as: "factors", foreignKey: "_idpaissede" });
  Persona.belongsTo(Pais, { as: "paisnacionalidad_pai", foreignKey: "_idpaisnacionalidad" });
  Pais.hasMany(Persona, { as: "personas", foreignKey: "_idpaisnacionalidad" });
  Persona.belongsTo(Pais, { as: "paisnacimiento_pai", foreignKey: "_idpaisnacimiento" });
  Pais.hasMany(Persona, { as: "paisnacimiento_personas", foreignKey: "_idpaisnacimiento" });
  Persona.belongsTo(Pais, { as: "paisresidencia_pai", foreignKey: "_idpaisresidencia" });
  Pais.hasMany(Persona, { as: "paisresidencia_personas", foreignKey: "_idpaisresidencia" });
  PersonaPepIndirecto.belongsTo(PepVinculo, { as: "pepevinculo_pep_vinculo", foreignKey: "_idpepevinculo" });
  PepVinculo.hasMany(PersonaPepIndirecto, { as: "persona_pep_indirectos", foreignKey: "_idpepevinculo" });
  ArchivoPersona.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona" });
  Persona.hasMany(ArchivoPersona, { as: "archivo_personas", foreignKey: "_idpersona" });
  Colaborador.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona" });
  Persona.hasMany(Colaborador, { as: "colaboradors", foreignKey: "_idpersona" });
  Inversionista.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona" });
  Persona.hasOne(Inversionista, { as: "inversionistum", foreignKey: "_idpersona" });
  PersonaCuentaBancaria.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona" });
  Persona.hasMany(PersonaCuentaBancaria, { as: "persona_cuenta_bancaria", foreignKey: "_idpersona" });
  PersonaDeclaracion.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona" });
  Persona.hasMany(PersonaDeclaracion, { as: "persona_declaracions", foreignKey: "_idpersona" });
  PersonaPepDirecto.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona" });
  Persona.hasMany(PersonaPepDirecto, { as: "persona_pep_directos", foreignKey: "_idpersona" });
  PersonaPepIndirecto.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona" });
  Persona.hasMany(PersonaPepIndirecto, { as: "persona_pep_indirectos", foreignKey: "_idpersona" });
  PersonaVerificacion.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona" });
  Persona.hasMany(PersonaVerificacion, { as: "persona_verificacions", foreignKey: "_idpersona" });
  Persona.belongsTo(PersonaVerificacionEstado, { as: "personaverificacionestado_persona_verificacion_estado", foreignKey: "_idpersonaverificacionestado" });
  PersonaVerificacionEstado.hasMany(Persona, { as: "personas", foreignKey: "_idpersonaverificacionestado" });
  PersonaVerificacion.belongsTo(PersonaVerificacionEstado, { as: "personaverificacionestado_persona_verificacion_estado", foreignKey: "_idpersonaverificacionestado" });
  PersonaVerificacionEstado.hasMany(PersonaVerificacion, { as: "persona_verificacions", foreignKey: "_idpersonaverificacionestado" });
  Distrito.belongsTo(Provincia, { as: "provincia_provincium", foreignKey: "_idprovincia" });
  Provincia.hasMany(Distrito, { as: "distritos", foreignKey: "_idprovincia" });
  Empresa.belongsTo(Provincia, { as: "provinciasede_provincium", foreignKey: "_idprovinciasede" });
  Provincia.hasMany(Empresa, { as: "empresas", foreignKey: "_idprovinciasede" });
  Factor.belongsTo(Provincia, { as: "provinciasede_provincium", foreignKey: "_idprovinciasede" });
  Provincia.hasMany(Factor, { as: "factors", foreignKey: "_idprovinciasede" });
  Persona.belongsTo(Provincia, { as: "provinciaresidencia_provincium", foreignKey: "_idprovinciaresidencia" });
  Provincia.hasMany(Persona, { as: "personas", foreignKey: "_idprovinciaresidencia" });
  Distrito.belongsTo(RegionNatural, { as: "regionnatural_region_natural", foreignKey: "_idregionnatural" });
  RegionNatural.hasMany(Distrito, { as: "distritos", foreignKey: "_idregionnatural" });
  Empresa.belongsTo(Riesgo, { as: "riesgo_riesgo", foreignKey: "_idriesgo" });
  Riesgo.hasMany(Empresa, { as: "empresas", foreignKey: "_idriesgo" });
  Factor.belongsTo(Riesgo, { as: "riesgo_riesgo", foreignKey: "_idriesgo" });
  Riesgo.hasMany(Factor, { as: "factors", foreignKey: "_idriesgo" });
  FactoringConfigComision.belongsTo(Riesgo, { as: "riesgo_riesgo", foreignKey: "_idriesgo" });
  Riesgo.hasMany(FactoringConfigComision, { as: "factoring_config_comisions", foreignKey: "_idriesgo" });
  FactoringConfigGarantia.belongsTo(Riesgo, { as: "riesgo_riesgo", foreignKey: "_idriesgo" });
  Riesgo.hasMany(FactoringConfigGarantia, { as: "factoring_config_garantia", foreignKey: "_idriesgo" });
  FactoringConfigTasaDescuento.belongsTo(Riesgo, { as: "riesgo_riesgo", foreignKey: "_idriesgo" });
  Riesgo.hasMany(FactoringConfigTasaDescuento, { as: "factoring_config_tasa_descuentos", foreignKey: "_idriesgo" });
  FactoringPropuesta.belongsTo(Riesgo, { as: "riesgooperacion_riesgo", foreignKey: "_idriesgooperacion" });
  Riesgo.hasMany(FactoringPropuesta, { as: "factoring_propuesta", foreignKey: "_idriesgooperacion" });
  FactoringPropuesta.belongsTo(Riesgo, { as: "riesgoaceptante_riesgo", foreignKey: "_idriesgoaceptante" });
  Riesgo.hasMany(FactoringPropuesta, { as: "riesgoaceptante_factoring_propuesta", foreignKey: "_idriesgoaceptante" });
  FactoringPropuesta.belongsTo(Riesgo, { as: "riesgocedente_riesgo", foreignKey: "_idriesgocedente" });
  Riesgo.hasMany(FactoringPropuesta, { as: "riesgocedente_factoring_propuesta", foreignKey: "_idriesgocedente" });
  UsuarioRol.belongsTo(Rol, { as: "rol_rol", foreignKey: "_idrol" });
  Rol.hasMany(UsuarioRol, { as: "usuario_rols", foreignKey: "_idrol" });
  ServicioEmpresa.belongsTo(Servicio, { as: "servicio_servicio", foreignKey: "_idservicio" });
  Servicio.hasMany(ServicioEmpresa, { as: "servicio_empresas", foreignKey: "_idservicio" });
  UsuarioServicio.belongsTo(Servicio, { as: "servicio_servicio", foreignKey: "_idservicio" });
  Servicio.hasMany(UsuarioServicio, { as: "usuario_servicios", foreignKey: "_idservicio" });
  UsuarioServicioEmpresa.belongsTo(Servicio, { as: "servicio_servicio", foreignKey: "_idservicio" });
  Servicio.hasMany(UsuarioServicioEmpresa, { as: "usuario_servicio_empresas", foreignKey: "_idservicio" });
  ServicioEmpresaVerificacion.belongsTo(ServicioEmpresa, { as: "servicioempresa_servicio_empresa", foreignKey: "_idservicioempresa" });
  ServicioEmpresa.hasMany(ServicioEmpresaVerificacion, { as: "servicio_empresa_verificacions", foreignKey: "_idservicioempresa" });
  ServicioEmpresa.belongsTo(ServicioEmpresaEstado, { as: "servicioempresaestado_servicio_empresa_estado", foreignKey: "_idservicioempresaestado" });
  ServicioEmpresaEstado.hasMany(ServicioEmpresa, { as: "servicio_empresas", foreignKey: "_idservicioempresaestado" });
  ServicioEmpresaVerificacion.belongsTo(ServicioEmpresaEstado, { as: "servicioempresaestado_servicio_empresa_estado", foreignKey: "_idservicioempresaestado" });
  ServicioEmpresaEstado.hasMany(ServicioEmpresaVerificacion, { as: "servicio_empresa_verificacions", foreignKey: "_idservicioempresaestado" });
  BancoTransaccionEstadoHistorial.belongsTo(Usuario, { as: "usuariomodifica_usuario", foreignKey: "_idusuariomodifica" });
  Usuario.hasMany(BancoTransaccionEstadoHistorial, { as: "banco_transaccion_estado_historials", foreignKey: "_idusuariomodifica" });
  Credencial.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario" });
  Usuario.hasOne(Credencial, { as: "credencial", foreignKey: "_idusuario" });
  FactoringHistorialEstado.belongsTo(Usuario, { as: "usuariomodifica_usuario", foreignKey: "_idusuariomodifica" });
  Usuario.hasMany(FactoringHistorialEstado, { as: "factoring_historial_estados", foreignKey: "_idusuariomodifica" });
  Factura.belongsTo(Usuario, { as: "usuarioupload_usuario", foreignKey: "_idusuarioupload" });
  Usuario.hasMany(Factura, { as: "facturas", foreignKey: "_idusuarioupload" });
  Persona.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario" });
  Usuario.hasOne(Persona, { as: "persona", foreignKey: "_idusuario" });
  PersonaVerificacion.belongsTo(Usuario, { as: "usuarioverifica_usuario", foreignKey: "_idusuarioverifica" });
  Usuario.hasMany(PersonaVerificacion, { as: "persona_verificacions", foreignKey: "_idusuarioverifica" });
  ServicioEmpresa.belongsTo(Usuario, { as: "usuariosuscriptor_usuario", foreignKey: "_idusuariosuscriptor" });
  Usuario.hasMany(ServicioEmpresa, { as: "servicio_empresas", foreignKey: "_idusuariosuscriptor" });
  ServicioEmpresaVerificacion.belongsTo(Usuario, { as: "usuarioverifica_usuario", foreignKey: "_idusuarioverifica" });
  Usuario.hasMany(ServicioEmpresaVerificacion, { as: "servicio_empresa_verificacions", foreignKey: "_idusuarioverifica" });
  UsuarioRol.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario" });
  Usuario.hasMany(UsuarioRol, { as: "usuario_rols", foreignKey: "_idusuario" });
  UsuarioServicio.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario" });
  Usuario.hasMany(UsuarioServicio, { as: "usuario_servicios", foreignKey: "_idusuario" });
  UsuarioServicioEmpresa.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario" });
  Usuario.hasMany(UsuarioServicioEmpresa, { as: "usuario_servicio_empresas", foreignKey: "_idusuario" });
  UsuarioServicioVerificacion.belongsTo(Usuario, { as: "usuarioverifica_usuario", foreignKey: "_idusuarioverifica" });
  Usuario.hasMany(UsuarioServicioVerificacion, { as: "usuario_servicio_verificacions", foreignKey: "_idusuarioverifica" });
  Validacion.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario" });
  Usuario.hasMany(Validacion, { as: "validacions", foreignKey: "_idusuario" });
  UsuarioServicioVerificacion.belongsTo(UsuarioServicio, { as: "usuarioservicio_usuario_servicio", foreignKey: "_idusuarioservicio" });
  UsuarioServicio.hasMany(UsuarioServicioVerificacion, { as: "usuario_servicio_verificacions", foreignKey: "_idusuarioservicio" });
  UsuarioServicioEmpresa.belongsTo(UsuarioServicioEmpresaEstado, { as: "usuarioservicioempresaestado_usuario_servicio_empresa_estado", foreignKey: "_idusuarioservicioempresaestado" });
  UsuarioServicioEmpresaEstado.hasMany(UsuarioServicioEmpresa, { as: "usuario_servicio_empresas", foreignKey: "_idusuarioservicioempresaestado" });
  UsuarioServicioEmpresa.belongsTo(UsuarioServicioEmpresaRol, { as: "usuarioservicioempresarol_usuario_servicio_empresa_rol", foreignKey: "_idusuarioservicioempresarol" });
  UsuarioServicioEmpresaRol.hasMany(UsuarioServicioEmpresa, { as: "usuario_servicio_empresas", foreignKey: "_idusuarioservicioempresarol" });
  UsuarioServicio.belongsTo(UsuarioServicioEstado, { as: "usuarioservicioestado_usuario_servicio_estado", foreignKey: "_idusuarioservicioestado" });
  UsuarioServicioEstado.hasMany(UsuarioServicio, { as: "usuario_servicios", foreignKey: "_idusuarioservicioestado" });
  UsuarioServicioVerificacion.belongsTo(UsuarioServicioEstado, { as: "usuarioservicioestado_usuario_servicio_estado", foreignKey: "_idusuarioservicioestado" });
  UsuarioServicioEstado.hasMany(UsuarioServicioVerificacion, { as: "usuario_servicio_verificacions", foreignKey: "_idusuarioservicioestado" });
  Validacion.belongsTo(ValidacionTipo, { as: "validaciontipo_validacion_tipo", foreignKey: "_idvalidaciontipo" });
  ValidacionTipo.hasMany(Validacion, { as: "validacions", foreignKey: "_idvalidaciontipo" });
  ZlaboratorioPedido.belongsTo(ZlaboratorioUsuario, { as: "usuario_zlaboratorio_usuario", foreignKey: "_idusuario" });
  ZlaboratorioUsuario.hasMany(ZlaboratorioPedido, { as: "zlaboratorio_pedidos", foreignKey: "_idusuario" });

  return {
    Archivo,
    ArchivoColaborador,
    ArchivoCuentaBancaria,
    ArchivoEmpresa,
    ArchivoEstado,
    ArchivoFactoringHistorialEstado,
    ArchivoFactura,
    ArchivoInversionistaDeposito,
    ArchivoInversionistaRetiro,
    ArchivoPersona,
    ArchivoTipo,
    Banco,
    BancoCuenta,
    BancoCuentaEstado,
    BancoCuentaTipo,
    BancoTransaccion,
    BancoTransaccionEstado,
    BancoTransaccionEstadoHistorial,
    BancoTransaccionFactoringInversion,
    BancoTransaccionInversionistaDeposito,
    BancoTransaccionInversionistaRetiro,
    BancoTransaccionTipo,
    Colaborador,
    ColaboradorTipo,
    ConfiguracionApp,
    Contacto,
    Credencial,
    CuentaBancaria,
    CuentaBancariaEstado,
    CuentaTipo,
    Departamento,
    Distrito,
    DocumentoTipo,
    Empresa,
    EmpresaCuentaBancaria,
    EmpresaDeclaracion,
    Factor,
    FactorCuentaBancaria,
    Factoring,
    FactoringConfigComision,
    FactoringConfigGarantia,
    FactoringConfigTasaDescuento,
    FactoringEjecutado,
    FactoringEjecutadoEstado,
    FactoringEstado,
    FactoringEstrategia,
    FactoringFactura,
    FactoringHistorialEstado,
    FactoringInversion,
    FactoringPago,
    FactoringPropuesta,
    FactoringPropuestaEstado,
    FactoringPropuestaFinanciero,
    FactoringTipo,
    Factura,
    FacturaImpuesto,
    FacturaItem,
    FacturaMedioPago,
    FacturaNota,
    FacturaTerminoPago,
    FinancieroConcepto,
    FinancieroTipo,
    Genero,
    Inversionista,
    InversionistaBancoCuenta,
    InversionistaCuentaBancaria,
    InversionistaDeposito,
    InversionistaRetiro,
    Moneda,
    Pais,
    PepVinculo,
    Persona,
    PersonaCuentaBancaria,
    PersonaDeclaracion,
    PersonaPepDirecto,
    PersonaPepIndirecto,
    PersonaVerificacion,
    PersonaVerificacionEstado,
    Provincia,
    RegionNatural,
    Riesgo,
    Rol,
    Servicio,
    ServicioEmpresa,
    ServicioEmpresaEstado,
    ServicioEmpresaVerificacion,
    Usuario,
    UsuarioRol,
    UsuarioServicio,
    UsuarioServicioEmpresa,
    UsuarioServicioEmpresaEstado,
    UsuarioServicioEmpresaRol,
    UsuarioServicioEstado,
    UsuarioServicioVerificacion,
    Validacion,
    ValidacionTipo,
    ZlaboratorioPedido,
    ZlaboratorioUsuario,
  };
}
