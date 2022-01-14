import { createSeed } from "../database";

const help = `Usage: npm run db:make-migration <migration-name>`;
const { argv } = process;

if (argv.length !== 3)
  throw new Error(
    `Unexpected number of arguments: ${JSON.stringify(argv)}\n${help}`
  );
const seedName = argv[2];
if (!seedName) throw new Error(`Unexpected missing seed name: \n${help}`);

createSeed(seedName.trim())
  .then(() => {
    console.log("Seed file created");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
