import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Factura, FacturaId } from './Factura.js';

export interface FacturaImpuestoAttributes {
  _idfacturaimpuesto: number;
  facturaimpuestoid: string;
  _idfactura: number;
  id?: string;
  codigo_sunat?: string;
  nombre?: string;
  porcentaje?: number;
  base_imponible?: number;
  monto?: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FacturaImpuestoPk = "_idfacturaimpuesto";
export type FacturaImpuestoId = FacturaImpuesto[FacturaImpuestoPk];
export type FacturaImpuestoOptionalAttributes = "_idfacturaimpuesto" | "facturaimpuestoid" | "id" | "codigo_sunat" | "nombre" | "porcentaje" | "base_imponible" | "monto" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FacturaImpuestoCreationAttributes = Optional<FacturaImpuestoAttributes, FacturaImpuestoOptionalAttributes>;

export class FacturaImpuesto extends Model<FacturaImpuestoAttributes, FacturaImpuestoCreationAttributes> implements FacturaImpuestoAttributes {
  _idfacturaimpuesto!: number;
  facturaimpuestoid!: string;
  _idfactura!: number;
  id?: string;
  codigo_sunat?: string;
  nombre?: string;
  porcentaje?: number;
  base_imponible?: number;
  monto?: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FacturaImpuesto belongsTo Factura via _idfactura
  factura_factura!: Factura;
  get_idfactura_factura!: Sequelize.BelongsToGetAssociationMixin<Factura>;
  set_idfactura_factura!: Sequelize.BelongsToSetAssociationMixin<Factura, FacturaId>;
  create_idfactura_factura!: Sequelize.BelongsToCreateAssociationMixin<Factura>;

  static initModel(sequelize: Sequelize.Sequelize): typeof FacturaImpuesto {
    return FacturaImpuesto.init({
    _idfacturaimpuesto: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    facturaimpuestoid: {
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
      type: DataTypes.STRING(200),
      allowNull: true
    },
    codigo_sunat: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    porcentaje: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    base_imponible: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    monto: {
      type: DataTypes.DECIMAL(12,2),
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
    tableName: 'factura_impuesto',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfacturaimpuesto" },
        ]
      },
      {
        name: "FK_factura_impuesto_idfactura",
        using: "BTREE",
        fields: [
          { name: "_idfactura" },
        ]
      },
    ]
  });
  }
}
