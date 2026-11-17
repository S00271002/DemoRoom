import { DemoModel } from "../models/demoModel.js";
import { DemoVersionModel } from "../models/demoVersionModel.js";
import { CommentModel } from "../models/commentModel.js";
import { unlink } from "node:fs/promises";

//gets all demos in the database
export async function getAllDemos() {
    return await DemoModel.find();
}

//gets a specific demo by its ID
export async function getDemoById(id: string) {
    return await DemoModel.findById(id);
}

//gets all demos that a specific user has created
export async function createDemo(title: string, description: string, userId: string, bandId: string, tempo?: number, key?: string) {
    const demo = new DemoModel({
        title,
        description,
        userId,
        bandId
    });

    if (tempo !== undefined) {
        demo.tempo = tempo;
    }

    if (key !== undefined && key.trim() !== "") {
        demo.key = key.trim();
    }

    return await demo.save();
}

//deletes a specific demo by its ID, along with all of its versions and comments
export async function deleteDemo(id: string) {
    const demo = await DemoModel.findById(id);

    if (!demo) {
        return false;
    }

    const versions = await DemoVersionModel.find({demoId: id});
    const versionIds = versions.map(version => version._id);

    await CommentModel.deleteMany({versionId: {$in: versionIds}});
    await DemoVersionModel.deleteMany({demoId: id});
    await DemoModel.deleteOne({_id: id});

    for (const version of versions) {
        try {
            await unlink(version.audioPath);
        } catch (error) {
            const fileError = error as NodeJS.ErrnoException;

            if (fileError.code !== "ENOENT") {
                console.error("Audio cleanup failed:", fileError.code);
            }
        }
    }

    return true;
}

// removes audio file when error occurs during a method
export async function removeUpload(audioPath?: string) {
    if (!audioPath) return;

    try {
        await unlink(audioPath);
    } catch (error) {
        console.error("Could not remove uploaded audio");
    }
}
