import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class CuentaBancaria extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idcuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    cuentabancariaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    _idempresa: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    _idbanco: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    _idcuentatipo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    _idmoneda: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    _idcuentabancariaestado: {
      type: DataTypes.INTEGER,
      allowNull: false
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
          { name: "_idcuentabancaria" },
        ]
      },
      {
        name: "UQ_cuenta_bancaria_cuentabancariaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cuentabancariaid" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idbanco",
        using: "BTREE",
        fields: [
          { name: "_idbanco" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idcuentabancariaestado",
        using: "BTREE",
        fields: [
          { name: "_idcuentabancariaestado" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idcuentatipo",
        using: "BTREE",
        fields: [
          { name: "_idcuentatipo" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idempresa",
        using: "BTREE",
        fields: [
          { name: "_idempresa" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idmoneda",
        using: "BTREE",
        fields: [
          { name: "_idmoneda" },
        ]
      },
    ]
  });
  }
}
