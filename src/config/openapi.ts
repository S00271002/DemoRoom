import { readFileSync } from "node:fs";

//loads the openapi json file and makes it available to the rest of the application as a JSON object
const specificationPath = new URL("../../openapi.json", import.meta.url);

export const openApiDocument = JSON.parse(readFileSync(specificationPath, "utf8"));
