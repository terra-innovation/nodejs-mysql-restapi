import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getWelcomeMessageService = () => {
  return { message: "welcome to my api" };
};

export const pingDatabaseService = async () => {
  log.debug(line(), "service::pingDatabaseService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const result = await tx.$queryRaw<{ result: string }[]>`SELECT 'pong' as result`;
      return result[0];
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
