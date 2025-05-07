import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoTransaccion, BancoTransaccionId } from './BancoTransaccion.js';
import type { BancoTransaccionFactoringInversion, BancoTransaccionFactoringInversionId } from './BancoTransaccionFactoringInversion.js';

export interface FactoringInversionAttributes {
  _idfactoringinversion: number;
  factoringinversionid: string;
  code: string;
  _idfactoring: number;
  _idinversionista: number;
  monto_invertido: number;
  fecha_inversion: Date | Sequelize.Utils.Fn;
  porcentaje_participacion: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactoringInversionPk = "_idfactoringinversion";
export type FactoringInversionId = FactoringInversion[FactoringInversionPk];
export type FactoringInversionOptionalAttributes = "_idfactoringinversion" | "factoringinversionid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringInversionCreationAttributes = Optional<FactoringInversionAttributes, FactoringInversionOptionalAttributes>;

export class FactoringInversion extends Model<FactoringInversionAttributes, FactoringInversionCreationAttributes> implements FactoringInversionAttributes {
  _idfactoringinversion!: number;
  factoringinversionid!: string;
  code!: string;
  _idfactoring!: number;
  _idinversionista!: number;
  monto_invertido!: number;
  fecha_inversion!: Date;
  porcentaje_participacion!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringInversion belongsToMany BancoTransaccion via _idfactoringinversion and _idbancotransaccion
  bancotransaccion_banco_transaccions!: BancoTransaccion[];
  get_idbancotransaccion_banco_transaccions!: Sequelize.BelongsToManyGetAssociationsMixin<BancoTransaccion>;
  set_idbancotransaccion_banco_transaccions!: Sequelize.BelongsToManySetAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  add_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToManyAddAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  add_idbancotransaccion_banco_transaccions!: Sequelize.BelongsToManyAddAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  create_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToManyCreateAssociationMixin<BancoTransaccion>;
  remove_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToManyRemoveAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  remove_idbancotransaccion_banco_transaccions!: Sequelize.BelongsToManyRemoveAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  has_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToManyHasAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  has_idbancotransaccion_banco_transaccions!: Sequelize.BelongsToManyHasAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  count_idbancotransaccion_banco_transaccions!: Sequelize.BelongsToManyCountAssociationsMixin;
  // FactoringInversion hasMany BancoTransaccionFactoringInversion via _idfactoringinversion
  banco_transaccion_factoring_inversions!: BancoTransaccionFactoringInversion[];
  getBanco_transaccion_factoring_inversions!: Sequelize.HasManyGetAssociationsMixin<BancoTransaccionFactoringInversion>;
  setBanco_transaccion_factoring_inversions!: Sequelize.HasManySetAssociationsMixin<BancoTransaccionFactoringInversion, BancoTransaccionFactoringInversionId>;
  addBanco_transaccion_factoring_inversion!: Sequelize.HasManyAddAssociationMixin<BancoTransaccionFactoringInversion, BancoTransaccionFactoringInversionId>;
  addBanco_transaccion_factoring_inversions!: Sequelize.HasManyAddAssociationsMixin<BancoTransaccionFactoringInversion, BancoTransaccionFactoringInversionId>;
  createBanco_transaccion_factoring_inversion!: Sequelize.HasManyCreateAssociationMixin<BancoTransaccionFactoringInversion>;
  removeBanco_transaccion_factoring_inversion!: Sequelize.HasManyRemoveAssociationMixin<BancoTransaccionFactoringInversion, BancoTransaccionFactoringInversionId>;
  removeBanco_transaccion_factoring_inversions!: Sequelize.HasManyRemoveAssociationsMixin<BancoTransaccionFactoringInversion, BancoTransaccionFactoringInversionId>;
  hasBanco_transaccion_factoring_inversion!: Sequelize.HasManyHasAssociationMixin<BancoTransaccionFactoringInversion, BancoTransaccionFactoringInversionId>;
  hasBanco_transaccion_factoring_inversions!: Sequelize.HasManyHasAssociationsMixin<BancoTransaccionFactoringInversion, BancoTransaccionFactoringInversionId>;
  countBanco_transaccion_factoring_inversions!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringInversion {
    return FactoringInversion.init({
    _idfactoringinversion: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    factoringinversionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoringinversion_factoringinversionid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factoringinversion_code"
    },
    _idfactoring: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    _idinversionista: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    monto_invertido: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: false
    },
    fecha_inversion: {
      type: DataTypes.DATE(3),
      allowNull: false
    },
    porcentaje_participacion: {
      type: DataTypes.DECIMAL(20,6),
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
    tableName: 'factoring_inversion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringinversion" },
        ]
      },
      {
        name: "UQ_factoringinversion_factoringinversionid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringinversionid" },
        ]
      },
      {
        name: "UQ_factoringinversion_code",
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
