import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ZlaboratorioUsuario, ZlaboratorioUsuarioId } from './ZlaboratorioUsuario.js';

export interface ZlaboratorioPedidoAttributes {
  _idperdido: number;
  _idusuario: number;
  nombre: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ZlaboratorioPedidoPk = "_idperdido";
export type ZlaboratorioPedidoId = ZlaboratorioPedido[ZlaboratorioPedidoPk];
export type ZlaboratorioPedidoOptionalAttributes = "_idperdido" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ZlaboratorioPedidoCreationAttributes = Optional<ZlaboratorioPedidoAttributes, ZlaboratorioPedidoOptionalAttributes>;

export class ZlaboratorioPedido extends Model<ZlaboratorioPedidoAttributes, ZlaboratorioPedidoCreationAttributes> implements ZlaboratorioPedidoAttributes {
  _idperdido!: number;
  _idusuario!: number;
  nombre!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ZlaboratorioPedido belongsTo ZlaboratorioUsuario via _idusuario
  usuario_zlaboratorio_usuario!: ZlaboratorioUsuario;
  get_idusuario_zlaboratorio_usuario!: Sequelize.BelongsToGetAssociationMixin<ZlaboratorioUsuario>;
  set_idusuario_zlaboratorio_usuario!: Sequelize.BelongsToSetAssociationMixin<ZlaboratorioUsuario, ZlaboratorioUsuarioId>;
  create_idusuario_zlaboratorio_usuario!: Sequelize.BelongsToCreateAssociationMixin<ZlaboratorioUsuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ZlaboratorioPedido {
    return ZlaboratorioPedido.init({
    _idperdido: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    _idusuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'zlaboratorio_usuario',
        key: '_idusuario'
      }
    },
    nombre: {
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
    tableName: 'zlaboratorio_pedido',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idperdido" },
        ]
      },
      {
        name: "FK_zlaboratorio_pedido__idusuario",
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
        ]
      },
    ]
  });
  }
}
