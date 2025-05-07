import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { PersonaPepIndirecto, PersonaPepIndirectoId } from './PersonaPepIndirecto.js';

export interface PepVinculoAttributes {
  _idpepvinculo: number;
  pepvinculoid: string;
  nombrepepvinculo: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type PepVinculoPk = "_idpepvinculo";
export type PepVinculoId = PepVinculo[PepVinculoPk];
export type PepVinculoOptionalAttributes = "_idpepvinculo" | "pepvinculoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type PepVinculoCreationAttributes = Optional<PepVinculoAttributes, PepVinculoOptionalAttributes>;

export class PepVinculo extends Model<PepVinculoAttributes, PepVinculoCreationAttributes> implements PepVinculoAttributes {
  _idpepvinculo!: number;
  pepvinculoid!: string;
  nombrepepvinculo!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // PepVinculo hasMany PersonaPepIndirecto via _idpepevinculo
  persona_pep_indirectos!: PersonaPepIndirecto[];
  getPersona_pep_indirectos!: Sequelize.HasManyGetAssociationsMixin<PersonaPepIndirecto>;
  setPersona_pep_indirectos!: Sequelize.HasManySetAssociationsMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  addPersona_pep_indirecto!: Sequelize.HasManyAddAssociationMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  addPersona_pep_indirectos!: Sequelize.HasManyAddAssociationsMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  createPersona_pep_indirecto!: Sequelize.HasManyCreateAssociationMixin<PersonaPepIndirecto>;
  removePersona_pep_indirecto!: Sequelize.HasManyRemoveAssociationMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  removePersona_pep_indirectos!: Sequelize.HasManyRemoveAssociationsMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  hasPersona_pep_indirecto!: Sequelize.HasManyHasAssociationMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  hasPersona_pep_indirectos!: Sequelize.HasManyHasAssociationsMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  countPersona_pep_indirectos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof PepVinculo {
    return PepVinculo.init({
    _idpepvinculo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pepvinculoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_pepvinculoid"
    },
    nombrepepvinculo: {
      type: DataTypes.STRING(200),
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
    tableName: 'pep_vinculo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpepvinculo" },
        ]
      },
      {
        name: "UQ_pepvinculoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pepvinculoid" },
        ]
      },
    ]
  });
  }
}
