"use client";

import React from "react";
import { QuestionType } from "@prisma/client";
import { EditorQuestion, EditorOption } from "@/types/editor";
import { Button } from "@/components/UI/Button"; // Button exists
import { Trash2, Copy, MoreVertical, GripVertical } from "lucide-react";

interface QuestionCardProps {
    question: EditorQuestion;
    isActive: boolean;
    onUpdate: (id: string, updates: Partial<EditorQuestion>) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onClick: () => void;
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    isActive,
    onUpdate,
    onDelete,
    onDuplicate,
    onClick,
    dragHandleProps,
}) => {
    return (
        <div
            onClick={onClick}
            className={`relative bg-white rounded-lg border border-transparent shadow-sm transition-all duration-200 group mb-4 ${isActive ? "border-l-4 border-l-primary shadow-md ring-1 ring-primary/20" : "hover:bg-gray-50"
                }`}
        >
            {/* Drag Handle */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-6 flex items-center justify-center cursor-move text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                {...dragHandleProps}
            >
                <GripVertical size={16} className="rotate-90" />
            </div>

            <div className="p-6 pt-8">
                <div className="flex flex-row gap-4 items-start">
                    <div className="flex-1 space-y-4">
                        {/* Question Title */}
                        <input
                            type="text"
                            className={`w-full text-lg p-3 bg-gray-50 border-b border-gray-200 focus:border-primary focus:bg-gray-100 focus:outline-none transition-colors ${isActive ? "" : "bg-transparent border-transparent hover:border-gray-200"
                                }`}
                            placeholder="Question"
                            value={question.label}
                            onChange={(e) => onUpdate(question.id, { label: e.target.value })}
                        />

                        {/* Question Type Selector (Simplified) */}
                        {isActive && (
                            <div className="flex gap-2">
                                <select
                                    className="p-2 border rounded"
                                    value={question.type}
                                    onChange={(e) => onUpdate(question.id, { type: e.target.value as QuestionType })}
                                >
                                    <option value="SHORT_TEXT">Short answer</option>
                                    <option value="PARAGRAPH">Paragraph</option>
                                    <option value="MULTIPLE_CHOICE">Multiple choice</option>
                                    <option value="CHECKBOXES">Checkboxes</option>
                                    <option value="DROPDOWN">Dropdown</option>
                                    <option value="FILE">File upload</option>
                                </select>
                                {/* Assuming the user intended to add a checkbox for 'hasLogic' here */}
                                <label className="flex items-center gap-1 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={question.metadata?.hasLogic || false}
                                        onChange={(e) => onUpdate(question.id, {
                                            metadata: { ...(question.metadata || {}), hasLogic: e.target.checked }
                                        })}
                                    />
                                    Has Logic
                                </label>
                            </div>
                        )}

                        {/* Options Area */}
                        {(question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOXES' || question.type === 'DROPDOWN') && (
                            <div className="space-y-2 mt-4">
                                {(question.options as unknown as EditorOption[])?.map((option, index) => (
                                    <div key={option.id || index} className="flex items-center gap-2 group/option">
                                        {/* Icon based on type */}
                                        <div className="text-gray-400">
                                            {question.type === 'MULTIPLE_CHOICE' && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                                            {question.type === 'CHECKBOXES' && <div className="w-4 h-4 rounded border-2 border-gray-300" />}
                                            {question.type === 'DROPDOWN' && <span className="text-xs">{(index + 1) + "."}</span>}
                                        </div>

                                        <input
                                            type="text"
                                            className="flex-1 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-primary focus:outline-none transition-colors py-1"
                                            value={option.label}
                                            onChange={(e) => {
                                                const newOptions = [...(question.options as unknown as EditorOption[])];
                                                newOptions[index] = { ...newOptions[index], label: e.target.value };
                                                onUpdate(question.id, { options: newOptions });
                                            }}
                                            placeholder={`Option ${index + 1}`}
                                        />

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover/option:opacity-100 text-gray-400 hover:text-red-500"
                                            onClick={() => {
                                                const newOptions = (question.options as unknown as EditorOption[]).filter((_, i) => i !== index);
                                                onUpdate(question.id, { options: newOptions });
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </Button>
                                    </div>
                                ))}

                                {/* Add Option Button */}
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-4 h-4" /> {/* Spacer */}
                                    <button
                                        className="text-sm text-gray-500 hover:text-primary hover:underline"
                                        onClick={() => {
                                            const newOptions = [...(question.options as unknown as EditorOption[] || []), { id: crypto.randomUUID(), label: `Option ${(question.options as unknown as EditorOption[] || []).length + 1}` }];
                                            onUpdate(question.id, { options: newOptions });
                                        }}
                                    >
                                        Add option
                                    </button>
                                    {question.type !== 'DROPDOWN' && (
                                        <>
                                            <span className="text-gray-300">or</span>
                                            <button className="text-sm text-blue-600 hover:underline">Add &apos;Other&apos;</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isActive && (
                <div className="border-t p-2 flex justify-end items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDuplicate(question.id); }}>
                        <Copy size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(question.id); }}>
                        <Trash2 size={18} />
                    </Button>
                    <div className="h-6 w-px bg-gray-200 mx-2"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Required</span>
                        <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => onUpdate(question.id, { required: e.target.checked })}
                        />
                    </div>
                    <Button variant="ghost" size="icon">
                        <MoreVertical size={18} />
                    </Button>
                </div>
            )}
        </div>
    );
};
