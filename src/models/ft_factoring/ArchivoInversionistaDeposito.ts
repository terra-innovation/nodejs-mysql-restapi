import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { InversionistaDeposito, InversionistaDepositoId } from './InversionistaDeposito.js';

export interface ArchivoInversionistaDepositoAttributes {
  _idarchivo: number;
  _idinversionistadeposito: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ArchivoInversionistaDepositoPk = "_idarchivo" | "_idinversionistadeposito";
export type ArchivoInversionistaDepositoId = ArchivoInversionistaDeposito[ArchivoInversionistaDepositoPk];
export type ArchivoInversionistaDepositoOptionalAttributes = "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ArchivoInversionistaDepositoCreationAttributes = Optional<ArchivoInversionistaDepositoAttributes, ArchivoInversionistaDepositoOptionalAttributes>;

export class ArchivoInversionistaDeposito extends Model<ArchivoInversionistaDepositoAttributes, ArchivoInversionistaDepositoCreationAttributes> implements ArchivoInversionistaDepositoAttributes {
  _idarchivo!: number;
  _idinversionistadeposito!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ArchivoInversionistaDeposito belongsTo Archivo via _idarchivo
  archivo_archivo!: Archivo;
  get_idarchivo_archivo!: Sequelize.BelongsToGetAssociationMixin<Archivo>;
  set_idarchivo_archivo!: Sequelize.BelongsToSetAssociationMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo!: Sequelize.BelongsToCreateAssociationMixin<Archivo>;
  // ArchivoInversionistaDeposito belongsTo InversionistaDeposito via _idinversionistadeposito
  inversionistadeposito_inversionista_deposito!: InversionistaDeposito;
  get_idinversionistadeposito_inversionista_deposito!: Sequelize.BelongsToGetAssociationMixin<InversionistaDeposito>;
  set_idinversionistadeposito_inversionista_deposito!: Sequelize.BelongsToSetAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  create_idinversionistadeposito_inversionista_deposito!: Sequelize.BelongsToCreateAssociationMixin<InversionistaDeposito>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ArchivoInversionistaDeposito {
    return ArchivoInversionistaDeposito.init({
    _idarchivo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'archivo',
        key: '_idarchivo'
      }
    },
    _idinversionistadeposito: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'inversionista_deposito',
        key: '_idinversionistadeposito'
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
    tableName: 'archivo_inversionista_deposito',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idarchivo" },
          { name: "_idinversionistadeposito" },
        ]
      },
      {
        name: "FK_archivobancodeposito_idbancodeposito",
        using: "BTREE",
        fields: [
          { name: "_idinversionistadeposito" },
        ]
      },
    ]
  });
  }
}
