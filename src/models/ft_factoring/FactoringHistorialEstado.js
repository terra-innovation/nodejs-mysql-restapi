import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringHistorialEstado extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactoringhistorialestado: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    factoringhistorialestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoringhistorialestado_factoringhistorialestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factoringhistorialestado_code"
    },
    _idfactoring: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'factoring',
        key: '_idfactoring'
      }
    },
    _idfactoringestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'factoring_estado',
        key: '_idfactoringestado'
      }
    },
    _idusuariomodifica: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    comentario: {
      type: DataTypes.TEXT,
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
    tableName: 'factoring_historial_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringhistorialestado" },
        ]
      },
      {
        name: "UQ_factoringhistorialestado_factoringhistorialestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringhistorialestadoid" },
        ]
      },
      {
        name: "UQ_factoringhistorialestado_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factoringhistorialestado_idfactoting",
        using: "BTREE",
        fields: [
          { name: "_idfactoring" },
        ]
      },
      {
        name: "FK_factoringhistorialestado_idfactoringestado",
        using: "BTREE",
        fields: [
          { name: "_idfactoringestado" },
        ]
      },
      {
        name: "FK_factoringhistorialestado_idusuariomodifica",
        using: "BTREE",
        fields: [
          { name: "_idusuariomodifica" },
        ]
      },
    ]
  });
  }
}
