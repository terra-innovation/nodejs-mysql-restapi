import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class EmpresaCuentaBancaria extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idempresacuentabancaria: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    empresacuentabancariaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "UQ_empresacuentabancaria_empresacuentabancariaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_empresacuentabancaria_code"
    },
    _idempresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa',
        key: '_idempresa'
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
    tableName: 'empresa_cuenta_bancaria',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idempresacuentabancaria" },
        ]
      },
      {
        name: "UQ_empresacuentabancaria_empresacuentabancariaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "empresacuentabancariaid" },
        ]
      },
      {
        name: "UQ_empresacuentabancaria_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_empresacuentabancaria_idempresa_idcuentabancaria",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idempresa" },
          { name: "_idcuentabancaria" },
        ]
      },
      {
        name: "FK_empresacuentabancaria_idcuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idcuentabancaria" },
        ]
      },
    ]
  });
  }
}
