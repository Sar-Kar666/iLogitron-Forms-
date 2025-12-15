import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ThemeSettings } from "@/types";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { answers } = body; // Expecting { answers: { [questionId]: value } }

        if (!answers) {
            return NextResponse.json({ success: false, error: "Missing answers" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);

        // Verify form exists
        const form = await prisma.form.findUnique({
            where: { id },
            select: { id: true, published: true, settings: true }
        });

        if (!form) {
            return NextResponse.json({ success: false, error: "Form not found" }, { status: 404 });
        }

        // Logic check: if requires login
        const settings = form.settings as unknown as ThemeSettings;
        if (settings?.requiresLogin && !session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const finalAnswers = { ...answers };
        if (session?.user?.email) {
            finalAnswers['__email_collected__'] = session.user.email;
        }

        // Create Response
        // We store answers as JSON
        const response = await prisma.response.create({
            data: {
                formId: id,
                answers: finalAnswers,
                userId: session?.user?.id || null,
            }
        });

        return NextResponse.json({ success: true, id: response.id });
    } catch (error) {
        console.error("Submit form error", error);
        return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
    }
}
