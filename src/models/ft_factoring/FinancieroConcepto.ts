import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId } from './FactoringPropuestaFinanciero.js';

export interface FinancieroConceptoAttributes {
  _idfinancieroconcepto: number;
  financieroconceptoid: string;
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

export type FinancieroConceptoPk = "_idfinancieroconcepto";
export type FinancieroConceptoId = FinancieroConcepto[FinancieroConceptoPk];
export type FinancieroConceptoOptionalAttributes = "financieroconceptoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FinancieroConceptoCreationAttributes = Optional<FinancieroConceptoAttributes, FinancieroConceptoOptionalAttributes>;

export class FinancieroConcepto extends Model<FinancieroConceptoAttributes, FinancieroConceptoCreationAttributes> implements FinancieroConceptoAttributes {
  _idfinancieroconcepto!: number;
  financieroconceptoid!: string;
  code!: string;
  nombre!: string;
  alias!: string;
  color!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FinancieroConcepto hasMany FactoringPropuestaFinanciero via _idfinancieroconcepto
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

  static initModel(sequelize: Sequelize.Sequelize): typeof FinancieroConcepto {
    return FinancieroConcepto.init({
    _idfinancieroconcepto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    financieroconceptoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_financiero_concepto_financieroconceptoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_financiero_concepto_code"
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
    tableName: 'financiero_concepto',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfinancieroconcepto" },
        ]
      },
      {
        name: "UQ_financiero_concepto_financieroconceptoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "financieroconceptoid" },
        ]
      },
      {
        name: "UQ_financiero_concepto_code",
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
