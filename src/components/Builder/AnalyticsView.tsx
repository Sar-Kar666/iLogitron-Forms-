"use client";

import { Question, QuestionType } from "@prisma/client";
import { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

// Bright, Google-ish colors for charts
const COLORS = ["#4285F4", "#DB4437", "#F4B400", "#0F9D58", "#AB47BC", "#00ACC1", "#FF7043", "#9E9D24"];

interface ResponseData {
    answers: Record<string, string | string[] | number | null>;
}

interface AnalyticsViewProps {
    questions: Question[];
    responses: ResponseData[];
}

export function AnalyticsView({ questions, responses }: AnalyticsViewProps) {
    const analyticsData = useMemo(() => {
        return questions.map((q) => {
            const answerCounts: Record<string, number> = {};
            let totalAnswers = 0;

            responses.forEach((r) => {
                const answer = r.answers[q.id] as string | string[] | number | null;
                if (answer) {
                    if (Array.isArray(answer)) {
                        // Checkboxes
                        answer.forEach((val) => {
                            const strVal = String(val);
                            answerCounts[strVal] = (answerCounts[strVal] || 0) + 1;
                            totalAnswers++;
                        });
                    } else {
                        const strVal = String(answer);
                        answerCounts[strVal] = (answerCounts[strVal] || 0) + 1;
                        totalAnswers++;
                    }
                }
            });

            const data = Object.entries(answerCounts).map(([name, value]) => ({
                name,
                value,
            }));

            // Sort by value desc for better visualization usually, or by name if logical
            // For now, let's just leave it as is or maybe sort by count
            // data.sort((a, b) => b.value - a.value);

            return {
                questionId: q.id,
                label: q.label,
                type: q.type,
                totalAnswers,
                data,
                textData: q.type === QuestionType.SHORT_TEXT || q.type === QuestionType.PARAGRAPH
                    ? responses.map(r => r.answers[q.id]).filter(Boolean).slice(0, 5) // Show top 5 recent?
                    : []
            };
        });
    }, [questions, responses]);

    if (responses.length === 0) {
        return <div className="text-center p-10 text-muted-foreground">No responses to analyze yet.</div>;
    }

    return (
        <div className="space-y-8 pb-20">
            {analyticsData.map((item) => (
                <div key={item.questionId} className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
                    <h3 className="text-lg font-medium">{item.label}</h3>
                    <div className="text-sm text-muted-foreground mb-4">{item.totalAnswers} responses</div>

                    {/* Chart Logic */}
                    <div className="h-[300px] w-full flex items-center justify-center bg-muted/10 rounded-lg p-2">
                        {(item.type === QuestionType.MULTIPLE_CHOICE || item.type === QuestionType.DROPDOWN) && (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={item.data}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        label={({ name, percent }: any) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {item.data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}

                        {(item.type === QuestionType.CHECKBOXES || item.type === QuestionType.LINEAR_SCALE) && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={item.data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                    <Bar dataKey="value" fill="#4285F4" radius={[0, 4, 4, 0]}>
                                        {item.data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}

                        {(item.type === QuestionType.SHORT_TEXT || item.type === QuestionType.PARAGRAPH) && (
                            <div className="w-full h-full overflow-y-auto space-y-2 p-2">
                                {item.textData.length > 0 ? (
                                    item.textData.map((text, idx) => (
                                        <div key={idx} className="bg-muted/50 p-3 rounded-md text-sm">
                                            {String(text)}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-muted-foreground text-sm italic">No text responses.</div>
                                )}
                                <div className="text-xs text-muted-foreground pt-2">Showing latest 5 responses</div>
                            </div>
                        )}

                        {/* Fallback for other types or empty charts */}
                        {item.data.length === 0 && (item.type !== QuestionType.SHORT_TEXT && item.type !== QuestionType.PARAGRAPH) && (
                            <div className="text-muted-foreground text-sm">No data to display.</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
