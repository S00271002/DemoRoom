import express from "express";
import demoRoutes from "./routes/demoRoutes.js";

const app = express();
app.use(express.json());
const port = 3000;

app.get("/", (req, res) => {
  res.send("DemoRoom server is running");
});

app.use("/api/demos", demoRoutes);


app.listen(port, () => {
  console.log(`DemoRoom is running at http://localhost:${port}`);
});