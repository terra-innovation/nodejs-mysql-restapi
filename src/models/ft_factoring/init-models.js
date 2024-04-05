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
import _Factura from "./Factura.js";
import _FacturaImpuesto from "./FacturaImpuesto.js";
import _FacturaItem from "./FacturaItem.js";
import _FacturaMedioPago from "./FacturaMedioPago.js";
import _FacturaTerminoPago from "./FacturaTerminoPago.js";
import _Moneda from "./Moneda.js";
import _Rol from "./Rol.js";
import _Usuario from "./Usuario.js";
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
  const Factura = _Factura.init(sequelize, DataTypes);
  const FacturaImpuesto = _FacturaImpuesto.init(sequelize, DataTypes);
  const FacturaItem = _FacturaItem.init(sequelize, DataTypes);
  const FacturaMedioPago = _FacturaMedioPago.init(sequelize, DataTypes);
  const FacturaTerminoPago = _FacturaTerminoPago.init(sequelize, DataTypes);
  const Moneda = _Moneda.init(sequelize, DataTypes);
  const Rol = _Rol.init(sequelize, DataTypes);
  const Usuario = _Usuario.init(sequelize, DataTypes);
  const UsuarioRol = _UsuarioRol.init(sequelize, DataTypes);

  Rol.belongsToMany(Usuario, { as: "_idusuario_usuarios", through: UsuarioRol, foreignKey: "_idrol", otherKey: "_idusuario" });
  Usuario.belongsToMany(Rol, { as: "roles", through: UsuarioRol, foreignKey: "_idusuario", otherKey: "_idrol" });
  CuentaBancaria.belongsTo(Banco, { foreignKey: "idbanco" });
  Banco.hasMany(CuentaBancaria, { foreignKey: "idbanco" });
  Factoring.belongsTo(Company, { foreignKey: "iddebtor" });
  Company.hasMany(Factoring, { foreignKey: "iddebtor" });
  Factoring.belongsTo(Company, { foreignKey: "idseller" });
  Company.hasMany(Factoring, { foreignKey: "idseller" });
  CuentaBancaria.belongsTo(CuentaBancariaEstado, { foreignKey: "idcuentabancariaestado" });
  CuentaBancariaEstado.hasMany(CuentaBancaria, { foreignKey: "idcuentabancariaestado" });
  CuentaBancaria.belongsTo(CuentaTipo, { foreignKey: "idcuentatipo" });
  CuentaTipo.hasMany(CuentaBancaria, { foreignKey: "idcuentatipo" });
  Usuario.belongsTo(DocumentoTipo, { foreignKey: "_iddocumentotipo" });
  DocumentoTipo.hasMany(Usuario, { foreignKey: "_iddocumentotipo" });
  Colaborador.belongsTo(Empresa, { foreignKey: "idempresa" });
  Empresa.hasMany(Colaborador, { foreignKey: "idempresa" });
  CuentaBancaria.belongsTo(Empresa, { foreignKey: "idempresa" });
  Empresa.hasMany(CuentaBancaria, { foreignKey: "idempresa" });
  CuentaBancaria.belongsTo(Moneda, { foreignKey: "idmoneda" });
  Moneda.hasMany(CuentaBancaria, { foreignKey: "idmoneda" });
  UsuarioRol.belongsTo(Rol, { foreignKey: "_idrol" });
  Rol.hasMany(UsuarioRol, { foreignKey: "_idrol" });
  UsuarioRol.belongsTo(Usuario, { foreignKey: "_idusuario" });
  Usuario.hasMany(UsuarioRol, { foreignKey: "_idusuario" });

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
    FacturaTerminoPago,
    Moneda,
    Rol,
    Usuario,
    UsuarioRol,
  };
}
