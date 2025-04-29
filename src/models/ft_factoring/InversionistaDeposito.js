import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class InversionistaDeposito extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
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
