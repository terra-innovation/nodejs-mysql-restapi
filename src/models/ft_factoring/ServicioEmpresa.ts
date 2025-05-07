import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Empresa, EmpresaId } from './Empresa.js';
import type { Servicio, ServicioId } from './Servicio.js';
import type { ServicioEmpresaEstado, ServicioEmpresaEstadoId } from './ServicioEmpresaEstado.js';
import type { ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId } from './ServicioEmpresaVerificacion.js';
import type { Usuario, UsuarioId } from './Usuario.js';

export interface ServicioEmpresaAttributes {
  _idservicioempresa: number;
  servicioempresaid: string;
  code: string;
  _idservicio: number;
  _idempresa: number;
  _idusuariosuscriptor: number;
  _idservicioempresaestado: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ServicioEmpresaPk = "_idservicioempresa";
export type ServicioEmpresaId = ServicioEmpresa[ServicioEmpresaPk];
export type ServicioEmpresaOptionalAttributes = "_idservicioempresa" | "servicioempresaid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ServicioEmpresaCreationAttributes = Optional<ServicioEmpresaAttributes, ServicioEmpresaOptionalAttributes>;

export class ServicioEmpresa extends Model<ServicioEmpresaAttributes, ServicioEmpresaCreationAttributes> implements ServicioEmpresaAttributes {
  _idservicioempresa!: number;
  servicioempresaid!: string;
  code!: string;
  _idservicio!: number;
  _idempresa!: number;
  _idusuariosuscriptor!: number;
  _idservicioempresaestado!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ServicioEmpresa belongsTo Empresa via _idempresa
  empresa_empresa!: Empresa;
  get_idempresa_empresa!: Sequelize.BelongsToGetAssociationMixin<Empresa>;
  set_idempresa_empresa!: Sequelize.BelongsToSetAssociationMixin<Empresa, EmpresaId>;
  create_idempresa_empresa!: Sequelize.BelongsToCreateAssociationMixin<Empresa>;
  // ServicioEmpresa belongsTo Servicio via _idservicio
  servicio_servicio!: Servicio;
  get_idservicio_servicio!: Sequelize.BelongsToGetAssociationMixin<Servicio>;
  set_idservicio_servicio!: Sequelize.BelongsToSetAssociationMixin<Servicio, ServicioId>;
  create_idservicio_servicio!: Sequelize.BelongsToCreateAssociationMixin<Servicio>;
  // ServicioEmpresa hasMany ServicioEmpresaVerificacion via _idservicioempresa
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
  // ServicioEmpresa belongsTo ServicioEmpresaEstado via _idservicioempresaestado
  servicioempresaestado_servicio_empresa_estado!: ServicioEmpresaEstado;
  get_idservicioempresaestado_servicio_empresa_estado!: Sequelize.BelongsToGetAssociationMixin<ServicioEmpresaEstado>;
  set_idservicioempresaestado_servicio_empresa_estado!: Sequelize.BelongsToSetAssociationMixin<ServicioEmpresaEstado, ServicioEmpresaEstadoId>;
  create_idservicioempresaestado_servicio_empresa_estado!: Sequelize.BelongsToCreateAssociationMixin<ServicioEmpresaEstado>;
  // ServicioEmpresa belongsTo Usuario via _idusuariosuscriptor
  usuariosuscriptor_usuario!: Usuario;
  get_idusuariosuscriptor_usuario!: Sequelize.BelongsToGetAssociationMixin<Usuario>;
  set_idusuariosuscriptor_usuario!: Sequelize.BelongsToSetAssociationMixin<Usuario, UsuarioId>;
  create_idusuariosuscriptor_usuario!: Sequelize.BelongsToCreateAssociationMixin<Usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ServicioEmpresa {
    return ServicioEmpresa.init({
    _idservicioempresa: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    servicioempresaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_servicioempresa_servicioempresaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_servicioempresa_code"
    },
    _idservicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'servicio',
        key: '_idservicio'
      }
    },
    _idempresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa',
        key: '_idempresa'
      }
    },
    _idusuariosuscriptor: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    _idservicioempresaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'servicio_empresa_estado',
        key: '_idservicioempresaestado'
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
    tableName: 'servicio_empresa',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idservicioempresa" },
        ]
      },
      {
        name: "UQ_servicioempresa_idservicio__idempresa",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idservicio" },
          { name: "_idempresa" },
        ]
      },
      {
        name: "UQ_servicioempresa_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_servicioempresa_servicioempresaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "servicioempresaid" },
        ]
      },
      {
        name: "FK_servicioempresa_idempresa",
        using: "BTREE",
        fields: [
          { name: "_idempresa" },
        ]
      },
      {
        name: "FK_servicioempresa_idservicioempresaestado",
        using: "BTREE",
        fields: [
          { name: "_idservicioempresaestado" },
        ]
      },
      {
        name: "FK_servicioempresa_idusuariosuscriptor",
        using: "BTREE",
        fields: [
          { name: "_idusuariosuscriptor" },
        ]
      },
    ]
  });
  }
}
