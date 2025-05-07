import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Empresa, EmpresaId } from './Empresa.js';
import type { Factor, FactorId } from './Factor.js';
import type { FactoringConfigComision, FactoringConfigComisionId } from './FactoringConfigComision.js';
import type { FactoringConfigGarantia, FactoringConfigGarantiaId } from './FactoringConfigGarantia.js';
import type { FactoringConfigTasaDescuento, FactoringConfigTasaDescuentoId } from './FactoringConfigTasaDescuento.js';
import type { FactoringPropuesta, FactoringPropuestaId } from './FactoringPropuesta.js';

export interface RiesgoAttributes {
  _idriesgo: number;
  riesgoid: string;
  code: string;
  nombre: string;
  alias: string;
  score: number;
  color: string;
  descripcion?: string;
  porcentaje_comision_gestion?: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type RiesgoPk = "_idriesgo";
export type RiesgoId = Riesgo[RiesgoPk];
export type RiesgoOptionalAttributes = "_idriesgo" | "riesgoid" | "descripcion" | "porcentaje_comision_gestion" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type RiesgoCreationAttributes = Optional<RiesgoAttributes, RiesgoOptionalAttributes>;

export class Riesgo extends Model<RiesgoAttributes, RiesgoCreationAttributes> implements RiesgoAttributes {
  _idriesgo!: number;
  riesgoid!: string;
  code!: string;
  nombre!: string;
  alias!: string;
  score!: number;
  color!: string;
  descripcion?: string;
  porcentaje_comision_gestion?: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Riesgo hasMany Empresa via _idriesgo
  empresas!: Empresa[];
  getEmpresas!: Sequelize.HasManyGetAssociationsMixin<Empresa>;
  setEmpresas!: Sequelize.HasManySetAssociationsMixin<Empresa, EmpresaId>;
  addEmpresa!: Sequelize.HasManyAddAssociationMixin<Empresa, EmpresaId>;
  addEmpresas!: Sequelize.HasManyAddAssociationsMixin<Empresa, EmpresaId>;
  createEmpresa!: Sequelize.HasManyCreateAssociationMixin<Empresa>;
  removeEmpresa!: Sequelize.HasManyRemoveAssociationMixin<Empresa, EmpresaId>;
  removeEmpresas!: Sequelize.HasManyRemoveAssociationsMixin<Empresa, EmpresaId>;
  hasEmpresa!: Sequelize.HasManyHasAssociationMixin<Empresa, EmpresaId>;
  hasEmpresas!: Sequelize.HasManyHasAssociationsMixin<Empresa, EmpresaId>;
  countEmpresas!: Sequelize.HasManyCountAssociationsMixin;
  // Riesgo hasMany Factor via _idriesgo
  factors!: Factor[];
  getFactors!: Sequelize.HasManyGetAssociationsMixin<Factor>;
  setFactors!: Sequelize.HasManySetAssociationsMixin<Factor, FactorId>;
  addFactor!: Sequelize.HasManyAddAssociationMixin<Factor, FactorId>;
  addFactors!: Sequelize.HasManyAddAssociationsMixin<Factor, FactorId>;
  createFactor!: Sequelize.HasManyCreateAssociationMixin<Factor>;
  removeFactor!: Sequelize.HasManyRemoveAssociationMixin<Factor, FactorId>;
  removeFactors!: Sequelize.HasManyRemoveAssociationsMixin<Factor, FactorId>;
  hasFactor!: Sequelize.HasManyHasAssociationMixin<Factor, FactorId>;
  hasFactors!: Sequelize.HasManyHasAssociationsMixin<Factor, FactorId>;
  countFactors!: Sequelize.HasManyCountAssociationsMixin;
  // Riesgo hasMany FactoringConfigComision via _idriesgo
  factoring_config_comisions!: FactoringConfigComision[];
  getFactoring_config_comisions!: Sequelize.HasManyGetAssociationsMixin<FactoringConfigComision>;
  setFactoring_config_comisions!: Sequelize.HasManySetAssociationsMixin<FactoringConfigComision, FactoringConfigComisionId>;
  addFactoring_config_comision!: Sequelize.HasManyAddAssociationMixin<FactoringConfigComision, FactoringConfigComisionId>;
  addFactoring_config_comisions!: Sequelize.HasManyAddAssociationsMixin<FactoringConfigComision, FactoringConfigComisionId>;
  createFactoring_config_comision!: Sequelize.HasManyCreateAssociationMixin<FactoringConfigComision>;
  removeFactoring_config_comision!: Sequelize.HasManyRemoveAssociationMixin<FactoringConfigComision, FactoringConfigComisionId>;
  removeFactoring_config_comisions!: Sequelize.HasManyRemoveAssociationsMixin<FactoringConfigComision, FactoringConfigComisionId>;
  hasFactoring_config_comision!: Sequelize.HasManyHasAssociationMixin<FactoringConfigComision, FactoringConfigComisionId>;
  hasFactoring_config_comisions!: Sequelize.HasManyHasAssociationsMixin<FactoringConfigComision, FactoringConfigComisionId>;
  countFactoring_config_comisions!: Sequelize.HasManyCountAssociationsMixin;
  // Riesgo hasMany FactoringConfigGarantia via _idriesgo
  factoring_config_garantia!: FactoringConfigGarantia[];
  getFactoring_config_garantia!: Sequelize.HasManyGetAssociationsMixin<FactoringConfigGarantia>;
  setFactoring_config_garantia!: Sequelize.HasManySetAssociationsMixin<FactoringConfigGarantia, FactoringConfigGarantiaId>;
  addFactoring_config_garantium!: Sequelize.HasManyAddAssociationMixin<FactoringConfigGarantia, FactoringConfigGarantiaId>;
  addFactoring_config_garantia!: Sequelize.HasManyAddAssociationsMixin<FactoringConfigGarantia, FactoringConfigGarantiaId>;
  createFactoring_config_garantium!: Sequelize.HasManyCreateAssociationMixin<FactoringConfigGarantia>;
  removeFactoring_config_garantium!: Sequelize.HasManyRemoveAssociationMixin<FactoringConfigGarantia, FactoringConfigGarantiaId>;
  removeFactoring_config_garantia!: Sequelize.HasManyRemoveAssociationsMixin<FactoringConfigGarantia, FactoringConfigGarantiaId>;
  hasFactoring_config_garantium!: Sequelize.HasManyHasAssociationMixin<FactoringConfigGarantia, FactoringConfigGarantiaId>;
  hasFactoring_config_garantia!: Sequelize.HasManyHasAssociationsMixin<FactoringConfigGarantia, FactoringConfigGarantiaId>;
  countFactoring_config_garantia!: Sequelize.HasManyCountAssociationsMixin;
  // Riesgo hasMany FactoringConfigTasaDescuento via _idriesgo
  factoring_config_tasa_descuentos!: FactoringConfigTasaDescuento[];
  getFactoring_config_tasa_descuentos!: Sequelize.HasManyGetAssociationsMixin<FactoringConfigTasaDescuento>;
  setFactoring_config_tasa_descuentos!: Sequelize.HasManySetAssociationsMixin<FactoringConfigTasaDescuento, FactoringConfigTasaDescuentoId>;
  addFactoring_config_tasa_descuento!: Sequelize.HasManyAddAssociationMixin<FactoringConfigTasaDescuento, FactoringConfigTasaDescuentoId>;
  addFactoring_config_tasa_descuentos!: Sequelize.HasManyAddAssociationsMixin<FactoringConfigTasaDescuento, FactoringConfigTasaDescuentoId>;
  createFactoring_config_tasa_descuento!: Sequelize.HasManyCreateAssociationMixin<FactoringConfigTasaDescuento>;
  removeFactoring_config_tasa_descuento!: Sequelize.HasManyRemoveAssociationMixin<FactoringConfigTasaDescuento, FactoringConfigTasaDescuentoId>;
  removeFactoring_config_tasa_descuentos!: Sequelize.HasManyRemoveAssociationsMixin<FactoringConfigTasaDescuento, FactoringConfigTasaDescuentoId>;
  hasFactoring_config_tasa_descuento!: Sequelize.HasManyHasAssociationMixin<FactoringConfigTasaDescuento, FactoringConfigTasaDescuentoId>;
  hasFactoring_config_tasa_descuentos!: Sequelize.HasManyHasAssociationsMixin<FactoringConfigTasaDescuento, FactoringConfigTasaDescuentoId>;
  countFactoring_config_tasa_descuentos!: Sequelize.HasManyCountAssociationsMixin;
  // Riesgo hasMany FactoringPropuesta via _idriesgooperacion
  factoring_propuesta!: FactoringPropuesta[];
  getFactoring_propuesta!: Sequelize.HasManyGetAssociationsMixin<FactoringPropuesta>;
  setFactoring_propuesta!: Sequelize.HasManySetAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  addFactoring_propuestum!: Sequelize.HasManyAddAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  addFactoring_propuesta!: Sequelize.HasManyAddAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  createFactoring_propuestum!: Sequelize.HasManyCreateAssociationMixin<FactoringPropuesta>;
  removeFactoring_propuestum!: Sequelize.HasManyRemoveAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  removeFactoring_propuesta!: Sequelize.HasManyRemoveAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  hasFactoring_propuestum!: Sequelize.HasManyHasAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  hasFactoring_propuesta!: Sequelize.HasManyHasAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  countFactoring_propuesta!: Sequelize.HasManyCountAssociationsMixin;
  // Riesgo hasMany FactoringPropuesta via _idriesgoaceptante
  riesgoaceptante_factoring_propuesta!: FactoringPropuesta[];
  get_idriesgoaceptante_factoring_propuesta!: Sequelize.HasManyGetAssociationsMixin<FactoringPropuesta>;
  set_idriesgoaceptante_factoring_propuesta!: Sequelize.HasManySetAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  add_idriesgoaceptante_factoring_propuestum!: Sequelize.HasManyAddAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  add_idriesgoaceptante_factoring_propuesta!: Sequelize.HasManyAddAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  create_idriesgoaceptante_factoring_propuestum!: Sequelize.HasManyCreateAssociationMixin<FactoringPropuesta>;
  remove_idriesgoaceptante_factoring_propuestum!: Sequelize.HasManyRemoveAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  remove_idriesgoaceptante_factoring_propuesta!: Sequelize.HasManyRemoveAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  has_idriesgoaceptante_factoring_propuestum!: Sequelize.HasManyHasAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  has_idriesgoaceptante_factoring_propuesta!: Sequelize.HasManyHasAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  count_idriesgoaceptante_factoring_propuesta!: Sequelize.HasManyCountAssociationsMixin;
  // Riesgo hasMany FactoringPropuesta via _idriesgocedente
  riesgocedente_factoring_propuesta!: FactoringPropuesta[];
  get_idriesgocedente_factoring_propuesta!: Sequelize.HasManyGetAssociationsMixin<FactoringPropuesta>;
  set_idriesgocedente_factoring_propuesta!: Sequelize.HasManySetAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  add_idriesgocedente_factoring_propuestum!: Sequelize.HasManyAddAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  add_idriesgocedente_factoring_propuesta!: Sequelize.HasManyAddAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  create_idriesgocedente_factoring_propuestum!: Sequelize.HasManyCreateAssociationMixin<FactoringPropuesta>;
  remove_idriesgocedente_factoring_propuestum!: Sequelize.HasManyRemoveAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  remove_idriesgocedente_factoring_propuesta!: Sequelize.HasManyRemoveAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  has_idriesgocedente_factoring_propuestum!: Sequelize.HasManyHasAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  has_idriesgocedente_factoring_propuesta!: Sequelize.HasManyHasAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  count_idriesgocedente_factoring_propuesta!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Riesgo {
    return Riesgo.init({
    _idriesgo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    riesgoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_riesgo_riesgoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    score: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    porcentaje_comision_gestion: {
      type: DataTypes.DECIMAL(12,2),
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
      type: DataTypes.INTEGER.UNSIGNED,
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
    tableName: 'riesgo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idriesgo" },
        ]
      },
      {
        name: "UQ_riesgo_riesgoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "riesgoid" },
        ]
      },
    ]
  });
  }
}
