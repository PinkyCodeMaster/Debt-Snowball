import type { Schema } from "hono";

import { OpenAPIHono } from "@hono/zod-openapi";
import { requestId } from "hono/request-id";
import { pinoLogger } from "@/middlewares/pino-logger";

import type { AppBindings, AppOpenAPI } from "./types";
import { cors } from "hono/cors";

export function createRouter() {
    return new OpenAPIHono<AppBindings>({
        strict: false,
    });
}

export default function createApp() {
    const app = createRouter();
    // Apply CORS only if not in production
    if (process.env.NODE_ENV !== 'production') {
        app.use('*', cors({
            origin: ['http://localhost:3000', 'http://localhost:9000'], // no '*'
            allowMethods: ['GET', 'POST', 'OPTIONS'],
            allowHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        }));
    }
    app.use(requestId())
        .use(pinoLogger());
    return app;
}



export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
    return createApp().route("/", router);
}