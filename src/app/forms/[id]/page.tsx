import { getPublicFormById } from "./actions";
import { notFound } from "next/navigation";
import { PublicFormRenderer } from "@/components/Renderer/PublicFormRenderer";

export default async function PublicFormPage({ params }: { params: { id: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const form = await getPublicFormById(resolvedParams.id);

    if (!form) {
        notFound();
    }

    // TODO: Add check for form.published status if we add that feature later.

    return (
        <div className="min-h-screen bg-purple-50 dark:bg-zinc-950 py-10 px-4">
            <PublicFormRenderer form={form} />
        </div>
    );
}
