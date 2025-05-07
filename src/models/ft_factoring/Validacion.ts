import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Usuario, UsuarioId } from './Usuario.js';
import type { ValidacionTipo, ValidacionTipoId } from './ValidacionTipo.js';

export interface ValidacionAttributes {
  _idvalidacion: number;
  validacionid: string;
  _idusuario: number;
  _idvalidaciontipo: number;
  valor: string;
  otp: string;
  tiempo_marca: Date | Sequelize.Utils.Fn;
  tiempo_expiracion: number;
  verificado: number;
  fecha_verificado?: Date | Sequelize.Utils.Fn;
  codigo: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ValidacionPk = "_idvalidacion";
export type ValidacionId = Validacion[ValidacionPk];
export type ValidacionOptionalAttributes = "_idvalidacion" | "validacionid" | "valor" | "tiempo_marca" | "tiempo_expiracion" | "verificado" | "fecha_verificado" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ValidacionCreationAttributes = Optional<ValidacionAttributes, ValidacionOptionalAttributes>;

export class Validacion extends Model<ValidacionAttributes, ValidacionCreationAttributes> implements ValidacionAttributes {
  _idvalidacion!: number;
  validacionid!: string;
  _idusuario!: number;
  _idvalidaciontipo!: number;
  valor!: string;
  otp!: string;
  tiempo_marca!: Date;
  tiempo_expiracion!: number;
  verificado!: number;
  fecha_verificado?: Date | Sequelize.Utils.Fn;
  codigo!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Validacion belongsTo Usuario via _idusuario
  usuario_usuario!: Usuario;
  get_idusuario_usuario!: Sequelize.BelongsToGetAssociationMixin<Usuario>;
  set_idusuario_usuario!: Sequelize.BelongsToSetAssociationMixin<Usuario, UsuarioId>;
  create_idusuario_usuario!: Sequelize.BelongsToCreateAssociationMixin<Usuario>;
  // Validacion belongsTo ValidacionTipo via _idvalidaciontipo
  validaciontipo_validacion_tipo!: ValidacionTipo;
  get_idvalidaciontipo_validacion_tipo!: Sequelize.BelongsToGetAssociationMixin<ValidacionTipo>;
  set_idvalidaciontipo_validacion_tipo!: Sequelize.BelongsToSetAssociationMixin<ValidacionTipo, ValidacionTipoId>;
  create_idvalidaciontipo_validacion_tipo!: Sequelize.BelongsToCreateAssociationMixin<ValidacionTipo>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Validacion {
    return Validacion.init({
    _idvalidacion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    validacionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_validacion_validacionid"
    },
    _idusuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    _idvalidaciontipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'validacion_tipo',
        key: '_idvalidaciontipo'
      }
    },
    valor: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    otp: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    tiempo_marca: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: "current_timestamp(3)"
    },
    tiempo_expiracion: {
      type: DataTypes.MEDIUMINT,
      allowNull: false,
      defaultValue: 0,
      comment: "en minutos"
    },
    verificado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    fecha_verificado: {
      type: DataTypes.DATE(3),
      allowNull: true
    },
    codigo: {
      type: DataTypes.STRING(100),
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
    tableName: 'validacion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idvalidacion" },
        ]
      },
      {
        name: "UQ_validacion_validacionid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "validacionid" },
        ]
      },
      {
        name: "FK_validacion_idusuario",
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
        ]
      },
      {
        name: "FK_validacion_idvalidaciontipo",
        using: "BTREE",
        fields: [
          { name: "_idvalidaciontipo" },
        ]
      },
    ]
  });
  }
}
