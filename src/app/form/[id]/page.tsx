import React from 'react';
import { FormEditor } from '@/components/Editor/FormEditor';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface FormEditorPageProps {
    params: Promise<{
        id: string;
    }>;
}

// In a real app we'd fetch the form here.
// For now, I'll just render the editor directly.
// But strictly I should verify the form exists or create one if this is a "new" route?
// The user said "/form/create" separate. So this is [id].
// I'll assume valid ID for now or fetch.

// Since I don't have DB running properly (no docker), fetching will fail in build or runtime if I try to use prisma.
// I'll make this a client component or just skip server fetch for the MVP scaffolding step 
// until I can confirm DB connection. 
// Actually, FormEditor is "use client", so this page can be server component that just passes ID.

export default async function FormEditorPage({ params }: FormEditorPageProps) {
    // const form = await prisma.form.findUnique... 
    // skipping fetch for dev without DB
    const { id } = await params;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* 
          I could put a TopBar here or inside FormEditor. 
          Google Forms has a top bar outside the canvas.
       */}
            <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="bg-purple-600 rounded p-1">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 7H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 17H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-xl font-medium text-gray-700">iLogitron Forms</span>
                </div>
                <div>
                    {/* User Avatar or actions */}
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700">
                        U
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                <FormEditor formId={id} />
            </main>
        </div>
    );
}
