"use client";

import { useState } from "react";
import { Form, Section, Question, QuestionType } from "@prisma/client"; // Ensure imports match
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { ThemeSettings, QuestionOption } from "@/types";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";
import { submitResponse } from "@/app/forms/[id]/actions";

// Helper to convert Hex to HSL for Shadcn
function hexToHSL(hex: string) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt("0x" + hex[1] + hex[1]);
        g = parseInt("0x" + hex[2] + hex[2]);
        b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt("0x" + hex[1] + hex[2]);
        g = parseInt("0x" + hex[3] + hex[4]);
        b = parseInt("0x" + hex[5] + hex[6]);
    }
    r /= 255;
    g /= 255;
    b /= 255;
    const cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin;
    let h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `${h} ${s}% ${l}%`;
}

type FormWithSections = Form & {
    sections: (Section & {
        questions: Question[];
    })[];
};

export function PublicFormRenderer({ form }: { form: FormWithSections }) {
    const { data: session, status } = useSession();
    const [answers, setAnswers] = useState<Record<string, string | string[] | number | null>>({});
    const [emailInput, setEmailInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const settings = (form.settings as unknown as ThemeSettings) || {};
    const theme = settings.theme || {};
    const requiresLogin = settings.requiresLogin || false;
    const collectEmail = settings.collectEmail || false;

    // Assumed email to use (session or input)
    const activeEmail = session?.user?.email || emailInput;

    const questions = form.sections[0]?.questions || [];

    const handleAnswerChange = (questionId: string, value: string | string[] | number | null) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validation: Email
        if (collectEmail && !activeEmail) {
            toast.error("Please provide your email address.");
            setIsSubmitting(false);
            return;
        }

        // Basic Validation check
        const missingRequired = questions.filter(q => q.required && !answers[q.id]);
        if (missingRequired.length > 0) {
            toast.error(`Please answer all required questions.`);
            setIsSubmitting(false);
            return;
        }

        try {
            // Append email to answers with special key if collected
            const submissionData = { ...answers };
            if (collectEmail && activeEmail) {
                // We'll store it in a special key or separate field. 
                // For now, let's prepend it as a "hidden" answer or handle in server.
                // Ideally, we'd add 'respondentEmail' to submitResponse args.
                // Let's stick to answers payload for minimum viable change:
                submissionData['__email_collected__'] = activeEmail;
            }

            await submitResponse(form.id, submissionData);
            setIsSubmitted(true);
            toast.success("Response submitted successfully!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit response.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === "loading") {
        return <div className="p-10 text-center">Loading form...</div>;
    }

    // Enforcement: Require Login
    if (requiresLogin && !session) {
        return (
            <div className="max-w-md mx-auto mt-20 bg-white dark:bg-card rounded-lg border shadow-sm p-8 text-center space-y-6">
                <h2 className="text-xl font-semibold">Sign in required</h2>
                <p className="text-muted-foreground">This form requires you to verify your identity.</p>
                <Button onClick={() => signIn("google")} className="w-full">
                    Sign in with Google
                </Button>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="max-w-xl mx-auto bg-white dark:bg-card rounded-lg shadow-md p-8 text-center space-y-4">
                <h1 className="text-2xl font-bold">Thank You!</h1>
                <p className="text-muted-foreground">Your response has been recorded.</p>
                <Button variant="link" onClick={() => window.location.reload()}>Submit another response</Button>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Dynamic Style Injection */}
            <style jsx global>{`
                ${theme.primary ? `
                    :root {
                        --primary: ${hexToHSL(theme.primary)};
                        --ring: ${hexToHSL(theme.primary)};
                    }
                ` : ''}
                ${theme.background ? `
                    body {
                        background-color: ${theme.background} !important;
                    }
                ` : ''}
            `}</style>

            <div className="bg-card rounded-xl border shadow-sm p-8 border-t-8 border-t-primary">
                <h1 className="text-3xl font-bold">{form.title}</h1>
                {form.description && (
                    <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{form.description}</p>
                )}
                {/* Email Collection Status / Switch Account */}
                {collectEmail && (
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                        {session?.user?.email ? (
                            <div>
                                Recording as <span className="font-medium text-foreground">{session.user.email}</span>
                                <span className="mx-2">•</span>
                                <button onClick={() => signIn()} className="text-primary hover:underline">Switch account</button>
                            </div>
                        ) : (
                            <div>
                                Sign in to save your progress. <button onClick={() => signIn("google")} className="text-primary hover:underline">Sign in with Google</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Manual Email Input if collecting and not logged in */}
                {collectEmail && !session?.user?.email && (
                    <div className="bg-card rounded-lg shadow-sm border p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-base font-medium text-foreground block">
                                Email Address <span className="text-destructive ml-1">*</span>
                            </label>
                            <Input
                                type="email"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                placeholder="Your email address"
                                className="border-b border-t-0 border-x-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                                required
                            />
                        </div>
                    </div>
                )}

                {questions.map((q) => (
                    <div key={q.id} className="bg-card rounded-lg shadow-sm border p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-base font-medium text-foreground block">
                                {q.label}
                                {q.required && <span className="text-destructive ml-1">*</span>}
                            </label>
                            {q.helpText && <p className="text-xs text-muted-foreground">{q.helpText}</p>}
                        </div>

                        {/* Render Input based on type */}
                        <div className="mt-2">
                            {q.type === "SHORT_TEXT" && (
                                <Input
                                    value={answers[q.id] || ""}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    placeholder="Your answer"
                                    className="border-b border-t-0 border-x-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                                />
                            )}

                            {q.type === "PARAGRAPH" && (
                                <textarea
                                    value={answers[q.id] || ""}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    className="w-full border p-2 rounded-md min-h-[100px] bg-transparent text-foreground placeholder:text-muted-foreground"
                                    placeholder="Your answer"
                                />
                            )}

                            {q.type === "MULTIPLE_CHOICE" && q.options && (
                                <div className="space-y-2">
                                    {(q.options as unknown as QuestionOption[]).map((opt, idx) => (
                                        <label key={idx} className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={q.id}
                                                value={opt.value || opt.label}
                                                checked={answers[q.id] === (opt.value || opt.label)}
                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                className="w-5 h-5 text-primary focus:ring-primary border-muted-foreground"
                                            />
                                            <span className="text-foreground">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Fallback for other types for now */}
                            {["CHECKBOXES", "DROPDOWN", "DATE", "TIME", "LINEAR_SCALE"].includes(q.type) && (
                                <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 p-2 rounded">
                                    Type {q.type} renderer coming soon.
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <div className="flex justify-between items-center py-4">
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                    <Button type="button" variant="ghost" className="text-muted-foreground" onClick={() => setAnswers({})}>
                        Clear form
                    </Button>
                </div>
            </form>
        </div>
    );
}
