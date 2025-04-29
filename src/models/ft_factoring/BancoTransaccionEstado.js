import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class BancoTransaccionEstado extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idbancotransaccionestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bancotransaccionestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancotransaccionestado_bancotransaccionestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_bancotransaccionestado_code"
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
    tableName: 'banco_transaccion_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccionestado" },
        ]
      },
      {
        name: "UQ_bancotransaccionestado_bancotransaccionestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bancotransaccionestadoid" },
        ]
      },
      {
        name: "UQ_bancotransaccionestado_code",
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
