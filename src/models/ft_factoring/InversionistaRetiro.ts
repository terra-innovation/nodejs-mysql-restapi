import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId } from './ArchivoInversionistaRetiro.js';
import type { BancoCuenta, BancoCuentaId } from './BancoCuenta.js';
import type { BancoTransaccion, BancoTransaccionId } from './BancoTransaccion.js';
import type { BancoTransaccionInversionistaRetiro, BancoTransaccionInversionistaRetiroId } from './BancoTransaccionInversionistaRetiro.js';
import type { FactorCuentaBancaria, FactorCuentaBancariaId } from './FactorCuentaBancaria.js';
import type { InversionistaCuentaBancaria, InversionistaCuentaBancariaId } from './InversionistaCuentaBancaria.js';

export interface InversionistaRetiroAttributes {
  _idinversionistaretiro: number;
  inversionistaretiroid: string;
  code: string;
  _idbancocuenta: number;
  _idinversionistacuentabancaria: number;
  _idfactorcuentabancaria?: number;
  fecha_solicitud: Date | Sequelize.Utils.Fn;
  monto_retirado: number;
  numero_operacion?: string;
  fecha_transferencia?: Date | Sequelize.Utils.Fn;
  comentario?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type InversionistaRetiroPk = "_idinversionistaretiro";
export type InversionistaRetiroId = InversionistaRetiro[InversionistaRetiroPk];
export type InversionistaRetiroOptionalAttributes = "_idinversionistaretiro" | "inversionistaretiroid" | "_idfactorcuentabancaria" | "numero_operacion" | "fecha_transferencia" | "comentario" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type InversionistaRetiroCreationAttributes = Optional<InversionistaRetiroAttributes, InversionistaRetiroOptionalAttributes>;

export class InversionistaRetiro extends Model<InversionistaRetiroAttributes, InversionistaRetiroCreationAttributes> implements InversionistaRetiroAttributes {
  _idinversionistaretiro!: number;
  inversionistaretiroid!: string;
  code!: string;
  _idbancocuenta!: number;
  _idinversionistacuentabancaria!: number;
  _idfactorcuentabancaria?: number;
  fecha_solicitud!: Date;
  monto_retirado!: number;
  numero_operacion?: string;
  fecha_transferencia?: Date | Sequelize.Utils.Fn;
  comentario?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // InversionistaRetiro belongsTo BancoCuenta via _idbancocuenta
  bancocuenta_banco_cuentum!: BancoCuenta;
  get_idbancocuenta_banco_cuentum!: Sequelize.BelongsToGetAssociationMixin<BancoCuenta>;
  set_idbancocuenta_banco_cuentum!: Sequelize.BelongsToSetAssociationMixin<BancoCuenta, BancoCuentaId>;
  create_idbancocuenta_banco_cuentum!: Sequelize.BelongsToCreateAssociationMixin<BancoCuenta>;
  // InversionistaRetiro belongsTo FactorCuentaBancaria via _idfactorcuentabancaria
  factorcuentabancaria_factor_cuenta_bancarium!: FactorCuentaBancaria;
  get_idfactorcuentabancaria_factor_cuenta_bancarium!: Sequelize.BelongsToGetAssociationMixin<FactorCuentaBancaria>;
  set_idfactorcuentabancaria_factor_cuenta_bancarium!: Sequelize.BelongsToSetAssociationMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  create_idfactorcuentabancaria_factor_cuenta_bancarium!: Sequelize.BelongsToCreateAssociationMixin<FactorCuentaBancaria>;
  // InversionistaRetiro belongsTo InversionistaCuentaBancaria via _idinversionistacuentabancaria
  inversionistacuentabancaria_inversionista_cuenta_bancarium!: InversionistaCuentaBancaria;
  get_idinversionistacuentabancaria_inversionista_cuenta_bancarium!: Sequelize.BelongsToGetAssociationMixin<InversionistaCuentaBancaria>;
  set_idinversionistacuentabancaria_inversionista_cuenta_bancarium!: Sequelize.BelongsToSetAssociationMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  create_idinversionistacuentabancaria_inversionista_cuenta_bancarium!: Sequelize.BelongsToCreateAssociationMixin<InversionistaCuentaBancaria>;
  // InversionistaRetiro belongsToMany Archivo via _idinversionistaretiro and _idarchivo
  archivo_archivo_archivo_inversionista_retiros!: Archivo[];
  get_idarchivo_archivo_archivo_inversionista_retiros!: Sequelize.BelongsToManyGetAssociationsMixin<Archivo>;
  set_idarchivo_archivo_archivo_inversionista_retiros!: Sequelize.BelongsToManySetAssociationsMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_inversionista_retiro!: Sequelize.BelongsToManyAddAssociationMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_inversionista_retiros!: Sequelize.BelongsToManyAddAssociationsMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo_archivo_inversionista_retiro!: Sequelize.BelongsToManyCreateAssociationMixin<Archivo>;
  remove_idarchivo_archivo_archivo_inversionista_retiro!: Sequelize.BelongsToManyRemoveAssociationMixin<Archivo, ArchivoId>;
  remove_idarchivo_archivo_archivo_inversionista_retiros!: Sequelize.BelongsToManyRemoveAssociationsMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_inversionista_retiro!: Sequelize.BelongsToManyHasAssociationMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_inversionista_retiros!: Sequelize.BelongsToManyHasAssociationsMixin<Archivo, ArchivoId>;
  count_idarchivo_archivo_archivo_inversionista_retiros!: Sequelize.BelongsToManyCountAssociationsMixin;
  // InversionistaRetiro hasMany ArchivoInversionistaRetiro via _idinversionistaretiro
  archivo_inversionista_retiros!: ArchivoInversionistaRetiro[];
  getArchivo_inversionista_retiros!: Sequelize.HasManyGetAssociationsMixin<ArchivoInversionistaRetiro>;
  setArchivo_inversionista_retiros!: Sequelize.HasManySetAssociationsMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  addArchivo_inversionista_retiro!: Sequelize.HasManyAddAssociationMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  addArchivo_inversionista_retiros!: Sequelize.HasManyAddAssociationsMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  createArchivo_inversionista_retiro!: Sequelize.HasManyCreateAssociationMixin<ArchivoInversionistaRetiro>;
  removeArchivo_inversionista_retiro!: Sequelize.HasManyRemoveAssociationMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  removeArchivo_inversionista_retiros!: Sequelize.HasManyRemoveAssociationsMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  hasArchivo_inversionista_retiro!: Sequelize.HasManyHasAssociationMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  hasArchivo_inversionista_retiros!: Sequelize.HasManyHasAssociationsMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  countArchivo_inversionista_retiros!: Sequelize.HasManyCountAssociationsMixin;
  // InversionistaRetiro belongsToMany BancoTransaccion via _idinversionistaretiro and _idbancotransaccion
  bancotransaccion_banco_transaccion_banco_transaccion_inversionista_retiros!: BancoTransaccion[];
  get_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_retiros!: Sequelize.BelongsToManyGetAssociationsMixin<BancoTransaccion>;
  set_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_retiros!: Sequelize.BelongsToManySetAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  add_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_retiro!: Sequelize.BelongsToManyAddAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  add_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_retiros!: Sequelize.BelongsToManyAddAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  create_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_retiro!: Sequelize.BelongsToManyCreateAssociationMixin<BancoTransaccion>;
  remove_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_retiro!: Sequelize.BelongsToManyRemoveAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  remove_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_retiros!: Sequelize.BelongsToManyRemoveAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  has_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_retiro!: Sequelize.BelongsToManyHasAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  has_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_retiros!: Sequelize.BelongsToManyHasAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  count_idbancotransaccion_banco_transaccion_banco_transaccion_inversionista_retiros!: Sequelize.BelongsToManyCountAssociationsMixin;
  // InversionistaRetiro hasMany BancoTransaccionInversionistaRetiro via _idinversionistaretiro
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

  static initModel(sequelize: Sequelize.Sequelize): typeof InversionistaRetiro {
    return InversionistaRetiro.init({
    _idinversionistaretiro: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    inversionistaretiroid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancoretiro_bancoretiroid"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ_bancoretiro_code"
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
      allowNull: true,
      references: {
        model: 'factor_cuenta_bancaria',
        key: '_idfactorcuentabancaria'
      }
    },
    fecha_solicitud: {
      type: DataTypes.DATE,
      allowNull: false
    },
    monto_retirado: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: false
    },
    numero_operacion: {
      type: DataTypes.STRING(50),
      allowNull: true
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
    tableName: 'inversionista_retiro',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idinversionistaretiro" },
        ]
      },
      {
        name: "UQ_bancoretiro_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_bancoretiro_bancoretiroid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "inversionistaretiroid" },
        ]
      },
      {
        name: "FK_bancoretiro_idbancocuenta",
        using: "BTREE",
        fields: [
          { name: "_idbancocuenta" },
        ]
      },
      {
        name: "FK_bancoretiro_idinversionistacuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idinversionistacuentabancaria" },
        ]
      },
      {
        name: "FK_bancoretiro_idfactorcuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idfactorcuentabancaria" },
        ]
      },
    ]
  });
  }
}
