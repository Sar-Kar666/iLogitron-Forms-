import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signUpSchema } from '@/lib/validators';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = signUpSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error.flatten() }, { status: 400 });
        }

        const { email, password, name } = result.data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'RESPONDER', // Default role
            },
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({ success: true, data: userWithoutPassword }, { status: 201 });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
