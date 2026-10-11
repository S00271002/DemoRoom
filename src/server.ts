import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

async function startServer() {
    try {
        await connectDatabase();
        app.listen(3000, () => {
            console.log("DemoRoom is running at http://localhost:3000");
        });
    } catch (error) {
        console.error("Startup failed:", error instanceof Error ? error.name : "Unknown error");
        process.exitCode = 1;
    }
}

startServer();
