import app from "./src/app.js";
import connectDatabase from "./src/config/database.js";
import { env } from "./src/config/env.js";

const startServer = async () => {
  // Connect to database before accepting incoming HTTP requests
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(
      `🚀 Storiva API running on http://localhost:${env.PORT} [${env.NODE_ENV}]`
    );
  });
};

startServer();