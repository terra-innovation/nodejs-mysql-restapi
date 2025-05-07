import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { FactoringPropuesta, FactoringPropuestaId } from './FactoringPropuesta.js';

export interface FactoringTipoAttributes {
  _idfactoringtipo: number;
  factoringtipoid: string;
  nombre: string;
  alias: string;
  color: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactoringTipoPk = "_idfactoringtipo";
export type FactoringTipoId = FactoringTipo[FactoringTipoPk];
export type FactoringTipoOptionalAttributes = "_idfactoringtipo" | "factoringtipoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringTipoCreationAttributes = Optional<FactoringTipoAttributes, FactoringTipoOptionalAttributes>;

export class FactoringTipo extends Model<FactoringTipoAttributes, FactoringTipoCreationAttributes> implements FactoringTipoAttributes {
  _idfactoringtipo!: number;
  factoringtipoid!: string;
  nombre!: string;
  alias!: string;
  color!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringTipo hasMany FactoringPropuesta via _idfactoringtipo
  factoring_propuesta!: FactoringPropuesta[];
  getFactoring_propuesta!: Sequelize.HasManyGetAssociationsMixin<FactoringPropuesta>;
  setFactoring_propuesta!: Sequelize.HasManySetAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  addFactoring_propuestum!: Sequelize.HasManyAddAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  addFactoring_propuesta!: Sequelize.HasManyAddAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  createFactoring_propuestum!: Sequelize.HasManyCreateAssociationMixin<FactoringPropuesta>;
  removeFactoring_propuestum!: Sequelize.HasManyRemoveAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  removeFactoring_propuesta!: Sequelize.HasManyRemoveAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  hasFactoring_propuestum!: Sequelize.HasManyHasAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  hasFactoring_propuesta!: Sequelize.HasManyHasAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  countFactoring_propuesta!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringTipo {
    return FactoringTipo.init({
    _idfactoringtipo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringtipoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_tipo_factoringid"
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    color: {
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
    tableName: 'factoring_tipo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringtipo" },
        ]
      },
      {
        name: "UQ_factoring_tipo_factoringid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringtipoid" },
        ]
      },
    ]
  });
  }
}
