import 'dotenv/config';
import path from 'path';
import Database from 'better-sqlite3';
import { hash } from 'bcryptjs';

function resolveSqlitePath(databaseUrl: string) {
  if (!databaseUrl.startsWith('file:')) {
    throw new Error('This seed currently supports only sqlite file: URLs.');
  }

  const rawPath = databaseUrl.slice('file:'.length);
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for seed execution.');
  }

  const dbPath = resolveSqlitePath(databaseUrl);
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "username" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
  `);

  const adminUsername = process.env.ADMIN_SEED_USERNAME ?? 'admin';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? 'admin1234';
  const userUsername = process.env.USER_SEED_USERNAME ?? 'user';
  const userPassword = process.env.USER_SEED_PASSWORD ?? 'user1234';

  const adminPasswordHash = await hash(adminPassword, 10);
  const userPasswordHash = await hash(userPassword, 10);

  const upsert = db.prepare(`
    INSERT INTO "User" (id, username, passwordHash, role, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(username) DO UPDATE SET
      passwordHash = excluded.passwordHash,
      role = excluded.role,
      updatedAt = CURRENT_TIMESTAMP
  `);

  upsert.run(`seed-admin-${adminUsername}`, adminUsername, adminPasswordHash, 'ADMIN');
  upsert.run(`seed-user-${userUsername}`, userUsername, userPasswordHash, 'USER');

  db.close();

  console.log(`Seed completed. Admin user: ${adminUsername}`);
  console.log(`Seed completed. Standard user: ${userUsername}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
