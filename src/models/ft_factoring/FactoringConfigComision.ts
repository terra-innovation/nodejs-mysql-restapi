import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Riesgo, RiesgoId } from './Riesgo.js';

export interface FactoringConfigComisionAttributes {
  _idfactoringconfigcomision: number;
  factoringconfigcomisionid: string;
  code: string;
  _idriesgo: number;
  version: number;
  factor1: number;
  factor2: number;
  factor3: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactoringConfigComisionPk = "_idfactoringconfigcomision";
export type FactoringConfigComisionId = FactoringConfigComision[FactoringConfigComisionPk];
export type FactoringConfigComisionOptionalAttributes = "factoringconfigcomisionid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringConfigComisionCreationAttributes = Optional<FactoringConfigComisionAttributes, FactoringConfigComisionOptionalAttributes>;

export class FactoringConfigComision extends Model<FactoringConfigComisionAttributes, FactoringConfigComisionCreationAttributes> implements FactoringConfigComisionAttributes {
  _idfactoringconfigcomision!: number;
  factoringconfigcomisionid!: string;
  code!: string;
  _idriesgo!: number;
  version!: number;
  factor1!: number;
  factor2!: number;
  factor3!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringConfigComision belongsTo Riesgo via _idriesgo
  riesgo_riesgo!: Riesgo;
  get_idriesgo_riesgo!: Sequelize.BelongsToGetAssociationMixin<Riesgo>;
  set_idriesgo_riesgo!: Sequelize.BelongsToSetAssociationMixin<Riesgo, RiesgoId>;
  create_idriesgo_riesgo!: Sequelize.BelongsToCreateAssociationMixin<Riesgo>;

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringConfigComision {
    return FactoringConfigComision.init({
    _idfactoringconfigcomision: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringconfigcomisionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_config_comision_factoringconfigcomisionid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factoring_config_comision_code"
    },
    _idriesgo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'riesgo',
        key: '_idriesgo'
      }
    },
    version: {
      type: DataTypes.FLOAT(6,3),
      allowNull: false
    },
    factor1: {
      type: DataTypes.DECIMAL(20,10),
      allowNull: false
    },
    factor2: {
      type: DataTypes.DECIMAL(20,10),
      allowNull: false
    },
    factor3: {
      type: DataTypes.DECIMAL(10,5),
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
    tableName: 'factoring_config_comision',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringconfigcomision" },
        ]
      },
      {
        name: "UQ_factoring_config_comision_factoringconfigcomisionid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringconfigcomisionid" },
        ]
      },
      {
        name: "UQ_factoring_config_comision_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factoring_config_comision_idriesgo",
        using: "BTREE",
        fields: [
          { name: "_idriesgo" },
        ]
      },
    ]
  });
  }
}
