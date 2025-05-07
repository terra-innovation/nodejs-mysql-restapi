import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Colaborador, ColaboradorId } from './Colaborador.js';

export interface ColaboradorTipoAttributes {
  _idcolaboradortipo: number;
  colaboradortipoid: string;
  code: string;
  nombre: string;
  alias: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ColaboradorTipoPk = "_idcolaboradortipo";
export type ColaboradorTipoId = ColaboradorTipo[ColaboradorTipoPk];
export type ColaboradorTipoOptionalAttributes = "colaboradortipoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ColaboradorTipoCreationAttributes = Optional<ColaboradorTipoAttributes, ColaboradorTipoOptionalAttributes>;

export class ColaboradorTipo extends Model<ColaboradorTipoAttributes, ColaboradorTipoCreationAttributes> implements ColaboradorTipoAttributes {
  _idcolaboradortipo!: number;
  colaboradortipoid!: string;
  code!: string;
  nombre!: string;
  alias!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ColaboradorTipo hasMany Colaborador via _idcolaboradortipo
  colaboradors!: Colaborador[];
  getColaboradors!: Sequelize.HasManyGetAssociationsMixin<Colaborador>;
  setColaboradors!: Sequelize.HasManySetAssociationsMixin<Colaborador, ColaboradorId>;
  addColaborador!: Sequelize.HasManyAddAssociationMixin<Colaborador, ColaboradorId>;
  addColaboradors!: Sequelize.HasManyAddAssociationsMixin<Colaborador, ColaboradorId>;
  createColaborador!: Sequelize.HasManyCreateAssociationMixin<Colaborador>;
  removeColaborador!: Sequelize.HasManyRemoveAssociationMixin<Colaborador, ColaboradorId>;
  removeColaboradors!: Sequelize.HasManyRemoveAssociationsMixin<Colaborador, ColaboradorId>;
  hasColaborador!: Sequelize.HasManyHasAssociationMixin<Colaborador, ColaboradorId>;
  hasColaboradors!: Sequelize.HasManyHasAssociationsMixin<Colaborador, ColaboradorId>;
  countColaboradors!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ColaboradorTipo {
    return ColaboradorTipo.init({
    _idcolaboradortipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    colaboradortipoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    alias: {
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
    tableName: 'colaborador_tipo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idcolaboradortipo" },
        ]
      },
    ]
  });
  }
}
