import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ZlaboratorioPedido, ZlaboratorioPedidoId } from './ZlaboratorioPedido.js';

export interface ZlaboratorioUsuarioAttributes {
  _idusuario: number;
  nombre: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ZlaboratorioUsuarioPk = "_idusuario";
export type ZlaboratorioUsuarioId = ZlaboratorioUsuario[ZlaboratorioUsuarioPk];
export type ZlaboratorioUsuarioOptionalAttributes = "_idusuario" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ZlaboratorioUsuarioCreationAttributes = Optional<ZlaboratorioUsuarioAttributes, ZlaboratorioUsuarioOptionalAttributes>;

export class ZlaboratorioUsuario extends Model<ZlaboratorioUsuarioAttributes, ZlaboratorioUsuarioCreationAttributes> implements ZlaboratorioUsuarioAttributes {
  _idusuario!: number;
  nombre!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ZlaboratorioUsuario hasMany ZlaboratorioPedido via _idusuario
  zlaboratorio_pedidos!: ZlaboratorioPedido[];
  getZlaboratorio_pedidos!: Sequelize.HasManyGetAssociationsMixin<ZlaboratorioPedido>;
  setZlaboratorio_pedidos!: Sequelize.HasManySetAssociationsMixin<ZlaboratorioPedido, ZlaboratorioPedidoId>;
  addZlaboratorio_pedido!: Sequelize.HasManyAddAssociationMixin<ZlaboratorioPedido, ZlaboratorioPedidoId>;
  addZlaboratorio_pedidos!: Sequelize.HasManyAddAssociationsMixin<ZlaboratorioPedido, ZlaboratorioPedidoId>;
  createZlaboratorio_pedido!: Sequelize.HasManyCreateAssociationMixin<ZlaboratorioPedido>;
  removeZlaboratorio_pedido!: Sequelize.HasManyRemoveAssociationMixin<ZlaboratorioPedido, ZlaboratorioPedidoId>;
  removeZlaboratorio_pedidos!: Sequelize.HasManyRemoveAssociationsMixin<ZlaboratorioPedido, ZlaboratorioPedidoId>;
  hasZlaboratorio_pedido!: Sequelize.HasManyHasAssociationMixin<ZlaboratorioPedido, ZlaboratorioPedidoId>;
  hasZlaboratorio_pedidos!: Sequelize.HasManyHasAssociationsMixin<ZlaboratorioPedido, ZlaboratorioPedidoId>;
  countZlaboratorio_pedidos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ZlaboratorioUsuario {
    return ZlaboratorioUsuario.init({
    _idusuario: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
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
    tableName: 'zlaboratorio_usuario',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
        ]
      },
    ]
  });
  }
}
