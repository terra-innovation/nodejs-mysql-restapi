import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId } from './ArchivoFactoringHistorialEstado.js';
import type { Factoring, FactoringId } from './Factoring.js';
import type { FactoringEstado, FactoringEstadoId } from './FactoringEstado.js';
import type { Usuario, UsuarioId } from './Usuario.js';

export interface FactoringHistorialEstadoAttributes {
  _idfactoringhistorialestado: number;
  factoringhistorialestadoid: string;
  code: string;
  _idfactoring: number;
  _idfactoringestado: number;
  _idusuariomodifica: number;
  comentario: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactoringHistorialEstadoPk = "_idfactoringhistorialestado";
export type FactoringHistorialEstadoId = FactoringHistorialEstado[FactoringHistorialEstadoPk];
export type FactoringHistorialEstadoOptionalAttributes = "_idfactoringhistorialestado" | "factoringhistorialestadoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringHistorialEstadoCreationAttributes = Optional<FactoringHistorialEstadoAttributes, FactoringHistorialEstadoOptionalAttributes>;

export class FactoringHistorialEstado extends Model<FactoringHistorialEstadoAttributes, FactoringHistorialEstadoCreationAttributes> implements FactoringHistorialEstadoAttributes {
  _idfactoringhistorialestado!: number;
  factoringhistorialestadoid!: string;
  code!: string;
  _idfactoring!: number;
  _idfactoringestado!: number;
  _idusuariomodifica!: number;
  comentario!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringHistorialEstado belongsTo Factoring via _idfactoring
  factoring_factoring!: Factoring;
  get_idfactoring_factoring!: Sequelize.BelongsToGetAssociationMixin<Factoring>;
  set_idfactoring_factoring!: Sequelize.BelongsToSetAssociationMixin<Factoring, FactoringId>;
  create_idfactoring_factoring!: Sequelize.BelongsToCreateAssociationMixin<Factoring>;
  // FactoringHistorialEstado belongsTo FactoringEstado via _idfactoringestado
  factoringestado_factoring_estado!: FactoringEstado;
  get_idfactoringestado_factoring_estado!: Sequelize.BelongsToGetAssociationMixin<FactoringEstado>;
  set_idfactoringestado_factoring_estado!: Sequelize.BelongsToSetAssociationMixin<FactoringEstado, FactoringEstadoId>;
  create_idfactoringestado_factoring_estado!: Sequelize.BelongsToCreateAssociationMixin<FactoringEstado>;
  // FactoringHistorialEstado belongsToMany Archivo via _idfactoringhistorialestado and _idarchivo
  archivo_archivo_archivo_factoring_historial_estados!: Archivo[];
  get_idarchivo_archivo_archivo_factoring_historial_estados!: Sequelize.BelongsToManyGetAssociationsMixin<Archivo>;
  set_idarchivo_archivo_archivo_factoring_historial_estados!: Sequelize.BelongsToManySetAssociationsMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_factoring_historial_estado!: Sequelize.BelongsToManyAddAssociationMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_factoring_historial_estados!: Sequelize.BelongsToManyAddAssociationsMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo_archivo_factoring_historial_estado!: Sequelize.BelongsToManyCreateAssociationMixin<Archivo>;
  remove_idarchivo_archivo_archivo_factoring_historial_estado!: Sequelize.BelongsToManyRemoveAssociationMixin<Archivo, ArchivoId>;
  remove_idarchivo_archivo_archivo_factoring_historial_estados!: Sequelize.BelongsToManyRemoveAssociationsMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_factoring_historial_estado!: Sequelize.BelongsToManyHasAssociationMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_factoring_historial_estados!: Sequelize.BelongsToManyHasAssociationsMixin<Archivo, ArchivoId>;
  count_idarchivo_archivo_archivo_factoring_historial_estados!: Sequelize.BelongsToManyCountAssociationsMixin;
  // FactoringHistorialEstado hasMany ArchivoFactoringHistorialEstado via _idfactoringhistorialestado
  archivo_factoring_historial_estados!: ArchivoFactoringHistorialEstado[];
  getArchivo_factoring_historial_estados!: Sequelize.HasManyGetAssociationsMixin<ArchivoFactoringHistorialEstado>;
  setArchivo_factoring_historial_estados!: Sequelize.HasManySetAssociationsMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  addArchivo_factoring_historial_estado!: Sequelize.HasManyAddAssociationMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  addArchivo_factoring_historial_estados!: Sequelize.HasManyAddAssociationsMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  createArchivo_factoring_historial_estado!: Sequelize.HasManyCreateAssociationMixin<ArchivoFactoringHistorialEstado>;
  removeArchivo_factoring_historial_estado!: Sequelize.HasManyRemoveAssociationMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  removeArchivo_factoring_historial_estados!: Sequelize.HasManyRemoveAssociationsMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  hasArchivo_factoring_historial_estado!: Sequelize.HasManyHasAssociationMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  hasArchivo_factoring_historial_estados!: Sequelize.HasManyHasAssociationsMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  countArchivo_factoring_historial_estados!: Sequelize.HasManyCountAssociationsMixin;
  // FactoringHistorialEstado belongsTo Usuario via _idusuariomodifica
  usuariomodifica_usuario!: Usuario;
  get_idusuariomodifica_usuario!: Sequelize.BelongsToGetAssociationMixin<Usuario>;
  set_idusuariomodifica_usuario!: Sequelize.BelongsToSetAssociationMixin<Usuario, UsuarioId>;
  create_idusuariomodifica_usuario!: Sequelize.BelongsToCreateAssociationMixin<Usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringHistorialEstado {
    return FactoringHistorialEstado.init({
    _idfactoringhistorialestado: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    factoringhistorialestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoringhistorialestado_factoringhistorialestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factoringhistorialestado_code"
    },
    _idfactoring: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'factoring',
        key: '_idfactoring'
      }
    },
    _idfactoringestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'factoring_estado',
        key: '_idfactoringestado'
      }
    },
    _idusuariomodifica: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    comentario: {
      type: DataTypes.TEXT,
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
    tableName: 'factoring_historial_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringhistorialestado" },
        ]
      },
      {
        name: "UQ_factoringhistorialestado_factoringhistorialestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringhistorialestadoid" },
        ]
      },
      {
        name: "UQ_factoringhistorialestado_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factoringhistorialestado_idfactoting",
        using: "BTREE",
        fields: [
          { name: "_idfactoring" },
        ]
      },
      {
        name: "FK_factoringhistorialestado_idfactoringestado",
        using: "BTREE",
        fields: [
          { name: "_idfactoringestado" },
        ]
      },
      {
        name: "FK_factoringhistorialestado_idusuariomodifica",
        using: "BTREE",
        fields: [
          { name: "_idusuariomodifica" },
        ]
      },
    ]
  });
  }
}
