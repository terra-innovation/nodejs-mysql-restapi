import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoCuenta, BancoCuentaId } from './BancoCuenta.js';
import type { Inversionista, InversionistaId } from './Inversionista.js';

export interface InversionistaBancoCuentaAttributes {
  _idinversionista: number;
  _idbancocuenta: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type InversionistaBancoCuentaPk = "_idinversionista" | "_idbancocuenta";
export type InversionistaBancoCuentaId = InversionistaBancoCuenta[InversionistaBancoCuentaPk];
export type InversionistaBancoCuentaOptionalAttributes = "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type InversionistaBancoCuentaCreationAttributes = Optional<InversionistaBancoCuentaAttributes, InversionistaBancoCuentaOptionalAttributes>;

export class InversionistaBancoCuenta extends Model<InversionistaBancoCuentaAttributes, InversionistaBancoCuentaCreationAttributes> implements InversionistaBancoCuentaAttributes {
  _idinversionista!: number;
  _idbancocuenta!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // InversionistaBancoCuenta belongsTo BancoCuenta via _idbancocuenta
  bancocuenta_banco_cuentum!: BancoCuenta;
  get_idbancocuenta_banco_cuentum!: Sequelize.BelongsToGetAssociationMixin<BancoCuenta>;
  set_idbancocuenta_banco_cuentum!: Sequelize.BelongsToSetAssociationMixin<BancoCuenta, BancoCuentaId>;
  create_idbancocuenta_banco_cuentum!: Sequelize.BelongsToCreateAssociationMixin<BancoCuenta>;
  // InversionistaBancoCuenta belongsTo Inversionista via _idinversionista
  inversionista_inversionistum!: Inversionista;
  get_idinversionista_inversionistum!: Sequelize.BelongsToGetAssociationMixin<Inversionista>;
  set_idinversionista_inversionistum!: Sequelize.BelongsToSetAssociationMixin<Inversionista, InversionistaId>;
  create_idinversionista_inversionistum!: Sequelize.BelongsToCreateAssociationMixin<Inversionista>;

  static initModel(sequelize: Sequelize.Sequelize): typeof InversionistaBancoCuenta {
    return InversionistaBancoCuenta.init({
    _idinversionista: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'inversionista',
        key: '_idinversionista'
      }
    },
    _idbancocuenta: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'banco_cuenta',
        key: '_idbancocuenta'
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
    tableName: 'inversionista_banco_cuenta',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idinversionista" },
          { name: "_idbancocuenta" },
        ]
      },
      {
        name: "FK_inversionistabancocuenta_idbancocuenta",
        using: "BTREE",
        fields: [
          { name: "_idbancocuenta" },
        ]
      },
    ]
  });
  }
}
