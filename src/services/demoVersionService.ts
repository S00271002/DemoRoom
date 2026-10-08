import type { DemoVersion } from "../models/demoVersion.js";
import { getDemoById } from "./demoService.js";

const demoVersions: DemoVersion[] = [];
let nextVersionId = 1;

export function getVersionsByDemoId(demoId: number): DemoVersion[] {
    return demoVersions.filter((version) => version.demoId === demoId);
}

export function getVersionById(demoId: number, versionId: number): DemoVersion | undefined {
    return demoVersions.find(
        (version) =>
            version.demoId === demoId &&
            version.id === versionId
    );
}

export function createDemoVersion(demoId: number, audioPath: string, changeNote: string): DemoVersion {
 
    const demo = getDemoById(demoId);
    if (!demo) {
        throw new Error("Demo not found");
        }   

    const existingVersions = getVersionsByDemoId(demoId);

    const demoVersion: DemoVersion = {
            id: nextVersionId++,
            demoId: demoId,
            versionNumber: existingVersions.length + 1,
            audioPath: audioPath.trim(),
            uploadedAt: new Date().toISOString(),
            changeNote: changeNote.trim()
        };
    
        demoVersions.push(demoVersion);
        demo.currentVersionId = demoVersion.id;

    return demoVersion;
}
