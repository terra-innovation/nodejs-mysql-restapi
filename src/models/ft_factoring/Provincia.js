import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Provincia extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idprovincia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    provinciaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_provinciaid"
    },
    _iddepartamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departamento',
        key: '_iddepartamento'
      }
    },
    codigoprovincia: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    nombreprovincia: {
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
    tableName: 'provincia',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idprovincia" },
        ]
      },
      {
        name: "UQ_provinciaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "provinciaid" },
        ]
      },
      {
        name: "FK_provincia_iddepartamento",
        using: "BTREE",
        fields: [
          { name: "_iddepartamento" },
        ]
      },
    ]
  });
  }
}
