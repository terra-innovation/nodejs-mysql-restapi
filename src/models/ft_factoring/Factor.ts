import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Departamento, DepartamentoId } from './Departamento.js';
import type { Distrito, DistritoId } from './Distrito.js';
import type { FactorCuentaBancaria, FactorCuentaBancariaId } from './FactorCuentaBancaria.js';
import type { Pais, PaisId } from './Pais.js';
import type { Provincia, ProvinciaId } from './Provincia.js';
import type { Riesgo, RiesgoId } from './Riesgo.js';

export interface FactorAttributes {
  _idfactor: number;
  factorid: string;
  code: string;
  _idpaissede?: number;
  _iddepartamentosede?: number;
  _idprovinciasede?: number;
  _iddistritosede?: number;
  _idriesgo?: number;
  ruc: string;
  razon_social: string;
  nombre_comercial?: string;
  fecha_inscripcion?: string;
  domicilio_fiscal?: string;
  direccion_sede?: string;
  direccion_sede_referencia?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactorPk = "_idfactor";
export type FactorId = Factor[FactorPk];
export type FactorOptionalAttributes = "factorid" | "_idpaissede" | "_iddepartamentosede" | "_idprovinciasede" | "_iddistritosede" | "_idriesgo" | "nombre_comercial" | "fecha_inscripcion" | "domicilio_fiscal" | "direccion_sede" | "direccion_sede_referencia" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactorCreationAttributes = Optional<FactorAttributes, FactorOptionalAttributes>;

export class Factor extends Model<FactorAttributes, FactorCreationAttributes> implements FactorAttributes {
  _idfactor!: number;
  factorid!: string;
  code!: string;
  _idpaissede?: number;
  _iddepartamentosede?: number;
  _idprovinciasede?: number;
  _iddistritosede?: number;
  _idriesgo?: number;
  ruc!: string;
  razon_social!: string;
  nombre_comercial?: string;
  fecha_inscripcion?: string;
  domicilio_fiscal?: string;
  direccion_sede?: string;
  direccion_sede_referencia?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Factor belongsTo Departamento via _iddepartamentosede
  departamentosede_departamento!: Departamento;
  get_iddepartamentosede_departamento!: Sequelize.BelongsToGetAssociationMixin<Departamento>;
  set_iddepartamentosede_departamento!: Sequelize.BelongsToSetAssociationMixin<Departamento, DepartamentoId>;
  create_iddepartamentosede_departamento!: Sequelize.BelongsToCreateAssociationMixin<Departamento>;
  // Factor belongsTo Distrito via _iddistritosede
  distritosede_distrito!: Distrito;
  get_iddistritosede_distrito!: Sequelize.BelongsToGetAssociationMixin<Distrito>;
  set_iddistritosede_distrito!: Sequelize.BelongsToSetAssociationMixin<Distrito, DistritoId>;
  create_iddistritosede_distrito!: Sequelize.BelongsToCreateAssociationMixin<Distrito>;
  // Factor hasMany FactorCuentaBancaria via _idfactor
  factor_cuenta_bancaria!: FactorCuentaBancaria[];
  getFactor_cuenta_bancaria!: Sequelize.HasManyGetAssociationsMixin<FactorCuentaBancaria>;
  setFactor_cuenta_bancaria!: Sequelize.HasManySetAssociationsMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  addFactor_cuenta_bancarium!: Sequelize.HasManyAddAssociationMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  addFactor_cuenta_bancaria!: Sequelize.HasManyAddAssociationsMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  createFactor_cuenta_bancarium!: Sequelize.HasManyCreateAssociationMixin<FactorCuentaBancaria>;
  removeFactor_cuenta_bancarium!: Sequelize.HasManyRemoveAssociationMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  removeFactor_cuenta_bancaria!: Sequelize.HasManyRemoveAssociationsMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  hasFactor_cuenta_bancarium!: Sequelize.HasManyHasAssociationMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  hasFactor_cuenta_bancaria!: Sequelize.HasManyHasAssociationsMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  countFactor_cuenta_bancaria!: Sequelize.HasManyCountAssociationsMixin;
  // Factor belongsTo Pais via _idpaissede
  paissede_pai!: Pais;
  get_idpaissede_pai!: Sequelize.BelongsToGetAssociationMixin<Pais>;
  set_idpaissede_pai!: Sequelize.BelongsToSetAssociationMixin<Pais, PaisId>;
  create_idpaissede_pai!: Sequelize.BelongsToCreateAssociationMixin<Pais>;
  // Factor belongsTo Provincia via _idprovinciasede
  provinciasede_provincium!: Provincia;
  get_idprovinciasede_provincium!: Sequelize.BelongsToGetAssociationMixin<Provincia>;
  set_idprovinciasede_provincium!: Sequelize.BelongsToSetAssociationMixin<Provincia, ProvinciaId>;
  create_idprovinciasede_provincium!: Sequelize.BelongsToCreateAssociationMixin<Provincia>;
  // Factor belongsTo Riesgo via _idriesgo
  riesgo_riesgo!: Riesgo;
  get_idriesgo_riesgo!: Sequelize.BelongsToGetAssociationMixin<Riesgo>;
  set_idriesgo_riesgo!: Sequelize.BelongsToSetAssociationMixin<Riesgo, RiesgoId>;
  create_idriesgo_riesgo!: Sequelize.BelongsToCreateAssociationMixin<Riesgo>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Factor {
    return Factor.init({
    _idfactor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factorid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factor_factorid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factor_code"
    },
    _idpaissede: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pais',
        key: '_idpais'
      }
    },
    _iddepartamentosede: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departamento',
        key: '_iddepartamento'
      }
    },
    _idprovinciasede: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'provincia',
        key: '_idprovincia'
      }
    },
    _iddistritosede: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'distrito',
        key: '_iddistrito'
      }
    },
    _idriesgo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'riesgo',
        key: '_idriesgo'
      }
    },
    ruc: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    razon_social: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    nombre_comercial: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    fecha_inscripcion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    domicilio_fiscal: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    direccion_sede: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    direccion_sede_referencia: {
      type: DataTypes.STRING(200),
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
    tableName: 'factor',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactor" },
        ]
      },
      {
        name: "UQ_factor_factorid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factorid" },
        ]
      },
      {
        name: "UQ_factor_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factor_idpaissede",
        using: "BTREE",
        fields: [
          { name: "_idpaissede" },
        ]
      },
      {
        name: "FK_factor_iddepartamentosede",
        using: "BTREE",
        fields: [
          { name: "_iddepartamentosede" },
        ]
      },
      {
        name: "FK_factor_idprovinciasede",
        using: "BTREE",
        fields: [
          { name: "_idprovinciasede" },
        ]
      },
      {
        name: "FK_factor_iddistritosede",
        using: "BTREE",
        fields: [
          { name: "_iddistritosede" },
        ]
      },
      {
        name: "FK_factor_idriesgo",
        using: "BTREE",
        fields: [
          { name: "_idriesgo" },
        ]
      },
    ]
  });
  }
}
