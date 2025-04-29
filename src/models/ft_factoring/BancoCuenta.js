import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class BancoCuenta extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
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
