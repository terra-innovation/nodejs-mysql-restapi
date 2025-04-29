import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class InversionistaRetiro extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
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
