import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Genero extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idgenero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    generoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_generoid"
    },
    nombregenero: {
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
    tableName: 'genero',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idgenero" },
        ]
      },
      {
        name: "UQ_generoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "generoid" },
        ]
      },
    ]
  });
  }
}
