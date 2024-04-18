import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Riesgo extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idriesgo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    riesgoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_riesgo_riesgoid"
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    score: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    'descripción': {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    porcentaje_comision_gestion: {
      type: DataTypes.DECIMAL(12,2),
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
      type: DataTypes.INTEGER.UNSIGNED,
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
    tableName: 'riesgo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idriesgo" },
        ]
      },
      {
        name: "UQ_riesgo_riesgoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "riesgoid" },
        ]
      },
    ]
  });
  }
}
