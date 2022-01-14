import knex, { Knex } from "knex";
import { join } from "path";

const knexConfig: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: join(__dirname, ".dev.sqlite3"),
  },
  useNullAsDefault: true,
  seeds: {
    directory: join(__dirname, "./seeds"),
  },
  migrations: {
    tableName: "migrations",
    directory: join(__dirname, "./migrations"),
  },
};

export const database = knex(knexConfig);

export async function migrateDatabase() {
  return await database.migrate.latest();
}

export async function seedDatabase() {
  return await database.seed.run({ directory: join(__dirname, "./seeds") });
}

export async function createSeed(seedName: string) {
  return await database.seed.make(seedName, {
    extension: "ts",
  });
}

export async function rollbackDatabase() {
  return await database.migrate.rollback(undefined, true);
}

export async function rollbackMigration() {
  return await database.migrate.rollback(undefined, false);
}

export async function destroyDatabaseConnection() {
  return await database.destroy();
}
