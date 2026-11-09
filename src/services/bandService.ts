import { BandModel } from "../models/bandModel.js";

//creates a new band with the given name and owner ID
export async function createBand(name: string, ownerId: string) {
    return await BandModel.create({
        name: name.trim(),
        ownerId,
        memberIds: [ownerId]
    });
}

//gets a specific band by its ID
export async function getBandById(id: string) {
    return await BandModel.findById(id);
}

//gets all bands that a specific user is a member of
export async function getBandsByUserId(userId: string) {
    return await BandModel.find({
        memberIds: userId
    });
}

