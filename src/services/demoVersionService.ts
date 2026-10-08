import { DemoVersionModel } from "../models/demoVersionModel.js";
import { getDemoById } from "./demoService.js";

export async function getVersionsByDemoId(demoId: string) {
    return await DemoVersionModel.find({ demoId })
}

export async function getVersionById(
    demoId: string,
    versionNumber: number
) {
    return await DemoVersionModel.findOne({
        demoId,
        versionNumber
    });
}

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

    
