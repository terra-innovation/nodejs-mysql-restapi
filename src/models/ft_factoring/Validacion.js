import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Validacion extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idvalidacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    validacionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    _idusuario: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    _idvalidaciontipo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    valor: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    otp: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    tiempo_marca: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: "current_timestamp(3)"
    },
    tiempo_expiracion: {
      type: DataTypes.MEDIUMINT,
      allowNull: false,
      defaultValue: 0,
      comment: "en minutos"
    },
    verificado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    fecha_verificado: {
      type: DataTypes.DATE(3),
      allowNull: true
    },
    codigo: {
      type: DataTypes.STRING(100),
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
    tableName: 'validacion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idvalidacion" },
        ]
      },
      {
        name: "UQ_validacion_validacionid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "validacionid" },
        ]
      },
      {
        name: "FK_validacion_idusuario",
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
        ]
      },
      {
        name: "FK_validacion_idvalidaciontipo",
        using: "BTREE",
        fields: [
          { name: "_idvalidaciontipo" },
        ]
      },
    ]
  });
  }
}
