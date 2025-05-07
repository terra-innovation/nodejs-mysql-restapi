import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface EmpresaDeclaracionAttributes {
  _idpersonadeclaracion: number;
  personadeclaracionid: string;
  _idpersona: number;
  espep?: number;
  tienevinculopep?: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type EmpresaDeclaracionOptionalAttributes = "personadeclaracionid" | "espep" | "tienevinculopep" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type EmpresaDeclaracionCreationAttributes = Optional<EmpresaDeclaracionAttributes, EmpresaDeclaracionOptionalAttributes>;

export class EmpresaDeclaracion extends Model<EmpresaDeclaracionAttributes, EmpresaDeclaracionCreationAttributes> implements EmpresaDeclaracionAttributes {
  _idpersonadeclaracion!: number;
  personadeclaracionid!: string;
  _idpersona!: number;
  espep?: number;
  tienevinculopep?: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof EmpresaDeclaracion {
    return EmpresaDeclaracion.init({
    _idpersonadeclaracion: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    personadeclaracionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    _idpersona: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    espep: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: "Declaro que soy una Persona Expuesta Políticamente"
    },
    tienevinculopep: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: "Declaro que tengo un vínculo con una Persona Expuesta"
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
    tableName: 'empresa_declaracion',
    timestamps: false
  });
  }
}
