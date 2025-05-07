import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId } from './FactoringPropuestaFinanciero.js';

export interface FinancieroTipoAttributes {
  _idfinancierotipo: number;
  financierotipoid: string;
  code: string;
  nombre: string;
  alias: string;
  color: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FinancieroTipoPk = "_idfinancierotipo";
export type FinancieroTipoId = FinancieroTipo[FinancieroTipoPk];
export type FinancieroTipoOptionalAttributes = "financierotipoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FinancieroTipoCreationAttributes = Optional<FinancieroTipoAttributes, FinancieroTipoOptionalAttributes>;

export class FinancieroTipo extends Model<FinancieroTipoAttributes, FinancieroTipoCreationAttributes> implements FinancieroTipoAttributes {
  _idfinancierotipo!: number;
  financierotipoid!: string;
  code!: string;
  nombre!: string;
  alias!: string;
  color!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FinancieroTipo hasMany FactoringPropuestaFinanciero via _idfinancierotipo
  factoring_propuesta_financieros!: FactoringPropuestaFinanciero[];
  getFactoring_propuesta_financieros!: Sequelize.HasManyGetAssociationsMixin<FactoringPropuestaFinanciero>;
  setFactoring_propuesta_financieros!: Sequelize.HasManySetAssociationsMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  addFactoring_propuesta_financiero!: Sequelize.HasManyAddAssociationMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  addFactoring_propuesta_financieros!: Sequelize.HasManyAddAssociationsMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  createFactoring_propuesta_financiero!: Sequelize.HasManyCreateAssociationMixin<FactoringPropuestaFinanciero>;
  removeFactoring_propuesta_financiero!: Sequelize.HasManyRemoveAssociationMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  removeFactoring_propuesta_financieros!: Sequelize.HasManyRemoveAssociationsMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  hasFactoring_propuesta_financiero!: Sequelize.HasManyHasAssociationMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  hasFactoring_propuesta_financieros!: Sequelize.HasManyHasAssociationsMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  countFactoring_propuesta_financieros!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof FinancieroTipo {
    return FinancieroTipo.init({
    _idfinancierotipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    financierotipoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_financiero_tipo_financierotipoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_financiero_tipo_code"
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
    tableName: 'financiero_tipo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfinancierotipo" },
        ]
      },
      {
        name: "UQ_financiero_tipo_financierotipoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "financierotipoid" },
        ]
      },
      {
        name: "UQ_financiero_tipo_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
    ]
  });
  }
}
