"use client";

import { useState, useEffect } from "react";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRouter } from "next/navigation";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Switch } from "@/components/UI/Switch";
import { Save, Plus, Type, MessageSquare, Layout, ArrowLeft, Palette } from "lucide-react";
import { SortableQuestionCard } from "./SortableQuestionCard";
import { v4 as uuidv4 } from "uuid";
import { ResponsesView } from "./ResponsesView";
import { ThemeEditor } from "./ThemeEditor";
import { updateFormContent } from "@/app/builder/[id]/actions";
import { toast } from "sonner";

import { Form, Section, Question, QuestionType } from "@prisma/client";

// Define a type that matches the include structure
type FormWithSections = Form & {
    sections: (Section & {
        questions: Question[];
    })[];
};

interface FormBuilderProps {
    initialForm: FormWithSections;
}

export function FormBuilder({ initialForm }: FormBuilderProps) {
    const [form, setForm] = useState(initialForm);
    const [questions, setQuestions] = useState<Question[]>(
        initialForm.sections[0]?.questions || []
    );
    const [activeTab, setActiveTab] = useState<"editor" | "responses" | "settings">("editor");
    const [showThemeEditor, setShowThemeEditor] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setQuestions((items) => {
                const oldIndex = items.findIndex((q) => q.id === active.id);
                const newIndex = items.findIndex((q) => q.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
        );
    };

    const handleDeleteQuestion = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    const handleAddQuestion = () => {
        const newQuestion: Question = {
            id: uuidv4(), // Temporary ID until saved
            sectionId: initialForm.sections[0]?.id || "temp-section",
            type: QuestionType.SHORT_TEXT,
            label: "Untitled Question",
            helpText: null,
            required: false,
            options: null,
            validation: null,
            points: 0,
            metadata: null,
            order: questions.length,
        };
        setQuestions([...questions, newQuestion]);
    };

    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Debounce Save hook
    useEffect(() => {
        const timer = setTimeout(async () => {
            // Only auto-save if we have changes? 
            // For now, simple debounce on every change
            setSaving(true);
            try {
                await updateFormContent(form.id, questions, {
                    title: form.title,
                    description: form.description || "",
                    settings: form.settings as any // Pass updated settings
                });
                setLastSaved(new Date());
            } catch (err) {
                console.error("Auto-save failed", err);
            } finally {
                setSaving(false);
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(timer);
    }, [form, questions]); // Re-run on any change

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateFormContent(form.id, questions, {
                title: form.title,
                description: form.description || "",
                settings: form.settings as any
            });
            toast.success("Saved");
            setLastSaved(new Date());
        } catch (error) {
            toast.error("Failed to save form");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSettings = (newSettings: any) => {
        setForm({ ...form, settings: newSettings });
    };

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const router = useRouter();

    if (!mounted) {
        return <div className="p-8">Loading builder...</div>;
    }

    return (
        <div className="flex w-full flex-col h-[calc(100vh-65px)]">
            <div className="flex items-center justify-between border-b bg-background p-4 shadow-sm shrink-0">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold truncate max-w-[200px]">{form.title}</h1>
                </div>
                <div className="flex items-center space-x-2">
                    {saving && <span className="text-xs text-muted-foreground mr-2">Saving...</span>}

                    <Button variant="ghost" size="icon" onClick={() => setShowThemeEditor(!showThemeEditor)}>
                        <Palette className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center bg-muted rounded-lg p-1 mr-4">
                        <button
                            onClick={() => setActiveTab("editor")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === "editor" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Questions
                        </button>
                        <button
                            onClick={() => setActiveTab("responses")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === "responses" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Responses
                        </button>
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === "settings" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Settings
                        </button>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(`/forms/${form.id}`, '_blank')}>
                        <Layout className="mr-2 h-4 w-4" />
                        Preview / Share
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                    </Button>
                </div>
            </div>
            {/* Main Content Area - Fill remaining space */}
            <div className="flex flex-1 overflow-hidden h-[calc(100vh-65px)] min-h-0 relative">
                <main className="flex-1 overflow-y-auto bg-muted/30 p-8 flex justify-center h-full">
                    <div className="w-full max-w-3xl space-y-4 pb-32">
                        {activeTab === "editor" ? (
                            <>
                                <div className="bg-card p-8 rounded-lg border shadow-sm group">
                                    <Input
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="text-3xl font-bold border-none px-0 focus-visible:ring-0 h-auto placeholder:text-muted-foreground/50 bg-transparent"
                                        placeholder="Form Title"
                                    />
                                    <Input
                                        value={form.description || ""}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="text-base text-muted-foreground mt-2 border-none px-0 focus-visible:ring-0 h-auto placeholder:text-muted-foreground/50"
                                        placeholder="Form Description"
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
                                        <div className="space-y-4">
                                            {questions.map((question) => (
                                                <SortableQuestionCard
                                                    key={question.id}
                                                    question={question}
                                                    onUpdate={handleUpdateQuestion}
                                                    onDelete={handleDeleteQuestion}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>

                                {questions.length === 0 && (
                                    <div className="py-10 text-center text-muted-foreground">
                                        No questions yet. Click "Add Question" to start.
                                    </div>
                                )}
                            </>
                        ) : activeTab === "responses" ? (
                            <ResponsesView formId={form.id} questions={questions} />
                        ) : (
                            <div className="bg-card p-8 rounded-lg border shadow-sm space-y-6">
                                <h2 className="text-xl font-semibold">Form Settings</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-0.5">
                                            <label className="text-base font-medium">Collect Email Addresses</label>
                                            <p className="text-sm text-muted-foreground">
                                                Respondents will be required to provide their email address.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={(form.settings as any)?.collectEmail || false}
                                            onCheckedChange={(checked) => setForm({
                                                ...form,
                                                settings: { ...(form.settings as any), collectEmail: checked }
                                            })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-0.5">
                                            <label className="text-base font-medium">Require Login</label>
                                            <p className="text-sm text-muted-foreground">
                                                Respondents must be signed in to Google to view the form.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={(form.settings as any)?.requiresLogin || false}
                                            onCheckedChange={(checked) => setForm({
                                                ...form,
                                                settings: { ...(form.settings as any), requiresLogin: checked }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <aside className="w-[300px] border-l bg-background hidden lg:block p-4">
                    <div className="space-y-4 sticky top-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Toolbox</h3>
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" className="justify-start" onClick={handleAddQuestion}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Question
                            </Button>
                            <Button variant="outline" className="justify-start opacity-50 cursor-not-allowed">
                                <Type className="mr-2 h-4 w-4" />
                                Add Section
                            </Button>
                        </div>
                    </div>
                </aside>

                {showThemeEditor && (
                    <ThemeEditor
                        form={form}
                        onUpdate={handleUpdateSettings}
                        onClose={() => setShowThemeEditor(false)}
                    />
                )}
            </div>
        </div>
    );
}
