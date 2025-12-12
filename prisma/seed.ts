import { PrismaClient, QuestionType, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

    // 1. Create Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@ilogitron.com' },
        update: {},
        create: {
            email: 'admin@ilogitron.com',
            name: 'Admin User',
            password: passwordHash,
            role: Role.SUPER_ADMIN,
        },
    });

    const editor1 = await prisma.user.upsert({
        where: { email: 'editor1@ilogitron.com' },
        update: {},
        create: {
            email: 'editor1@ilogitron.com',
            name: 'Editor One',
            password: passwordHash,
            role: Role.EDITOR,
        },
    });

    const editor2 = await prisma.user.upsert({
        where: { email: 'editor2@ilogitron.com' },
        update: {},
        create: {
            email: 'editor2@ilogitron.com',
            name: 'Editor Two',
            password: passwordHash,
            role: Role.EDITOR,
        },
    });

    const responder = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            name: 'Regular Responder',
            password: passwordHash,
            role: Role.RESPONDER,
        },
    });

    console.log('Users created');

    // 2. Create Sample Quiz
    const quiz = await prisma.form.create({
        data: {
            title: 'General Knowledge Quiz',
            description: 'Test your knowledge!',
            ownerId: admin.id,
            published: true,
            isQuiz: true,
            settings: {
                collectEmail: true,
                limitOneResponse: false,
            },
            sections: {
                create: [
                    {
                        order: 0,
                        title: 'Section 1',
                        questions: {
                            create: [
                                {
                                    order: 0,
                                    type: QuestionType.MULTIPLE_CHOICE,
                                    label: 'What is the capital of France?',
                                    required: true,
                                    options: [
                                        { label: 'London', value: 'london' },
                                        { label: 'Paris', value: 'paris' },
                                        { label: 'Berlin', value: 'berlin' },
                                    ],
                                    points: 5,
                                    validation: { correct: 'paris' },
                                },
                                {
                                    order: 1,
                                    type: QuestionType.CHECKBOXES,
                                    label: 'Which of these are fruits?',
                                    required: true,
                                    options: [
                                        { label: 'Apple', value: 'apple' },
                                        { label: 'Carrot', value: 'carrot' },
                                        { label: 'Banana', value: 'banana' },
                                    ],
                                    points: 5,
                                    validation: { correct: ['apple', 'banana'] },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });

    console.log('Quiz created');

    // 3. Create Sample Survey
    const survey = await prisma.form.create({
        data: {
            title: 'Customer Feedback Survey',
            description: 'We value your feedback.',
            ownerId: editor1.id,
            published: true,
            settings: {},
            collaborators: {
                create: {
                    userId: editor2.id,
                    role: Role.EDITOR,
                },
            },
            sections: {
                create: [
                    {
                        order: 0,
                        questions: {
                            create: [
                                {
                                    order: 0,
                                    type: QuestionType.LINEAR_SCALE,
                                    label: 'How satisfied are you with our service?',
                                    required: true,
                                    options: { min: 1, max: 5, minLabel: 'Very Dissatisfied', maxLabel: 'Very Satisfied' },
                                },
                                {
                                    order: 1,
                                    type: QuestionType.PARAGRAPH,
                                    label: 'Any other feedback?',
                                    required: false,
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });

    console.log('Survey created');

    // 4. Create Responses for Quiz
    // Create 5 random responses
    for (let i = 0; i < 5; i++) {
        await prisma.response.create({
            data: {
                formId: quiz.id,
                userId: i % 2 === 0 ? responder.id : null, // mix of logged in and anon
                answers: [
                    { questionId: 'q1-placeholder', value: 'paris' }, // Needs real ID mapping in real app
                ],
                score: Math.floor(Math.random() * 10),
            },
        });
    }

    // NOTE: In a real seed, we need to fetch question IDs to link answers correctly. 
    // For simplicity here, we're just creating the structure. 
    // If we want valid analytics, we should query the questions we just created.

    const quizQuestions = await prisma.question.findMany({ where: { section: { formId: quiz.id } } });

    for (let i = 0; i < 5; i++) {
        const answers = quizQuestions.map(q => {
            // simpler logic for seed
            return {
                questionId: q.id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value: q.options && Array.isArray(q.options) ? (q.options[0] as any).value : 'answer'
            };
        });

        await prisma.response.create({
            data: {
                formId: quiz.id,
                answers: answers,
                score: 5,
            }
        });
    }

    console.log('Responses created');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
