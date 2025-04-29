import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ArchivoInversionistaRetiro extends Model {
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
    _idinversionistaretiro: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'inversionista_retiro',
        key: '_idinversionistaretiro'
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
    tableName: 'archivo_inversionista_retiro',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idarchivo" },
          { name: "_idinversionistaretiro" },
        ]
      },
      {
        name: "FK_archivoinversionistaretiro_idbancoretiro",
        using: "BTREE",
        fields: [
          { name: "_idinversionistaretiro" },
        ]
      },
    ]
  });
  }
}
