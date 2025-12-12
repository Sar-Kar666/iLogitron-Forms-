"use client";

import { useState } from "react";
import { Question, QuestionType } from "@prisma/client";
import { Trash2, GripVertical, Copy } from "lucide-react";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/UI/Select"; // Need to create Select component
import { Switch } from "@/components/UI/Switch"; // Need to create Switch component
import { OptionsList } from "./OptionsList";
import { QuestionOption } from "@/types";

interface QuestionEditorProps {
    question: Question;
    isQuiz: boolean;
    onUpdate: (id: string, updates: Partial<Question>) => void;
    onDelete: (id: string) => void;
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>; // Contains listener/attributes
}

export function QuestionEditor({ question, isQuiz, onUpdate, onDelete, dragHandleProps }: QuestionEditorProps) {
    return (
        <div className="group relative flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md focus-within:shadow-lg focus-within:ring-0 overflow-hidden">
            {/* Active Accent Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary opacity-0 transition-opacity duration-200 group-focus-within:opacity-100" />

            <div
                className="absolute left-[2px] top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-muted-foreground opacity-0 group-hover:opacity-100 p-2 hover:bg-muted/50 rounded-md transition-all z-10"
                {...dragHandleProps}
            >
                <GripVertical className="h-5 w-5" />
            </div>

            <div className="flex gap-4 pl-6">
                <div className="flex-1">
                    <Input
                        value={question.label}
                        onChange={(e) => onUpdate(question.id, { label: e.target.value })}
                        className="text-xl font-medium border-b-2 border-transparent border-x-0 border-t-0 bg-transparent focus-visible:ring-0 focus-visible:border-primary px-0 h-auto placeholder:text-muted-foreground/50 transition-colors rounded-none pb-2"
                        placeholder="Question Text"
                    />
                </div>
                <div className="w-[200px]">
                    <Select
                        value={question.type}
                        onValueChange={(value) => onUpdate(question.id, { type: value as QuestionType })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Question Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={QuestionType.SHORT_TEXT}>Short Answer</SelectItem>
                            <SelectItem value={QuestionType.PARAGRAPH}>Paragraph</SelectItem>
                            <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                            <SelectItem value={QuestionType.CHECKBOXES}>Checkboxes</SelectItem>
                            <SelectItem value={QuestionType.DROPDOWN}>Dropdown</SelectItem>
                            <SelectItem value={QuestionType.DATE}>Date</SelectItem>
                            <SelectItem value={QuestionType.TIME}>Time</SelectItem>
                            <SelectItem value={QuestionType.LINEAR_SCALE}>Linear Scale</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Render Options based on Type */}
            {(question.type === "MULTIPLE_CHOICE" || question.type === "CHECKBOXES" || question.type === "DROPDOWN") && (
                <div className="pl-6 space-y-2">
                    <OptionsList
                        type={question.type}
                        options={question.options as unknown as QuestionOption[]}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(options) => onUpdate(question.id, { options: options as any })}
                    />
                </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t pt-4 mt-2">
                <div className="flex items-center gap-2 mr-auto text-sm text-muted-foreground">
                    <Switch
                        checked={question.required}
                        onCheckedChange={(checked) => onUpdate(question.id, { required: checked })}
                    />
                    <span>Required</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { }}>
                    <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(question.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {isQuiz && (
                <div className="border-t pt-4 pl-6 space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Answer Key</h4>
                    <div className="flex gap-4">
                        <div className="w-24">
                            <label className="text-xs font-medium mb-1 block">Points</label>
                            <Input
                                type="number"
                                value={question.points || 0}
                                onChange={(e) => onUpdate(question.id, { points: parseInt(e.target.value) || 0 })}
                                className="h-8"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-medium mb-1 block">Correct Answer</label>
                            {(question.type === "SHORT_TEXT" || question.type === "PARAGRAPH") ? (
                                <Input
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    value={(question.metadata as any)?.correctAnswer || ""}
                                    onChange={(e) => onUpdate(question.id, {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        metadata: { ...(question.metadata as any), correctAnswer: e.target.value }
                                    })}
                                    placeholder="Enter the correct answer text"
                                    className="h-8"
                                />
                            ) : (question.type === "MULTIPLE_CHOICE" || question.type === "DROPDOWN") ? (
                                <Select
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    value={(question.metadata as any)?.correctAnswer || ""}
                                    onValueChange={(value) => onUpdate(question.id, {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        metadata: { ...(question.metadata as any), correctAnswer: value }
                                    })}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select correct option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(question.options as unknown as QuestionOption[])?.map((opt, idx) => (
                                            <SelectItem key={opt.id || idx} value={opt.label || ""}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
