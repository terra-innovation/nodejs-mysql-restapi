import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Distrito extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _iddistrito: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    distritoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_distritoid"
    },
    _idprovincia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'provincia',
        key: '_idprovincia'
      }
    },
    _idregionnatural: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'region_natural',
        key: '_idregionnatural'
      }
    },
    codigodistrito: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    nombredistrito: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    capitallegal: {
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
    tableName: 'distrito',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_iddistrito" },
        ]
      },
      {
        name: "UQ_distritoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "distritoid" },
        ]
      },
      {
        name: "FK_distrito_idprovincia",
        using: "BTREE",
        fields: [
          { name: "_idprovincia" },
        ]
      },
      {
        name: "FK_distrito_idregionnatural",
        using: "BTREE",
        fields: [
          { name: "_idregionnatural" },
        ]
      },
    ]
  });
  }
}
