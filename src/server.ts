import express from "express";
import type {Demo} from "./models/demo.js";

const app = express();
app.use(express.json());
const port = 3000;
let nextId = 1;

app.get("/", (req, res) => {
  res.send("DemoRoom server is running");
});

//temp storage 
const demos: Demo[] = [];

app.get("/api/demos", (req, res) => {
    res.json(demos);
});

app.post("/api/demos", (req, res) => {
  const { title, description } = req.body;

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      message: "A demo title is required"
    });
  }

    const demo: Demo = 
    {
        id: nextId++,
        title: title.trim(),
        author: "Anonymous",
        description: typeof description === "string" ? description : "",
        tempo: 120,
        key: "C"
    };

    demos.push(demo);
    res.status(201).json(demo);
});

app.get("/api/demos/:id", (req, res) => {
  const demo = demos.find((demo) => demo.id === parseInt(req.params.id));

  if (!demo) {
    return res.status(404).json({
      message: "Demo not found"
    });
  }

  res.json(demo);
});

app.listen(port, () => {
  console.log(`DemoRoom is running at http://localhost:${port}`);
});