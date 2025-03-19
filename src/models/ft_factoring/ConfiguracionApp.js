import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ConfiguracionApp extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idconfiguracionapp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    consiguracionappid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_consiguracion_app_consiguracionappid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_consiguracion_app_code"
    },
    variable: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    valor: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    unidad: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'configuracion_app',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idconfiguracionapp" },
        ]
      },
      {
        name: "UQ_consiguracion_app_consiguracionappid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "consiguracionappid" },
        ]
      },
      {
        name: "UQ_consiguracion_app_code",
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
