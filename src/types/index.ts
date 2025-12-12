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
    label: string;
    value: string;
    isCorrect?: boolean;
}

export interface ResponseData {
    answers: Record<string, string | string[] | number | null>;
    createdAt: Date;
    id: string;
}
