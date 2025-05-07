import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { FactoringPropuesta, FactoringPropuestaId } from './FactoringPropuesta.js';

export interface FactoringEstrategiaAttributes {
  _idfactoringestrategia: number;
  factoringestrategiaid: string;
  code: string;
  nombre_estrategia?: string;
  descripcion?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactoringEstrategiaPk = "_idfactoringestrategia";
export type FactoringEstrategiaId = FactoringEstrategia[FactoringEstrategiaPk];
export type FactoringEstrategiaOptionalAttributes = "factoringestrategiaid" | "nombre_estrategia" | "descripcion" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringEstrategiaCreationAttributes = Optional<FactoringEstrategiaAttributes, FactoringEstrategiaOptionalAttributes>;

export class FactoringEstrategia extends Model<FactoringEstrategiaAttributes, FactoringEstrategiaCreationAttributes> implements FactoringEstrategiaAttributes {
  _idfactoringestrategia!: number;
  factoringestrategiaid!: string;
  code!: string;
  nombre_estrategia?: string;
  descripcion?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringEstrategia hasMany FactoringPropuesta via _idfactoringestrategia
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

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringEstrategia {
    return FactoringEstrategia.init({
    _idfactoringestrategia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringestrategiaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_estrategia_factoringestrategiaid"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ_factoring_estrategia_code"
    },
    nombre_estrategia: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Monto asociado a la colocación de la operación"
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
    tableName: 'factoring_estrategia',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringestrategia" },
        ]
      },
      {
        name: "UQ_factoring_estrategia_factoringestrategiaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringestrategiaid" },
        ]
      },
      {
        name: "UQ_factoring_estrategia_code",
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
