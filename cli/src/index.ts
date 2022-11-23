import readline from "readline";
import { Parser } from "node-sql-parser";
import axios from "axios";

const main = async () => {
  if (process.argv.length < 3) {
    console.error("Usage: node index.ts <hostname> <database>");
    process.exit(1);
  }

  const hostname = process.argv[2];
  const database = process.argv[3];

  console.log(`${hostname}::${database}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", async (input: string) => {
    const sqlParser = new Parser();
    const parsed = sqlParser.astify(input);

    const response = await axios.post(`${hostname}/query`, {
      database,
      query: parsed,
    });

    console.table(response.data);
  });
};

main();
