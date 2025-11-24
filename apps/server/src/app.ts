import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import index from "@/routes/index.route";
import health from "@/routes/health.route";

const app = createApp();

configureOpenAPI(app);

const routes = [
    index,
    health,
] as const;

routes.forEach((route) => {
    app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;