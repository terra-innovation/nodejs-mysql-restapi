import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Rol from "./Rol.js";
import _Usuario from "./Usuario.js";
import _UsuarioRol from "./UsuarioRol.js";
import _Colaborador from "./Colaborador.js";
import _Empresa from "./Empresa.js";

export default function initModels(sequelize) {
  const Rol = _Rol.init(sequelize, DataTypes);
  const Usuario = _Usuario.init(sequelize, DataTypes);
  const UsuarioRol = _UsuarioRol.init(sequelize, DataTypes);
  const Colaborador = _Colaborador.init(sequelize, DataTypes);
  const Empresa = _Empresa.init(sequelize, DataTypes);

  Rol.belongsToMany(Usuario, { as: "usuarios", through: UsuarioRol, foreignKey: "idrol", otherKey: "idusuario" });
  Usuario.belongsToMany(Rol, { as: "roles", through: UsuarioRol, foreignKey: "idusuario", otherKey: "idrol" });
  UsuarioRol.belongsTo(Rol, { as: "rol", foreignKey: "idrol" });
  Rol.hasMany(UsuarioRol, { as: "usuarioroles", foreignKey: "idrol" });
  UsuarioRol.belongsTo(Usuario, { as: "usuario", foreignKey: "idusuario" });
  Usuario.hasMany(UsuarioRol, { as: "usuarioroles", foreignKey: "idusuario" });

  Colaborador.belongsTo(Empresa, { as: "empresa", foreignKey: "idempresa" });
  Empresa.hasMany(Colaborador, { as: "colaboradores", foreignKey: "idempresa" });

  return {
    Rol,
    Usuario,
    UsuarioRol,
    Colaborador,
    Empresa,
  };
}
