import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Archivo from "./Archivo.js";
import _ArchivoColaborador from "./ArchivoColaborador.js";
import _ArchivoCuentaBancaria from "./ArchivoCuentaBancaria.js";
import _ArchivoEmpresa from "./ArchivoEmpresa.js";
import _ArchivoEstado from "./ArchivoEstado.js";
import _ArchivoPersona from "./ArchivoPersona.js";
import _ArchivoTipo from "./ArchivoTipo.js";
import _Banco from "./Banco.js";
import _Colaborador from "./Colaborador.js";
import _ColaboradorTipo from "./ColaboradorTipo.js";
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
import _Factoring from "./Factoring.js";
import _FactoringEstado from "./FactoringEstado.js";
import _FactoringFactura from "./FactoringFactura.js";
import _FactoringTipo from "./FactoringTipo.js";
import _Factura from "./Factura.js";
import _FacturaImpuesto from "./FacturaImpuesto.js";
import _FacturaItem from "./FacturaItem.js";
import _FacturaMedioPago from "./FacturaMedioPago.js";
import _FacturaNota from "./FacturaNota.js";
import _FacturaTerminoPago from "./FacturaTerminoPago.js";
import _Genero from "./Genero.js";
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
  const ArchivoPersona = _ArchivoPersona.init(sequelize, DataTypes);
  const ArchivoTipo = _ArchivoTipo.init(sequelize, DataTypes);
  const Banco = _Banco.init(sequelize, DataTypes);
  const Colaborador = _Colaborador.init(sequelize, DataTypes);
  const ColaboradorTipo = _ColaboradorTipo.init(sequelize, DataTypes);
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
  const Factoring = _Factoring.init(sequelize, DataTypes);
  const FactoringEstado = _FactoringEstado.init(sequelize, DataTypes);
  const FactoringFactura = _FactoringFactura.init(sequelize, DataTypes);
  const FactoringTipo = _FactoringTipo.init(sequelize, DataTypes);
  const Factura = _Factura.init(sequelize, DataTypes);
  const FacturaImpuesto = _FacturaImpuesto.init(sequelize, DataTypes);
  const FacturaItem = _FacturaItem.init(sequelize, DataTypes);
  const FacturaMedioPago = _FacturaMedioPago.init(sequelize, DataTypes);
  const FacturaNota = _FacturaNota.init(sequelize, DataTypes);
  const FacturaTerminoPago = _FacturaTerminoPago.init(sequelize, DataTypes);
  const Genero = _Genero.init(sequelize, DataTypes);
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
  Archivo.belongsToMany(Persona, { as: "persona_personas", through: ArchivoPersona, foreignKey: "_idarchivo", otherKey: "_idpersona" });
  Colaborador.belongsToMany(Archivo, { as: "archivo_archivos", through: ArchivoColaborador, foreignKey: "_idcolaborador", otherKey: "_idarchivo" });
  CuentaBancaria.belongsToMany(Archivo, { as: "archivo_archivo_archivo_cuenta_bancaria", through: ArchivoCuentaBancaria, foreignKey: "_idcuentabancaria", otherKey: "_idarchivo" });
  CuentaBancaria.belongsToMany(Empresa, { as: "empresa_empresa_empresa_cuenta_bancaria", through: EmpresaCuentaBancaria, foreignKey: "_idcuentabancaria", otherKey: "_idempresa" });
  CuentaBancaria.belongsToMany(Persona, { as: "persona_persona_persona_cuenta_bancaria", through: PersonaCuentaBancaria, foreignKey: "_idcuentabancaria", otherKey: "_idpersona" });
  Empresa.belongsToMany(Archivo, { as: "archivo_archivo_archivo_empresas", through: ArchivoEmpresa, foreignKey: "_idempresa", otherKey: "_idarchivo" });
  Empresa.belongsToMany(CuentaBancaria, { as: "cuentabancaria_cuenta_bancaria_empresa_cuenta_bancaria", through: EmpresaCuentaBancaria, foreignKey: "_idempresa", otherKey: "_idcuentabancaria" });
  Factoring.belongsToMany(Factura, { as: "factura_facturas", through: FactoringFactura, foreignKey: "_idfactoring", otherKey: "_idfactura" });
  Factura.belongsToMany(Factoring, { as: "factoring_factorings", through: FactoringFactura, foreignKey: "_idfactura", otherKey: "_idfactoring" });
  Persona.belongsToMany(Archivo, { as: "archivo_archivo_archivo_personas", through: ArchivoPersona, foreignKey: "_idpersona", otherKey: "_idarchivo" });
  Persona.belongsToMany(CuentaBancaria, { as: "cuentabancaria_cuenta_bancaria_persona_cuenta_bancaria", through: PersonaCuentaBancaria, foreignKey: "_idpersona", otherKey: "_idcuentabancaria" });
  Rol.belongsToMany(Usuario, { as: "usuario_usuarios", through: UsuarioRol, foreignKey: "_idrol", otherKey: "_idusuario" });
  Usuario.belongsToMany(Rol, { as: "rol_rols", through: UsuarioRol, foreignKey: "_idusuario", otherKey: "_idrol" });
  ArchivoColaborador.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo" });
  Archivo.hasMany(ArchivoColaborador, { as: "archivo_colaboradors", foreignKey: "_idarchivo" });
  ArchivoCuentaBancaria.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo" });
  Archivo.hasMany(ArchivoCuentaBancaria, { as: "archivo_cuenta_bancaria", foreignKey: "_idarchivo" });
  ArchivoEmpresa.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo" });
  Archivo.hasMany(ArchivoEmpresa, { as: "archivo_empresas", foreignKey: "_idarchivo" });
  ArchivoPersona.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo" });
  Archivo.hasMany(ArchivoPersona, { as: "archivo_personas", foreignKey: "_idarchivo" });
  Archivo.belongsTo(ArchivoEstado, { as: "archivoestado_archivo_estado", foreignKey: "_idarchivoestado" });
  ArchivoEstado.hasMany(Archivo, { as: "archivos", foreignKey: "_idarchivoestado" });
  Archivo.belongsTo(ArchivoTipo, { as: "archivotipo_archivo_tipo", foreignKey: "_idarchivotipo" });
  ArchivoTipo.hasMany(Archivo, { as: "archivos", foreignKey: "_idarchivotipo" });
  CuentaBancaria.belongsTo(Banco, { as: "banco_banco", foreignKey: "_idbanco" });
  Banco.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idbanco" });
  ArchivoColaborador.belongsTo(Colaborador, { as: "colaborador_colaborador", foreignKey: "_idcolaborador" });
  Colaborador.hasMany(ArchivoColaborador, { as: "archivo_colaboradors", foreignKey: "_idcolaborador" });
  Factoring.belongsTo(Colaborador, { as: "contactoaceptante_colaborador", foreignKey: "_idcontactoaceptante" });
  Colaborador.hasMany(Factoring, { as: "factorings", foreignKey: "_idcontactoaceptante" });
  Colaborador.belongsTo(ColaboradorTipo, { as: "colaboradortipo_colaborador_tipo", foreignKey: "_idcolaboradortipo" });
  ColaboradorTipo.hasMany(Colaborador, { as: "colaboradors", foreignKey: "_idcolaboradortipo" });
  ArchivoCuentaBancaria.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.hasMany(ArchivoCuentaBancaria, { as: "archivo_cuenta_bancaria", foreignKey: "_idcuentabancaria" });
  EmpresaCuentaBancaria.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.hasMany(EmpresaCuentaBancaria, { as: "empresa_cuenta_bancaria", foreignKey: "_idcuentabancaria" });
  Factoring.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.hasMany(Factoring, { as: "factorings", foreignKey: "_idcuentabancaria" });
  PersonaCuentaBancaria.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.hasMany(PersonaCuentaBancaria, { as: "persona_cuenta_bancaria", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.belongsTo(CuentaBancariaEstado, { as: "cuentabancariaestado_cuenta_bancaria_estado", foreignKey: "_idcuentabancariaestado" });
  CuentaBancariaEstado.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idcuentabancariaestado" });
  CuentaBancaria.belongsTo(CuentaTipo, { as: "cuentatipo_cuenta_tipo", foreignKey: "_idcuentatipo" });
  CuentaTipo.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idcuentatipo" });
  Empresa.belongsTo(Departamento, { as: "departamentosede_departamento", foreignKey: "_iddepartamentosede" });
  Departamento.hasMany(Empresa, { as: "empresas", foreignKey: "_iddepartamentosede" });
  Persona.belongsTo(Departamento, { as: "departamentoresidencia_departamento", foreignKey: "_iddepartamentoresidencia" });
  Departamento.hasMany(Persona, { as: "personas", foreignKey: "_iddepartamentoresidencia" });
  Provincia.belongsTo(Departamento, { as: "departamento_departamento", foreignKey: "_iddepartamento" });
  Departamento.hasMany(Provincia, { as: "provincia", foreignKey: "_iddepartamento" });
  Empresa.belongsTo(Distrito, { as: "distritosede_distrito", foreignKey: "_iddistritosede" });
  Distrito.hasMany(Empresa, { as: "empresas", foreignKey: "_iddistritosede" });
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
  FactoringFactura.belongsTo(Factoring, { as: "factoring_factoring", foreignKey: "_idfactoring" });
  Factoring.hasMany(FactoringFactura, { as: "factoring_facturas", foreignKey: "_idfactoring" });
  Factoring.belongsTo(FactoringEstado, { as: "factoringestado_factoring_estado", foreignKey: "_idfactoringestado" });
  FactoringEstado.hasMany(Factoring, { as: "factorings", foreignKey: "_idfactoringestado" });
  Factoring.belongsTo(FactoringTipo, { as: "factoringtipo_factoring_tipo", foreignKey: "_idfactoringtipo" });
  FactoringTipo.hasMany(Factoring, { as: "factorings", foreignKey: "_idfactoringtipo" });
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
  Persona.belongsTo(Genero, { as: "genero_genero", foreignKey: "_idgenero" });
  Genero.hasMany(Persona, { as: "personas", foreignKey: "_idgenero" });
  CuentaBancaria.belongsTo(Moneda, { as: "moneda_moneda", foreignKey: "_idmoneda" });
  Moneda.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idmoneda" });
  Factoring.belongsTo(Moneda, { as: "moneda_moneda", foreignKey: "_idmoneda" });
  Moneda.hasMany(Factoring, { as: "factorings", foreignKey: "_idmoneda" });
  Departamento.belongsTo(Pais, { as: "pais_pai", foreignKey: "_idpais" });
  Pais.hasMany(Departamento, { as: "departamentos", foreignKey: "_idpais" });
  Empresa.belongsTo(Pais, { as: "paissede_pai", foreignKey: "_idpaissede" });
  Pais.hasMany(Empresa, { as: "empresas", foreignKey: "_idpaissede" });
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
  Persona.belongsTo(Provincia, { as: "provinciaresidencia_provincium", foreignKey: "_idprovinciaresidencia" });
  Provincia.hasMany(Persona, { as: "personas", foreignKey: "_idprovinciaresidencia" });
  Distrito.belongsTo(RegionNatural, { as: "regionnatural_region_natural", foreignKey: "_idregionnatural" });
  RegionNatural.hasMany(Distrito, { as: "distritos", foreignKey: "_idregionnatural" });
  Factoring.belongsTo(Riesgo, { as: "riesgooperacion_riesgo", foreignKey: "_idriesgooperacion" });
  Riesgo.hasMany(Factoring, { as: "factorings", foreignKey: "_idriesgooperacion" });
  Factoring.belongsTo(Riesgo, { as: "riesgoaceptante_riesgo", foreignKey: "_idriesgoaceptante" });
  Riesgo.hasMany(Factoring, { as: "riesgoaceptante_factorings", foreignKey: "_idriesgoaceptante" });
  Factoring.belongsTo(Riesgo, { as: "riesgocedente_riesgo", foreignKey: "_idriesgocedente" });
  Riesgo.hasMany(Factoring, { as: "riesgocedente_factorings", foreignKey: "_idriesgocedente" });
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
  Credencial.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario" });
  Usuario.hasOne(Credencial, { as: "credencial", foreignKey: "_idusuario" });
  Factoring.belongsTo(Usuario, { as: "contactocedente_usuario", foreignKey: "_idcontactocedente" });
  Usuario.hasMany(Factoring, { as: "factorings", foreignKey: "_idcontactocedente" });
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
    ArchivoPersona,
    ArchivoTipo,
    Banco,
    Colaborador,
    ColaboradorTipo,
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
    Factoring,
    FactoringEstado,
    FactoringFactura,
    FactoringTipo,
    Factura,
    FacturaImpuesto,
    FacturaItem,
    FacturaMedioPago,
    FacturaNota,
    FacturaTerminoPago,
    Genero,
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
