import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Colaborador from  "./Colaborador.js";
import _Empresa from  "./Empresa.js";

export default function initModels(sequelize) {
  const Colaborador = _Colaborador.init(sequelize, DataTypes);
  const Empresa = _Empresa.init(sequelize, DataTypes);

  Colaborador.belongsTo(Empresa, { as: "idempresa_empresa", foreignKey: "idempresa"});
  Empresa.hasMany(Colaborador, { as: "colaboradors", foreignKey: "idempresa"});

  return {
    Colaborador,
    Empresa,
  };
}
