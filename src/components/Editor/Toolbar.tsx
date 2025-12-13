"use client";

import React from "react";
import { Plus, Type, Image as ImageIcon, Video, SplitSquareVertical } from "lucide-react";
import { Button } from "@/components/UI/Button";

interface ToolbarProps {
    onAddQuestion: () => void;
    onAddTitle: () => void;
    onAddImage: () => void;
    onAddVideo: () => void;
    onAddSection: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    onAddQuestion,
    onAddTitle,
    onAddImage,
    onAddVideo,
    onAddSection,
}) => {
    return (
        <div className="fixed right-4 md:sticky md:right-0 md:top-24 flex flex-col items-center bg-white rounded-lg shadow-md border border-gray-200 p-2 gap-2 z-10 w-12 shrink-0">
            <div className="group relative">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onAddQuestion}
                    className="rounded-full hover:bg-gray-100 data-[state=open]:bg-gray-100"
                    title="Add question"
                >
                    <Plus size={20} className="text-gray-600" />
                </Button>
            </div>

            <div className="group relative">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onAddTitle}
                    className="rounded-full hover:bg-gray-100"
                    title="Add title and description"
                >
                    <Type size={20} className="text-gray-600" />
                </Button>
            </div>

            <div className="group relative">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onAddImage}
                    className="rounded-full hover:bg-gray-100"
                    title="Add image"
                >
                    <ImageIcon size={20} className="text-gray-600" />
                </Button>
            </div>

            <div className="group relative">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onAddVideo}
                    className="rounded-full hover:bg-gray-100"
                    title="Add video"
                >
                    <Video size={20} className="text-gray-600" />
                </Button>
            </div>

            <div className="group relative">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onAddSection}
                    className="rounded-full hover:bg-gray-100"
                    title="Add section"
                >
                    <SplitSquareVertical size={20} className="text-gray-600" />
                </Button>
            </div>
        </div>
    );
};
