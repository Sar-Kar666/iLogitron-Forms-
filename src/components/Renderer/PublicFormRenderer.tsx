"use client";

import React from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/UI/Button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/UI/Select";
import { EditorQuestion, EditorOption } from "@/types/editor";
import { cn } from "@/lib/utils";

// We'll need a way to render different inputs based on type
// For now, let's build a basic renderer that maps types to simple inputs.

interface PublicFormRendererProps {
    form: {
        id: string;
        title: string;
        description: string | null;
        questions: EditorQuestion[];
    };
}

// Helper to generate Zod schema dynamically from questions
const generateSchema = (questions: EditorQuestion[]) => {
    const shape: Record<string, z.ZodTypeAny> = {};

    questions.forEach((q) => {
        let fieldSchema: z.ZodTypeAny;

        switch (q.type) {
            case 'SHORT_TEXT':
            case 'PARAGRAPH':
            case 'DROPDOWN':
            case 'MULTIPLE_CHOICE':
                fieldSchema = z.string();
                break;
            case 'CHECKBOXES':
                fieldSchema = z.array(z.string());
                break;
            default:
                fieldSchema = z.any();
        }

        if (q.required) {
            if (q.type === 'CHECKBOXES') {
                fieldSchema = (fieldSchema as z.ZodArray<z.ZodString>).min(1, "This field is required");
            } else {
                // For strings, min(1) works. For others, refine.
                if (fieldSchema instanceof z.ZodString) {
                    fieldSchema = fieldSchema.min(1, "This field is required");
                }
            }
        } else {
            fieldSchema = fieldSchema.optional();
        }

        shape[q.id] = fieldSchema;
    });

    return z.object(shape);
};

export const PublicFormRenderer: React.FC<PublicFormRendererProps> = ({ form }) => {
    const schema = React.useMemo(() => generateSchema(form.questions), [form.questions]);

    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues: {}
    });

    const [submitting, setSubmitting] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);

    const onSubmit = async (data: Record<string, unknown>) => {
        try {
            setSubmitting(true);
            const res = await fetch(`/api/forms/${form.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: data })
            });

            if (!res.ok) throw new Error("Submission failed");

            setSubmitted(true);
            // alert("Submitted successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to submit form. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="bg-white rounded-lg border-t-8 border-t-purple-600 shadow-sm p-8 text-center">
                    <h1 className="text-2xl font-medium text-gray-900 mb-2">{form.title}</h1>
                    <p className="text-gray-600 mb-6">Your response has been recorded.</p>
                    <a href={`/s/${form.id}`} className="text-sm text-purple-600 hover:underline">Submit another response</a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Header Card */}
                    <div className="bg-white rounded-lg border-t-8 border-t-purple-600 shadow-sm p-6 mb-4">
                        <h1 className="text-3xl font-medium text-gray-900 mb-2">{form.title}</h1>
                        {form.description && <p className="text-sm text-gray-600">{form.description}</p>}
                        <div className="mt-2 text-red-500 text-sm">* Indicates required field</div>
                    </div>

                    {/* Questions */}
                    {form.questions.map((q) => (
                        <div key={q.id} className={cn("bg-white rounded-lg border border-gray-200 shadow-sm p-6 transition-all", methods.formState.errors[q.id] ? "border-red-500" : "")}>
                            <div className="mb-4">
                                <label className="text-base font-medium text-gray-900 block mb-1">
                                    {q.label}
                                    {q.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {q.helpText && <div className="text-sm text-gray-500">{q.helpText}</div>}
                            </div>

                            <div className="space-y-2">
                                {q.type === 'SHORT_TEXT' && (
                                    <input
                                        type="text"
                                        className="w-full md:w-1/2 border-b border-gray-300 focus:border-purple-600 focus:outline-none py-1 transition-colors"
                                        placeholder="Your answer"
                                        {...methods.register(q.id)}
                                    />
                                )}

                                {q.type === 'PARAGRAPH' && (
                                    <textarea
                                        className="w-full border-b border-gray-300 focus:border-purple-600 focus:outline-none py-1 resize-y min-h-[40px] transition-colors"
                                        placeholder="Your answer"
                                        {...methods.register(q.id)}
                                    />
                                )}

                                {q.type === 'MULTIPLE_CHOICE' && (
                                    <div className="space-y-3">
                                        {(q.options as EditorOption[])?.map((opt, idx) => (
                                            <label key={opt.id || idx} className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value={opt.label}
                                                    className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500"
                                                    {...methods.register(q.id)}
                                                />
                                                <span className="text-sm text-gray-700">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'CHECKBOXES' && (
                                    <div className="space-y-3">
                                        {(q.options as EditorOption[])?.map((opt, idx) => (
                                            <label key={opt.id || idx} className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value={opt.label}
                                                    className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                                    {...methods.register(q.id)}
                                                />
                                                <span className="text-sm text-gray-700">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'DROPDOWN' && (
                                    <Controller
                                        control={methods.control}
                                        name={q.id}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                                                <SelectTrigger className="w-full md:w-1/2">
                                                    <SelectValue placeholder="Select an option" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(q.options as EditorOption[])?.map((opt, idx) => (
                                                        <SelectItem key={opt.id || idx} value={opt.label}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                )}
                            </div>

                            {methods.formState.errors[q.id] && (
                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    {methods.formState.errors[q.id]?.message as string}
                                </p>
                            )}
                        </div>
                    ))}

                    <div className="flex justify-between items-center pt-4">
                        <Button type="submit" size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit"}
                        </Button>
                        <button type="button" className="text-purple-600 text-sm font-medium hover:text-purple-800" onClick={() => methods.reset()}>Clear form</button>
                    </div>
                </form>
            </FormProvider>

            <div className="mt-8 text-center text-xs text-gray-500">
                This content is neither created nor endorsed by iLogitron.
            </div>
        </div>
    );
};
