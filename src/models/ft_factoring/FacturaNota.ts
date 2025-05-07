import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Factura, FacturaId } from './Factura.js';

export interface FacturaNotaAttributes {
  _idfacturanota: number;
  facturanotaid: string;
  _idfactura: number;
  id?: string;
  descripcion?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FacturaNotaPk = "_idfacturanota";
export type FacturaNotaId = FacturaNota[FacturaNotaPk];
export type FacturaNotaOptionalAttributes = "_idfacturanota" | "facturanotaid" | "id" | "descripcion" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FacturaNotaCreationAttributes = Optional<FacturaNotaAttributes, FacturaNotaOptionalAttributes>;

export class FacturaNota extends Model<FacturaNotaAttributes, FacturaNotaCreationAttributes> implements FacturaNotaAttributes {
  _idfacturanota!: number;
  facturanotaid!: string;
  _idfactura!: number;
  id?: string;
  descripcion?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FacturaNota belongsTo Factura via _idfactura
  factura_factura!: Factura;
  get_idfactura_factura!: Sequelize.BelongsToGetAssociationMixin<Factura>;
  set_idfactura_factura!: Sequelize.BelongsToSetAssociationMixin<Factura, FacturaId>;
  create_idfactura_factura!: Sequelize.BelongsToCreateAssociationMixin<Factura>;

  static initModel(sequelize: Sequelize.Sequelize): typeof FacturaNota {
    return FacturaNota.init({
    _idfacturanota: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    facturanotaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    _idfactura: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'factura',
        key: '_idfactura'
      }
    },
    id: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'factura_nota',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfacturanota" },
        ]
      },
      {
        name: "FK_factura_item_idfactura",
        using: "BTREE",
        fields: [
          { name: "_idfactura" },
        ]
      },
    ]
  });
  }
}
