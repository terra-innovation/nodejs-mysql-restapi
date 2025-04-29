import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class BancoTransaccionTipo extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idbancotransacciontipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bancotransacciontipoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancotransacciontipo_bancotransacciontipoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_bancotransacciontipo_code"
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
    tableName: 'banco_transaccion_tipo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancotransacciontipo" },
        ]
      },
      {
        name: "UQ_bancotransacciontipo_bancotransacciontipoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bancotransacciontipoid" },
        ]
      },
      {
        name: "UQ_bancotransacciontipo_code",
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
