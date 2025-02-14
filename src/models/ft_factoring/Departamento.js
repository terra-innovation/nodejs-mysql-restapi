import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Departamento extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _iddepartamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    departamentoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    _idpais: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codigodepartamento: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    nombredepartamento: {
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
    tableName: 'departamento',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_iddepartamento" },
        ]
      },
      {
        name: "UQ_departamentoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "departamentoid" },
        ]
      },
      {
        name: "FK_departamento_idpais",
        using: "BTREE",
        fields: [
          { name: "_idpais" },
        ]
      },
    ]
  });
  }
}
