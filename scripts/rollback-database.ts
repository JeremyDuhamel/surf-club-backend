import { rollbackDatabase, destroyDatabaseConnection } from "../database";

rollbackDatabase()
  .then(destroyDatabaseConnection)
  .then(() => console.log("Rollback done"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
