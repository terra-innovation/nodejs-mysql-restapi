import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Usuario, UsuarioId } from './Usuario.js';
import type { UsuarioRol, UsuarioRolId } from './UsuarioRol.js';

export interface RolAttributes {
  _idrol: number;
  rolid: string;
  nombre: string;
  alias: string;
  codigo: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type RolPk = "_idrol";
export type RolId = Rol[RolPk];
export type RolOptionalAttributes = "_idrol" | "rolid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type RolCreationAttributes = Optional<RolAttributes, RolOptionalAttributes>;

export class Rol extends Model<RolAttributes, RolCreationAttributes> implements RolAttributes {
  _idrol!: number;
  rolid!: string;
  nombre!: string;
  alias!: string;
  codigo!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Rol belongsToMany Usuario via _idrol and _idusuario
  usuario_usuarios!: Usuario[];
  get_idusuario_usuarios!: Sequelize.BelongsToManyGetAssociationsMixin<Usuario>;
  set_idusuario_usuarios!: Sequelize.BelongsToManySetAssociationsMixin<Usuario, UsuarioId>;
  add_idusuario_usuario!: Sequelize.BelongsToManyAddAssociationMixin<Usuario, UsuarioId>;
  add_idusuario_usuarios!: Sequelize.BelongsToManyAddAssociationsMixin<Usuario, UsuarioId>;
  create_idusuario_usuario!: Sequelize.BelongsToManyCreateAssociationMixin<Usuario>;
  remove_idusuario_usuario!: Sequelize.BelongsToManyRemoveAssociationMixin<Usuario, UsuarioId>;
  remove_idusuario_usuarios!: Sequelize.BelongsToManyRemoveAssociationsMixin<Usuario, UsuarioId>;
  has_idusuario_usuario!: Sequelize.BelongsToManyHasAssociationMixin<Usuario, UsuarioId>;
  has_idusuario_usuarios!: Sequelize.BelongsToManyHasAssociationsMixin<Usuario, UsuarioId>;
  count_idusuario_usuarios!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Rol hasMany UsuarioRol via _idrol
  usuario_rols!: UsuarioRol[];
  getUsuario_rols!: Sequelize.HasManyGetAssociationsMixin<UsuarioRol>;
  setUsuario_rols!: Sequelize.HasManySetAssociationsMixin<UsuarioRol, UsuarioRolId>;
  addUsuario_rol!: Sequelize.HasManyAddAssociationMixin<UsuarioRol, UsuarioRolId>;
  addUsuario_rols!: Sequelize.HasManyAddAssociationsMixin<UsuarioRol, UsuarioRolId>;
  createUsuario_rol!: Sequelize.HasManyCreateAssociationMixin<UsuarioRol>;
  removeUsuario_rol!: Sequelize.HasManyRemoveAssociationMixin<UsuarioRol, UsuarioRolId>;
  removeUsuario_rols!: Sequelize.HasManyRemoveAssociationsMixin<UsuarioRol, UsuarioRolId>;
  hasUsuario_rol!: Sequelize.HasManyHasAssociationMixin<UsuarioRol, UsuarioRolId>;
  hasUsuario_rols!: Sequelize.HasManyHasAssociationsMixin<UsuarioRol, UsuarioRolId>;
  countUsuario_rols!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Rol {
    return Rol.init({
    _idrol: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    rolid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancoid"
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    idusuariocrea: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    fechacrea: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: "current_timestamp(3)"
    },
    idusuariomod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    fechamod: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: "current_timestamp(3)"
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'rol',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idrol" },
        ]
      },
      {
        name: "UQ_bancoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "rolid" },
        ]
      },
    ]
  });
  }
}
