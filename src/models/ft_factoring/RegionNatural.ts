import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Distrito, DistritoId } from './Distrito.js';

export interface RegionNaturalAttributes {
  _idregionnatural: number;
  regionnaturalid: string;
  nombreregionnatural: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type RegionNaturalPk = "_idregionnatural";
export type RegionNaturalId = RegionNatural[RegionNaturalPk];
export type RegionNaturalOptionalAttributes = "regionnaturalid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type RegionNaturalCreationAttributes = Optional<RegionNaturalAttributes, RegionNaturalOptionalAttributes>;

export class RegionNatural extends Model<RegionNaturalAttributes, RegionNaturalCreationAttributes> implements RegionNaturalAttributes {
  _idregionnatural!: number;
  regionnaturalid!: string;
  nombreregionnatural!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // RegionNatural hasMany Distrito via _idregionnatural
  distritos!: Distrito[];
  getDistritos!: Sequelize.HasManyGetAssociationsMixin<Distrito>;
  setDistritos!: Sequelize.HasManySetAssociationsMixin<Distrito, DistritoId>;
  addDistrito!: Sequelize.HasManyAddAssociationMixin<Distrito, DistritoId>;
  addDistritos!: Sequelize.HasManyAddAssociationsMixin<Distrito, DistritoId>;
  createDistrito!: Sequelize.HasManyCreateAssociationMixin<Distrito>;
  removeDistrito!: Sequelize.HasManyRemoveAssociationMixin<Distrito, DistritoId>;
  removeDistritos!: Sequelize.HasManyRemoveAssociationsMixin<Distrito, DistritoId>;
  hasDistrito!: Sequelize.HasManyHasAssociationMixin<Distrito, DistritoId>;
  hasDistritos!: Sequelize.HasManyHasAssociationsMixin<Distrito, DistritoId>;
  countDistritos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof RegionNatural {
    return RegionNatural.init({
    _idregionnatural: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    regionnaturalid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_distritoid"
    },
    nombreregionnatural: {
      type: DataTypes.STRING(200),
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
    tableName: 'region_natural',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idregionnatural" },
        ]
      },
      {
        name: "UQ_distritoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "regionnaturalid" },
        ]
      },
    ]
  });
  }
}
