import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { UsuarioServicio, UsuarioServicioId } from './UsuarioServicio.js';
import type { UsuarioServicioVerificacion, UsuarioServicioVerificacionId } from './UsuarioServicioVerificacion.js';

export interface UsuarioServicioEstadoAttributes {
  _idusuarioservicioestado: number;
  usuarioservicioestadoid: string;
  code: string;
  nombre: string;
  alias: string;
  color: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type UsuarioServicioEstadoPk = "_idusuarioservicioestado";
export type UsuarioServicioEstadoId = UsuarioServicioEstado[UsuarioServicioEstadoPk];
export type UsuarioServicioEstadoOptionalAttributes = "usuarioservicioestadoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type UsuarioServicioEstadoCreationAttributes = Optional<UsuarioServicioEstadoAttributes, UsuarioServicioEstadoOptionalAttributes>;

export class UsuarioServicioEstado extends Model<UsuarioServicioEstadoAttributes, UsuarioServicioEstadoCreationAttributes> implements UsuarioServicioEstadoAttributes {
  _idusuarioservicioestado!: number;
  usuarioservicioestadoid!: string;
  code!: string;
  nombre!: string;
  alias!: string;
  color!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // UsuarioServicioEstado hasMany UsuarioServicio via _idusuarioservicioestado
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
  // UsuarioServicioEstado hasMany UsuarioServicioVerificacion via _idusuarioservicioestado
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

  static initModel(sequelize: Sequelize.Sequelize): typeof UsuarioServicioEstado {
    return UsuarioServicioEstado.init({
    _idusuarioservicioestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    usuarioservicioestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_usuarioservicioestado_usuarioservicioestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_usuarioservicioestado_code"
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
    tableName: 'usuario_servicio_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioestado" },
        ]
      },
      {
        name: "UQ_usuarioservicioestado_usuarioservicioestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuarioservicioestadoid" },
        ]
      },
      {
        name: "UQ_usuarioservicioestado_code",
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
