import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Pais extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idpais: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    paisid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_paisid"
    },
    codigopais: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    nombrepais: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    nacionalidad: {
      type: DataTypes.STRING(200),
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
    tableName: 'pais',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpais" },
        ]
      },
      {
        name: "UQ_paisid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "paisid" },
        ]
      },
    ]
  });
  }
}