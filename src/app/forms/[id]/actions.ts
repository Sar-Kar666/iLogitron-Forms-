"use server";

import { prisma } from "@/lib/prisma";


export async function getPublicFormById(id: string) {
    const form = await prisma.form.findUnique({
        where: {
            id: id,
        },
        include: {
            sections: {
                orderBy: {
                    order: 'asc',
                },
                include: {
                    questions: {
                        orderBy: {
                            order: 'asc',
                        },
                    },
                },
            },
        },
    });

    return form;
}

export async function submitResponse(formId: string, answers: Record<string, string | string[] | number | null>) {
    // 1. Verify form exists
    const form = await prisma.form.findUnique({
        where: { id: formId },
        include: { sections: { include: { questions: true } } }
    });

    if (!form) {
        throw new Error("Form not found");
    }

    // 2. Validate Answers
    const questions = form.sections.flatMap(s => s.questions);
    for (const q of questions) {
        if (q.required) {
            const answer = answers[q.id];
            // Check for empty string or null/undefined
            if (answer === undefined || answer === null || answer === "" || (Array.isArray(answer) && answer.length === 0)) {
                throw new Error(`Missing required field: ${q.label}`);
            }
        }
    }

    // 3. Calculate Score (if Quiz)
    let totalScore: number | null = null;
    if (form.isQuiz) {
        totalScore = 0;
        for (const q of questions) {
            const answer = answers[q.id];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const correctAnswer = (q.metadata as any)?.correctAnswer;
            const points = q.points || 0;

            if (correctAnswer !== undefined && answer !== undefined && answer !== null) {
                // Determine match
                let isCorrect = false;
                if (Array.isArray(answer)) {
                    // Checkboxes: exact match of sorted arrays (simple version)
                    // Not fully implementing checkbox grading yet, exact match for now
                    isCorrect = false;
                } else {
                    // String comparison (case-insensitive for text)
                    if (q.type === 'SHORT_TEXT' || q.type === 'PARAGRAPH') {
                        isCorrect = String(answer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
                    } else {
                        // Exact match for options
                        isCorrect = String(answer) === String(correctAnswer);
                    }
                }

                if (isCorrect) {
                    totalScore += points;
                }
            }
        }
    }

    // 4. Save Response
    const response = await prisma.response.create({
        data: {
            formId: form.id,
            answers: answers,
            score: totalScore
        }
    });

    return { success: true, responseId: response.id, isQuiz: form.isQuiz, score: totalScore };
}
