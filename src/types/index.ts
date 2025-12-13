export interface ThemeSettings {
    theme?: {
        primary?: string;
        background?: string;
        font?: string;
    };
    collectEmail?: boolean;
    requiresLogin?: boolean;
    [key: string]: unknown;
}

export interface QuestionOption {
    id?: string;
    label: string;
    value: string;
    isCorrect?: boolean;
    goToSectionId?: string;
}

// Basic structure for stored answers
export type FormAnswers = Record<string, string | string[] | number | null>;

export interface ResponseData {
    id: string;
    answers: FormAnswers;
    createdAt: Date;
}
