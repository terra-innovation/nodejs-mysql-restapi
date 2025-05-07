import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Validacion, ValidacionId } from './Validacion.js';

export interface ValidacionTipoAttributes {
  _idvalidaciontipo: number;
  validaciontipoid: string;
  nombre: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ValidacionTipoPk = "_idvalidaciontipo";
export type ValidacionTipoId = ValidacionTipo[ValidacionTipoPk];
export type ValidacionTipoOptionalAttributes = "_idvalidaciontipo" | "validaciontipoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ValidacionTipoCreationAttributes = Optional<ValidacionTipoAttributes, ValidacionTipoOptionalAttributes>;

export class ValidacionTipo extends Model<ValidacionTipoAttributes, ValidacionTipoCreationAttributes> implements ValidacionTipoAttributes {
  _idvalidaciontipo!: number;
  validaciontipoid!: string;
  nombre!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ValidacionTipo hasMany Validacion via _idvalidaciontipo
  validacions!: Validacion[];
  getValidacions!: Sequelize.HasManyGetAssociationsMixin<Validacion>;
  setValidacions!: Sequelize.HasManySetAssociationsMixin<Validacion, ValidacionId>;
  addValidacion!: Sequelize.HasManyAddAssociationMixin<Validacion, ValidacionId>;
  addValidacions!: Sequelize.HasManyAddAssociationsMixin<Validacion, ValidacionId>;
  createValidacion!: Sequelize.HasManyCreateAssociationMixin<Validacion>;
  removeValidacion!: Sequelize.HasManyRemoveAssociationMixin<Validacion, ValidacionId>;
  removeValidacions!: Sequelize.HasManyRemoveAssociationsMixin<Validacion, ValidacionId>;
  hasValidacion!: Sequelize.HasManyHasAssociationMixin<Validacion, ValidacionId>;
  hasValidacions!: Sequelize.HasManyHasAssociationsMixin<Validacion, ValidacionId>;
  countValidacions!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ValidacionTipo {
    return ValidacionTipo.init({
    _idvalidaciontipo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    validaciontipoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_validacion_tipo_validaciontipoid"
    },
    nombre: {
      type: DataTypes.STRING(50),
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
    tableName: 'validacion_tipo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idvalidaciontipo" },
        ]
      },
      {
        name: "UQ_validacion_tipo_validaciontipoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "validaciontipoid" },
        ]
      },
    ]
  });
  }
}
