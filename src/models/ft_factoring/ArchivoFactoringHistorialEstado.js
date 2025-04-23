import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ArchivoFactoringHistorialEstado extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idarchivo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'archivo',
        key: '_idarchivo'
      }
    },
    _idfactoringhistorialestado: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'factoring_historial_estado',
        key: '_idfactoringhistorialestado'
      }
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
    tableName: 'archivo_factoring_historial_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idarchivo" },
          { name: "_idfactoringhistorialestado" },
        ]
      },
      {
        name: "FK_archivo_factoring_historial_estado_idfactoringhistorialestado",
        using: "BTREE",
        fields: [
          { name: "_idfactoringhistorialestado" },
        ]
      },
    ]
  });
  }
}
