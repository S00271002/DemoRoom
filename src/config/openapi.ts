import { readFileSync } from "node:fs";

const specificationPath = new URL("../../openapi.json", import.meta.url);
export const openApiDocument = JSON.parse(readFileSync(specificationPath, "utf8"));
