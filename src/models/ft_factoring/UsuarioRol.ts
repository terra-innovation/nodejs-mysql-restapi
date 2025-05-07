import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Rol, RolId } from './Rol.js';
import type { Usuario, UsuarioId } from './Usuario.js';

export interface UsuarioRolAttributes {
  _idusuario: number;
  _idrol: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type UsuarioRolPk = "_idusuario" | "_idrol";
export type UsuarioRolId = UsuarioRol[UsuarioRolPk];
export type UsuarioRolOptionalAttributes = "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type UsuarioRolCreationAttributes = Optional<UsuarioRolAttributes, UsuarioRolOptionalAttributes>;

export class UsuarioRol extends Model<UsuarioRolAttributes, UsuarioRolCreationAttributes> implements UsuarioRolAttributes {
  _idusuario!: number;
  _idrol!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // UsuarioRol belongsTo Rol via _idrol
  rol_rol!: Rol;
  get_idrol_rol!: Sequelize.BelongsToGetAssociationMixin<Rol>;
  set_idrol_rol!: Sequelize.BelongsToSetAssociationMixin<Rol, RolId>;
  create_idrol_rol!: Sequelize.BelongsToCreateAssociationMixin<Rol>;
  // UsuarioRol belongsTo Usuario via _idusuario
  usuario_usuario!: Usuario;
  get_idusuario_usuario!: Sequelize.BelongsToGetAssociationMixin<Usuario>;
  set_idusuario_usuario!: Sequelize.BelongsToSetAssociationMixin<Usuario, UsuarioId>;
  create_idusuario_usuario!: Sequelize.BelongsToCreateAssociationMixin<Usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof UsuarioRol {
    return UsuarioRol.init({
    _idusuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    _idrol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'rol',
        key: '_idrol'
      }
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
    tableName: 'usuario_rol',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
          { name: "_idrol" },
        ]
      },
      {
        name: "FK_usuario_rol_idrol",
        using: "BTREE",
        fields: [
          { name: "_idrol" },
        ]
      },
    ]
  });
  }
}
