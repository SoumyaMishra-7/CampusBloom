require("dotenv").config();

const http = require("http");
const env = require("./config/env");
const { connectDatabase } = require("./config/database");
const { createApp } = require("./app");
const { initializeSocketServer } = require("./sockets");

async function bootstrap() {
  await connectDatabase(env.mongoUri);

  const app = createApp(null);
  const server = http.createServer(app);
  const io = initializeSocketServer(server);
  app.set("io", io);

  server.listen(env.port, () => {
    console.log(`Document Vault backend running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
