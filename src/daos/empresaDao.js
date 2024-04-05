import { ClientError } from "../utils/CustomErrors.js";

export const getEmpresasActivas = async (req) => {
  try {
    const { models } = req.app.locals;
    const empresas = await models.Empresa.findAll({
      include: [
        {
          model: models.Colaborador,
          as: "colaboradores",
          attributes: {
            exclude: ["idcolaborador", "idempresa", "idusuariocrea", "fechacrea", "idusuariomod", "fechamod", "estado"],
          },
        },
      ],
      attributes: {
        exclude: ["idempresa", "idusuariocrea", "fechacrea", "idusuariomod", "fechamod", "estado"],
      },
      where: {
        estado: 1,
      },
    });
    //console.log(empresas);
    return empresas;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByIdempresa = async (req, idempresa) => {
  try {
    const { models } = req.app.locals;

    const empresa = await models.Empresa.findByPk(idempresa, {
      include: [
        {
          model: models.Colaborador,
        },
      ],
    });
    console.log(empresa);

    //const colaboradores = await empresa.getColaboradors();
    //console.log(colaboradores);

    return empresa;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByEmpresaid = async (req, empresaid) => {
  try {
    const { models } = req.app.locals;
    const empresa = await models.Empresa.findAll({
      include: [
        {
          model: models.Colaborador,
        },
      ],
      where: {
        empresaid: empresaid,
      },
    });
    //console.log(empresa);
    return empresa;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByRuc = async (req, ruc) => {
  try {
    const { models } = req.app.locals;
    const empresa = await models.Empresa.findAll({
      include: [
        {
          model: models.Colaborador,
          as: "colaboradores",
          attributes: {
            exclude: ["idcolaborador", "idempresa", "idusuariocrea", "fechacrea", "idusuariomod", "fechamod", "estado"],
          },
        },
      ],
      attributes: {
        exclude: ["idempresa", "idusuariocrea", "fechacrea", "idusuariomod", "fechamod", "estado"],
      },
      where: {
        ruc: ruc,
      },
    });
    //console.log(empresa);
    return empresa;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findEmpresaPk = async (req, empresaid) => {
  try {
    const { models } = req.app.locals;
    const empresa = await models.Empresa.findAll({
      attributes: ["idempresa"],
      where: {
        empresaid: empresaid,
      },
      raw: true,
    });
    //console.log(empresa);
    return empresa;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertEmpresa = async (req, empresa) => {
  try {
    const { models } = req.app.locals;
    const empresa_nuevo = await models.Empresa.create(empresa);
    // console.log(empresa_nuevo);
    return empresa_nuevo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateEmpresa = async (req, empresa) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Empresa.update(empresa, {
      where: {
        empresaid: empresa.empresaid,
      },
    });
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteEmpresa = async (req, empresa) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Empresa.update(empresa, {
      where: {
        empresaid: empresa.empresaid,
      },
    });
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
