import { pinoLogger as logger } from "hono-pino";
import pretty from "pino-pretty";
import pino from "pino";
import env from "@/env";

export function pinoLogger() {
    return logger({
        pino: pino({
            level: env.LOG_LEVEL || "info",
        }, env.NODE_ENV === "production" ? undefined : pretty()),
    });
}