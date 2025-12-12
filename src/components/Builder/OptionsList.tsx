"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";

import { QuestionOption } from "@/types";

interface OptionsListProps {
    options: QuestionOption[] | undefined | null;
    onChange: (options: QuestionOption[]) => void;
    type: "MULTIPLE_CHOICE" | "CHECKBOXES" | "DROPDOWN";
    showNavigation?: boolean;
}

export function OptionsList({ options, onChange, type, showNavigation }: OptionsListProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const props = { showNavigation }; // keeping previous logic reference valid
    const [list, setList] = useState<QuestionOption[]>([]);

    useEffect(() => {
        if (Array.isArray(options)) {
            // Only update if length differs or deep check needed (simplifying to length/id for now to avoid loop)
            // But if parent creates new reference each time, we strictly need to avoid setList if contents same.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setList(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(options)) {
                    return options;
                }
                return prev;
            });
        } else {
            setList([{ label: "Option 1", value: "option-1", isCorrect: false }]);
        }
    }, [options]);

    const handleAdd = () => {
        const newOption = {
            label: `Option ${list.length + 1}`,
            value: `option-${list.length + 1}`,
            isCorrect: false
        };
        const newList = [...list, newOption];
        setList(newList);
        onChange(newList);
    };

    const handleUpdate = (index: number, label: string) => {
        const newList = [...list];
        newList[index].label = label;
        newList[index].value = label.toLowerCase().replace(/\s+/g, '-');
        setList(newList);
        onChange(newList);
    };

    const handleToggleCorrect = (index: number) => {
        const newList = [...list];
        if (type === "MULTIPLE_CHOICE") {
            // Radio behavior: Uncheck others
            newList.forEach((opt, i) => {
                opt.isCorrect = i === index ? !opt.isCorrect : false;
            });
        } else {
            // Checkbox behavior: Toggle independently
            newList[index].isCorrect = !newList[index].isCorrect;
        }
        setList(newList);
        onChange(newList);
    };

    const handleRemove = (index: number) => {
        if (list.length <= 1) return;
        const newList = list.filter((_, i) => i !== index);
        setList(newList);
        onChange(newList);
    };

    return (
        <div className="space-y-2">
            {list.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleToggleCorrect(index)}
                        className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors hover:bg-muted ${type === 'DROPDOWN' ? 'cursor-default' : 'cursor-pointer'}`}
                        disabled={type === 'DROPDOWN'}
                        title="Mark as correct answer"
                    >
                        {type === "MULTIPLE_CHOICE" && (
                            <div className={`w-4 h-4 rounded-full border ${option.isCorrect ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`} />
                        )}
                        {type === "CHECKBOXES" && (
                            <div className={`w-4 h-4 rounded border ${option.isCorrect ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`} />
                        )}
                        {type === "DROPDOWN" && <span className="text-xs text-muted-foreground">{index + 1}.</span>}
                    </button>

                    <Input
                        value={option.label}
                        onChange={(e) => handleUpdate(index, e.target.value)}
                        className={`h-8 ${option.isCorrect ? 'text-green-600 font-medium' : ''}`}
                        placeholder={`Option ${index + 1}`}
                    />

                    {/* Navigation Select */}
                    {type !== "CHECKBOXES" && props.showNavigation && (
                        <select
                            // Simple native select for compactness in this list row
                            value={option.goToSectionId || "next"}
                            onChange={(e) => {
                                const newList = [...list];
                                newList[index].goToSectionId = e.target.value;
                                setList(newList);
                                onChange(newList);
                            }}
                            className="h-8 w-32 text-xs border rounded px-2 bg-transparent text-muted-foreground focus:ring-0 focus:border-primary"
                        >
                            <option value="next">Continue to next section</option>
                            <option value="submit">Submit form</option>
                        </select>
                    )}

                    <Button variant="ghost" size="icon" onClick={() => handleRemove(index)} disabled={list.length <= 1}>
                        <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            ))}
            <div className="flex items-center gap-2 pl-8">
                <Button variant="link" onClick={handleAdd} className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    Add option
                </Button>
            </div>
        </div>
    );
}
