import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { FactoringPropuesta, FactoringPropuestaId } from './FactoringPropuesta.js';

export interface FactoringPropuestaEstadoAttributes {
  _idfactoringpropuestaestado: number;
  factoringpropuestaestadoid: string;
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

export type FactoringPropuestaEstadoPk = "_idfactoringpropuestaestado";
export type FactoringPropuestaEstadoId = FactoringPropuestaEstado[FactoringPropuestaEstadoPk];
export type FactoringPropuestaEstadoOptionalAttributes = "factoringpropuestaestadoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringPropuestaEstadoCreationAttributes = Optional<FactoringPropuestaEstadoAttributes, FactoringPropuestaEstadoOptionalAttributes>;

export class FactoringPropuestaEstado extends Model<FactoringPropuestaEstadoAttributes, FactoringPropuestaEstadoCreationAttributes> implements FactoringPropuestaEstadoAttributes {
  _idfactoringpropuestaestado!: number;
  factoringpropuestaestadoid!: string;
  code!: string;
  nombre!: string;
  alias!: string;
  color!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringPropuestaEstado hasMany FactoringPropuesta via _idfactoringpropuestaestado
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

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringPropuestaEstado {
    return FactoringPropuestaEstado.init({
    _idfactoringpropuestaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringpropuestaestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_propuesta_estado_factoringpropuestaestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factoring_propuesta_estado_code"
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
    tableName: 'factoring_propuesta_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringpropuestaestado" },
        ]
      },
      {
        name: "UQ_factoring_propuesta_estado_factoringpropuestaestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringpropuestaestadoid" },
        ]
      },
      {
        name: "UQ_factoring_propuesta_estado_code",
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
