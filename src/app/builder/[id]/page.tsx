import { getFormById } from "./actions";
import { notFound, redirect } from "next/navigation";
import { FormBuilder } from "@/components/Builder/FormBuilder";

export default async function BuilderPage({ params }: { params: { id: string } }) {
    // Awaiting params is required in Next.js 15+, but we are on v16-ish/canary? 
    // Next 15 changed params to Promise. Just in case, let's await it if needed or treat as obj.
    // Actually params is still usually synchronous in server components for now unless using the new pattern.
    // Let's assume standard object for now or handle promise if it errors.

    // Actually Next.js 15 made params a promise. Our package.json says "next": "16.0.8" (beta?). 
    // Let's handle it as a Promise just to be safe if types complain, or check if it builds.
    // We'll write it as standard first.

    const resolvedParams = await Promise.resolve(params); // Compatibility
    const form = await getFormById(resolvedParams.id);

    if (!form) {
        notFound();
    }

    return (
        <div className="fixed inset-0 z-50 bg-background">
            <FormBuilder initialForm={form} />
        </div>
    );
}
