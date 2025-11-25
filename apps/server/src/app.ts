import configureOpenAPI from "@/lib/configure-open-api";
import health from "@/routes/health.route";
import createApp from "@/lib/create-app";
import index from "@/routes/index.route";
import { auth } from "./lib/auth";

const app = createApp();

configureOpenAPI(app);

const routes = [
    index,
    health,
] as const;

routes.forEach((route) => {
    app.route("/", route);
});

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));


export type AppType = typeof routes[number];

export default app;