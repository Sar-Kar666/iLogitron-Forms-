"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import { Question } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getFormById(id: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return null;
    }

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

    if (!form) {
        return null;
    }

    if (form.ownerId !== session.user.id) {
        // Basic authorization check
        return null;
    }

    return form;
}

import { ThemeSettings } from "@/types";

export async function updateFormContent(
    formId: string,
    questions: Question[],
    settings?: { title?: string; description?: string; settings?: ThemeSettings }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const form = await prisma.form.findUnique({
        where: { id: formId },
        include: { sections: true }
    });

    if (!form || form.ownerId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    // Assume single section for now
    let sectionId = form.sections[0]?.id;
    if (!sectionId) {
        // Self-healing: Create default section if missing
        const newSection = await prisma.section.create({
            data: { formId: form.id, title: "Section 1", order: 0 }
        });
        sectionId = newSection.id;
    }

    return await prisma.$transaction(async (tx) => {
        // 0. Update Form Metadata if provided
        if (settings) {
            await tx.form.update({
                where: { id: formId },
                data: {
                    title: settings.title,
                    description: settings.description,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    settings: (settings.settings as any) ?? undefined
                }
            });
        }

        // 1. Delete questions that are not present in the new list
        const keptIds = questions.map(q => q.id);
        await tx.question.deleteMany({
            where: {
                sectionId: sectionId,
                id: { notIn: keptIds }
            }
        });

        // 2. Upsert each question
        for (const [index, q] of questions.entries()) {
            await tx.question.upsert({
                where: { id: q.id },
                update: {
                    label: q.label,
                    type: q.type,
                    required: q.required,
                    order: index, // Use proper order from list
                    options: q.options || undefined, // JSON
                },
                create: {
                    id: q.id, // Use client-generated ID
                    sectionId: sectionId,
                    label: q.label,
                    type: q.type,
                    required: q.required,
                    order: index,
                    options: q.options || undefined,
                }
            });
        }

        revalidatePath(`/builder/${formId}`);
        revalidatePath(`/forms/${formId}`); // Ensure public view updates
        return { success: true };
    }, {
        maxWait: 5000, // default: 2000
        timeout: 10000 // default: 5000
    });
}

export async function getFormResponses(formId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const form = await prisma.form.findUnique({
        where: { id: formId },
        select: { ownerId: true }
    });

    if (!form || form.ownerId !== session.user.id) return null;

    return await prisma.response.findMany({
        where: { formId },
        orderBy: { createdAt: 'desc' }
    });
}
