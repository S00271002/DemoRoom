import { beforeEach, describe, expect, it, vi } from "vitest";
import { DemoModel } from "../src/models/demoModel.js";
import { DemoVersionModel } from "../src/models/demoVersionModel.js";
import { CommentModel } from "../src/models/commentModel.js";
import { unlink } from "node:fs/promises";
import { createDemoVersion } from "../src/services/demoVersionService.js";
import { deleteDemo } from "../src/services/demoService.js";

// Models and file deletion are mocked so the tests leave real data untouched.
vi.mock("../src/models/demoModel.js", () => ({
    DemoModel: { findById: vi.fn(), deleteOne: vi.fn() }
}));

vi.mock("../src/models/demoVersionModel.js", () => ({
    DemoVersionModel: class {
        static find = vi.fn();
        static findOne = vi.fn();
        static deleteMany = vi.fn();
        _id = "507f1f77bcf86cd799439014";
        save = vi.fn().mockResolvedValue(undefined);

        constructor(data: Record<string, unknown>) {
            Object.assign(this, data);
        }
    }
}));

vi.mock("../src/models/commentModel.js", () => ({
    CommentModel: { deleteMany: vi.fn() }
}));

vi.mock("node:fs/promises", () => ({ unlink: vi.fn() }));

const demoId = "507f1f77bcf86cd799439011";
const versionId = "507f1f77bcf86cd799439014";
const latestVersion = vi.fn();
let demo: any;

beforeEach(() => {
    vi.clearAllMocks();
    demo = {
        _id: demoId,
        currentVersionId: null,
        save: vi.fn().mockResolvedValue(undefined)
    };

    vi.mocked(DemoModel.findById).mockResolvedValue(demo);
    vi.mocked(DemoVersionModel.findOne).mockReturnValue({ sort: latestVersion } as any);
    latestVersion.mockResolvedValue(null);
    vi.mocked(unlink).mockResolvedValue(undefined);
});

describe("Demo services", () => {
    it("creates version 1 and makes it the current recording", async () => {
        const version = await createDemoVersion(demoId, "uploads/first.mp3", "Initial version");

        expect(version.versionNumber).toBe(1);
        expect(version.demoId).toBe(demoId);
        expect(version.audioPath).toBe("uploads/first.mp3");
        expect(version.save).toHaveBeenCalledOnce();
        expect(demo.currentVersionId).toBe(versionId);
        expect(demo.save).toHaveBeenCalledOnce();
    });

    it("creates version 2 when version 1 already exists", async () => {
        latestVersion.mockResolvedValue({ versionNumber: 1 });

        const version = await createDemoVersion(demoId, "uploads/second.mp3", "Added chorus");

        expect(version.versionNumber).toBe(2);
        expect(version.changeNote).toBe("Added chorus");
        expect(version.save).toHaveBeenCalledOnce();
    });

    it("deletes a demo with its comments, versions and audio", async () => {
        vi.mocked(DemoVersionModel.find).mockResolvedValue([
            { _id: versionId, audioPath: "uploads/first.mp3" }
        ]);

        const deleted = await deleteDemo(demoId);

        expect(deleted).toBe(true);
        expect(CommentModel.deleteMany).toHaveBeenCalledWith({
            versionId: { $in: [versionId] }
        });
        expect(DemoVersionModel.deleteMany).toHaveBeenCalledWith({ demoId });
        expect(DemoModel.deleteOne).toHaveBeenCalledWith({ _id: demoId });
        expect(unlink).toHaveBeenCalledWith("uploads/first.mp3");
    });
});
