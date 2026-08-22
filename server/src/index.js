import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";

const PORT = Number(process.env.PORT) || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/reviewly";

async function main() {
  await connectDB(MONGO_URI);

  const app = createApp();

  app.listen(PORT, () => {
    logger.info(`Reviewly server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
