import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Riesgo, RiesgoId } from './Riesgo.js';

export interface FactoringConfigTasaDescuentoAttributes {
  _idfactoringconfigtasadescuento: number;
  factoringconfigtasadescuentoid: string;
  code: string;
  _idriesgo: number;
  version: number;
  mensual_minimo: number;
  mensual_maximo: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactoringConfigTasaDescuentoPk = "_idfactoringconfigtasadescuento";
export type FactoringConfigTasaDescuentoId = FactoringConfigTasaDescuento[FactoringConfigTasaDescuentoPk];
export type FactoringConfigTasaDescuentoOptionalAttributes = "factoringconfigtasadescuentoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringConfigTasaDescuentoCreationAttributes = Optional<FactoringConfigTasaDescuentoAttributes, FactoringConfigTasaDescuentoOptionalAttributes>;

export class FactoringConfigTasaDescuento extends Model<FactoringConfigTasaDescuentoAttributes, FactoringConfigTasaDescuentoCreationAttributes> implements FactoringConfigTasaDescuentoAttributes {
  _idfactoringconfigtasadescuento!: number;
  factoringconfigtasadescuentoid!: string;
  code!: string;
  _idriesgo!: number;
  version!: number;
  mensual_minimo!: number;
  mensual_maximo!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringConfigTasaDescuento belongsTo Riesgo via _idriesgo
  riesgo_riesgo!: Riesgo;
  get_idriesgo_riesgo!: Sequelize.BelongsToGetAssociationMixin<Riesgo>;
  set_idriesgo_riesgo!: Sequelize.BelongsToSetAssociationMixin<Riesgo, RiesgoId>;
  create_idriesgo_riesgo!: Sequelize.BelongsToCreateAssociationMixin<Riesgo>;

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringConfigTasaDescuento {
    return FactoringConfigTasaDescuento.init({
    _idfactoringconfigtasadescuento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringconfigtasadescuentoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_config_tasa_factoringconfigtasadescuentoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factoring_config_tasa_code"
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
    mensual_minimo: {
      type: DataTypes.DECIMAL(20,10),
      allowNull: false
    },
    mensual_maximo: {
      type: DataTypes.DECIMAL(20,10),
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
    tableName: 'factoring_config_tasa_descuento',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringconfigtasadescuento" },
        ]
      },
      {
        name: "UQ_factoring_config_tasa_factoringconfigtasadescuentoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringconfigtasadescuentoid" },
        ]
      },
      {
        name: "UQ_factoring_config_tasa_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factoring_config_tasa_idriesgo",
        using: "BTREE",
        fields: [
          { name: "_idriesgo" },
        ]
      },
    ]
  });
  }
}
