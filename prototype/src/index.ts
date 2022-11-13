import readline from "readline";
import { Node } from "./services/node";
import { AST, Parser } from "node-sql-parser";

const node = new Node("blog_db");

const main = async () => {
  // Read user input INSERT, SELECT
  console.log("Welcome to the TestDB CLI");
  console.log("Type 'help' to see a list of commands");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", async (input: string) => {
    const sqlParser = new Parser();
    const parsed = sqlParser.astify(input);

    console.time("Query finished in");
    const result = await node.run(parsed as AST);
    console.timeEnd("Query finished in");

    console.table(result);

    //console.dir(parsed, { depth: null });
  });
};

main();
