import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class BancoCuentaTipo extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idbancocuentatipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bancocuentatipoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancocuentatipo_bancocuentatipoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_bancocuentatipo_code"
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
    tableName: 'banco_cuenta_tipo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancocuentatipo" },
        ]
      },
      {
        name: "UQ_bancocuentatipo_bancocuentatipoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bancocuentatipoid" },
        ]
      },
      {
        name: "UQ_bancocuentatipo_code",
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
