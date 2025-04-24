import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class InversionistaCuentaBancaria extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idinversionistacuentabancaria: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    inversionistacuentabancariaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_inversionistacuentabancaria_inversionistacuentabancariaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_inversionistacuentabancaria_code"
    },
    _idinversionista: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'inversionista',
        key: '_idinversionista'
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
    tableName: 'inversionista_cuenta_bancaria',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idinversionistacuentabancaria" },
        ]
      },
      {
        name: "UQ_inversionistacuentabancaria_inversionistacuentabancariaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "inversionistacuentabancariaid" },
        ]
      },
      {
        name: "UQ_inversionistacuentabancaria_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_inversionistacuentabancaria_idinversionista",
        using: "BTREE",
        fields: [
          { name: "_idinversionista" },
        ]
      },
      {
        name: "FK_inversionistacuentabancaria_idcuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idcuentabancaria" },
        ]
      },
    ]
  });
  }
}
