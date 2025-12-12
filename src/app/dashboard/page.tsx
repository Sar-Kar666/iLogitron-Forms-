import { Suspense } from "react";
import { getForms } from "./actions";
import { FormCard } from "@/components/Dashboard/FormCard";
import { CreateFormButton } from "@/components/Dashboard/CreateFormButton";

export default async function DashboardPage() {
    const forms = await getForms();

    return (
        <div className="flex flex-col space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Manage your forms and view responses.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <CreateFormButton />
                </div>
            </div>

            {forms.length === 0 ? (
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <h3 className="mt-4 text-lg font-semibold">No forms created</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground">
                            You haven&apos;t created any forms yet. Start by creating a new one.
                        </p>
                        <CreateFormButton />
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {forms.map((form) => (
                        <FormCard key={form.id} form={form} />
                    ))}
                </div>
            )}
        </div>
    );
}
