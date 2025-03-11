import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringTipo extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactoringtipo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringtipoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_tipo_factoringid"
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    color: {
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
    tableName: 'factoring_tipo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringtipo" },
        ]
      },
      {
        name: "UQ_factoring_tipo_factoringid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringtipoid" },
        ]
      },
    ]
  });
  }
}
