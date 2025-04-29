import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class BancoTransaccion extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
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
