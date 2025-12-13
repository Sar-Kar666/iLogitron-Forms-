"use client";

import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { QuestionCard } from "./QuestionCard";
import { Toolbar } from "./Toolbar";
import { QuestionType } from "@prisma/client";
import { useAutosave } from "@/hooks/useAutosave";
import { EditorQuestion } from "@/types/editor";

// Helper to generate IDs
const generateId = () => crypto.randomUUID();

interface FormEditorProps {
    formId: string;
    initialTitle?: string;
    initialDescription?: string;
    initialQuestions?: EditorQuestion[];
}

export const FormEditor: React.FC<FormEditorProps> = ({
    formId,
    initialTitle = "Untitled Form",
    initialDescription = "",
    initialQuestions = []
}) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);

    const [questions, setQuestions] = useState<EditorQuestion[]>(initialQuestions.length > 0 ? initialQuestions : [
        {
            id: generateId(),
            sectionId: "default",
            type: QuestionType.MULTIPLE_CHOICE,
            label: "Untitled Question",
            helpText: "",
            required: false,
            options: [{ id: generateId(), label: "Option 1" }],
            validation: null,
            points: 0,
            metadata: null,
            order: 0,
        }
    ]);

    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(questions[0]?.id || null);

    // Autosave
    useAutosave(
        { title, description, questions },
        async (data) => {
            const res = await fetch(`/api/forms/${formId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Save failed");
        },
        1500 // 1.5s debounce
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setQuestions((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex).map((q, idx) => ({ ...q, order: idx } as EditorQuestion));
            });
        }
    };

    const addQuestion = () => {
        const newQuestion: EditorQuestion = {
            id: generateId(),
            sectionId: "default",
            type: QuestionType.MULTIPLE_CHOICE,
            label: "",
            helpText: "",
            required: false,
            options: [{ id: generateId(), label: "Option 1" }],
            validation: null,
            points: 0,
            metadata: null,
            order: questions.length,
        };
        setQuestions([...questions, newQuestion]);
        setActiveQuestionId(newQuestion.id);
    };

    const updateQuestion = (id: string, updates: Partial<EditorQuestion>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } as EditorQuestion : q));
    };

    const deleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
        if (activeQuestionId === id) {
            setActiveQuestionId(null);
        }
    };

    const duplicateQuestion = (id: string) => {
        const questionToDuplicate = questions.find(q => q.id === id);
        if (!questionToDuplicate) return;

        const newQuestion = {
            ...questionToDuplicate,
            id: generateId(),
            order: questions.length,
        };

        // Insert after the original
        const index = questions.findIndex(q => q.id === id);
        const newQuestions = [...questions];
        newQuestions.splice(index + 1, 0, newQuestion);

        setQuestions(newQuestions.map((q, idx) => ({ ...q, order: idx })));
        setActiveQuestionId(newQuestion.id);
    };

    return (
        <div className="flex flex-col md:flex-row justify-center items-start gap-4 p-4 md:p-8 max-w-5xl mx-auto w-full">
            <div className="flex-1 w-full space-y-4">
                {/* Form Header Card would go here */}
                <div className="bg-white rounded-lg border-t-8 border-t-primary border-x border-b border-gray-200 shadow-sm p-6">
                    <input
                        type="text"
                        className="text-3xl text-foreground w-full border-b border-transparent hover:border-gray-200 focus:border-primary focus:outline-none transition-colors py-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled form"
                    />
                    <input
                        type="text"
                        className="text-md text-gray-500 w-full border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none transition-colors py-1 mt-2"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Form description"
                    />
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={questions.map(q => q.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {questions.map((question) => {
                            // We need a wrapper for SortableContext that handles the useSortable hook
                            // I'll create a SortableItem wrapper inline or separate file if needed.
                            // For now, I'll assume QuestionCard will handle ref if I pass it, 
                            // but actually DndKit needs a wrapper component to attach refs.
                            return (
                                <SortableQuestionItem
                                    key={question.id}
                                    id={question.id}
                                    question={question}
                                    isActive={activeQuestionId === question.id}
                                    onUpdate={updateQuestion}
                                    onDelete={deleteQuestion}
                                    onDuplicate={duplicateQuestion}
                                    onClick={() => setActiveQuestionId(question.id)}
                                />
                            );
                        })}
                    </SortableContext>
                </DndContext>
            </div>

            <Toolbar
                onAddQuestion={addQuestion}
                onAddTitle={() => { }}
                onAddImage={() => { }}
                onAddVideo={() => { }}
                onAddSection={() => { }}
            />
        </div>
    );
};

// Sortable Wrapper
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableQuestionItem = ({ id, ...props }: { id: string } & React.ComponentProps<typeof QuestionCard>) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            {/* We pass listeners to a handle inside QuestionCard ideally, or wrapper div if whole card is draggalbe. 
          Google Forms has a specific handler. I'll put listeners on the whole card for now or pass them down.
          Wait, QuestionCard has a drag handle spot. I should pass listeners there. 
      */}
            <QuestionCard {...props} dragHandleProps={listeners} />
        </div>
    );
};
