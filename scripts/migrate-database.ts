import { migrateDatabase, destroyDatabaseConnection } from "../database";

migrateDatabase()
  .then(destroyDatabaseConnection)
  .then(() => console.log("Migration done"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
