import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringEstado extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactoringestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    factoringestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    estado1: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    estado2: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    alias_estado1: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    alias_estado2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    accion: {
      type: DataTypes.STRING(50),
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
    tableName: 'factoring_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringestado" },
        ]
      },
      {
        name: "UQ_factoring_estado_factoringestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringestadoid" },
        ]
      },
    ]
  });
  }
}
