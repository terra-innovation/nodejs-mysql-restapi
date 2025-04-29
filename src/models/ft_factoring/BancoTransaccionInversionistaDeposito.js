import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class BancoTransaccionInversionistaDeposito extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idbancotransaccion: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'banco_transaccion',
        key: '_idbancotransaccion'
      }
    },
    _idinversionistadeposito: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'inversionista_deposito',
        key: '_idinversionistadeposito'
      }
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
    tableName: 'banco_transaccion_inversionista_deposito',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccion" },
          { name: "_idinversionistadeposito" },
        ]
      },
      {
        name: "FK_bancotransacciondeposito_idbancodeposito",
        using: "BTREE",
        fields: [
          { name: "_idinversionistadeposito" },
        ]
      },
    ]
  });
  }
}
