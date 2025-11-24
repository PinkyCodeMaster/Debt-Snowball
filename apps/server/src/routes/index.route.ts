import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "@/lib/create-app";
import { z } from "zod";

const IndexResponse = z.object({
    message: z.string(),
    uptime: z.number(),
    timestamp: z.number(),
});

const router = createRouter()
    .openapi(
        createRoute({
            tags: ["Index"],
            method: "get",
            path: "/",
            responses: {
                200: {
                    description: "Success",
                    content: {
                        "application/json": {
                            schema: IndexResponse,
                        },
                    },
                },
            },
        }),
        (c) => {
            return c.json({
                message: "Welcome to the Debt Snowball API!",
                uptime: process.uptime(),
                timestamp: Date.now(),
            }, 200);
        },
    );

export default router;