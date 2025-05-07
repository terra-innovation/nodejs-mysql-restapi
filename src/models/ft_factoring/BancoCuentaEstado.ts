import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoCuenta, BancoCuentaId } from './BancoCuenta.js';

export interface BancoCuentaEstadoAttributes {
  _idbancocuentaestado: number;
  bancocuentaestadoid: string;
  code: string;
  nombre: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type BancoCuentaEstadoPk = "_idbancocuentaestado";
export type BancoCuentaEstadoId = BancoCuentaEstado[BancoCuentaEstadoPk];
export type BancoCuentaEstadoOptionalAttributes = "bancocuentaestadoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type BancoCuentaEstadoCreationAttributes = Optional<BancoCuentaEstadoAttributes, BancoCuentaEstadoOptionalAttributes>;

export class BancoCuentaEstado extends Model<BancoCuentaEstadoAttributes, BancoCuentaEstadoCreationAttributes> implements BancoCuentaEstadoAttributes {
  _idbancocuentaestado!: number;
  bancocuentaestadoid!: string;
  code!: string;
  nombre!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // BancoCuentaEstado hasMany BancoCuenta via _idbancocuentaestado
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

  static initModel(sequelize: Sequelize.Sequelize): typeof BancoCuentaEstado {
    return BancoCuentaEstado.init({
    _idbancocuentaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bancocuentaestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancocuentaestado_bancocuentaestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_bancocuentaestado_code"
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
    tableName: 'banco_cuenta_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancocuentaestado" },
        ]
      },
      {
        name: "UQ_bancocuentaestado_bancocuentaestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bancocuentaestadoid" },
        ]
      },
      {
        name: "UQ_bancocuentaestado_code",
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
