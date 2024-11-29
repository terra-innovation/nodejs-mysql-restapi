import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Archivo from "./Archivo.js";
import _ArchivoEstado from "./ArchivoEstado.js";
import _ArchivoPersona from "./ArchivoPersona.js";
import _ArchivoTipo from "./ArchivoTipo.js";
import _Banco from "./Banco.js";
import _Colaborador from "./Colaborador.js";
import _CuentaBancaria from "./CuentaBancaria.js";
import _CuentaBancariaEstado from "./CuentaBancariaEstado.js";
import _CuentaTipo from "./CuentaTipo.js";
import _Departamento from "./Departamento.js";
import _Distrito from "./Distrito.js";
import _DocumentoTipo from "./DocumentoTipo.js";
import _Empresa from "./Empresa.js";
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
import _PersonaDeclaracion from "./PersonaDeclaracion.js";
import _PersonaPepDirecto from "./PersonaPepDirecto.js";
import _PersonaPepIndirecto from "./PersonaPepIndirecto.js";
import _PersonaVerificacion from "./PersonaVerificacion.js";
import _PersonaVerificacionEstado from "./PersonaVerificacionEstado.js";
import _Provincia from "./Provincia.js";
import _RegionNatural from "./RegionNatural.js";
import _Riesgo from "./Riesgo.js";
import _Rol from "./Rol.js";
import _Usuario from "./Usuario.js";
import _UsuarioEmpresa from "./UsuarioEmpresa.js";
import _UsuarioRol from "./UsuarioRol.js";
import _Validacion from "./Validacion.js";
import _ValidacionTipo from "./ValidacionTipo.js";

export default function initModels(sequelize) {
  const Archivo = _Archivo.init(sequelize, DataTypes);
  const ArchivoEstado = _ArchivoEstado.init(sequelize, DataTypes);
  const ArchivoPersona = _ArchivoPersona.init(sequelize, DataTypes);
  const ArchivoTipo = _ArchivoTipo.init(sequelize, DataTypes);
  const Banco = _Banco.init(sequelize, DataTypes);
  const Colaborador = _Colaborador.init(sequelize, DataTypes);
  const CuentaBancaria = _CuentaBancaria.init(sequelize, DataTypes);
  const CuentaBancariaEstado = _CuentaBancariaEstado.init(sequelize, DataTypes);
  const CuentaTipo = _CuentaTipo.init(sequelize, DataTypes);
  const Departamento = _Departamento.init(sequelize, DataTypes);
  const Distrito = _Distrito.init(sequelize, DataTypes);
  const DocumentoTipo = _DocumentoTipo.init(sequelize, DataTypes);
  const Empresa = _Empresa.init(sequelize, DataTypes);
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
  const PersonaDeclaracion = _PersonaDeclaracion.init(sequelize, DataTypes);
  const PersonaPepDirecto = _PersonaPepDirecto.init(sequelize, DataTypes);
  const PersonaPepIndirecto = _PersonaPepIndirecto.init(sequelize, DataTypes);
  const PersonaVerificacion = _PersonaVerificacion.init(sequelize, DataTypes);
  const PersonaVerificacionEstado = _PersonaVerificacionEstado.init(sequelize, DataTypes);
  const Provincia = _Provincia.init(sequelize, DataTypes);
  const RegionNatural = _RegionNatural.init(sequelize, DataTypes);
  const Riesgo = _Riesgo.init(sequelize, DataTypes);
  const Rol = _Rol.init(sequelize, DataTypes);
  const Usuario = _Usuario.init(sequelize, DataTypes);
  const UsuarioEmpresa = _UsuarioEmpresa.init(sequelize, DataTypes);
  const UsuarioRol = _UsuarioRol.init(sequelize, DataTypes);
  const Validacion = _Validacion.init(sequelize, DataTypes);
  const ValidacionTipo = _ValidacionTipo.init(sequelize, DataTypes);

  Archivo.belongsToMany(Persona, { as: "persona_personas", through: ArchivoPersona, foreignKey: "_idarchivo", otherKey: "_idpersona" });
  Empresa.belongsToMany(Usuario, { as: "usuario_usuarios", through: UsuarioEmpresa, foreignKey: "_idempresa", otherKey: "_idusuario" });
  Factoring.belongsToMany(Factura, { as: "factura_facturas", through: FactoringFactura, foreignKey: "_idfactoring", otherKey: "_idfactura" });
  Factura.belongsToMany(Factoring, { as: "factoring_factorings", through: FactoringFactura, foreignKey: "_idfactura", otherKey: "_idfactoring" });
  Persona.belongsToMany(Archivo, { as: "archivo_archivos", through: ArchivoPersona, foreignKey: "_idpersona", otherKey: "_idarchivo" });
  Rol.belongsToMany(Usuario, { as: "usuario_usuario_usuario_rols", through: UsuarioRol, foreignKey: "_idrol", otherKey: "_idusuario" });
  Usuario.belongsToMany(Empresa, { as: "empresa_empresas", through: UsuarioEmpresa, foreignKey: "_idusuario", otherKey: "_idempresa" });
  Usuario.belongsToMany(Rol, { as: "rol_rols", through: UsuarioRol, foreignKey: "_idusuario", otherKey: "_idrol" });
  ArchivoPersona.belongsTo(Archivo, { as: "archivo_archivo", foreignKey: "_idarchivo" });
  Archivo.hasMany(ArchivoPersona, { as: "archivo_personas", foreignKey: "_idarchivo" });
  Archivo.belongsTo(ArchivoEstado, { as: "archivoestado_archivo_estado", foreignKey: "_idarchivoestado" });
  ArchivoEstado.hasMany(Archivo, { as: "archivos", foreignKey: "_idarchivoestado" });
  Archivo.belongsTo(ArchivoTipo, { as: "archivotipo_archivo_tipo", foreignKey: "_idarchivotipo" });
  ArchivoTipo.hasMany(Archivo, { as: "archivos", foreignKey: "_idarchivotipo" });
  Factoring.belongsTo(Colaborador, { as: "contactoaceptante_colaborador", foreignKey: "_idcontactoaceptante" });
  Colaborador.hasMany(Factoring, { as: "factorings", foreignKey: "_idcontactoaceptante" });
  Factoring.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.hasMany(Factoring, { as: "factorings", foreignKey: "_idcuentabancaria" });
  Persona.belongsTo(Departamento, { as: "departamentoresidencia_departamento", foreignKey: "_iddepartamentoresidencia" });
  Departamento.hasMany(Persona, { as: "personas", foreignKey: "_iddepartamentoresidencia" });
  Provincia.belongsTo(Departamento, { as: "departamento_departamento", foreignKey: "_iddepartamento" });
  Departamento.hasMany(Provincia, { as: "provincia", foreignKey: "_iddepartamento" });
  Persona.belongsTo(Distrito, { as: "distritoresidencia_distrito", foreignKey: "_iddistritoresidencia" });
  Distrito.hasMany(Persona, { as: "personas", foreignKey: "_iddistritoresidencia" });
  Persona.belongsTo(DocumentoTipo, { as: "documentotipo_documento_tipo", foreignKey: "_iddocumentotipo" });
  DocumentoTipo.hasMany(Persona, { as: "personas", foreignKey: "_iddocumentotipo" });
  Usuario.belongsTo(DocumentoTipo, { as: "documentotipo_documento_tipo", foreignKey: "_iddocumentotipo" });
  DocumentoTipo.hasMany(Usuario, { as: "usuarios", foreignKey: "_iddocumentotipo" });
  Colaborador.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa" });
  Empresa.hasMany(Colaborador, { as: "colaboradors", foreignKey: "_idempresa" });
  Factoring.belongsTo(Empresa, { as: "aceptante_empresa", foreignKey: "_idaceptante" });
  Empresa.hasMany(Factoring, { as: "factorings", foreignKey: "_idaceptante" });
  Factoring.belongsTo(Empresa, { as: "cedente_empresa", foreignKey: "_idcedente" });
  Empresa.hasMany(Factoring, { as: "cedente_factorings", foreignKey: "_idcedente" });
  UsuarioEmpresa.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa" });
  Empresa.hasMany(UsuarioEmpresa, { as: "usuario_empresas", foreignKey: "_idempresa" });
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
  FacturaMedioPago.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura" });
  Factura.hasMany(FacturaMedioPago, { as: "factura_medio_pagos", foreignKey: "_idfactura" });
  FacturaNota.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura" });
  Factura.hasMany(FacturaNota, { as: "factura_nota", foreignKey: "_idfactura" });
  FacturaTerminoPago.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura" });
  Factura.hasMany(FacturaTerminoPago, { as: "factura_termino_pagos", foreignKey: "_idfactura" });
  Persona.belongsTo(Genero, { as: "genero_genero", foreignKey: "_idgenero" });
  Genero.hasMany(Persona, { as: "personas", foreignKey: "_idgenero" });
  Factoring.belongsTo(Moneda, { as: "moneda_moneda", foreignKey: "_idmoneda" });
  Moneda.hasMany(Factoring, { as: "factorings", foreignKey: "_idmoneda" });
  Departamento.belongsTo(Pais, { as: "pais_pai", foreignKey: "_idpais" });
  Pais.hasMany(Departamento, { as: "departamentos", foreignKey: "_idpais" });
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
  PersonaDeclaracion.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona" });
  Persona.hasMany(PersonaDeclaracion, { as: "persona_declaracions", foreignKey: "_idpersona" });
  PersonaPepIndirecto.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona" });
  Persona.hasMany(PersonaPepIndirecto, { as: "persona_pep_indirectos", foreignKey: "_idpersona" });
  PersonaVerificacion.belongsTo(Persona, { as: "persona_persona", foreignKey: "_idpersona" });
  Persona.hasMany(PersonaVerificacion, { as: "persona_verificacions", foreignKey: "_idpersona" });
  PersonaVerificacion.belongsTo(PersonaVerificacionEstado, { as: "personaverificacionestado_persona_verificacion_estado", foreignKey: "_idpersonaverificacionestado" });
  PersonaVerificacionEstado.hasMany(PersonaVerificacion, { as: "persona_verificacions", foreignKey: "_idpersonaverificacionestado" });
  Usuario.belongsTo(PersonaVerificacionEstado, { as: "personaverificacionestado_persona_verificacion_estado", foreignKey: "_idpersonaverificacionestado" });
  PersonaVerificacionEstado.hasMany(Usuario, { as: "usuarios", foreignKey: "_idpersonaverificacionestado" });
  Distrito.belongsTo(Provincia, { as: "provincia_provincium", foreignKey: "_idprovincia" });
  Provincia.hasMany(Distrito, { as: "distritos", foreignKey: "_idprovincia" });
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
  Factoring.belongsTo(Usuario, { as: "contactocedente_usuario", foreignKey: "_idcontactocedente" });
  Usuario.hasMany(Factoring, { as: "factorings", foreignKey: "_idcontactocedente" });
  Persona.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario" });
  Usuario.hasOne(Persona, { as: "persona", foreignKey: "_idusuario" });
  PersonaVerificacion.belongsTo(Usuario, { as: "usuarioverifica_usuario", foreignKey: "_idusuarioverifica" });
  Usuario.hasMany(PersonaVerificacion, { as: "persona_verificacions", foreignKey: "_idusuarioverifica" });
  UsuarioEmpresa.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario" });
  Usuario.hasMany(UsuarioEmpresa, { as: "usuario_empresas", foreignKey: "_idusuario" });
  UsuarioRol.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario" });
  Usuario.hasMany(UsuarioRol, { as: "usuario_rols", foreignKey: "_idusuario" });
  Validacion.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario" });
  Usuario.hasMany(Validacion, { as: "validacions", foreignKey: "_idusuario" });
  Validacion.belongsTo(ValidacionTipo, { as: "validaciontipo_validacion_tipo", foreignKey: "_idvalidaciontipo" });
  ValidacionTipo.hasMany(Validacion, { as: "validacions", foreignKey: "_idvalidaciontipo" });

  return {
    Archivo,
    ArchivoEstado,
    ArchivoPersona,
    ArchivoTipo,
    Banco,
    Colaborador,
    CuentaBancaria,
    CuentaBancariaEstado,
    CuentaTipo,
    Departamento,
    Distrito,
    DocumentoTipo,
    Empresa,
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
    PersonaDeclaracion,
    PersonaPepDirecto,
    PersonaPepIndirecto,
    PersonaVerificacion,
    PersonaVerificacionEstado,
    Provincia,
    RegionNatural,
    Riesgo,
    Rol,
    Usuario,
    UsuarioEmpresa,
    UsuarioRol,
    Validacion,
    ValidacionTipo,
  };
}
