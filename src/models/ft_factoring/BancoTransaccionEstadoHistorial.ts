import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoTransaccion, BancoTransaccionId } from './BancoTransaccion.js';
import type { BancoTransaccionEstado, BancoTransaccionEstadoId } from './BancoTransaccionEstado.js';
import type { Usuario, UsuarioId } from './Usuario.js';

export interface BancoTransaccionEstadoHistorialAttributes {
  _idbancotransaccionestadohistorial: number;
  bancotransaccionestadohistorialid: string;
  code: string;
  _idbancotransaccion: number;
  _idbancotransaccionestado: number;
  _idusuariomodifica: number;
  motivo?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type BancoTransaccionEstadoHistorialPk = "_idbancotransaccionestadohistorial";
export type BancoTransaccionEstadoHistorialId = BancoTransaccionEstadoHistorial[BancoTransaccionEstadoHistorialPk];
export type BancoTransaccionEstadoHistorialOptionalAttributes = "_idbancotransaccionestadohistorial" | "bancotransaccionestadohistorialid" | "motivo" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type BancoTransaccionEstadoHistorialCreationAttributes = Optional<BancoTransaccionEstadoHistorialAttributes, BancoTransaccionEstadoHistorialOptionalAttributes>;

export class BancoTransaccionEstadoHistorial extends Model<BancoTransaccionEstadoHistorialAttributes, BancoTransaccionEstadoHistorialCreationAttributes> implements BancoTransaccionEstadoHistorialAttributes {
  _idbancotransaccionestadohistorial!: number;
  bancotransaccionestadohistorialid!: string;
  code!: string;
  _idbancotransaccion!: number;
  _idbancotransaccionestado!: number;
  _idusuariomodifica!: number;
  motivo?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // BancoTransaccionEstadoHistorial belongsTo BancoTransaccion via _idbancotransaccion
  bancotransaccion_banco_transaccion!: BancoTransaccion;
  get_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToGetAssociationMixin<BancoTransaccion>;
  set_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToSetAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  create_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToCreateAssociationMixin<BancoTransaccion>;
  // BancoTransaccionEstadoHistorial belongsTo BancoTransaccionEstado via _idbancotransaccionestado
  bancotransaccionestado_banco_transaccion_estado!: BancoTransaccionEstado;
  get_idbancotransaccionestado_banco_transaccion_estado!: Sequelize.BelongsToGetAssociationMixin<BancoTransaccionEstado>;
  set_idbancotransaccionestado_banco_transaccion_estado!: Sequelize.BelongsToSetAssociationMixin<BancoTransaccionEstado, BancoTransaccionEstadoId>;
  create_idbancotransaccionestado_banco_transaccion_estado!: Sequelize.BelongsToCreateAssociationMixin<BancoTransaccionEstado>;
  // BancoTransaccionEstadoHistorial hasMany BancoTransaccion via _idbancotransaccionestadohistorial
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
  // BancoTransaccionEstadoHistorial belongsTo Usuario via _idusuariomodifica
  usuariomodifica_usuario!: Usuario;
  get_idusuariomodifica_usuario!: Sequelize.BelongsToGetAssociationMixin<Usuario>;
  set_idusuariomodifica_usuario!: Sequelize.BelongsToSetAssociationMixin<Usuario, UsuarioId>;
  create_idusuariomodifica_usuario!: Sequelize.BelongsToCreateAssociationMixin<Usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof BancoTransaccionEstadoHistorial {
    return BancoTransaccionEstadoHistorial.init({
    _idbancotransaccionestadohistorial: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    bancotransaccionestadohistorialid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bteh_bancotransaccionestadohistorialid"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ_bteh_code"
    },
    _idbancotransaccion: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'banco_transaccion',
        key: '_idbancotransaccion'
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
    _idusuariomodifica: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    motivo: {
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
    tableName: 'banco_transaccion_estado_historial',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccionestadohistorial" },
        ]
      },
      {
        name: "UQ_bteh_bancotransaccionestadohistorialid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bancotransaccionestadohistorialid" },
        ]
      },
      {
        name: "UQ_bteh_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_bteh_idbancotransaccionestado",
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccionestado" },
        ]
      },
      {
        name: "FK_bteh_idusuariomodifica",
        using: "BTREE",
        fields: [
          { name: "_idusuariomodifica" },
        ]
      },
      {
        name: "FK_bteh_idtransaccion",
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccion" },
        ]
      },
    ]
  });
  }
}
