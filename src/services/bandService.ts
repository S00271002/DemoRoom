import { BandModel } from "../models/bandModel.js";

export async function createBand(name: string, ownerId: string) {
    return await BandModel.create({
        name: name.trim(),
        ownerId,
        memberIds: [ownerId]
    });
}

export async function getBandById(id: string) {
    return await BandModel.findById(id);
}

export async function getBandsByUserId(userId: string) {
    return await BandModel.find({
        memberIds: userId
    });
}

