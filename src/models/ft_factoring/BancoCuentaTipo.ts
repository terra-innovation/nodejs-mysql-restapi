import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoCuenta, BancoCuentaId } from './BancoCuenta.js';

export interface BancoCuentaTipoAttributes {
  _idbancocuentatipo: number;
  bancocuentatipoid: string;
  code: string;
  nombre: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type BancoCuentaTipoPk = "_idbancocuentatipo";
export type BancoCuentaTipoId = BancoCuentaTipo[BancoCuentaTipoPk];
export type BancoCuentaTipoOptionalAttributes = "bancocuentatipoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type BancoCuentaTipoCreationAttributes = Optional<BancoCuentaTipoAttributes, BancoCuentaTipoOptionalAttributes>;

export class BancoCuentaTipo extends Model<BancoCuentaTipoAttributes, BancoCuentaTipoCreationAttributes> implements BancoCuentaTipoAttributes {
  _idbancocuentatipo!: number;
  bancocuentatipoid!: string;
  code!: string;
  nombre!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // BancoCuentaTipo hasMany BancoCuenta via _idbancocuentatipo
  banco_cuenta!: BancoCuenta[];
  getBanco_cuenta!: Sequelize.HasManyGetAssociationsMixin<BancoCuenta>;
  setBanco_cuenta!: Sequelize.HasManySetAssociationsMixin<BancoCuenta, BancoCuentaId>;
  addBanco_cuentum!: Sequelize.HasManyAddAssociationMixin<BancoCuenta, BancoCuentaId>;
  addBanco_cuenta!: Sequelize.HasManyAddAssociationsMixin<BancoCuenta, BancoCuentaId>;
  createBanco_cuentum!: Sequelize.HasManyCreateAssociationMixin<BancoCuenta>;
  removeBanco_cuentum!: Sequelize.HasManyRemoveAssociationMixin<BancoCuenta, BancoCuentaId>;
  removeBanco_cuenta!: Sequelize.HasManyRemoveAssociationsMixin<BancoCuenta, BancoCuentaId>;
  hasBanco_cuentum!: Sequelize.HasManyHasAssociationMixin<BancoCuenta, BancoCuentaId>;
  hasBanco_cuenta!: Sequelize.HasManyHasAssociationsMixin<BancoCuenta, BancoCuentaId>;
  countBanco_cuenta!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof BancoCuentaTipo {
    return BancoCuentaTipo.init({
    _idbancocuentatipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bancocuentatipoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancocuentatipo_bancocuentatipoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_bancocuentatipo_code"
    },
    nombre: {
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
    tableName: 'banco_cuenta_tipo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancocuentatipo" },
        ]
      },
      {
        name: "UQ_bancocuentatipo_bancocuentatipoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bancocuentatipoid" },
        ]
      },
      {
        name: "UQ_bancocuentatipo_code",
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
