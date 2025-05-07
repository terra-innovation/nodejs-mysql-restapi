import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId } from './ArchivoInversionistaDeposito.js';
import type { BancoCuenta, BancoCuentaId } from './BancoCuenta.js';
import type { BancoTransaccion, BancoTransaccionId } from './BancoTransaccion.js';
import type { BancoTransaccionInversionistaDeposito, BancoTransaccionInversionistaDepositoId } from './BancoTransaccionInversionistaDeposito.js';
import type { FactorCuentaBancaria, FactorCuentaBancariaId } from './FactorCuentaBancaria.js';
import type { InversionistaCuentaBancaria, InversionistaCuentaBancariaId } from './InversionistaCuentaBancaria.js';

export interface InversionistaDepositoAttributes {
  _idinversionistadeposito: number;
  inversionistadepositoid: string;
  code: string;
  _idbancocuenta: number;
  _idinversionistacuentabancaria: number;
  _idfactorcuentabancaria: number;
  fecha_solicitud: Date | Sequelize.Utils.Fn;
  numero_operacion: string;
  monto_depositado: number;
  fecha_transferencia?: Date | Sequelize.Utils.Fn;
  comentario?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type InversionistaDepositoPk = "_idinversionistadeposito";
export type InversionistaDepositoId = InversionistaDeposito[InversionistaDepositoPk];
export type InversionistaDepositoOptionalAttributes = "_idinversionistadeposito" | "inversionistadepositoid" | "fecha_transferencia" | "comentario" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type InversionistaDepositoCreationAttributes = Optional<InversionistaDepositoAttributes, InversionistaDepositoOptionalAttributes>;

export class InversionistaDeposito extends Model<InversionistaDepositoAttributes, InversionistaDepositoCreationAttributes> implements InversionistaDepositoAttributes {
  _idinversionistadeposito!: number;
  inversionistadepositoid!: string;
  code!: string;
  _idbancocuenta!: number;
  _idinversionistacuentabancaria!: number;
  _idfactorcuentabancaria!: number;
  fecha_solicitud!: Date;
  numero_operacion!: string;
  monto_depositado!: number;
  fecha_transferencia?: Date | Sequelize.Utils.Fn;
  comentario?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // InversionistaDeposito belongsTo BancoCuenta via _idbancocuenta
  bancocuenta_banco_cuentum!: BancoCuenta;
  get_idbancocuenta_banco_cuentum!: Sequelize.BelongsToGetAssociationMixin<BancoCuenta>;
  set_idbancocuenta_banco_cuentum!: Sequelize.BelongsToSetAssociationMixin<BancoCuenta, BancoCuentaId>;
  create_idbancocuenta_banco_cuentum!: Sequelize.BelongsToCreateAssociationMixin<BancoCuenta>;
  // InversionistaDeposito belongsTo FactorCuentaBancaria via _idfactorcuentabancaria
  factorcuentabancaria_factor_cuenta_bancarium!: FactorCuentaBancaria;
  get_idfactorcuentabancaria_factor_cuenta_bancarium!: Sequelize.BelongsToGetAssociationMixin<FactorCuentaBancaria>;
  set_idfactorcuentabancaria_factor_cuenta_bancarium!: Sequelize.BelongsToSetAssociationMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  create_idfactorcuentabancaria_factor_cuenta_bancarium!: Sequelize.BelongsToCreateAssociationMixin<FactorCuentaBancaria>;
  // InversionistaDeposito belongsTo InversionistaCuentaBancaria via _idinversionistacuentabancaria
  inversionistacuentabancaria_inversionista_cuenta_bancarium!: InversionistaCuentaBancaria;
  get_idinversionistacuentabancaria_inversionista_cuenta_bancarium!: Sequelize.BelongsToGetAssociationMixin<InversionistaCuentaBancaria>;
  set_idinversionistacuentabancaria_inversionista_cuenta_bancarium!: Sequelize.BelongsToSetAssociationMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  create_idinversionistacuentabancaria_inversionista_cuenta_bancarium!: Sequelize.BelongsToCreateAssociationMixin<InversionistaCuentaBancaria>;
  // InversionistaDeposito belongsToMany Archivo via _idinversionistadeposito and _idarchivo
  archivo_archivo_archivo_inversionista_depositos!: Archivo[];
  get_idarchivo_archivo_archivo_inversionista_depositos!: Sequelize.BelongsToManyGetAssociationsMixin<Archivo>;
  set_idarchivo_archivo_archivo_inversionista_depositos!: Sequelize.BelongsToManySetAssociationsMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_inversionista_deposito!: Sequelize.BelongsToManyAddAssociationMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_inversionista_depositos!: Sequelize.BelongsToManyAddAssociationsMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo_archivo_inversionista_deposito!: Sequelize.BelongsToManyCreateAssociationMixin<Archivo>;
  remove_idarchivo_archivo_archivo_inversionista_deposito!: Sequelize.BelongsToManyRemoveAssociationMixin<Archivo, ArchivoId>;
  remove_idarchivo_archivo_archivo_inversionista_depositos!: Sequelize.BelongsToManyRemoveAssociationsMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_inversionista_deposito!: Sequelize.BelongsToManyHasAssociationMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_inversionista_depositos!: Sequelize.BelongsToManyHasAssociationsMixin<Archivo, ArchivoId>;
  count_idarchivo_archivo_archivo_inversionista_depositos!: Sequelize.BelongsToManyCountAssociationsMixin;
  // InversionistaDeposito hasMany ArchivoInversionistaDeposito via _idinversionistadeposito
  archivo_inversionista_depositos!: ArchivoInversionistaDeposito[];
  getArchivo_inversionista_depositos!: Sequelize.HasManyGetAssociationsMixin<ArchivoInversionistaDeposito>;
  setArchivo_inversionista_depositos!: Sequelize.HasManySetAssociationsMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  addArchivo_inversionista_deposito!: Sequelize.HasManyAddAssociationMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  addArchivo_inversionista_depositos!: Sequelize.HasManyAddAssociationsMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  createArchivo_inversionista_deposito!: Sequelize.HasManyCreateAssociationMixin<ArchivoInversionistaDeposito>;
  removeArchivo_inversionista_deposito!: Sequelize.HasManyRemoveAssociationMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  removeArchivo_inversionista_depositos!: Sequelize.HasManyRemoveAssociationsMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  hasArchivo_inversionista_deposito!: Sequelize.HasManyHasAssociationMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  hasArchivo_inversionista_depositos!: Sequelize.HasManyHasAssociationsMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  countArchivo_inversionista_depositos!: Sequelize.HasManyCountAssociationsMixin;
  // InversionistaDeposito belongsToMany BancoTransaccion via _idinversionistadeposito and _idbancotransaccion
  bancotransaccion_banco_transaccion_banco_transaccion_inversionista_depositos!: BancoTransaccion[];
  get_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_depositos!: Sequelize.BelongsToManyGetAssociationsMixin<BancoTransaccion>;
  set_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_depositos!: Sequelize.BelongsToManySetAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  add_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_deposito!: Sequelize.BelongsToManyAddAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  add_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_depositos!: Sequelize.BelongsToManyAddAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  create_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_deposito!: Sequelize.BelongsToManyCreateAssociationMixin<BancoTransaccion>;
  remove_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_deposito!: Sequelize.BelongsToManyRemoveAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  remove_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_depositos!: Sequelize.BelongsToManyRemoveAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  has_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_deposito!: Sequelize.BelongsToManyHasAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  has_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_depositos!: Sequelize.BelongsToManyHasAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  count_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_depositos!: Sequelize.BelongsToManyCountAssociationsMixin;
  // InversionistaDeposito hasMany BancoTransaccionInversionistaDeposito via _idinversionistadeposito
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

  static initModel(sequelize: Sequelize.Sequelize): typeof InversionistaDeposito {
    return InversionistaDeposito.init({
    _idinversionistadeposito: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    inversionistadepositoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancodeposito_bancodepositoid"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ_bancodeposito_code"
    },
    _idbancocuenta: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'banco_cuenta',
        key: '_idbancocuenta'
      }
    },
    _idinversionistacuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inversionista_cuenta_bancaria',
        key: '_idinversionistacuentabancaria'
      }
    },
    _idfactorcuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'factor_cuenta_bancaria',
        key: '_idfactorcuentabancaria'
      }
    },
    fecha_solicitud: {
      type: DataTypes.DATE,
      allowNull: false
    },
    numero_operacion: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    monto_depositado: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: false
    },
    fecha_transferencia: {
      type: DataTypes.DATE,
      allowNull: true
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'inversionista_deposito',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idinversionistadeposito" },
        ]
      },
      {
        name: "UQ_bancodeposito_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_bancodeposito_bancodepositoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "inversionistadepositoid" },
        ]
      },
      {
        name: "FK_bancodeposito_idbancocuenta",
        using: "BTREE",
        fields: [
          { name: "_idbancocuenta" },
        ]
      },
      {
        name: "FK_bancodeposito_idinversionistacuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idinversionistacuentabancaria" },
        ]
      },
      {
        name: "FK_bancodeposito_idfactorcuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idfactorcuentabancaria" },
        ]
      },
    ]
  });
  }
}
