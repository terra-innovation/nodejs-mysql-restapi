import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Servicio, ServicioId } from './Servicio.js';
import type { Usuario, UsuarioId } from './Usuario.js';
import type { UsuarioServicioEstado, UsuarioServicioEstadoId } from './UsuarioServicioEstado.js';
import type { UsuarioServicioVerificacion, UsuarioServicioVerificacionId } from './UsuarioServicioVerificacion.js';

export interface UsuarioServicioAttributes {
  _idusuarioservicio: number;
  usuarioservicioid: string;
  code: string;
  _idusuario: number;
  _idservicio: number;
  _idusuarioservicioestado: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type UsuarioServicioPk = "_idusuarioservicio";
export type UsuarioServicioId = UsuarioServicio[UsuarioServicioPk];
export type UsuarioServicioOptionalAttributes = "_idusuarioservicio" | "usuarioservicioid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type UsuarioServicioCreationAttributes = Optional<UsuarioServicioAttributes, UsuarioServicioOptionalAttributes>;

export class UsuarioServicio extends Model<UsuarioServicioAttributes, UsuarioServicioCreationAttributes> implements UsuarioServicioAttributes {
  _idusuarioservicio!: number;
  usuarioservicioid!: string;
  code!: string;
  _idusuario!: number;
  _idservicio!: number;
  _idusuarioservicioestado!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // UsuarioServicio belongsTo Servicio via _idservicio
  servicio_servicio!: Servicio;
  get_idservicio_servicio!: Sequelize.BelongsToGetAssociationMixin<Servicio>;
  set_idservicio_servicio!: Sequelize.BelongsToSetAssociationMixin<Servicio, ServicioId>;
  create_idservicio_servicio!: Sequelize.BelongsToCreateAssociationMixin<Servicio>;
  // UsuarioServicio belongsTo Usuario via _idusuario
  usuario_usuario!: Usuario;
  get_idusuario_usuario!: Sequelize.BelongsToGetAssociationMixin<Usuario>;
  set_idusuario_usuario!: Sequelize.BelongsToSetAssociationMixin<Usuario, UsuarioId>;
  create_idusuario_usuario!: Sequelize.BelongsToCreateAssociationMixin<Usuario>;
  // UsuarioServicio hasMany UsuarioServicioVerificacion via _idusuarioservicio
  usuario_servicio_verificacions!: UsuarioServicioVerificacion[];
  getUsuario_servicio_verificacions!: Sequelize.HasManyGetAssociationsMixin<UsuarioServicioVerificacion>;
  setUsuario_servicio_verificacions!: Sequelize.HasManySetAssociationsMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  addUsuario_servicio_verificacion!: Sequelize.HasManyAddAssociationMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  addUsuario_servicio_verificacions!: Sequelize.HasManyAddAssociationsMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  createUsuario_servicio_verificacion!: Sequelize.HasManyCreateAssociationMixin<UsuarioServicioVerificacion>;
  removeUsuario_servicio_verificacion!: Sequelize.HasManyRemoveAssociationMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  removeUsuario_servicio_verificacions!: Sequelize.HasManyRemoveAssociationsMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  hasUsuario_servicio_verificacion!: Sequelize.HasManyHasAssociationMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  hasUsuario_servicio_verificacions!: Sequelize.HasManyHasAssociationsMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  countUsuario_servicio_verificacions!: Sequelize.HasManyCountAssociationsMixin;
  // UsuarioServicio belongsTo UsuarioServicioEstado via _idusuarioservicioestado
  usuarioservicioestado_usuario_servicio_estado!: UsuarioServicioEstado;
  get_idusuarioservicioestado_usuario_servicio_estado!: Sequelize.BelongsToGetAssociationMixin<UsuarioServicioEstado>;
  set_idusuarioservicioestado_usuario_servicio_estado!: Sequelize.BelongsToSetAssociationMixin<UsuarioServicioEstado, UsuarioServicioEstadoId>;
  create_idusuarioservicioestado_usuario_servicio_estado!: Sequelize.BelongsToCreateAssociationMixin<UsuarioServicioEstado>;

  static initModel(sequelize: Sequelize.Sequelize): typeof UsuarioServicio {
    return UsuarioServicio.init({
    _idusuarioservicio: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    usuarioservicioid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_usuarioservicio_usuarioservicioid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_usuarioservicio_code"
    },
    _idusuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    _idservicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'servicio',
        key: '_idservicio'
      }
    },
    _idusuarioservicioestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuario_servicio_estado',
        key: '_idusuarioservicioestado'
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
    tableName: 'usuario_servicio',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicio" },
        ]
      },
      {
        name: "UQ_usuarioservicio_usuarioservicioid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuarioservicioid" },
        ]
      },
      {
        name: "UQ_usuarioservicio_idusuario__idservicio",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
          { name: "_idservicio" },
        ]
      },
      {
        name: "UQ_usuarioservicio_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_usuarioservicio_idservicio",
        using: "BTREE",
        fields: [
          { name: "_idservicio" },
        ]
      },
      {
        name: "FK_usuarioservicio_idusuarioservicioestado",
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioestado" },
        ]
      },
    ]
  });
  }
}
