"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Question } from "@prisma/client";
import { QuestionEditor } from "./QuestionEditor";

interface SortableQuestionCardProps {
    question: Question;
    isQuiz: boolean;
    onUpdate: (id: string, updates: Partial<Question>) => void;
    onDelete: (id: string) => void;
}

export function SortableQuestionCard({
    question,
    isQuiz,
    onUpdate,
    onDelete,
}: SortableQuestionCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : "auto", // Ensure dragging item is on top
    };

    return (
        <div ref={setNodeRef} style={style}>
            <QuestionEditor
                question={question}
                isQuiz={isQuiz}
                onUpdate={onUpdate}
                onDelete={onDelete}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
}
