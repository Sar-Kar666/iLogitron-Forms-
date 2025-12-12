"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Edit, FileText, MoreVertical, Trash, Share2 } from "lucide-react";
import { Button } from "@/components/UI/Button";

interface FormCardProps {
    form: {
        id: string;
        title: string;
        createdAt: Date;
        published: boolean;
        _count: {
            responses: number;
        }
    };
}

export function FormCard({ form }: FormCardProps) {
    return (
        <div className="group relative flex flex-col justify-between rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className="flex flex-col space-y-1">
                    <Link
                        href={`/builder/${form.id}`}
                        className="font-semibold hover:underline"
                    >
                        {form.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(form.createdAt), {
                            addSuffix: true,
                        })}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {form.published && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-100">Published</span>}
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="mr-1 h-4 w-4" />
                    <span>{form._count.responses} responses</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/builder/${form.id}`}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
