import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Usuario, UsuarioId } from './Usuario.js';

export interface CredencialAttributes {
  _idcredencial: number;
  credencialid: string;
  code: string;
  _idusuario: number;
  password: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type CredencialPk = "_idcredencial";
export type CredencialId = Credencial[CredencialPk];
export type CredencialOptionalAttributes = "_idcredencial" | "credencialid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type CredencialCreationAttributes = Optional<CredencialAttributes, CredencialOptionalAttributes>;

export class Credencial extends Model<CredencialAttributes, CredencialCreationAttributes> implements CredencialAttributes {
  _idcredencial!: number;
  credencialid!: string;
  code!: string;
  _idusuario!: number;
  password!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Credencial belongsTo Usuario via _idusuario
  usuario_usuario!: Usuario;
  get_idusuario_usuario!: Sequelize.BelongsToGetAssociationMixin<Usuario>;
  set_idusuario_usuario!: Sequelize.BelongsToSetAssociationMixin<Usuario, UsuarioId>;
  create_idusuario_usuario!: Sequelize.BelongsToCreateAssociationMixin<Usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Credencial {
    return Credencial.init({
    _idcredencial: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    credencialid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_credencial_credencialid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_credencial_code"
    },
    _idusuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      },
      unique: "FK_credencial_idusuario"
    },
    password: {
      type: DataTypes.STRING(200),
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
    tableName: 'credencial',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idcredencial" },
        ]
      },
      {
        name: "UQ_credencial_credencialid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "credencialid" },
        ]
      },
      {
        name: "UQ_credencial_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_credencual_idusuario",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
        ]
      },
      {
        name: "FK_credencial_idusuario",
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
        ]
      },
    ]
  });
  }
}
