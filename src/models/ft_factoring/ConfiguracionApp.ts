import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ConfiguracionAppAttributes {
  _idconfiguracionapp: number;
  configuracionappid: string;
  code: string;
  variable: string;
  valor: string;
  unidad: string;
  fecha_inicio: Date | Sequelize.Utils.Fn;
  fecha_fin?: Date | Sequelize.Utils.Fn;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ConfiguracionAppPk = "_idconfiguracionapp";
export type ConfiguracionAppId = ConfiguracionApp[ConfiguracionAppPk];
export type ConfiguracionAppOptionalAttributes = "configuracionappid" | "fecha_fin" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ConfiguracionAppCreationAttributes = Optional<ConfiguracionAppAttributes, ConfiguracionAppOptionalAttributes>;

export class ConfiguracionApp extends Model<ConfiguracionAppAttributes, ConfiguracionAppCreationAttributes> implements ConfiguracionAppAttributes {
  _idconfiguracionapp!: number;
  configuracionappid!: string;
  code!: string;
  variable!: string;
  valor!: string;
  unidad!: string;
  fecha_inicio!: Date;
  fecha_fin?: Date | Sequelize.Utils.Fn;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof ConfiguracionApp {
    return ConfiguracionApp.init({
    _idconfiguracionapp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    configuracionappid: {
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
        name: "UQ_consiguracion_app_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_consiguracion_app_consiguracionappid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "configuracionappid" },
        ]
      },
    ]
  });
  }
}
