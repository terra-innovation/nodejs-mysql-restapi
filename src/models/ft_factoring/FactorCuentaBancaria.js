import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactorCuentaBancaria extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactorcuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factorcuentabancariaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factorcuentabancaria_factorcuentabancariaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factorcuentabancaria_code"
    },
    _idfactor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'factor',
        key: '_idfactor'
      }
    },
    _idcuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cuenta_bancaria',
        key: '_idcuentabancaria'
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
    tableName: 'factor_cuenta_bancaria',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactorcuentabancaria" },
        ]
      },
      {
        name: "UQ_factorcuentabancaria_factorcuentabancariaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factorcuentabancariaid" },
        ]
      },
      {
        name: "UQ_factorcuentabancaria_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factorcuentabancaria_idfactor",
        using: "BTREE",
        fields: [
          { name: "_idfactor" },
        ]
      },
      {
        name: "FK_factorcuentabancaria_idcuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idcuentabancaria" },
        ]
      },
    ]
  });
  }
}
