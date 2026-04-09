import app from "./app.js";
import env from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import { startWishScheduler } from "./jobs/wishScheduler.js";
import User from "./models/User.js";
import { hashValue } from "./utils/security.js";

async function ensureAdminUser() {
  const admin = await User.findOne({ email: env.adminEmail.toLowerCase() });

  if (!admin) {
    await User.create({
      name: env.adminName,
      email: env.adminEmail.toLowerCase(),
      passwordHash: await hashValue(env.adminPassword),
      role: "admin"
    });

    console.log("Seeded default admin user");
  }
}

async function bootstrap() {
  await connectDatabase();
  await ensureAdminUser();
  startWishScheduler();

  app.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to boot server", error);
  process.exit(1);
});
