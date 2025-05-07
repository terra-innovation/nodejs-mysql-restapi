import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';

export interface ArchivoTipoAttributes {
  _idarchivotipo: number;
  archivotipoid: string;
  code?: string;
  nombre: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ArchivoTipoPk = "_idarchivotipo";
export type ArchivoTipoId = ArchivoTipo[ArchivoTipoPk];
export type ArchivoTipoOptionalAttributes = "_idarchivotipo" | "archivotipoid" | "code" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ArchivoTipoCreationAttributes = Optional<ArchivoTipoAttributes, ArchivoTipoOptionalAttributes>;

export class ArchivoTipo extends Model<ArchivoTipoAttributes, ArchivoTipoCreationAttributes> implements ArchivoTipoAttributes {
  _idarchivotipo!: number;
  archivotipoid!: string;
  code?: string;
  nombre!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ArchivoTipo hasMany Archivo via _idarchivotipo
  archivos!: Archivo[];
  getArchivos!: Sequelize.HasManyGetAssociationsMixin<Archivo>;
  setArchivos!: Sequelize.HasManySetAssociationsMixin<Archivo, ArchivoId>;
  addArchivo!: Sequelize.HasManyAddAssociationMixin<Archivo, ArchivoId>;
  addArchivos!: Sequelize.HasManyAddAssociationsMixin<Archivo, ArchivoId>;
  createArchivo!: Sequelize.HasManyCreateAssociationMixin<Archivo>;
  removeArchivo!: Sequelize.HasManyRemoveAssociationMixin<Archivo, ArchivoId>;
  removeArchivos!: Sequelize.HasManyRemoveAssociationsMixin<Archivo, ArchivoId>;
  hasArchivo!: Sequelize.HasManyHasAssociationMixin<Archivo, ArchivoId>;
  hasArchivos!: Sequelize.HasManyHasAssociationsMixin<Archivo, ArchivoId>;
  countArchivos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ArchivoTipo {
    return ArchivoTipo.init({
    _idarchivotipo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    archivotipoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_archivotipoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    nombre: {
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
    tableName: 'archivo_tipo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idarchivotipo" },
        ]
      },
      {
        name: "UQ_archivotipoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "archivotipoid" },
        ]
      },
    ]
  });
  }
}
