import type { Demo } from "../models/demo.js";

export const demos: Demo[] = [];

let nextId = 1;

export function getNextDemoId(): number {
    return nextId++;
}

export function findDemoById(id: number): Demo | undefined {
    return demos.find((demo) => demo.id === id);
}

export function createDemo(title: string, description: string, author: string, tempo: number, key: string): Demo {
    const demo: Demo = 
    {
        id: nextId++,
        title: title.trim(),
        author: author.trim(),
        description: typeof description === "string" ? description : "",
        tempo: typeof tempo === "number" && tempo > 0 ? tempo : 120,
        key: typeof key === "string" ? key.trim() : "C",
        currentVersionId: null,
    }
    demos.push(demo);
    return demo;
}