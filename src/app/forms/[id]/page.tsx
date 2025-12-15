import { getPublicFormById } from "./actions";
import { notFound, redirect } from "next/navigation";
import { PublicFormRenderer } from "@/components/Renderer/PublicFormRenderer";
import { EditorQuestion } from '@/types/editor';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ThemeSettings } from "@/types";

export default async function PublicFormPage({ params }: { params: { id: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const form = await getPublicFormById(resolvedParams.id);

    if (!form) {
        notFound();
    }

    if (!form.published) {
        notFound();
    }

    const session = await getServerSession(authOptions);
    const settings = form.settings as unknown as ThemeSettings;

    if (settings?.requiresLogin && !session?.user) {
        redirect(`/api/auth/signin?callbackUrl=/forms/${form.id}`);
    }

    const questions = form.sections.flatMap(section => section.questions);

    return (
        <div className="min-h-screen bg-purple-50 dark:bg-zinc-950 py-10 px-4">
            <PublicFormRenderer form={{ ...form, questions: questions as unknown as EditorQuestion[] }} />
        </div>
    );
}
