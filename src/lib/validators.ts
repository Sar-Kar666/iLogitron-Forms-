import { z } from 'zod';

export const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
});

export const optionSchema = z.object({
    id: z.string().optional(),
    label: z.string(),
    value: z.string().optional()
});

export const questionSchema = z.object({
    id: z.string().optional(),
    type: z.enum(["SHORT_TEXT", "PARAGRAPH", "MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN", "FILE", "LINEAR_SCALE", "GRID", "DATE", "TIME", "RATING"]),
    label: z.string().min(1),
    helpText: z.string().optional(),
    required: z.boolean().optional(),
    options: z.array(optionSchema).optional(), // for choice questions
    validation: z.any().optional(),
    points: z.number().int().optional(),
    order: z.number().int().optional()
});

export const sectionSchema = z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    order: z.number().int().optional(),
    questions: z.array(questionSchema)
});

export const createFormSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    isQuiz: z.boolean().optional(),
    settings: z.record(z.string(), z.any()).optional(),
    sections: z.array(sectionSchema).optional()
});
