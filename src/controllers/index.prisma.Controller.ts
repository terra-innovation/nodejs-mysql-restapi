import { log, line } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";

export const index = (req: Request, res: Response) => res.json({ message: "welcome to my api" });

export const ping = async (req: Request, res: Response) => {
  log.debug(line(), "controller::ping");
  const result = await prismaFT.client.$transaction(
    async (tx) => {
      const result = await prismaFT.client.$queryRaw<{ result: string }[]>`SELECT 'pong' as result`;
      return result;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  res.json(result[0]);
};
