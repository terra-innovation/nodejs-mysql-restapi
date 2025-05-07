import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Empresa, EmpresaId } from './Empresa.js';
import type { Servicio, ServicioId } from './Servicio.js';
import type { Usuario, UsuarioId } from './Usuario.js';
import type { UsuarioServicioEmpresaEstado, UsuarioServicioEmpresaEstadoId } from './UsuarioServicioEmpresaEstado.js';
import type { UsuarioServicioEmpresaRol, UsuarioServicioEmpresaRolId } from './UsuarioServicioEmpresaRol.js';

export interface UsuarioServicioEmpresaAttributes {
  _idusuarioservicioempresa: number;
  usuarioservicioempresaid: string;
  code: string;
  _idusuario: number;
  _idempresa: number;
  _idservicio: number;
  _idusuarioservicioempresaestado: number;
  _idusuarioservicioempresarol: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type UsuarioServicioEmpresaPk = "_idusuarioservicioempresa";
export type UsuarioServicioEmpresaId = UsuarioServicioEmpresa[UsuarioServicioEmpresaPk];
export type UsuarioServicioEmpresaOptionalAttributes = "_idusuarioservicioempresa" | "usuarioservicioempresaid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type UsuarioServicioEmpresaCreationAttributes = Optional<UsuarioServicioEmpresaAttributes, UsuarioServicioEmpresaOptionalAttributes>;

export class UsuarioServicioEmpresa extends Model<UsuarioServicioEmpresaAttributes, UsuarioServicioEmpresaCreationAttributes> implements UsuarioServicioEmpresaAttributes {
  _idusuarioservicioempresa!: number;
  usuarioservicioempresaid!: string;
  code!: string;
  _idusuario!: number;
  _idempresa!: number;
  _idservicio!: number;
  _idusuarioservicioempresaestado!: number;
  _idusuarioservicioempresarol!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // UsuarioServicioEmpresa belongsTo Empresa via _idempresa
  empresa_empresa!: Empresa;
  get_idempresa_empresa!: Sequelize.BelongsToGetAssociationMixin<Empresa>;
  set_idempresa_empresa!: Sequelize.BelongsToSetAssociationMixin<Empresa, EmpresaId>;
  create_idempresa_empresa!: Sequelize.BelongsToCreateAssociationMixin<Empresa>;
  // UsuarioServicioEmpresa belongsTo Servicio via _idservicio
  servicio_servicio!: Servicio;
  get_idservicio_servicio!: Sequelize.BelongsToGetAssociationMixin<Servicio>;
  set_idservicio_servicio!: Sequelize.BelongsToSetAssociationMixin<Servicio, ServicioId>;
  create_idservicio_servicio!: Sequelize.BelongsToCreateAssociationMixin<Servicio>;
  // UsuarioServicioEmpresa belongsTo Usuario via _idusuario
  usuario_usuario!: Usuario;
  get_idusuario_usuario!: Sequelize.BelongsToGetAssociationMixin<Usuario>;
  set_idusuario_usuario!: Sequelize.BelongsToSetAssociationMixin<Usuario, UsuarioId>;
  create_idusuario_usuario!: Sequelize.BelongsToCreateAssociationMixin<Usuario>;
  // UsuarioServicioEmpresa belongsTo UsuarioServicioEmpresaEstado via _idusuarioservicioempresaestado
  usuarioservicioempresaestado_usuario_servicio_empresa_estado!: UsuarioServicioEmpresaEstado;
  get_idusuarioservicioempresaestado_usuario_servicio_empresa_estado!: Sequelize.BelongsToGetAssociationMixin<UsuarioServicioEmpresaEstado>;
  set_idusuarioservicioempresaestado_usuario_servicio_empresa_estado!: Sequelize.BelongsToSetAssociationMixin<UsuarioServicioEmpresaEstado, UsuarioServicioEmpresaEstadoId>;
  create_idusuarioservicioempresaestado_usuario_servicio_empresa_estado!: Sequelize.BelongsToCreateAssociationMixin<UsuarioServicioEmpresaEstado>;
  // UsuarioServicioEmpresa belongsTo UsuarioServicioEmpresaRol via _idusuarioservicioempresarol
  usuarioservicioempresarol_usuario_servicio_empresa_rol!: UsuarioServicioEmpresaRol;
  get_idusuarioservicioempresarol_usuario_servicio_empresa_rol!: Sequelize.BelongsToGetAssociationMixin<UsuarioServicioEmpresaRol>;
  set_idusuarioservicioempresarol_usuario_servicio_empresa_rol!: Sequelize.BelongsToSetAssociationMixin<UsuarioServicioEmpresaRol, UsuarioServicioEmpresaRolId>;
  create_idusuarioservicioempresarol_usuario_servicio_empresa_rol!: Sequelize.BelongsToCreateAssociationMixin<UsuarioServicioEmpresaRol>;

  static initModel(sequelize: Sequelize.Sequelize): typeof UsuarioServicioEmpresa {
    return UsuarioServicioEmpresa.init({
    _idusuarioservicioempresa: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    usuarioservicioempresaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_usuarioservicioempresa_usuarioempresaservicioid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_usuarioservicioempresa_code"
    },
    _idusuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
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
    _idservicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'servicio',
        key: '_idservicio'
      }
    },
    _idusuarioservicioempresaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuario_servicio_empresa_estado',
        key: '_idusuarioservicioempresaestado'
      }
    },
    _idusuarioservicioempresarol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuario_servicio_empresa_rol',
        key: '_idusuarioservicioempresarol'
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
    tableName: 'usuario_servicio_empresa',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioempresa" },
        ]
      },
      {
        name: "UQ_usuarioservicioempresa_idusuario__idempresa__idservicio",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
          { name: "_idempresa" },
          { name: "_idservicio" },
        ]
      },
      {
        name: "UQ_usuarioservicioempresa_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_usuarioservicioempresa_usuarioempresaservicioid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuarioservicioempresaid" },
        ]
      },
      {
        name: "FK_usuarioservicioempresa_idempresa",
        using: "BTREE",
        fields: [
          { name: "_idempresa" },
        ]
      },
      {
        name: "FK_usuarioservicioempresa_idservicio",
        using: "BTREE",
        fields: [
          { name: "_idservicio" },
        ]
      },
      {
        name: "FK_usuarioservicioempresa_idusuarioempresaservicioestado",
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioempresaestado" },
        ]
      },
      {
        name: "FK_usuarioservicioempresa_idusuarioservicioempresarol",
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioempresarol" },
        ]
      },
    ]
  });
  }
}
