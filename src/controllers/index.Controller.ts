import { Request, Response } from "express";
import * as healthService from "#root/src/services/health.Service.js";
import { line, log } from "#src/utils/logger.pino.js";

export const index = async (req: Request, res: Response) => {
  res.json(healthService.getWelcomeMessageService());
};

export const ping = async (req: Request, res: Response) => {
  log.debug(line(), "controller::ping");

  const result = await healthService.pingDatabaseService();
  res.json(result);
};
