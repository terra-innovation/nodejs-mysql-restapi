import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { Persona, PersonaId } from './Persona.js';

export interface ArchivoPersonaAttributes {
  _idarchivo: number;
  _idpersona: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ArchivoPersonaPk = "_idarchivo" | "_idpersona";
export type ArchivoPersonaId = ArchivoPersona[ArchivoPersonaPk];
export type ArchivoPersonaOptionalAttributes = "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ArchivoPersonaCreationAttributes = Optional<ArchivoPersonaAttributes, ArchivoPersonaOptionalAttributes>;

export class ArchivoPersona extends Model<ArchivoPersonaAttributes, ArchivoPersonaCreationAttributes> implements ArchivoPersonaAttributes {
  _idarchivo!: number;
  _idpersona!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ArchivoPersona belongsTo Archivo via _idarchivo
  archivo_archivo!: Archivo;
  get_idarchivo_archivo!: Sequelize.BelongsToGetAssociationMixin<Archivo>;
  set_idarchivo_archivo!: Sequelize.BelongsToSetAssociationMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo!: Sequelize.BelongsToCreateAssociationMixin<Archivo>;
  // ArchivoPersona belongsTo Persona via _idpersona
  persona_persona!: Persona;
  get_idpersona_persona!: Sequelize.BelongsToGetAssociationMixin<Persona>;
  set_idpersona_persona!: Sequelize.BelongsToSetAssociationMixin<Persona, PersonaId>;
  create_idpersona_persona!: Sequelize.BelongsToCreateAssociationMixin<Persona>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ArchivoPersona {
    return ArchivoPersona.init({
    _idarchivo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'archivo',
        key: '_idarchivo'
      }
    },
    _idpersona: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'persona',
        key: '_idpersona'
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
    tableName: 'archivo_persona',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idarchivo" },
          { name: "_idpersona" },
        ]
      },
      {
        name: "FK_archivo_persona_idpersona",
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
        ]
      },
    ]
  });
  }
}
