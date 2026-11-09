import { DemoVersionModel } from "../models/demoVersionModel.js";
import { getDemoById } from "./demoService.js";

//gets all versions for a specific demo
export async function getVersionsByDemoId(demoId: string) {
    return await DemoVersionModel.find({ demoId }).sort({versionNumber:1})
}

//gets a specific version of a demo by its demo ID and version number
export async function getVersionById(
    demoId: string,
    versionNumber: number
) {
    return await DemoVersionModel.findOne({
        demoId,
        versionNumber
    });
}

//creates a new version of a specific demo with the given audio file path and change note
export async function createDemoVersion(
    demoId: string,
    audioPath: string,
    changeNote: string
) {
    const demo = await getDemoById(demoId);

    if (!demo) {
        throw new Error("Demo not found");
    }

    const latestVersion = await DemoVersionModel
        .findOne({ demoId })
        .sort({ versionNumber: -1 });

    const demoVersion = new DemoVersionModel({
        demoId,
        versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
        audioPath,
        changeNote
    });

    await demoVersion.save();

    demo.currentVersionId = demoVersion._id;
    await demo.save();

    return demoVersion;
}

    
