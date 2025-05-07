import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Factoring, FactoringId } from './Factoring.js';
import type { FactoringHistorialEstado, FactoringHistorialEstadoId } from './FactoringHistorialEstado.js';

export interface FactoringEstadoAttributes {
  _idfactoringestado: number;
  factoringestadoid: string;
  estado1: string;
  estado2: string;
  alias_estado1?: string;
  alias_estado2?: string;
  accion?: string;
  orden?: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactoringEstadoPk = "_idfactoringestado";
export type FactoringEstadoId = FactoringEstado[FactoringEstadoPk];
export type FactoringEstadoOptionalAttributes = "_idfactoringestado" | "factoringestadoid" | "alias_estado1" | "alias_estado2" | "accion" | "orden" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringEstadoCreationAttributes = Optional<FactoringEstadoAttributes, FactoringEstadoOptionalAttributes>;

export class FactoringEstado extends Model<FactoringEstadoAttributes, FactoringEstadoCreationAttributes> implements FactoringEstadoAttributes {
  _idfactoringestado!: number;
  factoringestadoid!: string;
  estado1!: string;
  estado2!: string;
  alias_estado1?: string;
  alias_estado2?: string;
  accion?: string;
  orden?: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringEstado hasMany Factoring via _idfactoringestado
  factorings!: Factoring[];
  getFactorings!: Sequelize.HasManyGetAssociationsMixin<Factoring>;
  setFactorings!: Sequelize.HasManySetAssociationsMixin<Factoring, FactoringId>;
  addFactoring!: Sequelize.HasManyAddAssociationMixin<Factoring, FactoringId>;
  addFactorings!: Sequelize.HasManyAddAssociationsMixin<Factoring, FactoringId>;
  createFactoring!: Sequelize.HasManyCreateAssociationMixin<Factoring>;
  removeFactoring!: Sequelize.HasManyRemoveAssociationMixin<Factoring, FactoringId>;
  removeFactorings!: Sequelize.HasManyRemoveAssociationsMixin<Factoring, FactoringId>;
  hasFactoring!: Sequelize.HasManyHasAssociationMixin<Factoring, FactoringId>;
  hasFactorings!: Sequelize.HasManyHasAssociationsMixin<Factoring, FactoringId>;
  countFactorings!: Sequelize.HasManyCountAssociationsMixin;
  // FactoringEstado hasMany FactoringHistorialEstado via _idfactoringestado
  factoring_historial_estados!: FactoringHistorialEstado[];
  getFactoring_historial_estados!: Sequelize.HasManyGetAssociationsMixin<FactoringHistorialEstado>;
  setFactoring_historial_estados!: Sequelize.HasManySetAssociationsMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  addFactoring_historial_estado!: Sequelize.HasManyAddAssociationMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  addFactoring_historial_estados!: Sequelize.HasManyAddAssociationsMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  createFactoring_historial_estado!: Sequelize.HasManyCreateAssociationMixin<FactoringHistorialEstado>;
  removeFactoring_historial_estado!: Sequelize.HasManyRemoveAssociationMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  removeFactoring_historial_estados!: Sequelize.HasManyRemoveAssociationsMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  hasFactoring_historial_estado!: Sequelize.HasManyHasAssociationMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  hasFactoring_historial_estados!: Sequelize.HasManyHasAssociationsMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  countFactoring_historial_estados!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringEstado {
    return FactoringEstado.init({
    _idfactoringestado: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_estado_factoringestadoid"
    },
    estado1: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    estado2: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    alias_estado1: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    alias_estado2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    accion: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    orden: {
      type: DataTypes.SMALLINT,
      allowNull: true
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
    tableName: 'factoring_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringestado" },
        ]
      },
      {
        name: "UQ_factoring_estado_factoringestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringestadoid" },
        ]
      },
    ]
  });
  }
}
