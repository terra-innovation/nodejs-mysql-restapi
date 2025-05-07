import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';

export interface ArchivoEstadoAttributes {
  _idarchivoestado: number;
  archivoestadoid: string;
  nombre: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ArchivoEstadoPk = "_idarchivoestado";
export type ArchivoEstadoId = ArchivoEstado[ArchivoEstadoPk];
export type ArchivoEstadoOptionalAttributes = "_idarchivoestado" | "archivoestadoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ArchivoEstadoCreationAttributes = Optional<ArchivoEstadoAttributes, ArchivoEstadoOptionalAttributes>;

export class ArchivoEstado extends Model<ArchivoEstadoAttributes, ArchivoEstadoCreationAttributes> implements ArchivoEstadoAttributes {
  _idarchivoestado!: number;
  archivoestadoid!: string;
  nombre!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ArchivoEstado hasMany Archivo via _idarchivoestado
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

  static initModel(sequelize: Sequelize.Sequelize): typeof ArchivoEstado {
    return ArchivoEstado.init({
    _idarchivoestado: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    archivoestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_archivoestadoid"
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
    tableName: 'archivo_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idarchivoestado" },
        ]
      },
      {
        name: "UQ_archivoestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "archivoestadoid" },
        ]
      },
    ]
  });
  }
}
