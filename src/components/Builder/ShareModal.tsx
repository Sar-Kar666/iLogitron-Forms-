"use client";

import { useState } from "react";
import { X, Copy, Globe, Lock } from "lucide-react";
import { Button } from "@/components/UI/Button";
import { Switch } from "@/components/UI/Switch";
import { Input } from "@/components/UI/Input";
import { toast } from "sonner";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    formId: string;
    published: boolean;
    onPublishChange: (published: boolean) => Promise<void>;
}

export function ShareModal({ isOpen, onClose, formId, published, onPublishChange }: ShareModalProps) {
    const [updating, setUpdating] = useState(false);

    // Construct the public URL
    // Ideally this should use an env var for the base URL, but window.location.origin works on client
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/forms/${formId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
    };

    const handlePublishToggle = async (checked: boolean) => {
        setUpdating(true);
        try {
            await onPublishChange(checked);
        } catch (error) {
            console.error("Failed to update publish status", error);
            toast.error("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-background border rounded-lg shadow-lg overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        {published ? <Globe className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
                        Share Form
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-muted/30">
                        <div className="space-y-0.5">
                            <label className="text-base font-medium">Publish to web</label>
                            <p className="text-sm text-muted-foreground">
                                {published
                                    ? "Anyone with the link can view and respond."
                                    : "The form is currently private and not accessible."}
                            </p>
                        </div>
                        <Switch
                            checked={published}
                            onCheckedChange={handlePublishToggle}
                            disabled={updating}
                        />
                    </div>

                    {published && (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                            <label className="text-sm font-medium">Public Link</label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={shareUrl}
                                    className="bg-muted font-mono text-sm"
                                />
                                <Button variant="outline" size="icon" onClick={handleCopy}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-muted/10 flex justify-end">
                    <Button onClick={onClose}>Done</Button>
                </div>
            </div>
        </div>
    );
}
