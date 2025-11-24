import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "@/lib/create-app";
import { z } from "zod";

const HealthResponse = z.object({
    status: z.string(),
    uptime: z.number(),
    timestamp: z.number(),
});

const router = createRouter()
    .openapi(
        createRoute({
            tags: ["Health"],
            method: "get",
            path: "/health",
            responses: {
                200: {
                    description: "Health check",
                    content: {
                        "application/json": {
                            schema: HealthResponse,
                        },
                    },
                },
            },
        }),
        (c) => {
            return c.json({
                status: "ok",
                uptime: process.uptime(),
                timestamp: Date.now(),
            }, 200);
        },
    );

export default router;
