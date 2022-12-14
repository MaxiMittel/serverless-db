import express from "express";
import { filterAndProject } from "./condition";
import { join } from "./join";
import { Node } from "./node";

const app = express();

app.use(express.json());

app.post("/query", async (req, res) => {
  const { database, query } = req.body;
  const node = new Node(database);
  await node.init();

  const response = await node.run(query);

  res.send(response);
});

app.post("/join", (req: any, res: any) => {
  console.log("[POST] /join");
  const data = req.body;
  res.send(JSON.stringify(join(data)));
});

app.post("/filter", (req: any, res: any) => {
  console.log("[POST] /filter");
  const data = req.body;
  res.send(JSON.stringify(filterAndProject(data)));
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
