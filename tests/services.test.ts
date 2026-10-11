import { beforeEach, describe, expect, it, vi } from "vitest";

// Test the real services with model/file operations replaced, without connecting
// to MongoDB or deleting any recordings.
const database = vi.hoisted(() => {
    const saveVersion = vi.fn();
    const versionConstructor = vi.fn(function (data: Record<string, unknown>) {
        return {
            ...data,
            _id: "507f1f77bcf86cd799439014",
            save: saveVersion
        };
    });

    return {
        DemoModel: { findById: vi.fn(), deleteOne: vi.fn(), find: vi.fn() },
        DemoVersionModel: Object.assign(versionConstructor, {
            find: vi.fn(), findOne: vi.fn(), deleteMany: vi.fn()
        }),
        CommentModel: { deleteMany: vi.fn() },
        saveVersion,
        latestSort: vi.fn(),
        unlink: vi.fn()
    };
});

vi.mock("../src/models/demoModel.js", () => ({ DemoModel: database.DemoModel }));
vi.mock("../src/models/demoVersionModel.js", () => ({ DemoVersionModel: database.DemoVersionModel }));
vi.mock("../src/models/commentModel.js", () => ({ CommentModel: database.CommentModel }));
vi.mock("node:fs/promises", () => ({ unlink: database.unlink }));

import { deleteDemo } from "../src/services/demoService.js";
import { createDemoVersion, getVersionsByDemoId, getVersionById } from "../src/services/demoVersionService.js";

const demoId = "507f1f77bcf86cd799439011";
const versionId = "507f1f77bcf86cd799439014";
let demo: any;

beforeEach(() => {
    vi.clearAllMocks();
    demo = { _id: demoId, currentVersionId: null, save: vi.fn().mockResolvedValue(undefined) };
    database.DemoModel.findById.mockResolvedValue(demo);
    database.DemoModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
    database.DemoVersionModel.findOne.mockReturnValue({ sort: database.latestSort });
    database.DemoVersionModel.find.mockResolvedValue([]);
    database.DemoVersionModel.deleteMany.mockResolvedValue({ deletedCount: 0 });
    database.CommentModel.deleteMany.mockResolvedValue({ deletedCount: 0 });
    database.latestSort.mockResolvedValue(null);
    database.saveVersion.mockResolvedValue(undefined);
    database.unlink.mockResolvedValue(undefined);
});

describe("Recording version service", () => {
    it("creates version 1 and links it as the demo's current recording", async () => {
        const version = await createDemoVersion(demoId, "uploads/first.mp3", "Initial version");

        expect(database.DemoVersionModel.findOne).toHaveBeenCalledWith({ demoId });
        expect(database.latestSort).toHaveBeenCalledWith({ versionNumber: -1 });
        expect(version.versionNumber).toBe(1);
        expect(version.audioPath).toBe("uploads/first.mp3");
        expect(version.changeNote).toBe("Initial version");
        expect(database.saveVersion).toHaveBeenCalledOnce();
        expect(demo.currentVersionId).toBe(versionId);
        expect(demo.save).toHaveBeenCalledOnce();
        expect(database.saveVersion.mock.invocationCallOrder[0]).toBeLessThan(demo.save.mock.invocationCallOrder[0]);
    });

    it("uses the highest existing version number for the next revision", async () => {
        database.latestSort.mockResolvedValue({ versionNumber: 1 });
        const version = await createDemoVersion(demoId, "uploads/second.mp3", "Added chorus");
        expect(version.versionNumber).toBe(2);
        expect(version.demoId).toBe(demoId);
        expect(version.changeNote).toBe("Added chorus");
    });

    it("does not restart numbering when an earlier version has been deleted", async () => {
        database.latestSort.mockResolvedValue({ versionNumber: 5 });
        const version = await createDemoVersion(demoId, "uploads/sixth.mp3", "New vocals");
        expect(version.versionNumber).toBe(6);
    });

    it("does not create a version for a missing demo", async () => {
        database.DemoModel.findById.mockResolvedValue(null);
        await expect(createDemoVersion(demoId, "uploads/first.mp3", "Initial version"))
            .rejects.toThrow("Demo not found");
        expect(database.DemoVersionModel).not.toHaveBeenCalled();
        expect(database.saveVersion).not.toHaveBeenCalled();
    });

    it("does not change the current recording when saving the version fails", async () => {
        database.saveVersion.mockRejectedValueOnce(new Error("Database unavailable"));
        await expect(createDemoVersion(demoId, "uploads/first.mp3", "Initial version"))
            .rejects.toThrow("Database unavailable");
        expect(demo.currentVersionId).toBeNull();
        expect(demo.save).not.toHaveBeenCalled();
    });

    it("returns recording history in ascending version order", async () => {
        const recordings = [{ versionNumber: 1 }, { versionNumber: 2 }];
        const sort = vi.fn().mockResolvedValue(recordings);
        database.DemoVersionModel.find.mockReturnValue({ sort });
        const result = await getVersionsByDemoId(demoId);
        expect(database.DemoVersionModel.find).toHaveBeenCalledWith({ demoId });
        expect(sort).toHaveBeenCalledWith({ versionNumber: 1 });
        expect(result).toEqual(recordings);
    });

    it("version lookup is scoped to the demo as well as its version number", async () => {
        database.DemoVersionModel.findOne.mockResolvedValue(null);
        const result = await getVersionById(demoId, 2);
        expect(database.DemoVersionModel.findOne).toHaveBeenCalledWith({ demoId, versionNumber: 2 });
        expect(result).toBeNull();
    });
});

describe("Demo deletion service", () => {
    it("deletes linked comments, recordings and demo, then cleans up both audio files", async () => {
        const secondVersionId = "507f1f77bcf86cd799439015";
        const recordings = [
            { _id: versionId, audioPath: "uploads/first.mp3" },
            { _id: secondVersionId, audioPath: "uploads/second.mp3" }
        ];
        database.DemoVersionModel.find.mockResolvedValue(recordings);

        expect(await deleteDemo(demoId)).toBe(true);
        expect(database.DemoVersionModel.find).toHaveBeenCalledWith({ demoId });
        expect(database.CommentModel.deleteMany).toHaveBeenCalledWith({
            versionId: { $in: [versionId, secondVersionId] }
        });
        expect(database.DemoVersionModel.deleteMany).toHaveBeenCalledWith({ demoId });
        expect(database.DemoModel.deleteOne).toHaveBeenCalledWith({ _id: demoId });
        expect(database.unlink).toHaveBeenCalledWith("uploads/first.mp3");
        expect(database.unlink).toHaveBeenCalledWith("uploads/second.mp3");
        expect(database.unlink).toHaveBeenCalledTimes(2);
    });

    it("returns false for a missing demo and leaves other records untouched", async () => {
        database.DemoModel.findById.mockResolvedValue(null);
        expect(await deleteDemo(demoId)).toBe(false);
        expect(database.DemoVersionModel.find).not.toHaveBeenCalled();
        expect(database.CommentModel.deleteMany).not.toHaveBeenCalled();
        expect(database.DemoModel.deleteOne).not.toHaveBeenCalled();
        expect(database.unlink).not.toHaveBeenCalled();
    });

    it("still completes deletion when a recording file is already missing", async () => {
        database.DemoVersionModel.find.mockResolvedValue([
            { _id: versionId, audioPath: "uploads/missing.mp3" }
        ]);
        database.unlink.mockRejectedValueOnce(Object.assign(new Error("File missing"), { code: "ENOENT" }));
        expect(await deleteDemo(demoId)).toBe(true);
        expect(database.DemoModel.deleteOne).toHaveBeenCalledWith({ _id: demoId });
    });

    it("stops before deleting recordings if comment deletion fails", async () => {
        database.CommentModel.deleteMany.mockRejectedValueOnce(new Error("Database unavailable"));
        await expect(deleteDemo(demoId)).rejects.toThrow("Database unavailable");
        expect(database.DemoVersionModel.deleteMany).not.toHaveBeenCalled();
        expect(database.DemoModel.deleteOne).not.toHaveBeenCalled();
        expect(database.unlink).not.toHaveBeenCalled();
    });
});
