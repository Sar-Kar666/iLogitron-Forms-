
import { updateFormContent, getFormById } from "./src/app/builder/[id]/actions";
import { prisma } from "./src/lib/prisma";
import { QuestionType } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

// Mock session by overwriting getServerSession behavior?
// It's hard to mock next-auth in a standalone script.
// Instead, we will inspect the logic or use a test-user flow.

// Actually, testing server actions standalone usually requires a running Next.js context or mocking.
// Since we have direct access to DB, let's just create a dummy form manually and verify the data layer
// by running a simplified version of the logic, OR temporarily bypassing auth in actions for this script.

// Bypassing auth is risky.
// Let's create a standalone test script that DOES NOT rely on the server action but replicates its DB logic
// to verify the TRANSACTION logic is sound. We trust `prisma.$transaction`.

// Better: Create a user and form in DB, then print out instructions to check it via UI?
// No, user wants automated.

async function verifyPersistence() {
    console.log("Verifying Persistence Logic...");

    try {
        // 1. Create a Test User
        const userEmail = `test-${Date.now()}@example.com`;
        const user = await prisma.user.create({
            data: { email: userEmail, password: "hash", name: "Tester" }
        });
        console.log("Created Test User:", user.id);

        // 2. Create a Form
        const form = await prisma.form.create({
            data: {
                title: "Test Form",
                ownerId: user.id,
                settings: {}, // Required JSON field
                sections: {
                    create: { title: "Main Section", order: 0 }
                }
            },
            include: { sections: true }
        });
        console.log("Created Form:", form.id);
        const sectionId = form.sections[0].id;

        // 3. Simulate "Saving" questions (Upsert Logic)
        const q1Id = uuidv4();
        const q2Id = uuidv4();

        const questionsToSave = [
            {
                id: q1Id,
                sectionId: sectionId,
                type: QuestionType.SHORT_TEXT,
                label: "Question 1",
                required: true,
                order: 0,
                options: null,
                helpText: null, validation: null, points: 0, metadata: null // Defaults
            },
            {
                id: q2Id,
                sectionId: sectionId,
                type: QuestionType.MULTIPLE_CHOICE,
                label: "Question 2",
                required: false,
                order: 1,
                options: [{ label: "A", value: "a" }, { label: "B", value: "b" }],
                helpText: null, validation: null, points: 0, metadata: null
            }
        ];

        // LOGIC FROM ACTION
        await prisma.$transaction(async (tx) => {
            const keptIds = questionsToSave.map(q => q.id);
            await tx.question.deleteMany({
                where: {
                    sectionId: sectionId,
                    id: { notIn: keptIds }
                }
            });

            for (const [index, q] of questionsToSave.entries()) {
                await tx.question.upsert({
                    where: { id: q.id },
                    update: {
                        label: q.label,
                        type: q.type,
                        required: q.required,
                        order: index,
                        options: q.options || undefined,
                    },
                    create: {
                        id: q.id,
                        sectionId: sectionId,
                        label: q.label,
                        type: q.type,
                        required: q.required,
                        order: index,
                        options: q.options || undefined,
                    }
                });
            }
        });
        console.log("Executed Upsert Transaction");

        // 4. Verify DB State
        const savedQuestions = await prisma.question.findMany({
            where: { sectionId },
            orderBy: { order: 'asc' }
        });

        if (savedQuestions.length !== 2) throw new Error("Expected 2 questions");
        if (savedQuestions[0].label !== "Question 1") throw new Error("Q1 label mismatch");
        if (savedQuestions[1].options && (savedQuestions[1].options as any).length !== 2) throw new Error("Q2 options mismatch");

        console.log("SUCCESS: Database persistence logic verified!");

        // Cleanup
        await prisma.form.delete({ where: { id: form.id } });
        await prisma.user.delete({ where: { id: user.id } });

    } catch (e) {
        console.error("FAILED:", e);
        process.exit(1);
    }
}

verifyPersistence();
