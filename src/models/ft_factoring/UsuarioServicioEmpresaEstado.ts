import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { UsuarioServicioEmpresa, UsuarioServicioEmpresaId } from './UsuarioServicioEmpresa.js';

export interface UsuarioServicioEmpresaEstadoAttributes {
  _idusuarioservicioempresaestado: number;
  usuarioservicioempresaestadoid: string;
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

export type UsuarioServicioEmpresaEstadoPk = "_idusuarioservicioempresaestado";
export type UsuarioServicioEmpresaEstadoId = UsuarioServicioEmpresaEstado[UsuarioServicioEmpresaEstadoPk];
export type UsuarioServicioEmpresaEstadoOptionalAttributes = "usuarioservicioempresaestadoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type UsuarioServicioEmpresaEstadoCreationAttributes = Optional<UsuarioServicioEmpresaEstadoAttributes, UsuarioServicioEmpresaEstadoOptionalAttributes>;

export class UsuarioServicioEmpresaEstado extends Model<UsuarioServicioEmpresaEstadoAttributes, UsuarioServicioEmpresaEstadoCreationAttributes> implements UsuarioServicioEmpresaEstadoAttributes {
  _idusuarioservicioempresaestado!: number;
  usuarioservicioempresaestadoid!: string;
  code!: string;
  nombre!: string;
  alias!: string;
  color!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // UsuarioServicioEmpresaEstado hasMany UsuarioServicioEmpresa via _idusuarioservicioempresaestado
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

  static initModel(sequelize: Sequelize.Sequelize): typeof UsuarioServicioEmpresaEstado {
    return UsuarioServicioEmpresaEstado.init({
    _idusuarioservicioempresaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    usuarioservicioempresaestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_usuarioservicioempresaestado_usuarioservicioempresaestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_usuarioservicioempresaestado_code"
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
    tableName: 'usuario_servicio_empresa_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioempresaestado" },
        ]
      },
      {
        name: "UQ_usuarioservicioempresaestado_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_usuarioservicioempresaestado_usuarioservicioempresaestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuarioservicioempresaestadoid" },
        ]
      },
    ]
  });
  }
}
