import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { CuentaBancaria, CuentaBancariaId } from './CuentaBancaria.js';

export interface CuentaTipoAttributes {
  _idcuentatipo: number;
  cuentatipoid: string;
  nombre: string;
  alias: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type CuentaTipoPk = "_idcuentatipo";
export type CuentaTipoId = CuentaTipo[CuentaTipoPk];
export type CuentaTipoOptionalAttributes = "_idcuentatipo" | "cuentatipoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type CuentaTipoCreationAttributes = Optional<CuentaTipoAttributes, CuentaTipoOptionalAttributes>;

export class CuentaTipo extends Model<CuentaTipoAttributes, CuentaTipoCreationAttributes> implements CuentaTipoAttributes {
  _idcuentatipo!: number;
  cuentatipoid!: string;
  nombre!: string;
  alias!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // CuentaTipo hasMany CuentaBancaria via _idcuentatipo
  cuenta_bancaria!: CuentaBancaria[];
  getCuenta_bancaria!: Sequelize.HasManyGetAssociationsMixin<CuentaBancaria>;
  setCuenta_bancaria!: Sequelize.HasManySetAssociationsMixin<CuentaBancaria, CuentaBancariaId>;
  addCuenta_bancarium!: Sequelize.HasManyAddAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  addCuenta_bancaria!: Sequelize.HasManyAddAssociationsMixin<CuentaBancaria, CuentaBancariaId>;
  createCuenta_bancarium!: Sequelize.HasManyCreateAssociationMixin<CuentaBancaria>;
  removeCuenta_bancarium!: Sequelize.HasManyRemoveAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  removeCuenta_bancaria!: Sequelize.HasManyRemoveAssociationsMixin<CuentaBancaria, CuentaBancariaId>;
  hasCuenta_bancarium!: Sequelize.HasManyHasAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  hasCuenta_bancaria!: Sequelize.HasManyHasAssociationsMixin<CuentaBancaria, CuentaBancariaId>;
  countCuenta_bancaria!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof CuentaTipo {
    return CuentaTipo.init({
    _idcuentatipo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cuentatipoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_cuentatipoid"
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    alias: {
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
    tableName: 'cuenta_tipo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idcuentatipo" },
        ]
      },
      {
        name: "UQ_cuentatipoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cuentatipoid" },
        ]
      },
    ]
  });
  }
}
