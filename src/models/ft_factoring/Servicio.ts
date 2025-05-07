import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ServicioEmpresa, ServicioEmpresaId } from './ServicioEmpresa.js';
import type { UsuarioServicio, UsuarioServicioId } from './UsuarioServicio.js';
import type { UsuarioServicioEmpresa, UsuarioServicioEmpresaId } from './UsuarioServicioEmpresa.js';

export interface ServicioAttributes {
  _idservicio: number;
  servicioid: string;
  code: string;
  nombre: string;
  alias: string;
  descripcion: string;
  urlcontrato: string;
  pathroute: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ServicioPk = "_idservicio";
export type ServicioId = Servicio[ServicioPk];
export type ServicioOptionalAttributes = "_idservicio" | "servicioid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ServicioCreationAttributes = Optional<ServicioAttributes, ServicioOptionalAttributes>;

export class Servicio extends Model<ServicioAttributes, ServicioCreationAttributes> implements ServicioAttributes {
  _idservicio!: number;
  servicioid!: string;
  code!: string;
  nombre!: string;
  alias!: string;
  descripcion!: string;
  urlcontrato!: string;
  pathroute!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Servicio hasMany ServicioEmpresa via _idservicio
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
  // Servicio hasMany UsuarioServicio via _idservicio
  usuario_servicios!: UsuarioServicio[];
  getUsuario_servicios!: Sequelize.HasManyGetAssociationsMixin<UsuarioServicio>;
  setUsuario_servicios!: Sequelize.HasManySetAssociationsMixin<UsuarioServicio, UsuarioServicioId>;
  addUsuario_servicio!: Sequelize.HasManyAddAssociationMixin<UsuarioServicio, UsuarioServicioId>;
  addUsuario_servicios!: Sequelize.HasManyAddAssociationsMixin<UsuarioServicio, UsuarioServicioId>;
  createUsuario_servicio!: Sequelize.HasManyCreateAssociationMixin<UsuarioServicio>;
  removeUsuario_servicio!: Sequelize.HasManyRemoveAssociationMixin<UsuarioServicio, UsuarioServicioId>;
  removeUsuario_servicios!: Sequelize.HasManyRemoveAssociationsMixin<UsuarioServicio, UsuarioServicioId>;
  hasUsuario_servicio!: Sequelize.HasManyHasAssociationMixin<UsuarioServicio, UsuarioServicioId>;
  hasUsuario_servicios!: Sequelize.HasManyHasAssociationsMixin<UsuarioServicio, UsuarioServicioId>;
  countUsuario_servicios!: Sequelize.HasManyCountAssociationsMixin;
  // Servicio hasMany UsuarioServicioEmpresa via _idservicio
  usuario_servicio_empresas!: UsuarioServicioEmpresa[];
  getUsuario_servicio_empresas!: Sequelize.HasManyGetAssociationsMixin<UsuarioServicioEmpresa>;
  setUsuario_servicio_empresas!: Sequelize.HasManySetAssociationsMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  addUsuario_servicio_empresa!: Sequelize.HasManyAddAssociationMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  addUsuario_servicio_empresas!: Sequelize.HasManyAddAssociationsMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  createUsuario_servicio_empresa!: Sequelize.HasManyCreateAssociationMixin<UsuarioServicioEmpresa>;
  removeUsuario_servicio_empresa!: Sequelize.HasManyRemoveAssociationMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  removeUsuario_servicio_empresas!: Sequelize.HasManyRemoveAssociationsMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  hasUsuario_servicio_empresa!: Sequelize.HasManyHasAssociationMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  hasUsuario_servicio_empresas!: Sequelize.HasManyHasAssociationsMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  countUsuario_servicio_empresas!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Servicio {
    return Servicio.init({
    _idservicio: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    servicioid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_servicio_servicioid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_servicio_code"
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    urlcontrato: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    pathroute: {
      type: DataTypes.STRING(100),
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
    tableName: 'servicio',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idservicio" },
        ]
      },
      {
        name: "UQ_servicio_servicioid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "servicioid" },
        ]
      },
      {
        name: "UQ_servicio_code",
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
