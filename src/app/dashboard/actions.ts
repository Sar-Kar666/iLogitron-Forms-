"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getForms() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return [];
    }

    const forms = await prisma.form.findMany({
        where: {
            ownerId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            _count: {
                select: { responses: true }
            }
        }
    });

    return forms;
}

export async function createForm(data: { title: string; description?: string }) {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.id) {
        throw new Error("Unauthorized");
    }

    const form = await prisma.form.create({
        data: {
            title: data.title,
            description: data.description,
            ownerId: session.user.id,
            settings: {},
            published: false,
            sections: {
                create: {
                    title: "Section 1",
                    order: 0,
                }
            }
        },
    });

    revalidatePath("/dashboard");
    return form;
}
