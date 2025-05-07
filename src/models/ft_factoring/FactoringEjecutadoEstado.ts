import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { FactoringEjecutado, FactoringEjecutadoId } from './FactoringEjecutado.js';

export interface FactoringEjecutadoEstadoAttributes {
  _idfactoringejecutadoestado: number;
  factoringejecutadoestadoid: string;
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

export type FactoringEjecutadoEstadoPk = "_idfactoringejecutadoestado";
export type FactoringEjecutadoEstadoId = FactoringEjecutadoEstado[FactoringEjecutadoEstadoPk];
export type FactoringEjecutadoEstadoOptionalAttributes = "factoringejecutadoestadoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringEjecutadoEstadoCreationAttributes = Optional<FactoringEjecutadoEstadoAttributes, FactoringEjecutadoEstadoOptionalAttributes>;

export class FactoringEjecutadoEstado extends Model<FactoringEjecutadoEstadoAttributes, FactoringEjecutadoEstadoCreationAttributes> implements FactoringEjecutadoEstadoAttributes {
  _idfactoringejecutadoestado!: number;
  factoringejecutadoestadoid!: string;
  code!: string;
  nombre!: string;
  alias!: string;
  color!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringEjecutadoEstado hasMany FactoringEjecutado via _idfactoringejecutadoaestado
  factoring_ejecutados!: FactoringEjecutado[];
  getFactoring_ejecutados!: Sequelize.HasManyGetAssociationsMixin<FactoringEjecutado>;
  setFactoring_ejecutados!: Sequelize.HasManySetAssociationsMixin<FactoringEjecutado, FactoringEjecutadoId>;
  addFactoring_ejecutado!: Sequelize.HasManyAddAssociationMixin<FactoringEjecutado, FactoringEjecutadoId>;
  addFactoring_ejecutados!: Sequelize.HasManyAddAssociationsMixin<FactoringEjecutado, FactoringEjecutadoId>;
  createFactoring_ejecutado!: Sequelize.HasManyCreateAssociationMixin<FactoringEjecutado>;
  removeFactoring_ejecutado!: Sequelize.HasManyRemoveAssociationMixin<FactoringEjecutado, FactoringEjecutadoId>;
  removeFactoring_ejecutados!: Sequelize.HasManyRemoveAssociationsMixin<FactoringEjecutado, FactoringEjecutadoId>;
  hasFactoring_ejecutado!: Sequelize.HasManyHasAssociationMixin<FactoringEjecutado, FactoringEjecutadoId>;
  hasFactoring_ejecutados!: Sequelize.HasManyHasAssociationsMixin<FactoringEjecutado, FactoringEjecutadoId>;
  countFactoring_ejecutados!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringEjecutadoEstado {
    return FactoringEjecutadoEstado.init({
    _idfactoringejecutadoestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringejecutadoestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_ejecutado_estado_factoringejecutadoestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factoring_ejecutado_estado_code"
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
    tableName: 'factoring_ejecutado_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringejecutadoestado" },
        ]
      },
      {
        name: "UQ_factoring_ejecutado_estado_factoringejecutadoestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringejecutadoestadoid" },
        ]
      },
      {
        name: "UQ_factoring_ejecutado_estado_code",
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
