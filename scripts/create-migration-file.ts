import { database } from "../database";

const help = `Usage: npm run db:make-migration <migration-name>`;
const { argv } = process;

if (argv.length !== 3)
  throw new Error(
    `Unexpected number of arguments: ${JSON.stringify(argv)}\n${help}`
  );
const migrationName = argv[2];
if (!migrationName)
  throw new Error(`Unexpected missing migration name: \n${help}`);

database.migrate
  .make(migrationName.trim(), {
    extension: "ts",
  })
  .then(() => {
    console.log("Migration file created");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
