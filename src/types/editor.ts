import { Question } from "@prisma/client";

export interface EditorOption {
    id: string;
    label: string;
    value?: string;
}

// Extend Prisma Question but override options type
export interface EditorQuestion extends Omit<Question, 'options' | 'metadata'> {
    options?: EditorOption[];
    metadata?: {
        hasLogic?: boolean;
        [key: string]: unknown;
    } | null;
    // Add any other frontend-specific fields if needed (e.g. temporary un-saved flags)
}
