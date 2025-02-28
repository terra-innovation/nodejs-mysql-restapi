import util from "util";
import logger, { line } from "./logger.js";

export function formatError(error) {
  if (error) {
    return {
      message: error.message,
      name: error.name,
      details: error.errors
        ? error.errors.map((e) => ({
            path: e.path,
            message: e.message,
            type: e.type,
          }))
        : "No additional details available",
      stack: error.stack,
    };
  }

  return {};
}
