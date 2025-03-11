import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringEjecutadoEstado extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactoringejecutadoestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringejecutadoestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_ejecutado_estado_factoringejecutadoestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factoring_ejecutado_estado_code"
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
    tableName: 'factoring_ejecutado_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringejecutadoestado" },
        ]
      },
      {
        name: "UQ_factoring_ejecutado_estado_factoringejecutadoestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringejecutadoestadoid" },
        ]
      },
      {
        name: "UQ_factoring_ejecutado_estado_code",
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
