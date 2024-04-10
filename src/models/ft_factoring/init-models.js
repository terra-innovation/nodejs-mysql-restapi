import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Banco from  "./Banco.js";
import _Colaborador from  "./Colaborador.js";
import _Company from  "./Company.js";
import _CuentaBancaria from  "./CuentaBancaria.js";
import _CuentaBancariaEstado from  "./CuentaBancariaEstado.js";
import _CuentaTipo from  "./CuentaTipo.js";
import _DocumentoTipo from  "./DocumentoTipo.js";
import _Empresa from  "./Empresa.js";
import _Factoring from  "./Factoring.js";
import _Factura from  "./Factura.js";
import _FacturaImpuesto from  "./FacturaImpuesto.js";
import _FacturaItem from  "./FacturaItem.js";
import _FacturaMedioPago from  "./FacturaMedioPago.js";
import _FacturaNota from  "./FacturaNota.js";
import _FacturaTerminoPago from  "./FacturaTerminoPago.js";
import _Moneda from  "./Moneda.js";
import _Rol from  "./Rol.js";
import _Usuario from  "./Usuario.js";
import _UsuarioEmpresa from  "./UsuarioEmpresa.js";
import _UsuarioRol from  "./UsuarioRol.js";

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
  const Factura = _Factura.init(sequelize, DataTypes);
  const FacturaImpuesto = _FacturaImpuesto.init(sequelize, DataTypes);
  const FacturaItem = _FacturaItem.init(sequelize, DataTypes);
  const FacturaMedioPago = _FacturaMedioPago.init(sequelize, DataTypes);
  const FacturaNota = _FacturaNota.init(sequelize, DataTypes);
  const FacturaTerminoPago = _FacturaTerminoPago.init(sequelize, DataTypes);
  const Moneda = _Moneda.init(sequelize, DataTypes);
  const Rol = _Rol.init(sequelize, DataTypes);
  const Usuario = _Usuario.init(sequelize, DataTypes);
  const UsuarioEmpresa = _UsuarioEmpresa.init(sequelize, DataTypes);
  const UsuarioRol = _UsuarioRol.init(sequelize, DataTypes);

  Empresa.belongsToMany(Usuario, { as: '_idusuario_usuarios', through: UsuarioEmpresa, foreignKey: "_idempresa", otherKey: "_idusuario" });
  Rol.belongsToMany(Usuario, { as: '_idusuario_usuario_usuario_rols', through: UsuarioRol, foreignKey: "_idrol", otherKey: "_idusuario" });
  Usuario.belongsToMany(Empresa, { as: '_idempresa_empresas', through: UsuarioEmpresa, foreignKey: "_idusuario", otherKey: "_idempresa" });
  Usuario.belongsToMany(Rol, { as: '_idrol_rols', through: UsuarioRol, foreignKey: "_idusuario", otherKey: "_idrol" });
  CuentaBancaria.belongsTo(Banco, { foreignKey: "_idbanco"});
  Banco.hasMany(CuentaBancaria, { foreignKey: "_idbanco"});
  Factoring.belongsTo(Company, { foreignKey: "iddebtor"});
  Company.hasMany(Factoring, { foreignKey: "iddebtor"});
  Factoring.belongsTo(Company, { foreignKey: "idseller"});
  Company.hasMany(Factoring, { foreignKey: "idseller"});
  CuentaBancaria.belongsTo(CuentaBancariaEstado, { foreignKey: "_idcuentabancariaestado"});
  CuentaBancariaEstado.hasMany(CuentaBancaria, { foreignKey: "_idcuentabancariaestado"});
  CuentaBancaria.belongsTo(CuentaTipo, { foreignKey: "_idcuentatipo"});
  CuentaTipo.hasMany(CuentaBancaria, { foreignKey: "_idcuentatipo"});
  Usuario.belongsTo(DocumentoTipo, { foreignKey: "_iddocumentotipo"});
  DocumentoTipo.hasMany(Usuario, { foreignKey: "_iddocumentotipo"});
  Colaborador.belongsTo(Empresa, { foreignKey: "_idempresa"});
  Empresa.hasMany(Colaborador, { foreignKey: "_idempresa"});
  CuentaBancaria.belongsTo(Empresa, { foreignKey: "_idempresa"});
  Empresa.hasMany(CuentaBancaria, { foreignKey: "_idempresa"});
  UsuarioEmpresa.belongsTo(Empresa, { foreignKey: "_idempresa"});
  Empresa.hasMany(UsuarioEmpresa, { foreignKey: "_idempresa"});
  FacturaImpuesto.belongsTo(Factura, { foreignKey: "_idfactura"});
  Factura.hasMany(FacturaImpuesto, { foreignKey: "_idfactura"});
  FacturaItem.belongsTo(Factura, { foreignKey: "_idfactura"});
  Factura.hasMany(FacturaItem, { foreignKey: "_idfactura"});
  FacturaMedioPago.belongsTo(Factura, { foreignKey: "_idfactura"});
  Factura.hasMany(FacturaMedioPago, { foreignKey: "_idfactura"});
  FacturaTerminoPago.belongsTo(Factura, { foreignKey: "_idfactura"});
  Factura.hasMany(FacturaTerminoPago, { foreignKey: "_idfactura"});
  CuentaBancaria.belongsTo(Moneda, { foreignKey: "_idmoneda"});
  Moneda.hasMany(CuentaBancaria, { foreignKey: "_idmoneda"});
  UsuarioRol.belongsTo(Rol, { foreignKey: "_idrol"});
  Rol.hasMany(UsuarioRol, { foreignKey: "_idrol"});
  UsuarioEmpresa.belongsTo(Usuario, { foreignKey: "_idusuario"});
  Usuario.hasMany(UsuarioEmpresa, { foreignKey: "_idusuario"});
  UsuarioRol.belongsTo(Usuario, { foreignKey: "_idusuario"});
  Usuario.hasMany(UsuarioRol, { foreignKey: "_idusuario"});

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
    Factura,
    FacturaImpuesto,
    FacturaItem,
    FacturaMedioPago,
    FacturaNota,
    FacturaTerminoPago,
    Moneda,
    Rol,
    Usuario,
    UsuarioEmpresa,
    UsuarioRol,
  };
}
