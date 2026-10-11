import { readFileSync } from "node:fs";

// The specification is kept in one file so Swagger and the hand-in stay in sync.
const specificationPath = new URL("../../openapi.json", import.meta.url);
export const openApiDocument = JSON.parse(readFileSync(specificationPath, "utf8"));
