import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoCuenta, BancoCuentaId } from './BancoCuenta.js';
import type { BancoTransaccionEstado, BancoTransaccionEstadoId } from './BancoTransaccionEstado.js';
import type { BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId } from './BancoTransaccionEstadoHistorial.js';
import type { BancoTransaccionFactoringInversion, BancoTransaccionFactoringInversionId } from './BancoTransaccionFactoringInversion.js';
import type { BancoTransaccionInversionistaDeposito, BancoTransaccionInversionistaDepositoId } from './BancoTransaccionInversionistaDeposito.js';
import type { BancoTransaccionInversionistaRetiro, BancoTransaccionInversionistaRetiroId } from './BancoTransaccionInversionistaRetiro.js';
import type { BancoTransaccionTipo, BancoTransaccionTipoId } from './BancoTransaccionTipo.js';
import type { FactoringInversion, FactoringInversionId } from './FactoringInversion.js';
import type { InversionistaDeposito, InversionistaDepositoId } from './InversionistaDeposito.js';
import type { InversionistaRetiro, InversionistaRetiroId } from './InversionistaRetiro.js';

export interface BancoTransaccionAttributes {
  _idbancotransaccion: number;
  bancotransaccionid: string;
  code: string;
  _idbancocuenta: number;
  _idbancotransaciontipo: number;
  _idbancotransaccionestado: number;
  _idbancotransaccionestadohistorial?: number;
  fecha_solicitud: Date | Sequelize.Utils.Fn;
  fecha_efectiva?: Date | Sequelize.Utils.Fn;
  monto: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type BancoTransaccionPk = "_idbancotransaccion";
export type BancoTransaccionId = BancoTransaccion[BancoTransaccionPk];
export type BancoTransaccionOptionalAttributes = "_idbancotransaccion" | "bancotransaccionid" | "_idbancotransaccionestadohistorial" | "fecha_efectiva" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type BancoTransaccionCreationAttributes = Optional<BancoTransaccionAttributes, BancoTransaccionOptionalAttributes>;

export class BancoTransaccion extends Model<BancoTransaccionAttributes, BancoTransaccionCreationAttributes> implements BancoTransaccionAttributes {
  _idbancotransaccion!: number;
  bancotransaccionid!: string;
  code!: string;
  _idbancocuenta!: number;
  _idbancotransaciontipo!: number;
  _idbancotransaccionestado!: number;
  _idbancotransaccionestadohistorial?: number;
  fecha_solicitud!: Date;
  fecha_efectiva?: Date | Sequelize.Utils.Fn;
  monto!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // BancoTransaccion belongsTo BancoCuenta via _idbancocuenta
  bancocuenta_banco_cuentum!: BancoCuenta;
  get_idbancocuenta_banco_cuentum!: Sequelize.BelongsToGetAssociationMixin<BancoCuenta>;
  set_idbancocuenta_banco_cuentum!: Sequelize.BelongsToSetAssociationMixin<BancoCuenta, BancoCuentaId>;
  create_idbancocuenta_banco_cuentum!: Sequelize.BelongsToCreateAssociationMixin<BancoCuenta>;
  // BancoTransaccion hasMany BancoTransaccionEstadoHistorial via _idbancotransaccion
  banco_transaccion_estado_historials!: BancoTransaccionEstadoHistorial[];
  getBanco_transaccion_estado_historials!: Sequelize.HasManyGetAssociationsMixin<BancoTransaccionEstadoHistorial>;
  setBanco_transaccion_estado_historials!: Sequelize.HasManySetAssociationsMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  addBanco_transaccion_estado_historial!: Sequelize.HasManyAddAssociationMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  addBanco_transaccion_estado_historials!: Sequelize.HasManyAddAssociationsMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  createBanco_transaccion_estado_historial!: Sequelize.HasManyCreateAssociationMixin<BancoTransaccionEstadoHistorial>;
  removeBanco_transaccion_estado_historial!: Sequelize.HasManyRemoveAssociationMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  removeBanco_transaccion_estado_historials!: Sequelize.HasManyRemoveAssociationsMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  hasBanco_transaccion_estado_historial!: Sequelize.HasManyHasAssociationMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  hasBanco_transaccion_estado_historials!: Sequelize.HasManyHasAssociationsMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  countBanco_transaccion_estado_historials!: Sequelize.HasManyCountAssociationsMixin;
  // BancoTransaccion hasMany BancoTransaccionFactoringInversion via _idbancotransaccion
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
  // BancoTransaccion hasMany BancoTransaccionInversionistaDeposito via _idbancotransaccion
  banco_transaccion_inversionista_depositos!: BancoTransaccionInversionistaDeposito[];
  getBanco_transaccion_inversionista_depositos!: Sequelize.HasManyGetAssociationsMixin<BancoTransaccionInversionistaDeposito>;
  setBanco_transaccion_inversionista_depositos!: Sequelize.HasManySetAssociationsMixin<BancoTransaccionInversionistaDeposito, BancoTransaccionInversionistaDepositoId>;
  addBanco_transaccion_inversionista_deposito!: Sequelize.HasManyAddAssociationMixin<BancoTransaccionInversionistaDeposito, BancoTransaccionInversionistaDepositoId>;
  addBanco_transaccion_inversionista_depositos!: Sequelize.HasManyAddAssociationsMixin<BancoTransaccionInversionistaDeposito, BancoTransaccionInversionistaDepositoId>;
  createBanco_transaccion_inversionista_deposito!: Sequelize.HasManyCreateAssociationMixin<BancoTransaccionInversionistaDeposito>;
  removeBanco_transaccion_inversionista_deposito!: Sequelize.HasManyRemoveAssociationMixin<BancoTransaccionInversionistaDeposito, BancoTransaccionInversionistaDepositoId>;
  removeBanco_transaccion_inversionista_depositos!: Sequelize.HasManyRemoveAssociationsMixin<BancoTransaccionInversionistaDeposito, BancoTransaccionInversionistaDepositoId>;
  hasBanco_transaccion_inversionista_deposito!: Sequelize.HasManyHasAssociationMixin<BancoTransaccionInversionistaDeposito, BancoTransaccionInversionistaDepositoId>;
  hasBanco_transaccion_inversionista_depositos!: Sequelize.HasManyHasAssociationsMixin<BancoTransaccionInversionistaDeposito, BancoTransaccionInversionistaDepositoId>;
  countBanco_transaccion_inversionista_depositos!: Sequelize.HasManyCountAssociationsMixin;
  // BancoTransaccion hasMany BancoTransaccionInversionistaRetiro via _idbancotransaccion
  banco_transaccion_inversionista_retiros!: BancoTransaccionInversionistaRetiro[];
  getBanco_transaccion_inversionista_retiros!: Sequelize.HasManyGetAssociationsMixin<BancoTransaccionInversionistaRetiro>;
  setBanco_transaccion_inversionista_retiros!: Sequelize.HasManySetAssociationsMixin<BancoTransaccionInversionistaRetiro, BancoTransaccionInversionistaRetiroId>;
  addBanco_transaccion_inversionista_retiro!: Sequelize.HasManyAddAssociationMixin<BancoTransaccionInversionistaRetiro, BancoTransaccionInversionistaRetiroId>;
  addBanco_transaccion_inversionista_retiros!: Sequelize.HasManyAddAssociationsMixin<BancoTransaccionInversionistaRetiro, BancoTransaccionInversionistaRetiroId>;
  createBanco_transaccion_inversionista_retiro!: Sequelize.HasManyCreateAssociationMixin<BancoTransaccionInversionistaRetiro>;
  removeBanco_transaccion_inversionista_retiro!: Sequelize.HasManyRemoveAssociationMixin<BancoTransaccionInversionistaRetiro, BancoTransaccionInversionistaRetiroId>;
  removeBanco_transaccion_inversionista_retiros!: Sequelize.HasManyRemoveAssociationsMixin<BancoTransaccionInversionistaRetiro, BancoTransaccionInversionistaRetiroId>;
  hasBanco_transaccion_inversionista_retiro!: Sequelize.HasManyHasAssociationMixin<BancoTransaccionInversionistaRetiro, BancoTransaccionInversionistaRetiroId>;
  hasBanco_transaccion_inversionista_retiros!: Sequelize.HasManyHasAssociationsMixin<BancoTransaccionInversionistaRetiro, BancoTransaccionInversionistaRetiroId>;
  countBanco_transaccion_inversionista_retiros!: Sequelize.HasManyCountAssociationsMixin;
  // BancoTransaccion belongsToMany FactoringInversion via _idbancotransaccion and _idfactoringinversion
  factoringinversion_factoring_inversions!: FactoringInversion[];
  get_idfactoringinversion_factoring_inversions!: Sequelize.BelongsToManyGetAssociationsMixin<FactoringInversion>;
  set_idfactoringinversion_factoring_inversions!: Sequelize.BelongsToManySetAssociationsMixin<FactoringInversion, FactoringInversionId>;
  add_idfactoringinversion_factoring_inversion!: Sequelize.BelongsToManyAddAssociationMixin<FactoringInversion, FactoringInversionId>;
  add_idfactoringinversion_factoring_inversions!: Sequelize.BelongsToManyAddAssociationsMixin<FactoringInversion, FactoringInversionId>;
  create_idfactoringinversion_factoring_inversion!: Sequelize.BelongsToManyCreateAssociationMixin<FactoringInversion>;
  remove_idfactoringinversion_factoring_inversion!: Sequelize.BelongsToManyRemoveAssociationMixin<FactoringInversion, FactoringInversionId>;
  remove_idfactoringinversion_factoring_inversions!: Sequelize.BelongsToManyRemoveAssociationsMixin<FactoringInversion, FactoringInversionId>;
  has_idfactoringinversion_factoring_inversion!: Sequelize.BelongsToManyHasAssociationMixin<FactoringInversion, FactoringInversionId>;
  has_idfactoringinversion_factoring_inversions!: Sequelize.BelongsToManyHasAssociationsMixin<FactoringInversion, FactoringInversionId>;
  count_idfactoringinversion_factoring_inversions!: Sequelize.BelongsToManyCountAssociationsMixin;
  // BancoTransaccion belongsToMany InversionistaDeposito via _idbancotransaccion and _idinversionistadeposito
  inversionistadeposito_inversionista_deposito_banco_transaccion_inversionista_depositos!: InversionistaDeposito[];
  get_idinversionistadeposito_inversionista_deposito_banco_transaccion_inversionista_depositos!: Sequelize.BelongsToManyGetAssociationsMixin<InversionistaDeposito>;
  set_idinversionistadeposito_inversionista_deposito_banco_transaccion_inversionista_depositos!: Sequelize.BelongsToManySetAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  add_idinversionistadeposito_inversionista_deposito_banco_transaccion_inversionista_deposito!: Sequelize.BelongsToManyAddAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  add_idinversionistadeposito_inversionista_deposito_banco_transaccion_inversionista_depositos!: Sequelize.BelongsToManyAddAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  create_idinversionistadeposito_inversionista_deposito_banco_transaccion_inversionista_deposito!: Sequelize.BelongsToManyCreateAssociationMixin<InversionistaDeposito>;
  remove_idinversionistadeposito_inversionista_deposito_banco_transaccion_inversionista_deposito!: Sequelize.BelongsToManyRemoveAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  remove_idinversionistadeposito_inversionista_deposito_banco_transaccion_inversionista_depositos!: Sequelize.BelongsToManyRemoveAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  has_idinversionistadeposito_inversionista_deposito_banco_transaccion_inversionista_deposito!: Sequelize.BelongsToManyHasAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  has_idinversionistadeposito_inversionista_deposito_banco_transaccion_inversionista_depositos!: Sequelize.BelongsToManyHasAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  count_idinversionistadeposito_inversionista_deposito_banco_transaccion_inversionista_depositos!: Sequelize.BelongsToManyCountAssociationsMixin;
  // BancoTransaccion belongsToMany InversionistaRetiro via _idbancotransaccion and _idinversionistaretiro
  inversionistaretiro_inversionista_retiro_banco_transaccion_inversionista_retiros!: InversionistaRetiro[];
  get_idinversionistaretiro_inversionista_retiro_banco_transaccion_inversionista_retiros!: Sequelize.BelongsToManyGetAssociationsMixin<InversionistaRetiro>;
  set_idinversionistaretiro_inversionista_retiro_banco_transaccion_inversionista_retiros!: Sequelize.BelongsToManySetAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  add_idinversionistaretiro_inversionista_retiro_banco_transaccion_inversionista_retiro!: Sequelize.BelongsToManyAddAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  add_idinversionistaretiro_inversionista_retiro_banco_transaccion_inversionista_retiros!: Sequelize.BelongsToManyAddAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  create_idinversionistaretiro_inversionista_retiro_banco_transaccion_inversionista_retiro!: Sequelize.BelongsToManyCreateAssociationMixin<InversionistaRetiro>;
  remove_idinversionistaretiro_inversionista_retiro_banco_transaccion_inversionista_retiro!: Sequelize.BelongsToManyRemoveAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  remove_idinversionistaretiro_inversionista_retiro_banco_transaccion_inversionista_retiros!: Sequelize.BelongsToManyRemoveAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  has_idinversionistaretiro_inversionista_retiro_banco_transaccion_inversionista_retiro!: Sequelize.BelongsToManyHasAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  has_idinversionistaretiro_inversionista_retiro_banco_transaccion_inversionista_retiros!: Sequelize.BelongsToManyHasAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  count_idinversionistaretiro_inversionista_retiro_banco_transaccion_inversionista_retiros!: Sequelize.BelongsToManyCountAssociationsMixin;
  // BancoTransaccion belongsTo BancoTransaccionEstado via _idbancotransaccionestado
  bancotransaccionestado_banco_transaccion_estado!: BancoTransaccionEstado;
  get_idbancotransaccionestado_banco_transaccion_estado!: Sequelize.BelongsToGetAssociationMixin<BancoTransaccionEstado>;
  set_idbancotransaccionestado_banco_transaccion_estado!: Sequelize.BelongsToSetAssociationMixin<BancoTransaccionEstado, BancoTransaccionEstadoId>;
  create_idbancotransaccionestado_banco_transaccion_estado!: Sequelize.BelongsToCreateAssociationMixin<BancoTransaccionEstado>;
  // BancoTransaccion belongsTo BancoTransaccionEstadoHistorial via _idbancotransaccionestadohistorial
  bancotransaccionestadohistorial_banco_transaccion_estado_historial!: BancoTransaccionEstadoHistorial;
  get_idbancotransaccionestadohistorial_banco_transaccion_estado_historial!: Sequelize.BelongsToGetAssociationMixin<BancoTransaccionEstadoHistorial>;
  set_idbancotransaccionestadohistorial_banco_transaccion_estado_historial!: Sequelize.BelongsToSetAssociationMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  create_idbancotransaccionestadohistorial_banco_transaccion_estado_historial!: Sequelize.BelongsToCreateAssociationMixin<BancoTransaccionEstadoHistorial>;
  // BancoTransaccion belongsTo BancoTransaccionTipo via _idbancotransaciontipo
  bancotransaciontipo_banco_transaccion_tipo!: BancoTransaccionTipo;
  get_idbancotransaciontipo_banco_transaccion_tipo!: Sequelize.BelongsToGetAssociationMixin<BancoTransaccionTipo>;
  set_idbancotransaciontipo_banco_transaccion_tipo!: Sequelize.BelongsToSetAssociationMixin<BancoTransaccionTipo, BancoTransaccionTipoId>;
  create_idbancotransaciontipo_banco_transaccion_tipo!: Sequelize.BelongsToCreateAssociationMixin<BancoTransaccionTipo>;

  static initModel(sequelize: Sequelize.Sequelize): typeof BancoTransaccion {
    return BancoTransaccion.init({
    _idbancotransaccion: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    bancotransaccionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancotransaccio_bancotransaccioid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_bancotransaccio_code"
    },
    _idbancocuenta: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'banco_cuenta',
        key: '_idbancocuenta'
      }
    },
    _idbancotransaciontipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'banco_transaccion_tipo',
        key: '_idbancotransacciontipo'
      }
    },
    _idbancotransaccionestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'banco_transaccion_estado',
        key: '_idbancotransaccionestado'
      }
    },
    _idbancotransaccionestadohistorial: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'banco_transaccion_estado_historial',
        key: '_idbancotransaccionestadohistorial'
      }
    },
    fecha_solicitud: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_efectiva: {
      type: DataTypes.DATE,
      allowNull: true
    },
    monto: {
      type: DataTypes.DECIMAL(20,2),
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
    tableName: 'banco_transaccion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccion" },
        ]
      },
      {
        name: "UQ_bancotransaccio_bancotransaccioid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bancotransaccionid" },
        ]
      },
      {
        name: "UQ_bancotransaccio_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_bancotransaccion_idbancocuenta",
        using: "BTREE",
        fields: [
          { name: "_idbancocuenta" },
        ]
      },
      {
        name: "FK_bancotransaccion_idbancotransacciontipo",
        using: "BTREE",
        fields: [
          { name: "_idbancotransaciontipo" },
        ]
      },
      {
        name: "FK_bancotransaccion_idbancotransaccionestadohistorial",
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccionestadohistorial" },
        ]
      },
      {
        name: "FK_bancotransaccion_idbancotransaccionestado",
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccionestado" },
        ]
      },
    ]
  });
  }
}
