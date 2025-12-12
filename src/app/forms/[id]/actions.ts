"use server";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

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

export async function submitResponse(formId: string, answers: Record<string, any>) {
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

    // 3. Save Response
    const response = await prisma.response.create({
        data: {
            formId: form.id,
            answers: answers,
        }
    });

    return { success: true, responseId: response.id };
}
