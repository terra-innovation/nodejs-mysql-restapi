import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ServicioEmpresa, ServicioEmpresaId } from './ServicioEmpresa.js';
import type { ServicioEmpresaEstado, ServicioEmpresaEstadoId } from './ServicioEmpresaEstado.js';
import type { Usuario, UsuarioId } from './Usuario.js';

export interface ServicioEmpresaVerificacionAttributes {
  _idservicioempresaverificacion: number;
  servicioempresaverificacionid: string;
  _idservicioempresa: number;
  _idservicioempresaestado: number;
  _idusuarioverifica: number;
  comentariousuario: string;
  comentariointerno: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ServicioEmpresaVerificacionPk = "_idservicioempresaverificacion";
export type ServicioEmpresaVerificacionId = ServicioEmpresaVerificacion[ServicioEmpresaVerificacionPk];
export type ServicioEmpresaVerificacionOptionalAttributes = "_idservicioempresaverificacion" | "servicioempresaverificacionid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ServicioEmpresaVerificacionCreationAttributes = Optional<ServicioEmpresaVerificacionAttributes, ServicioEmpresaVerificacionOptionalAttributes>;

export class ServicioEmpresaVerificacion extends Model<ServicioEmpresaVerificacionAttributes, ServicioEmpresaVerificacionCreationAttributes> implements ServicioEmpresaVerificacionAttributes {
  _idservicioempresaverificacion!: number;
  servicioempresaverificacionid!: string;
  _idservicioempresa!: number;
  _idservicioempresaestado!: number;
  _idusuarioverifica!: number;
  comentariousuario!: string;
  comentariointerno!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ServicioEmpresaVerificacion belongsTo ServicioEmpresa via _idservicioempresa
  servicioempresa_servicio_empresa!: ServicioEmpresa;
  get_idservicioempresa_servicio_empresa!: Sequelize.BelongsToGetAssociationMixin<ServicioEmpresa>;
  set_idservicioempresa_servicio_empresa!: Sequelize.BelongsToSetAssociationMixin<ServicioEmpresa, ServicioEmpresaId>;
  create_idservicioempresa_servicio_empresa!: Sequelize.BelongsToCreateAssociationMixin<ServicioEmpresa>;
  // ServicioEmpresaVerificacion belongsTo ServicioEmpresaEstado via _idservicioempresaestado
  servicioempresaestado_servicio_empresa_estado!: ServicioEmpresaEstado;
  get_idservicioempresaestado_servicio_empresa_estado!: Sequelize.BelongsToGetAssociationMixin<ServicioEmpresaEstado>;
  set_idservicioempresaestado_servicio_empresa_estado!: Sequelize.BelongsToSetAssociationMixin<ServicioEmpresaEstado, ServicioEmpresaEstadoId>;
  create_idservicioempresaestado_servicio_empresa_estado!: Sequelize.BelongsToCreateAssociationMixin<ServicioEmpresaEstado>;
  // ServicioEmpresaVerificacion belongsTo Usuario via _idusuarioverifica
  usuarioverifica_usuario!: Usuario;
  get_idusuarioverifica_usuario!: Sequelize.BelongsToGetAssociationMixin<Usuario>;
  set_idusuarioverifica_usuario!: Sequelize.BelongsToSetAssociationMixin<Usuario, UsuarioId>;
  create_idusuarioverifica_usuario!: Sequelize.BelongsToCreateAssociationMixin<Usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ServicioEmpresaVerificacion {
    return ServicioEmpresaVerificacion.init({
    _idservicioempresaverificacion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    servicioempresaverificacionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_servicioempresaverificacion_servicioempresaverificacionid"
    },
    _idservicioempresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'servicio_empresa',
        key: '_idservicioempresa'
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
    _idusuarioverifica: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    comentariousuario: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    comentariointerno: {
      type: DataTypes.TEXT,
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
    tableName: 'servicio_empresa_verificacion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idservicioempresaverificacion" },
        ]
      },
      {
        name: "UQ_servicioempresaverificacion_servicioempresaverificacionid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "servicioempresaverificacionid" },
        ]
      },
      {
        name: "FK_servicioempresaverificacion_idservicioempresaestado",
        using: "BTREE",
        fields: [
          { name: "_idservicioempresaestado" },
        ]
      },
      {
        name: "FK_servicioempresaverificacion_idusuarioverifica",
        using: "BTREE",
        fields: [
          { name: "_idusuarioverifica" },
        ]
      },
      {
        name: "FK_servicioempresaverificacion_idservicioempresa",
        using: "BTREE",
        fields: [
          { name: "_idservicioempresa" },
        ]
      },
    ]
  });
  }
}
