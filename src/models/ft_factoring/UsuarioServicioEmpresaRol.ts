import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { UsuarioServicioEmpresa, UsuarioServicioEmpresaId } from './UsuarioServicioEmpresa.js';

export interface UsuarioServicioEmpresaRolAttributes {
  _idusuarioservicioempresarol: number;
  usuarioservicioempresarolid: string;
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

export type UsuarioServicioEmpresaRolPk = "_idusuarioservicioempresarol";
export type UsuarioServicioEmpresaRolId = UsuarioServicioEmpresaRol[UsuarioServicioEmpresaRolPk];
export type UsuarioServicioEmpresaRolOptionalAttributes = "usuarioservicioempresarolid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type UsuarioServicioEmpresaRolCreationAttributes = Optional<UsuarioServicioEmpresaRolAttributes, UsuarioServicioEmpresaRolOptionalAttributes>;

export class UsuarioServicioEmpresaRol extends Model<UsuarioServicioEmpresaRolAttributes, UsuarioServicioEmpresaRolCreationAttributes> implements UsuarioServicioEmpresaRolAttributes {
  _idusuarioservicioempresarol!: number;
  usuarioservicioempresarolid!: string;
  code!: string;
  nombre!: string;
  alias!: string;
  color!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // UsuarioServicioEmpresaRol hasMany UsuarioServicioEmpresa via _idusuarioservicioempresarol
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

  static initModel(sequelize: Sequelize.Sequelize): typeof UsuarioServicioEmpresaRol {
    return UsuarioServicioEmpresaRol.init({
    _idusuarioservicioempresarol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    usuarioservicioempresarolid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_usuarioservicioempresarol_usuarioempresaserviciorolid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_usuarioservicioempresarol_code"
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
    tableName: 'usuario_servicio_empresa_rol',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioempresarol" },
        ]
      },
      {
        name: "UQ_usuarioservicioempresarol_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_usuarioservicioempresarol_usuarioempresaserviciorolid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuarioservicioempresarolid" },
        ]
      },
    ]
  });
  }
}
