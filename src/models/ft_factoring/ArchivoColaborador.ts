import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { Colaborador, ColaboradorId } from './Colaborador.js';

export interface ArchivoColaboradorAttributes {
  _idarchivo: number;
  _idcolaborador: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ArchivoColaboradorPk = "_idarchivo" | "_idcolaborador";
export type ArchivoColaboradorId = ArchivoColaborador[ArchivoColaboradorPk];
export type ArchivoColaboradorOptionalAttributes = "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ArchivoColaboradorCreationAttributes = Optional<ArchivoColaboradorAttributes, ArchivoColaboradorOptionalAttributes>;

export class ArchivoColaborador extends Model<ArchivoColaboradorAttributes, ArchivoColaboradorCreationAttributes> implements ArchivoColaboradorAttributes {
  _idarchivo!: number;
  _idcolaborador!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ArchivoColaborador belongsTo Archivo via _idarchivo
  archivo_archivo!: Archivo;
  get_idarchivo_archivo!: Sequelize.BelongsToGetAssociationMixin<Archivo>;
  set_idarchivo_archivo!: Sequelize.BelongsToSetAssociationMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo!: Sequelize.BelongsToCreateAssociationMixin<Archivo>;
  // ArchivoColaborador belongsTo Colaborador via _idcolaborador
  colaborador_colaborador!: Colaborador;
  get_idcolaborador_colaborador!: Sequelize.BelongsToGetAssociationMixin<Colaborador>;
  set_idcolaborador_colaborador!: Sequelize.BelongsToSetAssociationMixin<Colaborador, ColaboradorId>;
  create_idcolaborador_colaborador!: Sequelize.BelongsToCreateAssociationMixin<Colaborador>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ArchivoColaborador {
    return ArchivoColaborador.init({
    _idarchivo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'archivo',
        key: '_idarchivo'
      }
    },
    _idcolaborador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'colaborador',
        key: '_idcolaborador'
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
    tableName: 'archivo_colaborador',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idarchivo" },
          { name: "_idcolaborador" },
        ]
      },
      {
        name: "FK_archivo_colaborador_idcolaborador",
        using: "BTREE",
        fields: [
          { name: "_idcolaborador" },
        ]
      },
    ]
  });
  }
}
