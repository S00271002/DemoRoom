import express from "express";
import demoRoutes from "./routes/demoRoutes.js";
import versionRoutes from "./routes/versionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import "dotenv/config";
import { connectDatabase } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(express.json());
const port = 3000;

app.get("/", (req, res) => {
  res.send("DemoRoom server is running");
});

app.use("/api/demos", demoRoutes);
app.use("/api/demos", versionRoutes);
app.use("/api/demos", commentRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

async function startServer(): Promise<void> {
    try {
        await connectDatabase();

        app.listen(port, () => {
            console.log(`DemoRoom is running at http://localhost:${port}`);
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Startup error type:", error.name);
        }

    process.exitCode = 1;
}
}

startServer();