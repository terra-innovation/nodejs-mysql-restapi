import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Usuario, UsuarioId } from './Usuario.js';
import type { UsuarioServicio, UsuarioServicioId } from './UsuarioServicio.js';
import type { UsuarioServicioEstado, UsuarioServicioEstadoId } from './UsuarioServicioEstado.js';

export interface UsuarioServicioVerificacionAttributes {
  _idusuarioservicioverificacion: number;
  usuarioservicioverificacionid: string;
  _idusuarioservicio: number;
  _idusuarioservicioestado: number;
  _idusuarioverifica: number;
  comentariousuario: string;
  comentariointerno: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type UsuarioServicioVerificacionPk = "_idusuarioservicioverificacion";
export type UsuarioServicioVerificacionId = UsuarioServicioVerificacion[UsuarioServicioVerificacionPk];
export type UsuarioServicioVerificacionOptionalAttributes = "_idusuarioservicioverificacion" | "usuarioservicioverificacionid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type UsuarioServicioVerificacionCreationAttributes = Optional<UsuarioServicioVerificacionAttributes, UsuarioServicioVerificacionOptionalAttributes>;

export class UsuarioServicioVerificacion extends Model<UsuarioServicioVerificacionAttributes, UsuarioServicioVerificacionCreationAttributes> implements UsuarioServicioVerificacionAttributes {
  _idusuarioservicioverificacion!: number;
  usuarioservicioverificacionid!: string;
  _idusuarioservicio!: number;
  _idusuarioservicioestado!: number;
  _idusuarioverifica!: number;
  comentariousuario!: string;
  comentariointerno!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // UsuarioServicioVerificacion belongsTo Usuario via _idusuarioverifica
  usuarioverifica_usuario!: Usuario;
  get_idusuarioverifica_usuario!: Sequelize.BelongsToGetAssociationMixin<Usuario>;
  set_idusuarioverifica_usuario!: Sequelize.BelongsToSetAssociationMixin<Usuario, UsuarioId>;
  create_idusuarioverifica_usuario!: Sequelize.BelongsToCreateAssociationMixin<Usuario>;
  // UsuarioServicioVerificacion belongsTo UsuarioServicio via _idusuarioservicio
  usuarioservicio_usuario_servicio!: UsuarioServicio;
  get_idusuarioservicio_usuario_servicio!: Sequelize.BelongsToGetAssociationMixin<UsuarioServicio>;
  set_idusuarioservicio_usuario_servicio!: Sequelize.BelongsToSetAssociationMixin<UsuarioServicio, UsuarioServicioId>;
  create_idusuarioservicio_usuario_servicio!: Sequelize.BelongsToCreateAssociationMixin<UsuarioServicio>;
  // UsuarioServicioVerificacion belongsTo UsuarioServicioEstado via _idusuarioservicioestado
  usuarioservicioestado_usuario_servicio_estado!: UsuarioServicioEstado;
  get_idusuarioservicioestado_usuario_servicio_estado!: Sequelize.BelongsToGetAssociationMixin<UsuarioServicioEstado>;
  set_idusuarioservicioestado_usuario_servicio_estado!: Sequelize.BelongsToSetAssociationMixin<UsuarioServicioEstado, UsuarioServicioEstadoId>;
  create_idusuarioservicioestado_usuario_servicio_estado!: Sequelize.BelongsToCreateAssociationMixin<UsuarioServicioEstado>;

  static initModel(sequelize: Sequelize.Sequelize): typeof UsuarioServicioVerificacion {
    return UsuarioServicioVerificacion.init({
    _idusuarioservicioverificacion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    usuarioservicioverificacionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_usuarioservicioverificacion_usuarioservicioverificacionid"
    },
    _idusuarioservicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuario_servicio',
        key: '_idusuarioservicio'
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
    tableName: 'usuario_servicio_verificacion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioverificacion" },
        ]
      },
      {
        name: "UQ_usuarioservicioverificacion_usuarioservicioverificacionid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuarioservicioverificacionid" },
        ]
      },
      {
        name: "FK_usuarioservicioverificacion_idusuarioservicioestado",
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioestado" },
        ]
      },
      {
        name: "FK_usuarioservicioverificacion_idusuarioverifica",
        using: "BTREE",
        fields: [
          { name: "_idusuarioverifica" },
        ]
      },
      {
        name: "FK_usuarioservicioverificacion_idusuarioservicio",
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicio" },
        ]
      },
    ]
  });
  }
}
