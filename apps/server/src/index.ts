import app from "./app";
import env from "./env";

const port = env.PORT;
console.log(`Server is running on port http://localhost:${port}`);
console.log(`Auth API available at http://localhost:${port}/api/auth/reference`);
console.log(`API docs available at http://localhost:${port}/reference`);

export default {
  port: 9000,
  fetch: app.fetch
}