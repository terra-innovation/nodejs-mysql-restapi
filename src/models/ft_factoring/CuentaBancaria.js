import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class CuentaBancaria extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    idcuentabancaria: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cuentabancariaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    idempresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa',
        key: 'idempresa'
      }
    },
    idbanco: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'banco',
        key: 'idbanco'
      }
    },
    idcuentatipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cuenta_tipo',
        key: 'idcuentatipo'
      }
    },
    idmoneda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'moneda',
        key: 'idmoneda'
      }
    },
    idcuentabancariaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cuenta_bancaria_estado',
        key: 'idcuentabancariaestado'
      }
    },
    numero: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    cci: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    alias: {
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
    tableName: 'cuenta_bancaria',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idcuentabancaria" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idbanco",
        using: "BTREE",
        fields: [
          { name: "idbanco" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idcuentabancariaestado",
        using: "BTREE",
        fields: [
          { name: "idcuentabancariaestado" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idcuentatipo",
        using: "BTREE",
        fields: [
          { name: "idcuentatipo" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idmoneda",
        using: "BTREE",
        fields: [
          { name: "idmoneda" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idempresa",
        using: "BTREE",
        fields: [
          { name: "idempresa" },
        ]
      },
    ]
  });
  }
}