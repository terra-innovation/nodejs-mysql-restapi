import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class BancoCuentaEstado extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idbancocuentaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bancocuentaestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancocuentaestado_bancocuentaestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_bancocuentaestado_code"
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
    tableName: 'banco_cuenta_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancocuentaestado" },
        ]
      },
      {
        name: "UQ_bancocuentaestado_bancocuentaestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bancocuentaestadoid" },
        ]
      },
      {
        name: "UQ_bancocuentaestado_code",
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
