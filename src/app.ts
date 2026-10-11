import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./config/openapi.js";
import express from "express";
import demoRoutes from "./routes/demoRoutes.js";
import versionRoutes from "./routes/versionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import "dotenv/config";
import { errorHandler } from "./middleware/errorHandler.js";
import bandRoutes from "./routes/bandRoutes.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("DemoRoom server is running");
});

app.use("/api/demos", demoRoutes);
app.use("/api/demos/:id/versions", versionRoutes);
app.use("/api/demos/:id/versions/:versionId/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bands", bandRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get("/openapi.json", (_req, res) => {
    res.json(openApiDocument);
});

app.use(errorHandler);

export default app;
