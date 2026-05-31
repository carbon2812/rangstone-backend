const app = require("./app");
const env = require("./config/env");

const PORT = env.port;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at ${env.apiBaseUrl}/api-docs`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down server.`);
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
