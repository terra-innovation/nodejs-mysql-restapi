import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Archivo extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idarchivo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    archivoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_archivoid"
    },
    _idarchivotipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'archivo_tipo',
        key: '_idarchivotipo'
      }
    },
    _idarchivoestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'archivo_estado',
        key: '_idarchivoestado'
      }
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "0"
    },
    nombrereal: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "Nombre real del archivo"
    },
    nombrealmacenamiento: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "Nombre del archivo en el almacenamiento"
    },
    ruta: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    tamanio: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
      comment: "Tamaño del archivo en KB"
    },
    mimetype: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "MineType"
    },
    encoding: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Encoding"
    },
    extension: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Extesión del archivo"
    },
    observacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Campo adicional para comentarios o información relevante."
    },
    fechavencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Fecha en que el documento expira o requiere revisión, si es relevante."
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
    tableName: 'archivo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idarchivo" },
        ]
      },
      {
        name: "UQ_archivoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "archivoid" },
        ]
      },
      {
        name: "FK_archivo_idarchivotipo",
        using: "BTREE",
        fields: [
          { name: "_idarchivotipo" },
        ]
      },
      {
        name: "FK_archivo_idarchivoestado",
        using: "BTREE",
        fields: [
          { name: "_idarchivoestado" },
        ]
      },
    ]
  });
  }
}
