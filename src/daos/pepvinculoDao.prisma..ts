import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getPepvinculos = async (tx: TxClient, estados: number[]) => {
  try {
    const pepvinculos = await tx.PepVinculo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return pepvinculos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPepvinculoByIdpepvinculo = async (tx: TxClient, idpepvinculo) => {
  try {
    const pepvinculo = await tx.PepVinculo.findByPk(idpepvinculo);

    //const pepvinculos = await pepvinculo.getPepvinculos();

    return pepvinculo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPepvinculoByPepvinculoid = async (tx: TxClient, pepvinculoid: string) => {
  try {
    const pepvinculo = await tx.PepVinculo.findFirst({
      where: {
        pepvinculoid: pepvinculoid,
      },
    });

    return pepvinculo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPepvinculoPk = async (tx: TxClient, pepvinculoid: string) => {
  try {
    const pepvinculo = await tx.PepVinculo.findFirst({
      attributes: ["idpepvinculo"],
      where: {
        pepvinculoid: pepvinculoid,
      },
    });

    return pepvinculo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPepvinculo = async (tx: TxClient, pepvinculo) => {
  try {
    const pepvinculo_nuevo = await tx.PepVinculo.create(pepvinculo);

    return pepvinculo_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePepvinculo = async (tx: TxClient, pepvinculo) => {
  try {
    const result = await tx.PepVinculo.update(pepvinculo, {
      where: {
        pepvinculoid: pepvinculo.pepvinculoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePepvinculo = async (tx: TxClient, pepvinculo) => {
  try {
    const result = await tx.PepVinculo.update(pepvinculo, {
      where: {
        pepvinculoid: pepvinculo.pepvinculoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
