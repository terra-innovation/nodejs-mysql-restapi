import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ServicioEmpresa, ServicioEmpresaId } from './ServicioEmpresa.js';
import type { ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId } from './ServicioEmpresaVerificacion.js';

export interface ServicioEmpresaEstadoAttributes {
  _idservicioempresaestado: number;
  servicioempresaestadoid: string;
  code: string;
  nombre: string;
  alias: string;
  color: string;
  issuccessfulvalidation: number;
  isestadofinal: number;
  isusuarioedit: number;
  isenabledcomentariousuario: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ServicioEmpresaEstadoPk = "_idservicioempresaestado";
export type ServicioEmpresaEstadoId = ServicioEmpresaEstado[ServicioEmpresaEstadoPk];
export type ServicioEmpresaEstadoOptionalAttributes = "servicioempresaestadoid" | "issuccessfulvalidation" | "isestadofinal" | "isusuarioedit" | "isenabledcomentariousuario" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ServicioEmpresaEstadoCreationAttributes = Optional<ServicioEmpresaEstadoAttributes, ServicioEmpresaEstadoOptionalAttributes>;

export class ServicioEmpresaEstado extends Model<ServicioEmpresaEstadoAttributes, ServicioEmpresaEstadoCreationAttributes> implements ServicioEmpresaEstadoAttributes {
  _idservicioempresaestado!: number;
  servicioempresaestadoid!: string;
  code!: string;
  nombre!: string;
  alias!: string;
  color!: string;
  issuccessfulvalidation!: number;
  isestadofinal!: number;
  isusuarioedit!: number;
  isenabledcomentariousuario!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ServicioEmpresaEstado hasMany ServicioEmpresa via _idservicioempresaestado
  servicio_empresas!: ServicioEmpresa[];
  getServicio_empresas!: Sequelize.HasManyGetAssociationsMixin<ServicioEmpresa>;
  setServicio_empresas!: Sequelize.HasManySetAssociationsMixin<ServicioEmpresa, ServicioEmpresaId>;
  addServicio_empresa!: Sequelize.HasManyAddAssociationMixin<ServicioEmpresa, ServicioEmpresaId>;
  addServicio_empresas!: Sequelize.HasManyAddAssociationsMixin<ServicioEmpresa, ServicioEmpresaId>;
  createServicio_empresa!: Sequelize.HasManyCreateAssociationMixin<ServicioEmpresa>;
  removeServicio_empresa!: Sequelize.HasManyRemoveAssociationMixin<ServicioEmpresa, ServicioEmpresaId>;
  removeServicio_empresas!: Sequelize.HasManyRemoveAssociationsMixin<ServicioEmpresa, ServicioEmpresaId>;
  hasServicio_empresa!: Sequelize.HasManyHasAssociationMixin<ServicioEmpresa, ServicioEmpresaId>;
  hasServicio_empresas!: Sequelize.HasManyHasAssociationsMixin<ServicioEmpresa, ServicioEmpresaId>;
  countServicio_empresas!: Sequelize.HasManyCountAssociationsMixin;
  // ServicioEmpresaEstado hasMany ServicioEmpresaVerificacion via _idservicioempresaestado
  servicio_empresa_verificacions!: ServicioEmpresaVerificacion[];
  getServicio_empresa_verificacions!: Sequelize.HasManyGetAssociationsMixin<ServicioEmpresaVerificacion>;
  setServicio_empresa_verificacions!: Sequelize.HasManySetAssociationsMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  addServicio_empresa_verificacion!: Sequelize.HasManyAddAssociationMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  addServicio_empresa_verificacions!: Sequelize.HasManyAddAssociationsMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  createServicio_empresa_verificacion!: Sequelize.HasManyCreateAssociationMixin<ServicioEmpresaVerificacion>;
  removeServicio_empresa_verificacion!: Sequelize.HasManyRemoveAssociationMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  removeServicio_empresa_verificacions!: Sequelize.HasManyRemoveAssociationsMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  hasServicio_empresa_verificacion!: Sequelize.HasManyHasAssociationMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  hasServicio_empresa_verificacions!: Sequelize.HasManyHasAssociationsMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  countServicio_empresa_verificacions!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ServicioEmpresaEstado {
    return ServicioEmpresaEstado.init({
    _idservicioempresaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    servicioempresaestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_servicioempresaestado_servicioempresaestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_servicioempresaestado_code"
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    issuccessfulvalidation: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    isestadofinal: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    isusuarioedit: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    isenabledcomentariousuario: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
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
    tableName: 'servicio_empresa_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idservicioempresaestado" },
        ]
      },
      {
        name: "UQ_servicioempresaestado_servicioempresaestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "servicioempresaestadoid" },
        ]
      },
      {
        name: "UQ_servicioempresaestado_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
    ]
  });
  }
}
