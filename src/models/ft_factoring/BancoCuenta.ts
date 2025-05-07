import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoCuentaEstado, BancoCuentaEstadoId } from './BancoCuentaEstado.js';
import type { BancoCuentaTipo, BancoCuentaTipoId } from './BancoCuentaTipo.js';
import type { BancoTransaccion, BancoTransaccionId } from './BancoTransaccion.js';
import type { Inversionista, InversionistaId } from './Inversionista.js';
import type { InversionistaBancoCuenta, InversionistaBancoCuentaId } from './InversionistaBancoCuenta.js';
import type { InversionistaDeposito, InversionistaDepositoId } from './InversionistaDeposito.js';
import type { InversionistaRetiro, InversionistaRetiroId } from './InversionistaRetiro.js';
import type { Moneda, MonedaId } from './Moneda.js';

export interface BancoCuentaAttributes {
  _idbancocuenta: number;
  bancocuentaid: string;
  code: string;
  _idbancocuentatipo: number;
  _idmoneda: number;
  _idbancocuentaestado: number;
  numero: string;
  disponible_confirmado: number;
  disponible_proceso: number;
  reservado_subasta: number;
  reservado_retiro: number;
  invertido: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type BancoCuentaPk = "_idbancocuenta";
export type BancoCuentaId = BancoCuenta[BancoCuentaPk];
export type BancoCuentaOptionalAttributes = "_idbancocuenta" | "bancocuentaid" | "numero" | "disponible_confirmado" | "disponible_proceso" | "reservado_subasta" | "reservado_retiro" | "invertido" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type BancoCuentaCreationAttributes = Optional<BancoCuentaAttributes, BancoCuentaOptionalAttributes>;

export class BancoCuenta extends Model<BancoCuentaAttributes, BancoCuentaCreationAttributes> implements BancoCuentaAttributes {
  _idbancocuenta!: number;
  bancocuentaid!: string;
  code!: string;
  _idbancocuentatipo!: number;
  _idmoneda!: number;
  _idbancocuentaestado!: number;
  numero!: string;
  disponible_confirmado!: number;
  disponible_proceso!: number;
  reservado_subasta!: number;
  reservado_retiro!: number;
  invertido!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // BancoCuenta hasMany BancoTransaccion via _idbancocuenta
  banco_transaccions!: BancoTransaccion[];
  getBanco_transaccions!: Sequelize.HasManyGetAssociationsMixin<BancoTransaccion>;
  setBanco_transaccions!: Sequelize.HasManySetAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  addBanco_transaccion!: Sequelize.HasManyAddAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  addBanco_transaccions!: Sequelize.HasManyAddAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  createBanco_transaccion!: Sequelize.HasManyCreateAssociationMixin<BancoTransaccion>;
  removeBanco_transaccion!: Sequelize.HasManyRemoveAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  removeBanco_transaccions!: Sequelize.HasManyRemoveAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  hasBanco_transaccion!: Sequelize.HasManyHasAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  hasBanco_transaccions!: Sequelize.HasManyHasAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  countBanco_transaccions!: Sequelize.HasManyCountAssociationsMixin;
  // BancoCuenta belongsToMany Inversionista via _idbancocuenta and _idinversionista
  inversionista_inversionista!: Inversionista[];
  get_idinversionista_inversionista!: Sequelize.BelongsToManyGetAssociationsMixin<Inversionista>;
  set_idinversionista_inversionista!: Sequelize.BelongsToManySetAssociationsMixin<Inversionista, InversionistaId>;
  add_idinversionista_inversionistum!: Sequelize.BelongsToManyAddAssociationMixin<Inversionista, InversionistaId>;
  add_idinversionista_inversionista!: Sequelize.BelongsToManyAddAssociationsMixin<Inversionista, InversionistaId>;
  create_idinversionista_inversionistum!: Sequelize.BelongsToManyCreateAssociationMixin<Inversionista>;
  remove_idinversionista_inversionistum!: Sequelize.BelongsToManyRemoveAssociationMixin<Inversionista, InversionistaId>;
  remove_idinversionista_inversionista!: Sequelize.BelongsToManyRemoveAssociationsMixin<Inversionista, InversionistaId>;
  has_idinversionista_inversionistum!: Sequelize.BelongsToManyHasAssociationMixin<Inversionista, InversionistaId>;
  has_idinversionista_inversionista!: Sequelize.BelongsToManyHasAssociationsMixin<Inversionista, InversionistaId>;
  count_idinversionista_inversionista!: Sequelize.BelongsToManyCountAssociationsMixin;
  // BancoCuenta hasMany InversionistaBancoCuenta via _idbancocuenta
  inversionista_banco_cuenta!: InversionistaBancoCuenta[];
  getInversionista_banco_cuenta!: Sequelize.HasManyGetAssociationsMixin<InversionistaBancoCuenta>;
  setInversionista_banco_cuenta!: Sequelize.HasManySetAssociationsMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  addInversionista_banco_cuentum!: Sequelize.HasManyAddAssociationMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  addInversionista_banco_cuenta!: Sequelize.HasManyAddAssociationsMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  createInversionista_banco_cuentum!: Sequelize.HasManyCreateAssociationMixin<InversionistaBancoCuenta>;
  removeInversionista_banco_cuentum!: Sequelize.HasManyRemoveAssociationMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  removeInversionista_banco_cuenta!: Sequelize.HasManyRemoveAssociationsMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  hasInversionista_banco_cuentum!: Sequelize.HasManyHasAssociationMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  hasInversionista_banco_cuenta!: Sequelize.HasManyHasAssociationsMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  countInversionista_banco_cuenta!: Sequelize.HasManyCountAssociationsMixin;
  // BancoCuenta hasMany InversionistaDeposito via _idbancocuenta
  inversionista_depositos!: InversionistaDeposito[];
  getInversionista_depositos!: Sequelize.HasManyGetAssociationsMixin<InversionistaDeposito>;
  setInversionista_depositos!: Sequelize.HasManySetAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  addInversionista_deposito!: Sequelize.HasManyAddAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  addInversionista_depositos!: Sequelize.HasManyAddAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  createInversionista_deposito!: Sequelize.HasManyCreateAssociationMixin<InversionistaDeposito>;
  removeInversionista_deposito!: Sequelize.HasManyRemoveAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  removeInversionista_depositos!: Sequelize.HasManyRemoveAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  hasInversionista_deposito!: Sequelize.HasManyHasAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  hasInversionista_depositos!: Sequelize.HasManyHasAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  countInversionista_depositos!: Sequelize.HasManyCountAssociationsMixin;
  // BancoCuenta hasMany InversionistaRetiro via _idbancocuenta
  inversionista_retiros!: InversionistaRetiro[];
  getInversionista_retiros!: Sequelize.HasManyGetAssociationsMixin<InversionistaRetiro>;
  setInversionista_retiros!: Sequelize.HasManySetAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  addInversionista_retiro!: Sequelize.HasManyAddAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  addInversionista_retiros!: Sequelize.HasManyAddAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  createInversionista_retiro!: Sequelize.HasManyCreateAssociationMixin<InversionistaRetiro>;
  removeInversionista_retiro!: Sequelize.HasManyRemoveAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  removeInversionista_retiros!: Sequelize.HasManyRemoveAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  hasInversionista_retiro!: Sequelize.HasManyHasAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  hasInversionista_retiros!: Sequelize.HasManyHasAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  countInversionista_retiros!: Sequelize.HasManyCountAssociationsMixin;
  // BancoCuenta belongsTo BancoCuentaEstado via _idbancocuentaestado
  bancocuentaestado_banco_cuenta_estado!: BancoCuentaEstado;
  get_idbancocuentaestado_banco_cuenta_estado!: Sequelize.BelongsToGetAssociationMixin<BancoCuentaEstado>;
  set_idbancocuentaestado_banco_cuenta_estado!: Sequelize.BelongsToSetAssociationMixin<BancoCuentaEstado, BancoCuentaEstadoId>;
  create_idbancocuentaestado_banco_cuenta_estado!: Sequelize.BelongsToCreateAssociationMixin<BancoCuentaEstado>;
  // BancoCuenta belongsTo BancoCuentaTipo via _idbancocuentatipo
  bancocuentatipo_banco_cuenta_tipo!: BancoCuentaTipo;
  get_idbancocuentatipo_banco_cuenta_tipo!: Sequelize.BelongsToGetAssociationMixin<BancoCuentaTipo>;
  set_idbancocuentatipo_banco_cuenta_tipo!: Sequelize.BelongsToSetAssociationMixin<BancoCuentaTipo, BancoCuentaTipoId>;
  create_idbancocuentatipo_banco_cuenta_tipo!: Sequelize.BelongsToCreateAssociationMixin<BancoCuentaTipo>;
  // BancoCuenta belongsTo Moneda via _idmoneda
  moneda_moneda!: Moneda;
  get_idmoneda_moneda!: Sequelize.BelongsToGetAssociationMixin<Moneda>;
  set_idmoneda_moneda!: Sequelize.BelongsToSetAssociationMixin<Moneda, MonedaId>;
  create_idmoneda_moneda!: Sequelize.BelongsToCreateAssociationMixin<Moneda>;

  static initModel(sequelize: Sequelize.Sequelize): typeof BancoCuenta {
    return BancoCuenta.init({
    _idbancocuenta: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    bancocuentaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancocuenta_bancocuentaid"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ_bancocuenta_code"
    },
    _idbancocuentatipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'banco_cuenta_tipo',
        key: '_idbancocuentatipo'
      }
    },
    _idmoneda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'moneda',
        key: '_idmoneda'
      }
    },
    _idbancocuentaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'banco_cuenta_estado',
        key: '_idbancocuentaestado'
      }
    },
    numero: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "0"
    },
    disponible_confirmado: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: false,
      defaultValue: 0.00,
      comment: "Monto disponible para hacre pujas o retirar"
    },
    disponible_proceso: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: false,
      defaultValue: 0.00,
      comment: "Monto de depósito que está en proceso de verificación"
    },
    reservado_subasta: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: false,
      defaultValue: 0.00,
      comment: "Monto reservado en subastas que aún no cierran"
    },
    reservado_retiro: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: false,
      defaultValue: 0.00,
      comment: "Monto reservado en solicitudes de retiros que están en proceso de validación"
    },
    invertido: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: false,
      defaultValue: 0.00,
      comment: "Monto invertido en subastas ganadas"
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
    tableName: 'banco_cuenta',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancocuenta" },
        ]
      },
      {
        name: "UQ_bancocuenta_bancocuentaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bancocuentaid" },
        ]
      },
      {
        name: "UQ_bancocuenta_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_bancocuenta_idmoneda",
        using: "BTREE",
        fields: [
          { name: "_idmoneda" },
        ]
      },
      {
        name: "FK_bancocuenta_idbancocuentaestado",
        using: "BTREE",
        fields: [
          { name: "_idbancocuentaestado" },
        ]
      },
      {
        name: "FK_bancocuenta_idbancocuentatipo",
        using: "BTREE",
        fields: [
          { name: "_idbancocuentatipo" },
        ]
      },
    ]
  });
  }
}
