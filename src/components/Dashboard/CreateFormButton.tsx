"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/UI/Button";
import { createForm } from "@/app/dashboard/actions";

export function CreateFormButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleCreate = () => {
        startTransition(async () => {
            try {
                const form = await createForm({ title: "Untitled Form" });
                router.push(`/builder/${form.id}`);
            } catch (error) {
                console.error("Failed to create form", error);
                // Toast error here
            }
        });
    };

    return (
        <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Plus className="mr-2 h-4 w-4" />
            )}
            Create Form
        </Button>
    );
}
