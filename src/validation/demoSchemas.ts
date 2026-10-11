import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "A valid MongoDB ID is required");

export const demoDetailsSchema = z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(5000),
    bandId: objectIdSchema,
    tempo: z.number().min(1).max(400).optional(),
    key: z.string().trim().max(30).optional()
});

export const demoPatchSchema = demoDetailsSchema
    .omit({bandId: true})
    .partial()
    .refine(value => Object.keys(value).length > 0, "At least one field is required");

export const versionSchema = z.object({
    changeNote: z.string().trim().min(1).max(2000)
});

export const commentSchema = z.object({
    text: z.string().trim().min(1).max(5000)
});

export const bandSchema = z.object({
    name: z.string().trim().min(1).max(200)
});

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const registrationSchema = z.object({
    username: z.string().trim().min(1).max(100),
    email: emailSchema,
    password: z.string().min(15).max(256)
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1).max(256)
});
