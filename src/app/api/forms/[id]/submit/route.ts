import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        // Verify form exists
        const form = await prisma.form.findUnique({
            where: { id },
            select: { id: true, published: true } // check published status in real app
        });

        if (!form) {
            return NextResponse.json({ success: false, error: "Form not found" }, { status: 404 });
        }

        // Create Response
        // We store answers as JSON
        const response = await prisma.response.create({
            data: {
                formId: id,
                answers: answers,
                // userId: session?.user?.id, // Optional: Link to user if logged in (Anonymous for now)
            }
        });

        return NextResponse.json({ success: true, id: response.id });
    } catch (error) {
        console.error("Submit form error", error);
        return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
    }
}
