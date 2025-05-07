import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { InversionistaRetiro, InversionistaRetiroId } from './InversionistaRetiro.js';

export interface ArchivoInversionistaRetiroAttributes {
  _idarchivo: number;
  _idinversionistaretiro: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ArchivoInversionistaRetiroPk = "_idarchivo" | "_idinversionistaretiro";
export type ArchivoInversionistaRetiroId = ArchivoInversionistaRetiro[ArchivoInversionistaRetiroPk];
export type ArchivoInversionistaRetiroOptionalAttributes = "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ArchivoInversionistaRetiroCreationAttributes = Optional<ArchivoInversionistaRetiroAttributes, ArchivoInversionistaRetiroOptionalAttributes>;

export class ArchivoInversionistaRetiro extends Model<ArchivoInversionistaRetiroAttributes, ArchivoInversionistaRetiroCreationAttributes> implements ArchivoInversionistaRetiroAttributes {
  _idarchivo!: number;
  _idinversionistaretiro!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ArchivoInversionistaRetiro belongsTo Archivo via _idarchivo
  archivo_archivo!: Archivo;
  get_idarchivo_archivo!: Sequelize.BelongsToGetAssociationMixin<Archivo>;
  set_idarchivo_archivo!: Sequelize.BelongsToSetAssociationMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo!: Sequelize.BelongsToCreateAssociationMixin<Archivo>;
  // ArchivoInversionistaRetiro belongsTo InversionistaRetiro via _idinversionistaretiro
  inversionistaretiro_inversionista_retiro!: InversionistaRetiro;
  get_idinversionistaretiro_inversionista_retiro!: Sequelize.BelongsToGetAssociationMixin<InversionistaRetiro>;
  set_idinversionistaretiro_inversionista_retiro!: Sequelize.BelongsToSetAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  create_idinversionistaretiro_inversionista_retiro!: Sequelize.BelongsToCreateAssociationMixin<InversionistaRetiro>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ArchivoInversionistaRetiro {
    return ArchivoInversionistaRetiro.init({
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
