import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Empresa, EmpresaId } from './Empresa.js';
import type { Factoring, FactoringId } from './Factoring.js';

export interface ContactoAttributes {
  _idcontacto: number;
  contactoid: string;
  code: string;
  _idempresa: number;
  nombrecontacto: string;
  apellidocontacto?: string;
  cargo?: string;
  email: string;
  celular?: string;
  telefono?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ContactoPk = "_idcontacto";
export type ContactoId = Contacto[ContactoPk];
export type ContactoOptionalAttributes = "_idcontacto" | "contactoid" | "apellidocontacto" | "cargo" | "celular" | "telefono" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ContactoCreationAttributes = Optional<ContactoAttributes, ContactoOptionalAttributes>;

export class Contacto extends Model<ContactoAttributes, ContactoCreationAttributes> implements ContactoAttributes {
  _idcontacto!: number;
  contactoid!: string;
  code!: string;
  _idempresa!: number;
  nombrecontacto!: string;
  apellidocontacto?: string;
  cargo?: string;
  email!: string;
  celular?: string;
  telefono?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Contacto hasMany Factoring via _idcontactoaceptante
  factorings!: Factoring[];
  getFactorings!: Sequelize.HasManyGetAssociationsMixin<Factoring>;
  setFactorings!: Sequelize.HasManySetAssociationsMixin<Factoring, FactoringId>;
  addFactoring!: Sequelize.HasManyAddAssociationMixin<Factoring, FactoringId>;
  addFactorings!: Sequelize.HasManyAddAssociationsMixin<Factoring, FactoringId>;
  createFactoring!: Sequelize.HasManyCreateAssociationMixin<Factoring>;
  removeFactoring!: Sequelize.HasManyRemoveAssociationMixin<Factoring, FactoringId>;
  removeFactorings!: Sequelize.HasManyRemoveAssociationsMixin<Factoring, FactoringId>;
  hasFactoring!: Sequelize.HasManyHasAssociationMixin<Factoring, FactoringId>;
  hasFactorings!: Sequelize.HasManyHasAssociationsMixin<Factoring, FactoringId>;
  countFactorings!: Sequelize.HasManyCountAssociationsMixin;
  // Contacto belongsTo Empresa via _idempresa
  empresa_empresa!: Empresa;
  get_idempresa_empresa!: Sequelize.BelongsToGetAssociationMixin<Empresa>;
  set_idempresa_empresa!: Sequelize.BelongsToSetAssociationMixin<Empresa, EmpresaId>;
  create_idempresa_empresa!: Sequelize.BelongsToCreateAssociationMixin<Empresa>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Contacto {
    return Contacto.init({
    _idcontacto: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    contactoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_contacto_contactoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_contacto_code"
    },
    _idempresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa',
        key: '_idempresa'
      }
    },
    nombrecontacto: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    apellidocontacto: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cargo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(50),
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
    tableName: 'contacto',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idcontacto" },
        ]
      },
      {
        name: "UQ_contacto_contactoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "contactoid" },
        ]
      },
      {
        name: "UQ_contacto_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_contacto_idempresa",
        using: "BTREE",
        fields: [
          { name: "_idempresa" },
        ]
      },
    ]
  });
  }
}
