import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { CuentaBancaria, CuentaBancariaId } from './CuentaBancaria.js';

export interface ArchivoCuentaBancariaAttributes {
  _idarchivo: number;
  _idcuentabancaria: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ArchivoCuentaBancariaPk = "_idarchivo" | "_idcuentabancaria";
export type ArchivoCuentaBancariaId = ArchivoCuentaBancaria[ArchivoCuentaBancariaPk];
export type ArchivoCuentaBancariaOptionalAttributes = "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ArchivoCuentaBancariaCreationAttributes = Optional<ArchivoCuentaBancariaAttributes, ArchivoCuentaBancariaOptionalAttributes>;

export class ArchivoCuentaBancaria extends Model<ArchivoCuentaBancariaAttributes, ArchivoCuentaBancariaCreationAttributes> implements ArchivoCuentaBancariaAttributes {
  _idarchivo!: number;
  _idcuentabancaria!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ArchivoCuentaBancaria belongsTo Archivo via _idarchivo
  archivo_archivo!: Archivo;
  get_idarchivo_archivo!: Sequelize.BelongsToGetAssociationMixin<Archivo>;
  set_idarchivo_archivo!: Sequelize.BelongsToSetAssociationMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo!: Sequelize.BelongsToCreateAssociationMixin<Archivo>;
  // ArchivoCuentaBancaria belongsTo CuentaBancaria via _idcuentabancaria
  cuentabancaria_cuenta_bancarium!: CuentaBancaria;
  get_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToGetAssociationMixin<CuentaBancaria>;
  set_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToSetAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  create_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToCreateAssociationMixin<CuentaBancaria>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ArchivoCuentaBancaria {
    return ArchivoCuentaBancaria.init({
    _idarchivo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'archivo',
        key: '_idarchivo'
      }
    },
    _idcuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'cuenta_bancaria',
        key: '_idcuentabancaria'
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
    tableName: 'archivo_cuenta_bancaria',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idarchivo" },
          { name: "_idcuentabancaria" },
        ]
      },
      {
        name: "FK_archivo_cuenta_bancaria_idcuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idcuentabancaria" },
        ]
      },
    ]
  });
  }
}
