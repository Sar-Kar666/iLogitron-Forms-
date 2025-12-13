"use client";

import { useState } from "react"; // Removed useEffect as it wasn't used/visible in snippet
import { Form } from "@prisma/client";
import { X, Check } from "lucide-react";
import { Button } from "@/components/UI/Button";
import { ThemeSettings } from "@/types";

interface ThemeEditorProps {
    form: Form;
    onUpdate: (settings: ThemeSettings) => void;
    onClose: () => void;
}

const PRESET_COLORS = [
    "#4F46E5", // Indigo (Default)
    "#DC2626", // Red
    "#D97706", // Amber
    "#059669", // Emerald
    "#2563EB", // Blue
    "#DB2777", // Pink
    "#7C3AED", // Violet
    "#000000", // Black
];

const BACKGROUND_COLORS = [
    "#FFFFFF", // White
    "#F3F4F6", // Gray 100
    "#E5E7EB", // Gray 200
    "#FEF2F2", // Red 50
    "#ECFDF5", // Green 50
    "#EFF6FF", // Blue 50
    "#FFFBEB", // Amber 50
];

export function ThemeEditor({ form, onUpdate, onClose }: ThemeEditorProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [settings, setSettings] = useState<ThemeSettings>(form.settings as any || {});

    const updateTheme = (key: string, value: string) => {
        const newSettings: ThemeSettings = {
            ...settings,
            theme: {
                ...(settings.theme || {}),
                [key]: value
            }
        };
        setSettings(newSettings);
        onUpdate(newSettings);
    };

    return (
        <div className="fixed right-0 top-[64px] bottom-0 w-80 bg-background border-l shadow-xl p-6 z-50 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg">Theme Options</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div className="space-y-8">
                {/* Primary Color */}
                <div className="space-y-3">
                    <label className="text-sm font-medium">Primary Color</label>
                    <div className="grid grid-cols-4 gap-2">
                        {PRESET_COLORS.map(color => (
                            <button
                                key={color}
                                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${settings.theme?.primary === color ? "ring-2 ring-offset-2 ring-primary" : "hover:scale-110"}`}
                                style={{ backgroundColor: color }}
                                onClick={() => updateTheme("primary", color)}
                            >
                                {settings.theme?.primary === color && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Background Color */}
                <div className="space-y-3">
                    <label className="text-sm font-medium">Background Color</label>
                    <div className="grid grid-cols-4 gap-2">
                        {BACKGROUND_COLORS.map(color => (
                            <button
                                key={color}
                                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${settings.theme?.background === color ? "ring-2 ring-offset-2 ring-primary" : "hover:scale-110"}`}
                                style={{ backgroundColor: color }}
                                onClick={() => updateTheme("background", color)}
                            >
                                {settings.theme?.background === color && <Check className="w-4 h-4 text-foreground drop-shadow-sm" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom CSS (Advanced) - future proofing */}
                {/* <div className="space-y-2">
                     <label className="text-sm font-medium">Custom Font</label>
                     <Input 
                        placeholder="e.g. Inter" 
                        value={settings.theme?.font || ""}
                        onChange={(e) => updateTheme("font", e.target.value)}
                     />
                </div> */}
            </div>
        </div>
    );
}
