import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class EmpresaDeclaracion extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idpersonadeclaracion: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    personadeclaracionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    _idpersona: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    espep: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: "Declaro que soy una Persona Expuesta Políticamente"
    },
    tienevinculopep: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: "Declaro que tengo un vínculo con una Persona Expuesta"
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
    tableName: 'empresa_declaracion',
    timestamps: false
  });
  }
}
