import { seedDatabase, destroyDatabaseConnection } from "../database";

seedDatabase()
  .then(destroyDatabaseConnection)
  .then(() => console.log("Seed done"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
