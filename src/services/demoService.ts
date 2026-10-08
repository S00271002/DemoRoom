import { DemoModel } from "../models/demoModel.js";

export async function getAllDemos() {
    return await DemoModel.find();
}

export async function getDemoById(id: string) {
    return await DemoModel.findById(id);
}

export async function createDemo(title: string, description: string, userId: string, tempo?: number, key?: string) {
    const demo = new DemoModel({
        title,
        description,
        userId
    });

    if (tempo !== undefined) {
        demo.tempo = tempo;
    }

    if (key !== undefined && key.trim() !== "") {
        demo.key = key.trim();
    }

    return await demo.save();
}