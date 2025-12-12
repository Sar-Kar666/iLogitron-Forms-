"use client";

import { useEffect, useState } from "react";
import { getFormResponses } from "@/app/builder/[id]/actions";
import { formatDistanceToNow } from "date-fns";

// Mocking simple table for speed if UI lib missing
function SimpleTable({ children }: { children: React.ReactNode }) {
    return <table className="w-full text-left text-sm">{children}</table>
}

import { Question } from "@prisma/client";
import { AnalyticsView } from "./AnalyticsView";
import { BarChart, List } from "lucide-react";

export function ResponsesView({ formId, questions }: { formId: string, questions: Question[] }) {
    const [responses, setResponses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"summary" | "individual">("summary");

    useEffect(() => {
        getFormResponses(formId).then(data => {
            setResponses(data || []);
            setLoading(false);
        });
    }, [formId]);

    const getAnswerLabel = (qId: string) => {
        const q = questions.find(q => q.id === qId);
        return q?.label || "Unknown Question";
    };

    if (loading) return <div className="p-8 text-center">Loading responses...</div>;

    if (responses.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">No responses yet.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{responses.length} Responses</h2>
                <div className="flex bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode("summary")}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === "summary" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <BarChart className="w-4 h-4 mr-2" />
                        Summary
                    </button>
                    <button
                        onClick={() => setViewMode("individual")}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === "individual" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <List className="w-4 h-4 mr-2" />
                        Individual
                    </button>
                </div>
            </div>

            {viewMode === "summary" ? (
                <AnalyticsView questions={questions} responses={responses} />
            ) : (
                <div className="p-6 bg-card rounded-xl border shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-3 px-4 text-left font-medium text-muted-foreground w-48">Submitted</th>
                                    <th className="py-3 px-4 text-left font-medium text-muted-foreground w-64">Respondent</th>
                                    <th className="py-3 px-4 text-left font-medium text-muted-foreground">Answers</th>
                                </tr>
                            </thead>
                            <tbody>
                                {responses.map((r) => {
                                    const email = r.answers['__email_collected__'];
                                    return (
                                        <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50 align-top">
                                            <td className="py-3 px-4 text-muted-foreground text-sm">
                                                {new Date(r.createdAt).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-foreground text-sm">
                                                {email ? (
                                                    <span className="font-medium text-primary">{email}</span>
                                                ) : (
                                                    <span className="text-muted-foreground type-italic">Anonymous</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-foreground">
                                                <div className="space-y-2">
                                                    {Object.entries(r.answers)
                                                        .filter(([key]) => key !== '__email_collected__')
                                                        .map(([key, value]) => (
                                                            <div key={key} className="text-sm">
                                                                <span className="font-semibold text-foreground block">
                                                                    {getAnswerLabel(key)}
                                                                </span>
                                                                <span className="text-muted-foreground">
                                                                    {String(value)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
