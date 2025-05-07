import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { FactoringHistorialEstado, FactoringHistorialEstadoId } from './FactoringHistorialEstado.js';

export interface ArchivoFactoringHistorialEstadoAttributes {
  _idarchivo: number;
  _idfactoringhistorialestado: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ArchivoFactoringHistorialEstadoPk = "_idarchivo" | "_idfactoringhistorialestado";
export type ArchivoFactoringHistorialEstadoId = ArchivoFactoringHistorialEstado[ArchivoFactoringHistorialEstadoPk];
export type ArchivoFactoringHistorialEstadoOptionalAttributes = "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ArchivoFactoringHistorialEstadoCreationAttributes = Optional<ArchivoFactoringHistorialEstadoAttributes, ArchivoFactoringHistorialEstadoOptionalAttributes>;

export class ArchivoFactoringHistorialEstado extends Model<ArchivoFactoringHistorialEstadoAttributes, ArchivoFactoringHistorialEstadoCreationAttributes> implements ArchivoFactoringHistorialEstadoAttributes {
  _idarchivo!: number;
  _idfactoringhistorialestado!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // ArchivoFactoringHistorialEstado belongsTo Archivo via _idarchivo
  archivo_archivo!: Archivo;
  get_idarchivo_archivo!: Sequelize.BelongsToGetAssociationMixin<Archivo>;
  set_idarchivo_archivo!: Sequelize.BelongsToSetAssociationMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo!: Sequelize.BelongsToCreateAssociationMixin<Archivo>;
  // ArchivoFactoringHistorialEstado belongsTo FactoringHistorialEstado via _idfactoringhistorialestado
  factoringhistorialestado_factoring_historial_estado!: FactoringHistorialEstado;
  get_idfactoringhistorialestado_factoring_historial_estado!: Sequelize.BelongsToGetAssociationMixin<FactoringHistorialEstado>;
  set_idfactoringhistorialestado_factoring_historial_estado!: Sequelize.BelongsToSetAssociationMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  create_idfactoringhistorialestado_factoring_historial_estado!: Sequelize.BelongsToCreateAssociationMixin<FactoringHistorialEstado>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ArchivoFactoringHistorialEstado {
    return ArchivoFactoringHistorialEstado.init({
    _idarchivo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'archivo',
        key: '_idarchivo'
      }
    },
    _idfactoringhistorialestado: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'factoring_historial_estado',
        key: '_idfactoringhistorialestado'
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
    tableName: 'archivo_factoring_historial_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idarchivo" },
          { name: "_idfactoringhistorialestado" },
        ]
      },
      {
        name: "FK_archivo_factoring_historial_estado_idfactoringhistorialestado",
        using: "BTREE",
        fields: [
          { name: "_idfactoringhistorialestado" },
        ]
      },
    ]
  });
  }
}
