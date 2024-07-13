import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Banco from "./Banco.js";
import _Colaborador from "./Colaborador.js";
import _Company from "./Company.js";
import _CuentaBancaria from "./CuentaBancaria.js";
import _CuentaBancariaEstado from "./CuentaBancariaEstado.js";
import _CuentaTipo from "./CuentaTipo.js";
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
import _Moneda from "./Moneda.js";
import _Riesgo from "./Riesgo.js";
import _Rol from "./Rol.js";
import _Usuario from "./Usuario.js";
import _UsuarioEmpresa from "./UsuarioEmpresa.js";
import _UsuarioRol from "./UsuarioRol.js";

export default function initModels(sequelize) {
  const Banco = _Banco.init(sequelize, DataTypes);
  const Colaborador = _Colaborador.init(sequelize, DataTypes);
  const Company = _Company.init(sequelize, DataTypes);
  const CuentaBancaria = _CuentaBancaria.init(sequelize, DataTypes);
  const CuentaBancariaEstado = _CuentaBancariaEstado.init(sequelize, DataTypes);
  const CuentaTipo = _CuentaTipo.init(sequelize, DataTypes);
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
  const Moneda = _Moneda.init(sequelize, DataTypes);
  const Riesgo = _Riesgo.init(sequelize, DataTypes);
  const Rol = _Rol.init(sequelize, DataTypes);
  const Usuario = _Usuario.init(sequelize, DataTypes);
  const UsuarioEmpresa = _UsuarioEmpresa.init(sequelize, DataTypes);
  const UsuarioRol = _UsuarioRol.init(sequelize, DataTypes);

  Empresa.belongsToMany(Usuario, { as: "usuario_usuarios", through: UsuarioEmpresa, foreignKey: "_idempresa", otherKey: "_idusuario" });
  Factoring.belongsToMany(Factura, { as: "factura_facturas", through: FactoringFactura, foreignKey: "_idfactoring", otherKey: "_idfactura" });
  Factura.belongsToMany(Factoring, { as: "factoring_factorings", through: FactoringFactura, foreignKey: "_idfactura", otherKey: "_idfactoring" });
  Rol.belongsToMany(Usuario, { as: "usuario_usuario_usuario_rols", through: UsuarioRol, foreignKey: "_idrol", otherKey: "_idusuario" });
  Usuario.belongsToMany(Empresa, { as: "empresa_empresas", through: UsuarioEmpresa, foreignKey: "_idusuario", otherKey: "_idempresa" });
  Usuario.belongsToMany(Rol, { as: "rol_rols", through: UsuarioRol, foreignKey: "_idusuario", otherKey: "_idrol" });
  CuentaBancaria.belongsTo(Banco, { as: "banco_banco", foreignKey: "_idbanco" });
  Banco.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idbanco" });
  Factoring.belongsTo(Colaborador, { as: "contactoaceptante_colaborador", foreignKey: "_idcontactoaceptante" });
  Colaborador.hasMany(Factoring, { as: "factorings", foreignKey: "_idcontactoaceptante" });
  Factoring.belongsTo(CuentaBancaria, { as: "cuentabancaria_cuenta_bancarium", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.hasMany(Factoring, { as: "factorings", foreignKey: "_idcuentabancaria" });
  CuentaBancaria.belongsTo(CuentaBancariaEstado, { as: "cuentabancariaestado_cuenta_bancaria_estado", foreignKey: "_idcuentabancariaestado" });
  CuentaBancariaEstado.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idcuentabancariaestado" });
  CuentaBancaria.belongsTo(CuentaTipo, { as: "cuentatipo_cuenta_tipo", foreignKey: "_idcuentatipo" });
  CuentaTipo.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idcuentatipo" });
  Usuario.belongsTo(DocumentoTipo, { as: "documentotipo_documento_tipo", foreignKey: "_iddocumentotipo" });
  DocumentoTipo.hasMany(Usuario, { as: "usuarios", foreignKey: "_iddocumentotipo" });
  Colaborador.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa" });
  Empresa.hasMany(Colaborador, { as: "colaboradors", foreignKey: "_idempresa" });
  CuentaBancaria.belongsTo(Empresa, { as: "empresa_empresa", foreignKey: "_idempresa" });
  Empresa.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idempresa" });
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
  FacturaItem.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura" });
  Factura.hasMany(FacturaItem, { as: "factura_items", foreignKey: "_idfactura" });
  FacturaMedioPago.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura" });
  Factura.hasMany(FacturaMedioPago, { as: "factura_medio_pagos", foreignKey: "_idfactura" });
  FacturaTerminoPago.belongsTo(Factura, { as: "factura_factura", foreignKey: "_idfactura" });
  Factura.hasMany(FacturaTerminoPago, { as: "factura_termino_pagos", foreignKey: "_idfactura" });
  CuentaBancaria.belongsTo(Moneda, { as: "moneda_moneda", foreignKey: "_idmoneda" });
  Moneda.hasMany(CuentaBancaria, { as: "cuenta_bancaria", foreignKey: "_idmoneda" });
  Factoring.belongsTo(Moneda, { as: "moneda_moneda", foreignKey: "_idmoneda" });
  Moneda.hasMany(Factoring, { as: "factorings", foreignKey: "_idmoneda" });
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
  UsuarioEmpresa.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario" });
  Usuario.hasMany(UsuarioEmpresa, { as: "usuario_empresas", foreignKey: "_idusuario" });
  UsuarioRol.belongsTo(Usuario, { as: "usuario_usuario", foreignKey: "_idusuario" });
  Usuario.hasMany(UsuarioRol, { as: "usuario_rols", foreignKey: "_idusuario" });

  return {
    Banco,
    Colaborador,
    Company,
    CuentaBancaria,
    CuentaBancariaEstado,
    CuentaTipo,
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
    Moneda,
    Riesgo,
    Rol,
    Usuario,
    UsuarioEmpresa,
    UsuarioRol,
  };
}
