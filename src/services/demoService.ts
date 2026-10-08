import type { Demo } from "../models/demo.js";

export const demos: Demo[] = [];

let nextId = 1;

export function getDemoById(id: number): Demo | undefined {
    
    return demos.find((demo) => demo.id === id);
}

export function createDemo(title: string, description: string, tempo: number, key: string): Demo {
    const demo: Demo = 
    {
        id: nextId++,
        title: title.trim(),
        userId: 1,
        description: typeof description === "string" ? description : "",
        tempo: typeof tempo === "number" && tempo > 0 ? tempo : 120,
        key: typeof key === "string" ? key.trim() : "C",
        currentVersionId: 1,
    }
    demos.push(demo);
    return demo;
}