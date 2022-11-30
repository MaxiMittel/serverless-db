import readline from "readline";
import { Parser } from "node-sql-parser";
import net from "net";

const main = async () => {
  if (process.argv.length < 3) {
    console.error("Usage: node index.ts <hostname> <database>");
    process.exit(1);
  }

  const hostname = process.argv[2];
  const database = process.argv[3];

  console.log(`${hostname}::${database}`);

  var client = new net.Socket();
  client.connect(4000, "127.0.0.1", function () {
    console.log("Connected");
  });

  client.on("data", function (data: any) {
    console.log("Received: " + data);
    client.destroy(); // kill client after server's response
  });

  client.on("close", function () {
    console.log("Connection closed");
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", async (input: string) => {
    const sqlParser = new Parser();
    const parsed = sqlParser.astify(input);

    client.write(JSON.stringify({ name: "Maxi", age: 21 }));

    //console.table(response.data);
  });
};

main();
